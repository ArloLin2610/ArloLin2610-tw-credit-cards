# 新光銀行 (skbank) — research notes

Verified 2026-11-01. All numbers from www.skbank.com.tw only.

## Headline finding: every Shin Kong card has stopped accepting applications

- The official 信用卡種類一覽 (https://www.skbank.com.tw/CC-Creditcard/) lists 14 items; every title carries a
  停止申辦 suffix. 10 cards: 「自2026年10月30日停止申辦及進件」; 鼎鑽財富無限卡 / 分期七卡 / 極緻卡:
  「自2025年8月1日起已停止申辦及進件」; 新光加油卡: 「自即日起已停止申辦及進件」.
- Context on the site: 新光銀行與台新銀行將於 2027/1/1 正式合併 (合併專區:
  https://mkp.taishinbank.com.tw/s/2026/merger/index.html). All 13 credit cards are recorded with
  `status: "discontinued"` and `status_changed_at`. The site UI should probably hide or clearly label this bank.
- No `apply_url` on any card (no online application exists any more).

## Official URLs

- Card index (confirmed): https://www.skbank.com.tw/CC-Creditcard/  (SSR only renders page 1 of 3; pages 2–3 and
  card detail pages are rendered client-side by Angular from `/portal-api/domain/CreditCard`, which returns a
  maintenance page to non-browser clients. I rendered the pages with headless Chrome to read them.)
- Card detail pages: https://www.skbank.com.tw/credit_card/credit_card/{id}, ids 101 102 103 104 105 106 108 111
  115 116 117 118 119 (120 = 新光Visa簽帳金融卡, debit, excluded).
- Images: https://www.skbank.com.tw/resource/<uuid>.png — all 13 cards have `image_url`.
- Reward rule pages: 現金點數回饋辦法 https://www.skbank.com.tw/CC-CashpointRules/, 紅利點數回饋辦法
  https://www.skbank.com.tw/CC-BonusPointRules/, 加油金回饋辦法 https://www.skbank.com.tw/CC-RefuelingRebateRules/.

## Cards captured (13) — things to double-check

1. 寰宇現金回饋卡 — 國內最高 1% / 國外最高 3% / 行動支付網購影音最高 3%; all "最高" rates need both 指定任務
   (電子帳單 + 新光帳戶自動扣繳); 活動加碼 cap 1,000 點/期, 指定數位加碼 cap 200 點/期; promo 2026/1/2–12/27.
   Basic rates (國內 0.6%, 國外 1.5%) are uncapped. Issued as Visa 商務御璽 and Mastercard 鈦金商務.
2. 世界卡 — page shows both 國外 0.6% 現金回饋 and 20元1點 紅利; whether they stack is not stated. 保費 1.1% only on
   the list page.
3. 美麗華悠遊聯名卡 — card face is Mastercard, but its 優惠懶人包 lists JCB-only offers; a JCB version may exist.
4. 分期七卡 — no reward stated; `reward_type: other`. Fee tiers 普卡 500 / 白金 2,000 / 晶緻 2,000.
5. 新光ESG白金卡 — tiers 普卡 500 / 金卡 1,000 / 白金 2,000; free while on e-billing.
6. 鼎鑽財富無限卡 — invitation-only wealth card; kept because it is on the public list (brief rule).
7. 紅利 cards: `rate_value` 0.3 is derived from the 新光三越 in-store rule 1,000 點抵 60 元 (= NT$0.06/point at
   20元/點). Not an official % — consider dropping for points cards.
8. 無限卡 — 2026/1/1 邀請制, then stopped 2026/10/30; annual fee 20,000.

## banks.json corrections

- `cards_index_url` `https://www.skbank.com.tw/credit-card` → should be `https://www.skbank.com.tw/CC-Creditcard/`.
- Consider adding a bank-level note/flag: 新光銀行 stopped issuing all credit cards on 2026-10-30 ahead of the
  2027-01-01 merger into 台新銀行; `website` will likely redirect to taishinbank.com.tw after that date.
