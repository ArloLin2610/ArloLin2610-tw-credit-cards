#!/usr/bin/env node
/**
 * Validates data/banks.json, data/cards/*.json and data/changelog.json against
 * the JSON schemas plus a few cross-file rules. Exits 1 on any error.
 */
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateBank = ajv.compile(read('data/schema/bank.schema.json'));
const validateCard = ajv.compile(read('data/schema/card.schema.json'));

const errors = [];
const warn = [];

const banks = read('data/banks.json');
if (!validateBank(banks)) errors.push(`banks.json: ${ajv.errorsText(validateBank.errors, { separator: '\n  ' })}`);
const bankIds = new Set(banks.map((b) => b.id));
if (bankIds.size !== banks.length) errors.push('banks.json: duplicate bank ids');

const cardsDir = path.join(root, 'data/cards');
const files = fs.existsSync(cardsDir) ? fs.readdirSync(cardsDir).filter((f) => f.endsWith('.json')) : [];
const seen = new Map();
let total = 0;

for (const f of files) {
  let arr;
  try {
    arr = read(`data/cards/${f}`);
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) {
    errors.push(`${f}: must be a JSON array of cards`);
    continue;
  }
  const expectedBank = f.replace(/\.json$/, '');
  arr.forEach((card, i) => {
    total++;
    const where = `${f}[${i}] ${card?.id ?? '(no id)'}`;
    if (!validateCard(card)) {
      errors.push(`${where}: ${ajv.errorsText(validateCard.errors, { separator: '; ' })}`);
      return;
    }
    if (!bankIds.has(card.bank)) errors.push(`${where}: unknown bank "${card.bank}"`);
    if (!f.startsWith('_') && card.bank !== expectedBank) errors.push(`${where}: bank "${card.bank}" does not match file name`);
    if (!card.id.startsWith(`${card.bank}-`)) errors.push(`${where}: id must start with "${card.bank}-"`);
    if (seen.has(card.id)) errors.push(`${where}: duplicate id (also in ${seen.get(card.id)})`);
    seen.set(card.id, f);
    if (card.annual_fee.effectively_free !== true && card.tags.includes('no-annual-fee') && card.annual_fee.amount !== 0)
      warn.push(`${where}: tagged no-annual-fee but annual_fee.effectively_free is not true`);
    if (!card.image_url && !card.image) warn.push(`${where}: no image_url (placeholder will be shown)`);
    if (card.reward_type === 'miles' && card.rewards.some((r) => typeof r.rate_value === 'number' && r.rate_value < 1))
      warn.push(`${where}: miles rate_value should be TWD-per-mile (got ${card.rewards.map((r) => r.rate_value).join(',')})`);
    if (card.reward_type !== 'miles' && card.rewards.some((r) => typeof r.rate_value === 'number' && r.rate_value > 30))
      warn.push(`${where}: rate_value > 30% looks wrong (${card.rewards.map((r) => r.rate_value).join(',')})`);
    if (card.status !== 'active' && !card.status_note) warn.push(`${where}: ${card.status} without status_note`);
  });
}

const changelog = read('data/changelog.json');
if (!Array.isArray(changelog)) errors.push('changelog.json must be an array');
else
  changelog.forEach((e, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date ?? '')) errors.push(`changelog[${i}]: bad date`);
    if (!['added', 'updated', 'status', 'removed'].includes(e.type)) errors.push(`changelog[${i}]: bad type`);
    if (!bankIds.has(e.bank)) errors.push(`changelog[${i}]: unknown bank ${e.bank}`);
    if (e.card_id && !seen.has(e.card_id) && e.type !== 'removed') warn.push(`changelog[${i}]: card ${e.card_id} not found`);
  });

for (const w of warn) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\n${files.length} bank files, ${total} cards, ${banks.length} banks — ${errors.length} errors, ${warn.length} warnings`);
process.exit(errors.length ? 1 : 0);
