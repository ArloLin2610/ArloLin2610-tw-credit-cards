# 第一銀行 (firstbank) — research notes (verified 2026-11-02)

## Official card list
- `https://card.firstbank.com.tw/` (banks.json value) is the card site home; the list page is
  `https://card.firstbank.com.tw/sites/card/CreditCardList` with category pages 熱門卡片 `/sites/card/1565690685614`
  and 頂級卡 `/sites/card/1565690685480`.
- **Blocker**: every page on card.firstbank.com.tw (Oracle WebCenter Sites; detail URLs look like
  `/sites/card/zh_TW/<cid>` or `/sites/Satellite?c=CreditCard&cid=...&pagename=FirstBankCard/CreditCard/zh/CreditCardDetailView`)
  returns only the ~42–46K-character navigation shell; product content is XHR-loaded and never appears in the fetched
  HTML. curl gets the bank's WAF block page (403 / "操作行為疑似不符網站要求"). The Chrome extension was not connected.
- Sources actually used (all official):
  1. 信用卡循環信用利率及各項費用收費標準 PDF `https://www.firstbank.com.tw/sites/fcb/files/1565684562677` — complete
     annual-fee table and the current product list (GLORY+世界卡, 義享天地聯名世界卡/鈦金卡, 鈦金/御璽/白金商旅卡, 雙幣卡,
     媚儷鈦金卡, 菁英御璽卡, 綠活卡, 里仁御璽聯名卡, 星璨卡, 宜蘭認同卡, iLEO信用卡, 晶緻/御璽/鈦金/白金/金/普卡,
     一卡通聯名卡, 桃園市市民卡聯名卡/桃園市認同卡 (free for life), 公司卡).
  2. 2026 信用卡權益手冊 PDF `https://www.firstbank.com.tw/sites/fcb/files/1565683022506` — per-tier insurance,
     road rescue, airport parking, purchase protection.
  3. English card intro page `https://www.firstbank.com.tw/sites/fcb/1565688843684` (server-rendered) — Wonderful
     2%/0.5%, iPass 1%, card images for 綠活/宜蘭/一卡通/icash/悠遊/里仁.
  4. Official iLEO campaign site `https://webar.firstbank.com.tw/c000000671/index.html` (2026.7.1–12.31); its content
     was read from the site's own publish JSON (`/api/weba/v3/site/publish/c000000671`).
- Captured 13 cards. Not captured (no reward data obtainable beyond fees): 媚儷鈦金卡, 菁英御璽卡, 晶緻卡/御璽卡/鈦金卡/
  白金卡/金卡/普卡 generic tiers. The "LEO 卡" named by the coordinator was not found; the product is iLEO信用卡.
- No 停止申請/停發 notice found on any reachable official page; all captured cards are `active` because they appear in
  the 2026 fee schedule. Note: the fee schedule does not list icash聯名卡 / 悠遊聯名卡 separately — they may have been
  folded into a tier or retired; verify before publishing.

## Could not verify / double-check
1. **Base reward rates** are missing for most cards (reward entries say 累點比率未載明). iLEO's general rate and the
   "指定通路最高 2%" channel list are also unverified; only the 2026 H2 promo tables were readable.
2. **Networks** are mostly inferred (iLEO = Mastercard confirmed from the official card-face image; 星璨/綠活/一卡通/icash/
   悠遊/宜蘭/雙幣/桃園 = placeholder mastercard; 商旅卡 御璽→Visa). Fix once the product pages can be rendered.
3. **Images**: www.firstbank.com.tw `/sites/fcb/image/<id>` URLs come from the English intro page; the bank's WAF may
   block scripted downloads (curl got the block page for /files/ URLs). 星璨卡 image omitted because the page's alt text
   ("icash Card") did not match. 7 cards lack `image_url`.
4. iLEO "最高 13%" is the sum of stacked new-cardholder promos; the 消費懶人包 table on the campaign page shows 4% for an
   existing cardholder paying with 街口 and 13% for 台灣Pay at 寶雅 (new + digital-account autopay). Components are not
   itemised in text.
5. icash聯名卡 / 悠遊聯名卡 annual fee 1,200 is an assumption (same tier); not in the fee PDF.

## banks.json corrections
- `cards_index_url` `https://card.firstbank.com.tw/` is fine as a landing page; the list is
  `https://card.firstbank.com.tw/sites/card/CreditCardList` (JS-rendered). For automated checks prefer the fee PDF
  `https://www.firstbank.com.tw/sites/fcb/files/1565684562677`.
