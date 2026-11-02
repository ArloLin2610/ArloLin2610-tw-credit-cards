# 王道銀行 (obank) — research notes

Verified 2026-11-01; re-checked 2026-11-02 by a second agent (homepage navigation re-fetched: the only card products are 簽帳金融卡／公益認同卡／校園認同卡／聯名卡／低碳卡／頂級卡, all debit; the string 信用卡 does not appear on the homepage). Result: **王道銀行 does not issue credit cards.** `data/cards/obank.json` is intentionally an empty array.

## Evidence (official site only)

- Sitemap https://www.o-bank.com/sitemap.xml (187 URLs) contains no 信用卡 page; the only card pages are
  under `/retail/debit/` (簽帳金融卡): cardmain_new, cobranded-card, lowcarboncard, vip-card,
  affinity-card, school-affinity-card.
- Homepage nav (https://www.o-bank.com/) under 消費 lists only 簽帳金融卡 / 公益認同卡 / 校園認同卡 / 聯名卡 /
  低碳卡 / 頂級卡 — all debit. There is no 信用卡 menu item.
- The debit overview https://www.o-bank.com/retail/debit/cardmain_new explains "簽帳金融卡 VS 信用卡比較" and
  positions all O-Bank cards as 簽帳金融卡 (Debit Card, 即用即扣, 無信用審核). Base reward: 國內、外 1% 現金回饋無上限
  (2026/01/01–2026/12/31). Newest product "O! Range Card" (launched 2025-12-31) is also a 簽帳金融卡.
- The coordinator's examples "O-Bank 現金回饋卡 / 小鈦卡" were not found as credit-card products; the 現金回饋
  cards on the site are debit cards, and no "小鈦卡" exists on o-bank.com.

The brief excludes debit/金融卡, so nothing was captured. If the site later adds a 信用卡 section, the
place to look is the 消費 menu on the homepage.

## banks.json corrections

- `cards_index_url` `https://www.o-bank.com/retail/cards` returns 301 to a non-card page. If the bank is kept
  in banks.json, the closest official card index is the debit overview
  `https://www.o-bank.com/retail/debit/cardmain_new` (debit cards only). Consider removing obank from the
  site's bank list, or flagging it as "簽帳金融卡 only" in the UI.
