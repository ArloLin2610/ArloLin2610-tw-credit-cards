#!/usr/bin/env node
/**
 * Downloads each card's official card-face image (card.image_url) into
 * public/cards/<id>.webp (resized to ≤ 640px wide). Existing files are kept
 * unless --force. Cards without image_url, or whose download fails, keep
 * showing the generated placeholder on the site.
 *
 *   node scripts/fetch-card-images.mjs [--force] [--bank cathay]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const outDir = path.join(root, 'public/cards');
fs.mkdirSync(outDir, { recursive: true });
const FORCE = process.argv.includes('--force');
const bi = process.argv.indexOf('--bank');
const ONLY_BANK = bi >= 0 ? process.argv[bi + 1] : null;
const UA = 'tw-credit-cards-updater/1.0 (+https://github.com/ArloLin2610/ArloLin2610-tw-credit-cards; downloads official card images for a comparison site)';

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('sharp not available — saving images unmodified');
}

const files = fs.readdirSync(path.join(root, 'data/cards')).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
let ok = 0, skipped = 0, failed = 0, none = 0;
const failures = [];

for (const f of files) {
  const bankId = f.replace(/\.json$/, '');
  if (ONLY_BANK && bankId !== ONLY_BANK) continue;
  const cards = JSON.parse(fs.readFileSync(path.join(root, 'data/cards', f), 'utf8'));
  for (const card of cards) {
    if (!card.image_url) {
      none++;
      continue;
    }
    const existing = fs.readdirSync(outDir).find((x) => x.startsWith(card.id + '.'));
    if (existing && !FORCE) {
      skipped++;
      continue;
    }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(card.image_url, { headers: { 'user-agent': UA, referer: card.source_url || card.image_url, accept: 'image/*,*/*;q=0.8' }, signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error('response too small to be an image');
      if (type.includes('svg')) {
        fs.writeFileSync(path.join(outDir, `${card.id}.svg`), buf);
      } else if (sharp) {
        const img = sharp(buf, { animated: false });
        const meta = await img.metadata();
        if (!meta.width || meta.width < 80) throw new Error('image too small');
        // keep transparent corners of card art; flatten nothing
        await img.rotate().resize({ width: Math.min(640, meta.width), withoutEnlargement: true }).webp({ quality: 84 }).toFile(path.join(outDir, `${card.id}.webp`));
      } else {
        const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
        fs.writeFileSync(path.join(outDir, `${card.id}.${ext}`), buf);
      }
      if (existing && FORCE && !existing.endsWith('.webp')) fs.rmSync(path.join(outDir, existing), { force: true });
      ok++;
    } catch (e) {
      failed++;
      failures.push(`${card.id}: ${e.message} (${card.image_url})`);
    }
  }
}

console.log(`images: ${ok} downloaded, ${skipped} already present, ${failed} failed, ${none} cards without image_url`);
for (const f of failures) console.log('  fail ' + f);
