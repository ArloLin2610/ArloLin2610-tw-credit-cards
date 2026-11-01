import { useEffect, useMemo, useState } from 'react';
import type { Card } from '../lib/types';
import { NETWORK_LABEL, REWARD_TYPE_LABEL, STATUS_LABEL, TAG_LABEL } from '../lib/types';

export interface CompareCard extends Card {
  bankName: string;
  imageSrc: string;
  feeText: string;
}

interface Props {
  cards: CompareCard[];
}

const COMPARE_KEY = 'twcards.compare';
const MAX = 3;

function idsFromUrl(): string[] {
  try {
    const p = new URLSearchParams(window.location.search).get('ids');
    return p ? p.split(',').filter(Boolean).slice(0, MAX) : [];
  } catch {
    return [];
  }
}
function idsFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export default function CompareTable({ cards }: Props) {
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = idsFromUrl();
    setIds(fromUrl.length ? fromUrl : idsFromStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
      const url = new URL(window.location.href);
      if (ids.length) url.searchParams.set('ids', ids.join(','));
      else url.searchParams.delete('ids');
      window.history.replaceState(null, '', url);
    } catch {
      /* ignore */
    }
  }, [ids, ready]);

  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const chosen = ids.map((id) => byId.get(id)).filter(Boolean) as CompareCard[];

  const candidates = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return cards
      .filter((c) => !ids.includes(c.id) && c.status === 'active' && (c.name.toLowerCase().includes(needle) || c.bankName.includes(needle)))
      .slice(0, 8);
  }, [q, cards, ids]);

  const remove = (id: string) => setIds((cur) => cur.filter((x) => x !== id));
  const add = (id: string) => {
    setIds((cur) => (cur.length >= MAX || cur.includes(id) ? cur : [...cur, id]));
    setQ('');
  };

  const rows: { label: string; render: (c: CompareCard) => React.ReactNode }[] = [
    { label: '銀行', render: (c) => c.bankName },
    {
      label: '回饋類型',
      render: (c) => (
        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold reward-${c.reward_type === 'cashback' ? 'cash' : c.reward_type}`}>
          {REWARD_TYPE_LABEL[c.reward_type]}
        </span>
      ),
    },
    { label: '年費', render: (c) => (
      <div>
        <div>{c.feeText}</div>
        {c.annual_fee.waiver && <div className="mt-1 text-xs text-ink-soft">{c.annual_fee.waiver}</div>}
      </div>
    ) },
    { label: '卡別', render: (c) => (c.levels?.length ? c.levels.join('、') : '—') },
    { label: '卡組織', render: (c) => c.networks.map((n) => NETWORK_LABEL[n]).join('、') },
    {
      label: '回饋內容',
      render: (c) => (
        <ul className="space-y-2">
          {c.rewards.map((r, i) => (
            <li key={i}>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tight">{r.rate}</span>
                <span className="text-sm">{r.label}</span>
              </div>
              {(r.cap || r.conditions || r.valid_until) && (
                <div className="text-xs text-ink-soft">
                  {[r.cap, r.conditions, r.valid_until ? `至 ${r.valid_until}` : ''].filter(Boolean).join('；')}
                </div>
              )}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: '亮點',
      render: (c) => (
        <ul className="list-disc space-y-1 pl-4 text-sm">
          {c.highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      ),
    },
    { label: '適合', render: (c) => c.tags.map((t) => TAG_LABEL[t]).join('、') || '—' },
    { label: '申請資格', render: (c) => c.requirements || '—' },
    {
      label: '狀態',
      render: (c) => (
        <span className={c.status === 'active' ? '' : 'font-semibold text-danger'}>
          {STATUS_LABEL[c.status]}
          {c.status_note ? `（${c.status_note}）` : ''}
        </span>
      ),
    },
    { label: '最近核對', render: (c) => c.last_verified },
    {
      label: '',
      render: (c) => (
        <div className="flex flex-col gap-2">
          {c.apply_url && (
            <a href={c.apply_url} target="_blank" rel="noopener nofollow" className="btn btn-cash text-sm">
              前往官網申請
            </a>
          )}
          <a href={c.source_url} target="_blank" rel="noopener nofollow" className="text-xs text-ink-soft underline">
            官方資料來源
          </a>
          <a href={`/cards/${c.id}`} className="text-xs underline">
            卡片詳細頁
          </a>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="relative mb-6 max-w-md">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={chosen.length >= MAX ? `最多比較 ${MAX} 張，先移除一張` : '輸入卡名或銀行加入比較…'}
          disabled={chosen.length >= MAX}
          aria-label="加入卡片到比較"
          className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm"
        />
        {candidates.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-line bg-white shadow-lift">
            {candidates.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => add(c.id)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-paper-2">
                  <img src={c.imageSrc} alt="" width={44} height={28} className="h-7 w-11 rounded-[3px] object-contain" />
                  <span className="text-ink-soft">{c.bankName}</span>
                  <span className="font-medium">{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {chosen.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center text-ink-soft">
          比較清單是空的。從<a href="/" className="mx-1 underline">首頁</a>把卡片加進來，或在上方搜尋。
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="spec min-w-[640px]">
            <thead>
              <tr>
                <th className="!w-28 align-bottom" />
                {chosen.map((c) => (
                  <td key={c.id} className="w-1/3 align-bottom">
                    <div className="card-face mb-3 max-w-[260px]">
                      <img src={c.imageSrc} alt={`${c.bankName} ${c.name} 卡面`} width={320} height={202} />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-ink-soft">{c.bankName}</div>
                        <div className="text-lg font-bold leading-tight">{c.name}</div>
                      </div>
                      <button type="button" onClick={() => remove(c.id)} className="chip !px-2 !py-1 text-xs" aria-label={`移除 ${c.name}`}>
                        移除
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">{c.headline}</p>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <th scope="row">{row.label}</th>
                  {chosen.map((c) => (
                    <td key={c.id}>{row.render(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
