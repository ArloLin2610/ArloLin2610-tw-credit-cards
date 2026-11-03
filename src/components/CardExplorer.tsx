import { useEffect, useMemo, useState } from 'react';
import type { CardSummary, RewardType, Tag } from '../lib/types';
import { REWARD_TYPE_LABEL, SCENE_TAGS, TAG_LABEL, STATUS_LABEL } from '../lib/types';

interface BankOpt {
  id: string;
  short_name: string;
}

interface Props {
  cards: CardSummary[];
  banks: BankOpt[];
  /** Lock the reward type (used on /category/* pages). */
  fixedType?: RewardType;
  /** Lock a tag (used on /tags/* pages). */
  fixedTag?: Tag;
  /** Lock a bank (used on /banks/* pages). */
  fixedBank?: string;
  showHero?: boolean;
}

type Sort = 'featured' | 'rate' | 'fee' | 'bank';
const COMPARE_KEY = 'twcards.compare';
const MAX_COMPARE = 3;

function readCompare(): string[] {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}
function writeCompare(ids: string[]) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export default function CardExplorer({ cards, banks, fixedType, fixedTag, fixedBank, showHero = false }: Props) {
  const [type, setType] = useState<RewardType | 'all'>(fixedType ?? 'all');
  const [tags, setTags] = useState<Tag[]>(fixedTag ? [fixedTag] : []);
  const [bankSel, setBankSel] = useState<string[]>(fixedBank ? [fixedBank] : []);
  const [freeOnly, setFreeOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('featured');
  const [compare, setCompare] = useState<string[]>([]);
  const [moreFilters, setMoreFilters] = useState(false);

  useEffect(() => {
    setCompare(readCompare());
  }, []);

  const toggleTag = (t: Tag) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const toggleBank = (b: string) => setBankSel((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]));
  const toggleCompare = (id: string) =>
    setCompare((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id];
      writeCompare(next);
      return next;
    });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = cards.filter((c) => {
      if (!showInactive && c.status !== 'active') return false;
      if (type !== 'all' && c.rewardType !== type) return false;
      if (tags.length && !tags.every((t) => c.tags.includes(t))) return false;
      if (bankSel.length && !bankSel.includes(c.bank)) return false;
      if (freeOnly && !c.effectivelyFree) return false;
      if (needle && !(c.name.toLowerCase().includes(needle) || c.bankName.includes(needle) || c.headline.toLowerCase().includes(needle))) return false;
      return true;
    });
    const typeOrder: Record<RewardType, number> = { cashback: 0, points: 1, miles: 2, other: 3 };
    switch (sort) {
      case 'rate':
        // rates are only comparable within a reward type, so group by type first
        list = list.slice().sort((a, b) => typeOrder[a.rewardType] - typeOrder[b.rewardType] || b.bestRateValue - a.bestRateValue);
        break;
      case 'fee':
        list = list.slice().sort((a, b) => a.annualFee - b.annualFee || b.bestRateValue - a.bestRateValue);
        break;
      case 'bank':
        list = list.slice().sort((a, b) => a.bankName.localeCompare(b.bankName, 'zh-Hant') || b.bestRateValue - a.bestRateValue);
        break;
      default:
        // featured: keep data order (bank order), active cards first
        list = list.slice().sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active'));
    }
    return list;
  }, [cards, type, tags, bankSel, freeOnly, showInactive, q, sort]);

  const inactiveCount = cards.filter((c) => c.status !== 'active').length;
  const compareCards = compare.map((id) => cards.find((c) => c.id === id)).filter(Boolean) as CardSummary[];

  return (
    <div>
      {/* ---- filters ---- */}
      <section aria-label="篩選條件" className="space-y-4">
        {!fixedType && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="回饋類型">
            {(['all', 'cashback', 'miles', 'points'] as const).map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
                {t === 'all' ? '全部類型' : REWARD_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        )}

        {!fixedTag && (
          <div>
            {showHero && <p className="mb-2 text-sm text-ink-soft">你最常刷哪裡？可以複選。</p>}
            <div className="flex flex-wrap gap-2" role="group" aria-label="消費場景">
              {SCENE_TAGS.map((t) => (
                <button key={t} type="button" className="chip" aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>
                  {TAG_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label className="chip cursor-pointer">
            <input type="checkbox" className="accent-ink" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
            免年費
          </label>
          {!fixedTag && (
            <>
              <button type="button" className="chip" aria-pressed={tags.includes('new-cardholder')} onClick={() => toggleTag('new-cardholder')}>
                有新戶禮
              </button>
              <button type="button" className="chip" aria-pressed={tags.includes('premium')} onClick={() => toggleTag('premium')}>
                頂級卡
              </button>
            </>
          )}
          {!fixedBank && (
            <button type="button" className="chip" aria-expanded={moreFilters} onClick={() => setMoreFilters((v) => !v)}>
              選擇銀行{bankSel.length ? `（${bankSel.length}）` : ''}
            </button>
          )}
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜尋卡名或銀行"
            aria-label="搜尋卡名或銀行"
            className="ml-auto w-full rounded-full border border-line bg-surface px-4 py-2 text-sm sm:w-56"
          />
        </div>

        {moreFilters && !fixedBank && (
          <div className="flex flex-wrap gap-2 rounded-xl border border-line bg-surface p-3" role="group" aria-label="銀行">
            {banks.map((b) => (
              <button key={b.id} type="button" className="chip" aria-pressed={bankSel.includes(b.id)} onClick={() => toggleBank(b.id)}>
                {b.short_name}
              </button>
            ))}
            {bankSel.length > 0 && (
              <button type="button" className="chip" onClick={() => setBankSel([])}>
                清除
              </button>
            )}
          </div>
        )}
      </section>

      {/* ---- toolbar ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span aria-live="polite">
          {filtered.length} 張卡片
          {inactiveCount > 0 && (
            <>
              ・
              <label className="cursor-pointer">
                <input type="checkbox" className="mr-1 accent-ink" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                顯示已停發／暫停申請（{inactiveCount}）
              </label>
            </>
          )}
        </span>
        <label className="ml-auto flex items-center gap-2">
          排序
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-line bg-surface px-2 py-1">
            <option value="featured">推薦</option>
            <option value="rate">最高回饋</option>
            <option value="fee">年費低到高</option>
            <option value="bank">銀行</option>
          </select>
        </label>
      </div>

      {/* ---- grid ---- */}
      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-surface p-10 text-center text-ink-soft">
          沒有符合所有條件的卡片。試著少選一個場景，或取消「免年費」。
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const selected = compare.includes(c.id);
            const full = compare.length >= MAX_COMPARE && !selected;
            const rewardClass = `reward-${c.rewardType === 'cashback' ? 'cash' : c.rewardType}`;
            return (
              <li key={c.id} className={`tile relative p-3 ${selected ? 'is-selected' : ''} ${c.status !== 'active' ? 'opacity-70' : ''}`}>
                <a href={`/cards/${c.id}`} className="block">
                  <div className="card-face">
                    <img src={c.image} alt={`${c.bankName} ${c.name} 卡面`} loading="lazy" decoding="async" width={320} height={202} />
                    {c.status !== 'active' && (
                      <span className="absolute left-2 top-2 rounded-md bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">{STATUS_LABEL[c.status]}</span>
                    )}
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                        {c.bankLogo && <img src={c.bankLogo} alt="" width={40} height={16} className="h-4 w-10 rounded-sm object-contain px-0.5" style={{ background: c.bankLogoBg ?? '#fff' }} />}
                        {c.bankName}
                      </div>
                      <h3 className="truncate text-base font-bold leading-snug">{c.name}</h3>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${rewardClass}`}>{REWARD_TYPE_LABEL[c.rewardType]}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{c.headline}</p>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black tracking-tight">{c.bestRate}</span>
                    <span className="text-xs text-ink-soft">{c.effectivelyFree ? '免年費' : `年費 NT$${c.annualFee.toLocaleString()}`}</span>
                  </div>
                </a>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded bg-paper-2 px-1.5 py-0.5 text-[11px] text-ink-soft">
                        {TAG_LABEL[t]}
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(c.id)}
                    disabled={full}
                    aria-pressed={selected}
                    className="chip shrink-0 !px-2.5 !py-1 text-xs"
                    title={full ? `最多比較 ${MAX_COMPARE} 張` : undefined}
                  >
                    {selected ? '已加入' : '＋ 比較'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* ---- compare bar ---- */}
      {compareCards.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur" role="region" aria-label="比較清單">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
              {compareCards.map((c) => (
                <li key={c.id} className="flex shrink-0 items-center gap-2 rounded-lg border border-line bg-paper px-2 py-1 text-sm">
                  <img src={c.image} alt="" width={38} height={24} className="h-6 w-[38px] rounded-[3px] object-contain" />
                  <span className="max-w-[9rem] truncate">{c.name}</span>
                  <button type="button" onClick={() => toggleCompare(c.id)} aria-label={`移除 ${c.name}`} className="text-ink-soft hover:text-ink">
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <a href={`/compare?ids=${compareCards.map((c) => c.id).join(',')}`} className="btn btn-primary shrink-0 text-sm">
              比較 {compareCards.length} 張
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
