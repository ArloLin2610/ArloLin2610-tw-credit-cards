# 兆豐國際商業銀行 (mega) — research notes

Verified 2026-11-01.

## Official sources

- Card list (卡片總覽): https://www.megabank.com.tw/personal/credit-card/card/overview
  - The list is rendered client-side from a JSON API:
    `POST https://www.megabank.com.tw/api/client/CreditCardOverview/GetCreditCards?sc_lang=zh-TW&sc_site=bank-zh-tw&dic_lang=zh-TW` with form body `itemID={24275377-26C2-43F4-8F15-E4F6B874F51A}`.
    It returns 43 products with title, 520×520 card image, detail URL, apply URL and a `Removal` flag (true = 停發). Useful for future re-verification.
- Individual product pages: `https://www.megabank.com.tw/personal/credit-card/card/overview/<slug>` (each has tabs 卡片特色 / 優惠通路 / 年費申辦須知).
- Annual-fee table for all cards: 115年綜合版權益手冊 (115.07) PDF — https://www.megabank.com.tw/-/media/mega/files/bankv2/personal/credit-card/rights/guide-book1/11511507-2.pdf (linked from https://www.megabank.com.tw/personal/credit-card/rights/guide-book). Used for cards whose product page omits the fee amount (Gogoro, 統一獅, 兆豐悠遊聯名卡, 雅芳).
- 公告與須知: https://www.megabank.com.tw/personal/credit-card/service/announcement (JS-rendered list; could not read items via plain fetch). 停發 status was taken from the card-list API / product page banners instead.
- 辦卡說明 (eligibility): https://www.megabank.com.tw/personal/credit-card/card/directions

## Coverage

23 cards captured: 22 active + 1 discontinued (經典鈦金卡). Consumer cards on the official list that were **not** captured, with reason:

- e秒萬事通金融信用卡, e秒Happy金融信用卡 — combo debit+credit, 臨櫃 only; benefits identical to e秒刷卡 / e秒Happy卡 (mentioned in those cards' notes).
- 停發 cards with no live benefits on the page (only listed as 停發 in the API): 自然美聯名卡, 公務人員國民旅遊卡, 一般民眾國民旅遊卡, 生活工場聯名卡, 聖德科斯聯名卡, 個人商旅卡, 幸福卡, 雅芳聯名卡(白金/金/普卡), 萬事通悠遊金融信用卡, MEGA VISA / Mastercard / JCB, Fancy歡喜卡. All have `Removal: true` in the API; skipped because they can no longer be applied for and most pages show no current rates.
- Excluded as non-consumer: VISA公司商務御璽卡, 公司商務鈦金卡, 商務卡(停發), 政府採購卡, VISA金融卡.

Coordinator's hint mentioned "ME 卡" and "uniopen 聯名卡" for 兆豐 — neither exists on the official Mega list (uniopen 聯名卡 is a 國泰世華 product). Closest Mega product is 統一7-ELEVEN獅聯名卡 (captured).

## Things to double-check

1. **Promo-period rates.** Most Mega rates (利多御璽卡 2%+1%+0.1%, Mega One 1.5%+1.38%+0.12%, BT21, e秒 series, 中鼎, 雙幣鈦金) are stated as "適用 115/7/1–12/31 帳單結帳日" and are built from base + 電子帳單加碼. `promo_until: 2026-12-31` is set on these; base rates must be re-verified in Jan 2027.
2. **經典鈦金卡** page says 已停止發行 but the API still carries a 立即申辦 button — kept as `discontinued`; confirm.
3. **兆豐悠遊聯名卡** levels/networks (晶緻/白金/金/普; VISA+JCB) and fee tiers (2,400/1,200/600) come from the handbook + API `org` field; the product page itself doesn't enumerate tiers. Likewise e秒 series "鈦金卡" level comes only from the Mastercard-offer link text on the page.
4. **兆豐世界卡** and **將來銀行聯名卡** product pages label the 卡種 as "商務世界卡"/"商務卡" (Mastercard product-type naming) though they are consumer cards.
5. **BT21** has two card faces (經典黃／方格綠) with separate apply links; `apply_url` = 經典黃, `image_url` = 方格綠 (the API list image).
6. Apply URLs contain GUIDs in braces; stored percent-encoded (`%7B…%7D`) to satisfy URI format — they resolve identically.

## banks.json corrections

- `cards_index_url` for `mega` is wrong: `https://www.megabank.com.tw/personal/credit-card/card` returns **404**. Correct value: `https://www.megabank.com.tw/personal/credit-card/card/overview`.
