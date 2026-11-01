export type Network = 'visa' | 'mastercard' | 'jcb' | 'amex' | 'unionpay';
export type RewardType = 'cashback' | 'miles' | 'points' | 'other';
export type CardStatus = 'active' | 'suspended' | 'discontinued';

export type Tag =
  | 'no-annual-fee'
  | 'online-shopping'
  | 'overseas'
  | 'travel'
  | 'airport-lounge'
  | 'mobile-payment'
  | 'dining'
  | 'department-store'
  | 'supermarket'
  | 'fuel'
  | 'transit'
  | 'streaming'
  | 'insurance'
  | 'student'
  | 'new-cardholder'
  | 'co-branded'
  | 'premium'
  | 'ev-charging'
  | 'installment';

export interface Reward {
  label: string;
  rate: string;
  rate_value?: number;
  cap?: string;
  conditions?: string;
  valid_until?: string;
  /** Show this reward as the card's main number (overrides the headline heuristic). */
  featured?: boolean;
}

export interface Card {
  id: string;
  bank: string;
  name: string;
  name_en?: string;
  networks: Network[];
  levels?: string[];
  annual_fee: { amount: number; max_amount?: number; waiver?: string; effectively_free?: boolean };
  reward_type: RewardType;
  tags: Tag[];
  headline: string;
  rewards: Reward[];
  highlights: string[];
  requirements?: string;
  status: CardStatus;
  status_note?: string;
  status_changed_at?: string;
  apply_url?: string;
  source_url: string;
  image_url?: string;
  image?: string;
  promo_until?: string;
  last_verified: string;
  notes?: string;
}

export interface Bank {
  id: string;
  name: string;
  short_name: string;
  name_en?: string;
  website: string;
  cards_index_url: string;
  watch_urls?: string[];
  color: string;
  logo?: string;
  notes?: string;
}

export interface ChangelogEntry {
  date: string;
  type: 'added' | 'updated' | 'status' | 'removed';
  bank: string;
  card_id?: string;
  card_name?: string;
  summary: string;
  source_url?: string;
}

/** Lightweight shape passed to the React explorer island. */
export interface CardSummary {
  id: string;
  bank: string;
  bankName: string;
  bankColor: string;
  name: string;
  networks: Network[];
  rewardType: RewardType;
  tags: Tag[];
  headline: string;
  bestRate: string;
  bestRateValue: number;
  annualFee: number;
  effectivelyFree: boolean;
  status: CardStatus;
  image: string;
  lastVerified: string;
}

export const REWARD_TYPE_LABEL: Record<RewardType, string> = {
  cashback: '現金回饋',
  miles: '哩程',
  points: '點數回饋',
  other: '其他',
};

export const REWARD_TYPE_DESC: Record<RewardType, string> = {
  cashback: '消費直接折抵帳單或回饋刷卡金，最直覺的回饋方式。',
  miles: '消費累積航空哩程，適合常出國、想換機票的人。',
  points: '累積銀行點數或合作平台點數（LINE POINTS、OPENPOINT、小樹點…），可折抵或兌換。',
  other: '以保險、分期或特定生活權益為主的卡片。',
};

export const TAG_LABEL: Record<Tag, string> = {
  'no-annual-fee': '免年費',
  'online-shopping': '網購',
  overseas: '海外消費',
  travel: '旅遊',
  'airport-lounge': '機場貴賓室',
  'mobile-payment': '行動支付',
  dining: '餐飲',
  'department-store': '百貨',
  supermarket: '超市量販',
  fuel: '加油',
  transit: '交通',
  streaming: '影音串流',
  insurance: '保險',
  student: '學生',
  'new-cardholder': '新戶禮',
  'co-branded': '聯名卡',
  premium: '頂級卡',
  'ev-charging': '電動車充電',
  installment: '分期',
};

/** Tags surfaced as "你最常刷哪裡" quick filters, in display order. */
export const SCENE_TAGS: Tag[] = [
  'online-shopping',
  'overseas',
  'mobile-payment',
  'dining',
  'department-store',
  'supermarket',
  'fuel',
  'transit',
  'streaming',
  'travel',
  'airport-lounge',
  'ev-charging',
];

export const NETWORK_LABEL: Record<Network, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  jcb: 'JCB',
  amex: 'American Express',
  unionpay: '銀聯',
};

export const STATUS_LABEL: Record<CardStatus, string> = {
  active: '開放申請',
  suspended: '暫停申請',
  discontinued: '已停止申請',
};
