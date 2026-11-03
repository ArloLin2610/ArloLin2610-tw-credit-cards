#!/usr/bin/env node
/**
 * Downloads each issuer's official logo from its own website into public/logos/<id>.<ext>
 * and records the path in data/banks.json (`logo`). Heuristics: header <img> whose
 * src/alt/class mentions "logo", then apple-touch-icon / og:image. A bank can pin an
 * explicit URL in LOGO_OVERRIDES when the heuristic picks the wrong asset.
 *
 *   node scripts/fetch-bank-logos.mjs [--force] [--bank cathay]
 */
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const outDir = path.join(root, 'public/logos');
fs.mkdirSync(outDir, { recursive: true });
const FORCE = process.argv.includes('--force');
const bi = process.argv.indexOf('--bank');
const ONLY = bi >= 0 ? process.argv[bi + 1] : null;
const UA = 'tw-credit-cards-updater/1.0 (+https://github.com/ArloLin2610/ArloLin2610-tw-credit-cards; downloads official issuer logos for a comparison site)';

/** Explicit official logo URLs (used before heuristics). */
const LOGO_OVERRIDES = {
  cathay: 'https://www.cathay-cube.com.tw/content/dam/cub-aem-cs/Image/Common/cub-icons/logo.svg',
  ctbc: 'https://www.ctbcbank.com/content/dam/twrbo/ctbc-web_mix/images/components/header/logo-lg-3x.png',
  esun: 'https://www.esunbank.com/bank/rwd/images/header/logo.svg',
  taishin: 'https://www.taishinbank.com.tw/TSB/export/system/modules/com.thesys.project.TSB/resources/img/ts_FB.png',
  fubon: 'https://www.fubon.com/banking/common_content/images/logo.png',
  union: 'https://activity.ubot.com.tw/eCardWeb/images/img/UBOT_logo_180x26.png',
  sinopac: 'https://bank.sinopac.com/sinopacBT/resources/images/m_logo.png',
  tcb: 'https://www.tcb-bank.com.tw/-/media/images/bank/layout/logo/logo-gn.svg',
  chb: 'https://www.bankchb.com/frontend/img/CHB-pic(35).png',
  hsbc: 'https://www.hsbc.com.tw/content/dam/hsbc/tw/images/logos/13608-hsbc-masterbrand-tc-logo.png',
  scsb: 'https://www.scsb.com.tw/content/images/logo_sb.svg',
  rakuten: 'https://image.card.tw.r10s.com/images/common/logo/ttl_rc_c.gif',
  amex: 'https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg',
};

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  /* keep originals */
}

async function get(url, accept = 'text/html') {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function candidates(html, base) {
  const $ = cheerio.load(html);
  const abs = (u) => {
    try {
      return new URL(u, base).href;
    } catch {
      return null;
    }
  };
  const out = [];
  // 1. header / nav images that look like a logo
  $('header img, nav img, .header img, .navbar img, .logo img, a[href="/"] img, img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const meta = `${src} ${$(el).attr('alt') || ''} ${$(el).attr('class') || ''} ${$(el).parent().attr('class') || ''}`.toLowerCase();
    if (/logo/.test(meta) && !/footer|partner|visa|master|jcb|app-?store|google|facebook|line|youtube|ig|instagram/.test(meta)) {
      const u = abs(src);
      if (u) out.push({ url: u, score: 3 + (/svg/.test(src) ? 1 : 0) });
    }
  });
  // 2. inline svg logo isn't downloadable as a file; skip
  // 3. apple-touch-icon, og:image
  $('link[rel~="apple-touch-icon"]').each((_, el) => {
    const u = abs($(el).attr('href'));
    if (u) out.push({ url: u, score: 2 });
  });
  $('meta[property="og:image"]').each((_, el) => {
    const u = abs($(el).attr('content'));
    if (u) out.push({ url: u, score: 1 });
  });
  const seen = new Set();
  return out.filter((c) => !seen.has(c.url) && seen.add(c.url)).sort((a, b) => b.score - a.score);
}

async function saveImage(bankId, url) {
  const res = await get(url, 'image/*,*/*;q=0.8');
  const type = res.headers.get('content-type') || '';
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) throw new Error('too small');
  if (type.includes('svg') || url.endsWith('.svg')) {
    const file = `${bankId}.svg`;
    fs.writeFileSync(path.join(outDir, file), buf);
    return file;
  }
  if (sharp) {
    const img = sharp(buf);
    const meta = await img.metadata();
    if (!meta.width || meta.width < 40 || meta.height < 16) throw new Error(`image too small (${meta.width}x${meta.height})`);
    const file = `${bankId}.png`;
    await img.resize({ height: Math.min(128, meta.height), withoutEnlargement: true }).png().toFile(path.join(outDir, file));
    return file;
  }
  const file = `${bankId}.${type.includes('png') ? 'png' : 'jpg'}`;
  fs.writeFileSync(path.join(outDir, file), buf);
  return file;
}

const banksPath = path.join(root, 'data/banks.json');
const banks = JSON.parse(fs.readFileSync(banksPath, 'utf8'));
const results = [];
for (const bank of banks) {
  if (ONLY && bank.id !== ONLY) continue;
  const existing = fs.readdirSync(outDir).find((f) => f.startsWith(bank.id + '.'));
  if (existing && !FORCE) {
    bank.logo = `/logos/${existing}`;
    results.push(`${bank.id.padEnd(10)} kept ${existing}`);
    continue;
  }
  const tried = [];
  let saved = null;
  const list = LOGO_OVERRIDES[bank.id] ? [{ url: LOGO_OVERRIDES[bank.id], score: 9 }] : [];
  if (!list.length) {
    try {
      const res = await get(bank.website);
      list.push(...candidates(await res.text(), res.url));
    } catch (e) {
      tried.push(`${bank.website}: ${e.message}`);
    }
  }
  for (const c of list.slice(0, 6)) {
    try {
      saved = await saveImage(bank.id, c.url);
      results.push(`${bank.id.padEnd(10)} ${saved}  ← ${c.url}`);
      break;
    } catch (e) {
      tried.push(`${c.url}: ${e.message}`);
    }
  }
  if (saved) bank.logo = `/logos/${saved}`;
  else results.push(`${bank.id.padEnd(10)} FAILED\n    ${tried.join('\n    ') || 'no candidates'}`);
}
fs.writeFileSync(banksPath, JSON.stringify(banks, null, 2) + '\n');
console.log(results.join('\n'));
