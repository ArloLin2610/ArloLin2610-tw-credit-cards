import fs from 'node:fs';
import path from 'node:path';
import banksJson from '../../data/banks.json';
import changelogJson from '../../data/changelog.json';
import type { Bank, Card, CardSummary, ChangelogEntry, RewardType, Tag } from './types';

const cardModules = import.meta.glob<Card[]>('../../data/cards/*.json', {
  eager: true,
  import: 'default',
});

export const banks: Bank[] = banksJson as Bank[];
export const bankById = new Map(banks.map((b) => [b.id, b]));

export const cards: Card[] = Object.entries(cardModules)
  .flatMap(([, arr]) => arr)
  .filter((c) => bankById.has(c.bank) && !c.needs_review)
  .sort((a, b) => {
    const ai = banks.findIndex((x) => x.id === a.bank);
    const bi = banks.findIndex((x) => x.id === b.bank);
    return ai - bi || a.name.localeCompare(b.name, 'zh-Hant');
  });

export const cardById = new Map(cards.map((c) => [c.id, c]));
export const activeCards = cards.filter((c) => c.status === 'active');

export const changelog: ChangelogEntry[] = (changelogJson as ChangelogEntry[])
  .slice()
  .sort((a, b) => b.date.localeCompare(a.date));

export function cardsOfBank(bankId: string): Card[] {
  return cards.filter((c) => c.bank === bankId);
}

export function cardsOfType(type: RewardType): Card[] {
  return cards.filter((c) => c.reward_type === type);
}

export function cardsWithTag(tag: Tag): Card[] {
  return cards.filter((c) => c.tags.includes(tag));
}

/* ---------- images ---------- */

const PUBLIC_CARDS_DIR = path.resolve(process.cwd(), 'public/cards');
const localImages = new Map<string, string>();
try {
  for (const f of fs.readdirSync(PUBLIC_CARDS_DIR)) {
    const m = /^(.+)\.(png|jpe?g|webp|svg|avif)$/i.exec(f);
    if (m && !localImages.has(m[1])) localImages.set(m[1], `/cards/${f}`);
  }
} catch {
  /* no local images yet */
}

function placeholderSvg(card: Card, bank: Bank | undefined): string {
  const color = bank?.color ?? '#5b6663';
  const bankName = bank?.short_name ?? card.bank;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 202">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="320" height="202" rx="16" fill="url(#g)"/>
  <rect x="24" y="64" width="46" height="34" rx="6" fill="#fff" fill-opacity="0.85"/>
  <rect x="24" y="78" width="46" height="4" fill="${color}" fill-opacity="0.5"/>
  <text x="24" y="40" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="14" fill="#fff" fill-opacity="0.9">${esc(bankName)}</text>
  <text x="24" y="156" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="20" font-weight="700" fill="#fff">${esc(card.name)}</text>
  <text x="24" y="180" font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="11" fill="#fff" fill-opacity="0.75">卡圖更新中</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Resolution order: committed file in public/cards/<id>.* → official image_url → generated placeholder.
 */
export function cardImage(card: Card): { src: string; isPlaceholder: boolean; isRemote: boolean } {
  const local = card.image ? card.image : localImages.get(card.id);
  if (local) return { src: local, isPlaceholder: false, isRemote: false };
  if (card.image_url) return { src: card.image_url, isPlaceholder: false, isRemote: true };
  return { src: placeholderSvg(card, bankById.get(card.bank)), isPlaceholder: true, isRemote: false };
}

/* ---------- rate helpers ---------- */

export function bestReward(card: Card) {
  // 1. explicitly featured reward
  const featured = card.rewards.find((r) => r.featured);
  if (featured) return featured;
  // 2. the reward whose number appears in the headline (the maintainer's chosen hook)
  const headlineNums = card.headline.match(/\d+(?:\.\d+)?/g) ?? [];
  const inHeadline = card.rewards.find((r) => {
    const n = r.rate.match(/\d+(?:\.\d+)?/g) ?? [];
    return n.length > 0 && n.every((x) => headlineNums.includes(x));
  });
  if (inHeadline) return inHeadline;
  // 3. otherwise the numerically best one
  const withValue = card.rewards.filter((r) => typeof r.rate_value === 'number');
  if (withValue.length === 0) return card.rewards[0];
  if (card.reward_type === 'miles') {
    // fewer TWD per mile is better
    return withValue.reduce((a, b) => (b.rate_value! < a.rate_value! ? b : a));
  }
  return withValue.reduce((a, b) => (b.rate_value! > a.rate_value! ? b : a));
}

/** Comparable "goodness" score: higher is better regardless of reward type. */
export function rateScore(card: Card): number {
  const r = bestReward(card);
  if (!r || typeof r.rate_value !== 'number') return 0;
  if (card.reward_type === 'miles') return r.rate_value > 0 ? 100 / r.rate_value : 0; // 100 / TWD-per-mile
  return r.rate_value;
}

export function toSummary(card: Card): CardSummary {
  const bank = bankById.get(card.bank);
  const best = bestReward(card);
  return {
    id: card.id,
    bank: card.bank,
    bankName: bank?.short_name ?? card.bank,
    bankColor: bank?.color ?? '#5b6663',
    name: card.name,
    networks: card.networks,
    rewardType: card.reward_type,
    tags: card.tags,
    headline: card.headline,
    bestRate: best?.rate ?? '',
    bestRateValue: rateScore(card),
    annualFee: card.annual_fee.amount,
    effectivelyFree: Boolean(card.annual_fee.effectively_free || card.annual_fee.amount === 0),
    status: card.status,
    image: cardImage(card).src,
    lastVerified: card.last_verified,
  };
}

export const summaries: CardSummary[] = cards.map(toSummary);

export function formatFee(card: Card): string {
  const { amount, max_amount, effectively_free } = card.annual_fee;
  if (amount === 0 && !max_amount) return '免年費';
  const base = max_amount && max_amount !== amount ? `NT$${amount.toLocaleString()}–${max_amount.toLocaleString()}` : `NT$${amount.toLocaleString()}`;
  return effectively_free ? `${base}（可免）` : base;
}

export const siteStats = {
  banks: banks.length,
  cards: cards.length,
  active: activeCards.length,
  lastVerified: cards.reduce((m, c) => (c.last_verified > m ? c.last_verified : m), '0000-00-00'),
};
