#!/usr/bin/env node
/**
 * Scheduled checker: compares every bank's official card-index page and every
 * card's official product page against the last snapshot, detects new cards /
 * closed cards / changed benefits, and (when ANTHROPIC_API_KEY is set) drafts
 * the data changes. Everything it changes lands in the working tree so the
 * GitHub Actions workflow can open a review PR; nothing is published until a
 * human merges that PR.
 *
 *   node scripts/check-updates.mjs                # full run
 *   node scripts/check-updates.mjs --bank cathay  # one bank
 *   node scripts/check-updates.mjs --snapshot-only # (re)baseline snapshots, no proposals
 *   node scripts/check-updates.mjs --no-llm        # detection only
 *   node scripts/check-updates.mjs --dry-run       # don't write data/snapshots/proposals
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fetchPage, lineDiff, closeBrowser } from './lib/fetch-page.mjs';
import * as llm from './lib/llm.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const args = new Set(process.argv.slice(2));
const argVal = (k) => {
  const i = process.argv.indexOf(k);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const ONLY_BANK = argVal('--bank');
const SNAPSHOT_ONLY = args.has('--snapshot-only');
const DRY = args.has('--dry-run');
const USE_LLM = llm.hasLLM && !args.has('--no-llm') && !SNAPSHOT_ONLY;
const CONCURRENCY = Number(process.env.CHECK_CONCURRENCY || 3);
const TODAY = new Date().toISOString().slice(0, 10);

const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const writeJson = (p, v) => {
  if (DRY) return;
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(v, null, 2) + '\n');
};
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const slug = (url) => url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '').slice(0, 80);
const normName = (s) => s.replace(/\s+/g, '').replace(/[（(].*?[)）]/g, '').replace(/信用卡|卡$/g, '').toLowerCase();

const banks = readJson('data/banks.json').filter((b) => !ONLY_BANK || b.id === ONLY_BANK);
const changelog = readJson('data/changelog.json');

const report = { date: TODAY, llm: USE_LLM, banks: {}, proposals: [], errors: [] };
const proposal = (p) => report.proposals.push(p);

/* ---------- snapshots ---------- */
function snapPath(bankId, key) {
  return `data/snapshots/${bankId}/${key}.json`;
}
function loadSnap(bankId, key) {
  try {
    return readJson(snapPath(bankId, key));
  } catch {
    return null;
  }
}
function saveSnap(bankId, key, page, extra = {}) {
  writeJson(snapPath(bankId, key), {
    url: page.finalUrl,
    fetched_at: new Date().toISOString(),
    status: page.status,
    hash: sha(page.text),
    text: page.text.slice(0, 60000),
    ...extra,
  });
}

/* ---------- per-bank work ---------- */
async function checkBank(bank) {
  const file = `data/cards/${bank.id}.json`;
  let cards = [];
  try {
    cards = readJson(file);
  } catch {
    /* bank without data yet */
  }
  const summary = { index_changed: [], cards_checked: 0, cards_changed: 0, flagged: 0, added: 0, errors: 0 };
  report.banks[bank.id] = summary;
  let dirty = false;
  const knownNames = new Set(cards.map((c) => normName(c.name)));

  /* 1. index + watch pages */
  const indexUrls = [bank.cards_index_url, ...(bank.watch_urls || [])];
  for (const url of indexUrls) {
    const page = await fetchPage(url);
    const key = `index-${slug(url)}`;
    if (!page.ok) {
      summary.errors++;
      report.errors.push({ bank: bank.id, url, status: page.status, error: page.error || 'page not readable' });
      continue;
    }
    const prev = loadSnap(bank.id, key);
    if (prev && prev.hash !== sha(page.text) && !SNAPSHOT_ONLY) {
      const diff = lineDiff(prev.text, page.text);
      const entry = { url, added: diff.added.slice(0, 60), removed: diff.removed.slice(0, 60), summary: null, new_cards: [], missing_cards: [] };
      summary.index_changed.push(entry);

      // Names present in the index but not in our data → candidate new cards
      if (USE_LLM) {
        const list = await llm.extractCardList(bank.short_name, page.text, page.links).catch((e) => (report.errors.push({ bank: bank.id, url, error: `llm card_list: ${e.message}` }), null));
        if (list?.cards) {
          const indexNames = new Set(list.cards.map((c) => normName(c.name)));
          entry.missing_cards = cards.filter((c) => c.status === 'active' && !indexNames.has(normName(c.name))).map((c) => c.id);
          for (const c of list.cards) {
            if (knownNames.has(normName(c.name))) continue;
            if (c.status_hint === 'discontinued') continue;
            entry.new_cards.push(c);
            if (!c.url) continue;
            const prodPage = await fetchPage(c.url);
            if (!prodPage.ok) continue;
            const draft = await llm.extractCard({ bankId: bank.id, bankName: bank.short_name, url: c.url, pageText: prodPage.text + '\n\n圖片清單：\n' + prodPage.images.map((i) => `${i.alt} ${i.src}`).join('\n') }).catch((e) => (report.errors.push({ bank: bank.id, url: c.url, error: `llm extract: ${e.message}` }), null));
            if (!draft || !draft.id) continue;
            draft.bank = bank.id;
            draft.source_url = draft.source_url || c.url;
            draft.last_verified = TODAY;
            draft.notes = `自動擷取於 ${TODAY}，尚未人工核對`;
            if (cards.some((x) => x.id === draft.id)) draft.id = `${draft.id}-${sha(c.url).slice(0, 4)}`;
            cards.push(draft);
            knownNames.add(normName(draft.name));
            dirty = true;
            summary.added++;
            proposal({ type: 'add', bank: bank.id, card_id: draft.id, card_name: draft.name, source_url: c.url, confidence: 'medium', evidence: `出現在卡片總覽頁 ${url}` });
            changelog.push({ date: TODAY, type: 'added', bank: bank.id, card_id: draft.id, card_name: draft.name, summary: '新卡上架（自動擷取，待核對）', source_url: c.url });
          }
        }
        entry.summary = await llm.summarizeChange({ bankName: bank.short_name, url, added: diff.added, removed: diff.removed }).catch(() => null);
      }
      proposal({ type: 'index-changed', bank: bank.id, url, summary: entry.summary, added: entry.added.length, removed: entry.removed.length, new_cards: entry.new_cards.map((c) => c.name), missing_cards: entry.missing_cards });
    }
    saveSnap(bank.id, key, page);
  }

  /* 2. each card's product page */
  const queue = cards.filter((c) => c.status !== 'discontinued' && !c.needs_review && c.source_url);
  for (const card of queue) {
    summary.cards_checked++;
    const page = await fetchPage(card.source_url);
    const key = `card-${card.id}`;
    const prev = loadSnap(bank.id, key);
    const gone = page.status === 404 || page.status === 410;
    const redirectedAway = page.ok && page.finalUrl && new URL(page.finalUrl).pathname.replace(/\/$/, '') !== new URL(card.source_url).pathname.replace(/\/$/, '') && indexUrls.some((u) => page.finalUrl.startsWith(u.replace(/\/$/, '')));

    if (!page.ok && !gone) {
      summary.errors++;
      report.errors.push({ bank: bank.id, url: card.source_url, card_id: card.id, status: page.status, error: page.error || 'page not readable' });
      continue;
    }
    if (SNAPSHOT_ONLY) {
      if (page.ok) saveSnap(bank.id, key, page);
      continue;
    }

    /* 2a. status signals */
    const suspicious = gone || redirectedAway || page.stopKeywords.length > 0;
    if (suspicious && card.status === 'active') {
      summary.flagged++;
      let decision = null;
      if (USE_LLM && !gone) decision = await llm.classifyStatus({ cardName: card.name, pageText: page.text, httpStatus: page.status, stopKeywords: page.stopKeywords }).catch(() => null);
      const newStatus = gone ? 'discontinued' : decision && decision.confidence >= 0.75 && decision.status !== 'unknown' ? decision.status : null;
      if (newStatus && newStatus !== 'active') {
        card.status = newStatus;
        card.status_changed_at = TODAY;
        card.status_note = decision?.status_note || (gone ? '官網產品頁已移除' : '官網標示停止申請');
        card.last_verified = TODAY;
        dirty = true;
        proposal({ type: 'status', bank: bank.id, card_id: card.id, card_name: card.name, new_status: newStatus, confidence: gone ? 'high' : 'medium', evidence: gone ? `HTTP ${page.status}` : decision?.reason || page.stopKeywords.join(' | '), source_url: card.source_url });
        changelog.push({ date: TODAY, type: 'status', bank: bank.id, card_id: card.id, card_name: card.name, summary: newStatus === 'discontinued' ? '官網顯示已停止申請' : '官網顯示暫停申請', source_url: card.source_url });
      } else {
        proposal({ type: 'flag', bank: bank.id, card_id: card.id, card_name: card.name, confidence: 'low', evidence: gone ? `HTTP ${page.status}` : redirectedAway ? `導向 ${page.finalUrl}` : page.stopKeywords.join(' | '), source_url: card.source_url, note: '需人工確認申請狀態' });
      }
    }

    /* 2b. content changes */
    if (page.ok && prev && prev.hash !== sha(page.text)) {
      summary.cards_changed++;
      const diff = lineDiff(prev.text, page.text);
      let changedFields = [];
      if (USE_LLM && card.status === 'active') {
        const draft = await llm.extractCard({ bankId: bank.id, bankName: bank.short_name, url: card.source_url, pageText: page.text + '\n\n圖片清單：\n' + page.images.map((i) => `${i.alt} ${i.src}`).join('\n'), existing: card }).catch((e) => (report.errors.push({ bank: bank.id, url: card.source_url, card_id: card.id, error: `llm extract: ${e.message}` }), null));
        if (draft) {
          const keep = ['id', 'bank', 'source_url', 'image', 'notes'];
          for (const k of keep) if (card[k] !== undefined) draft[k] = card[k];
          for (const k of Object.keys({ ...card, ...draft })) {
            if (keep.includes(k) || k === 'last_verified') continue;
            if (JSON.stringify(card[k]) !== JSON.stringify(draft[k])) changedFields.push(k);
          }
          if (changedFields.length) {
            Object.assign(card, draft, { last_verified: TODAY, notes: `權益頁變動於 ${TODAY}，自動更新欄位：${changedFields.join(', ')}（待核對）` });
            dirty = true;
            changelog.push({ date: TODAY, type: 'updated', bank: bank.id, card_id: card.id, card_name: card.name, summary: `權益內容更新（${changedFields.join('、')}）`, source_url: card.source_url });
          } else {
            card.last_verified = TODAY;
            dirty = true;
          }
        }
      }
      const summaryText = USE_LLM ? await llm.summarizeChange({ bankName: bank.short_name, url: card.source_url, added: diff.added, removed: diff.removed }).catch(() => null) : null;
      proposal({ type: 'update', bank: bank.id, card_id: card.id, card_name: card.name, changed_fields: changedFields, summary: summaryText, added: diff.added.slice(0, 40), removed: diff.removed.slice(0, 40), source_url: card.source_url, confidence: changedFields.length ? 'medium' : 'low' });
    } else if (page.ok && prev && !suspicious) {
      // unchanged → bump verification date so the site shows a fresh check
      if (card.last_verified !== TODAY) {
        card.last_verified = TODAY;
        dirty = true;
      }
    }
    if (page.ok) saveSnap(bank.id, key, page);
  }

  if (dirty && !SNAPSHOT_ONLY) writeJson(file, cards);
}

/* ---------- run ---------- */
async function runPool(items, worker, n) {
  const it = items[Symbol.iterator]();
  await Promise.all(
    Array.from({ length: n }, async () => {
      for (let x = it.next(); !x.done; x = it.next()) await worker(x.value);
    }),
  );
}

console.log(`check-updates ${TODAY} — ${banks.length} banks, llm=${USE_LLM}, snapshotOnly=${SNAPSHOT_ONLY}, dry=${DRY}`);
await runPool(banks, async (bank) => {
  const t = Date.now();
  try {
    await checkBank(bank);
  } catch (e) {
    report.errors.push({ bank: bank.id, error: e.stack || e.message });
  }
  const s = report.banks[bank.id] || {};
  console.log(`  ${bank.id.padEnd(10)} cards ${String(s.cards_checked ?? 0).padStart(3)}  changed ${s.cards_changed ?? 0}  flagged ${s.flagged ?? 0}  added ${s.added ?? 0}  index-changed ${s.index_changed?.length ?? 0}  errors ${s.errors ?? 0}  (${Math.round((Date.now() - t) / 1000)}s)`);
}, CONCURRENCY);
await closeBrowser();

/* ---------- outputs ---------- */
const hasChanges = report.proposals.length > 0;
if (!SNAPSHOT_ONLY) {
  writeJson('data/changelog.json', changelog);
  if (hasChanges) {
    writeJson(`data/proposals/${TODAY}/report.json`, report);
    if (!DRY) fs.writeFileSync(path.join(root, `data/proposals/${TODAY}/REPORT.md`), renderReport(report));
  }
}
if (report.errors.length) {
  console.log('\nfetch errors:');
  for (const e of report.errors) console.log(`  ${e.bank.padEnd(10)} ${e.card_id ? e.card_id + ' ' : ''}${e.url ?? ''} — ${e.status ? `HTTP ${e.status} ` : ''}${e.error ?? ''}`);
}
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_changes=${hasChanges}\nreport_path=data/proposals/${TODAY}/REPORT.md\ndate=${TODAY}\n`);
console.log(`\n${report.proposals.length} proposals, ${report.errors.length} errors${hasChanges ? ` → data/proposals/${TODAY}/REPORT.md` : ''}`);

function renderReport(r) {
  const bankName = (id) => banks.find((b) => b.id === id)?.short_name ?? id;
  const by = (t) => r.proposals.filter((p) => p.type === t);
  const lines = [`# 信用卡資料自動核對 ${r.date}`, '', `LLM 擷取：${r.llm ? '已啟用' : '未啟用（只有偵測，沒有自動修改資料）'}`, '', '> 這個 PR 的 diff 就是要上線的變更。請逐項核對下方證據後再合併；不正確的 hunk 可以直接在 PR 中修改或還原。', ''];
  const section = (title, items, fmt) => {
    if (!items.length) return;
    lines.push(`## ${title}（${items.length}）`, '');
    for (const p of items) lines.push(...fmt(p), '');
  };
  section('新卡（已自動建立資料）', by('add'), (p) => [`- **${bankName(p.bank)} ${p.card_name}** \`${p.card_id}\` — ${p.evidence}`, `  - 來源：${p.source_url}`]);
  section('申請狀態變更（已套用）', by('status'), (p) => [`- **${bankName(p.bank)} ${p.card_name}** → \`${p.new_status}\`（信心：${p.confidence}）`, `  - 依據：${p.evidence}`, `  - 來源：${p.source_url}`]);
  section('需人工確認申請狀態（未套用）', by('flag'), (p) => [`- **${bankName(p.bank)} ${p.card_name}** — ${p.evidence}`, `  - 來源：${p.source_url}`]);
  section('產品頁內容變動', by('update'), (p) => [
    `- **${bankName(p.bank)} ${p.card_name}**${p.changed_fields?.length ? ` — 已更新欄位：${p.changed_fields.join('、')}` : ' — 僅偵測到文字變動，資料未改'}`,
    ...(p.summary ? [`  - 摘要：${p.summary}`] : []),
    `  - 來源：${p.source_url}`,
    '  <details><summary>文字差異</summary>',
    '',
    '  ```diff',
    ...p.removed.map((l) => `  - ${l}`),
    ...p.added.map((l) => `  + ${l}`),
    '  ```',
    '  </details>',
  ]);
  section('卡片總覽頁變動', by('index-changed'), (p) => [
    `- **${bankName(p.bank)}** ${p.url} — +${p.added} / −${p.removed} 行`,
    ...(p.summary ? [`  - 摘要：${p.summary}`] : []),
    ...(p.new_cards?.length ? [`  - 總覽頁出現但資料庫沒有：${p.new_cards.join('、')}`] : []),
    ...(p.missing_cards?.length ? [`  - 資料庫有但總覽頁找不到（可能下架）：${p.missing_cards.join('、')}`] : []),
  ]);
  if (r.errors.length) {
    lines.push(`## 抓取錯誤（${r.errors.length}）`, '');
    for (const e of r.errors) lines.push(`- ${bankName(e.bank)} ${e.card_id ? `\`${e.card_id}\` ` : ''}${e.url ?? ''} — ${e.status ? `HTTP ${e.status} ` : ''}${e.error ?? ''}`);
    lines.push('');
  }
  lines.push('## 各銀行統計', '', '| 銀行 | 檢查卡數 | 內容變動 | 狀態可疑 | 新增 | 總覽頁變動 | 錯誤 |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const [id, s] of Object.entries(r.banks)) lines.push(`| ${bankName(id)} | ${s.cards_checked} | ${s.cards_changed} | ${s.flagged} | ${s.added} | ${s.index_changed.length} | ${s.errors} |`);
  return lines.join('\n') + '\n';
}
