# 樂天信用卡 (rakuten) — research notes

Verified 2026-11-01/02. 5 consumer cards captured in `data/cards/rakuten.json` (all active, 0 discontinued, 0 missing images).

## Issuer — important

The 樂天信用卡 products are issued by **台灣樂天信用卡股份有限公司 (Taiwan Rakuten Card, Inc.)**, a licensed credit-card company, **not** by 樂天國際商業銀行 (Rakuten Bank Taiwan, the pure internet bank). The bank's own site (https://www.rakuten-bank.com.tw/) is an Angular SPA whose sitemap has only one card URL (`/portal/campaign/Rakutencard`, a cross-promo) and its JS bundle contains no 信用卡 text; the bank itself markets no credit card. Every number in the JSON comes from the card company's official site.

## Official sources

- Card site: `https://www.card.rakuten.com.tw/` — note the `www.`; `https://card.rakuten.com.tw/` (the value in banks.json) resets TCP connections from this environment and is robots-blocked for WebFetch. With `www.` and `--http1.1 -4`, curl returns full server-rendered HTML.
- Card index: https://www.card.rakuten.com.tw/corp/product/ (lists 樂天樂翔卡, 樂天Panda J卡, 樂虎卡, 樂天桃猿卡, 樂天玫瑰金卡, 樂天公司卡).
- Product pages: 樂翔卡 `/corp/ads/11.xhtml`, Panda J `/corp/ads/04.xhtml`, 樂虎卡 `/corp/ads/16.xhtml`, 桃猿卡 `/corp/ads/09.xhtml`. 玫瑰金卡 has no product page (its 了解更多 goes to the campaign index), so `source_url` is the product index.
- Annual fee disclosure (各項費用計算說明): https://www.card.rakuten.com.tw/corp/disclosure/charges.xhtml — 玫瑰金／桃猿鈦金 免年費；樂虎卡 688；Panda J 2,000；樂翔御璽 3,000／無限 15,000；桃猿世界卡 3,880. FAQ (`/corp/support/faq.xhtml`) repeats these.
- 樂天點數回饋計畫 terms: https://www.card.rakuten.com.tw/corp/terms/super-point.xhtml (points only for 台灣樂天市場 spend; no rate stated).
- Card-face images are on the CDN `https://image.card.tw.r10s.com/images/common/...` (pr2.png 樂翔御璽, p1.png Panda J, m1.png 桃猿鈦金, copy_card_09.png 玫瑰金 Visa, landing/ad16/images/tigercard2.png 樂虎卡).
- Excluded: 樂天公司卡 (corporate).

## Fields to double-check

1. **樂天玫瑰金卡** — the site states 免年費 and perks (機場貴賓室入場免費, 日本商店優惠, 全球訂房 10%) but no general reward rate anywhere I could read; recorded as `reward_type: other` with the 樂天點數 program as the only reward row. The lounge benefit's conditions are not in readable text.
2. **樂天樂翔卡** — recorded as `miles` with `rate_value` = NT$ per 樂翔積分 (6／12／18). The 積分→哩程 conversion ratio is not stated (only "每組以 900 積分為單位", min 5,000); confirm before showing "NT$ per mile". FAQ says 御璽卡 海外 NT$13 = 1 積分 while the product page says NT$12 — product page used.
3. **樂天桃猿卡** — only 精選通路 rates are stated; no base rate. The product page has a `type=jcb_monkey` apply link but the card is shown as Mastercard only.
4. Panda J／樂虎卡 promo rates are 2026-dated (Panda J 2026/7/1–12/31, 樂虎卡 2026/1/7–12/31); 樂翔積分 scheme runs to 2027/6/30; 桃猿 precinct offers to 2027/4/30.

## banks.json corrections

- `name`: `台灣樂天信用卡股份有限公司`; `short_name`: `樂天信用卡`; `name_en`: `Taiwan Rakuten Card, Inc.` (currently says 樂天國際商業銀行 / Rakuten Bank Taiwan, which is a different company that issues no credit cards).
- `website`: `https://www.card.rakuten.com.tw/`
- `cards_index_url`: `https://www.card.rakuten.com.tw/corp/product/` (the bare `card.rakuten.com.tw` host is unreachable from the fetch environment).
