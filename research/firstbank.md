# 第一銀行 (firstbank) — research notes (rewritten from the live site 2026-11-03)

## Official card list
- Index page confirmed: `https://card.firstbank.com.tw/sites/card/CreditCardList` (「信用卡一覽/支付」). Read in the Claude
  desktop app's built-in browser; each tile is `.card-item` with a background-image card face, a 詳細內容 link
  (`/sites/card/zh_TW/<cid>`) and usually a 立即申辦 link.
- The list shows 36 tiles. Captured all **26 consumer credit cards**; skipped 公司鈦金商旅卡, 公司御璽商旅卡 (corporate),
  iLEO VISA 金融卡 / VISA金融卡 / 悠遊Debit卡 (debit) and the 台灣Pay / Apple Pay / Google Pay / Samsung Pay / HCE tiles.
- Every detail page has tabs 卡片優惠 (`#hot_activity_content`), 權益服務, 申辦及年費 (`#card_fee_content`), 推薦活動,
  更多優惠 (`#card_landing_content`, which links the card network's promo page — used to confirm networks). Content is
  XHR-rendered, so WebFetch/curl still only see the shell; the browser is required.
- Annual fees, waiver text and 申辦條件 are taken from each page's 申辦及年費 tab. The only page without a fee table is
  JCB晶緻卡; its 1,200 fee comes from the official 收費標準 PDF
  `https://www.firstbank.com.tw/sites/fcb/files/1565684562677` (which now downloads fine from the cloud: HTTP 200, PDF).
  The PDF agrees with every page-stated fee (世界卡 10,000; 商旅/雙幣 2,000; 1,200 tier; 金卡 600; 普卡/一卡通 300; 桃園 free).
- No 停止申請／停發 notice on any card page or on the index; all 26 cards are `active`. 白金商旅卡 and i-FIRST生活卡 have
  no 立即申辦 button on the index (no `apply_url`), so confirm they still accept applications.
- `needs_review` flags were removed from all cards; every card now has `image_url` (0 missing).

## Images
- All card faces are `https://card.firstbank.com.tw/sites/card/image/<id>` (PNG). A plain `curl` from the cloud returned
  HTTP 200 image/png for `1565690677193`, so the image fetch script should work without the browser.
- Extra card faces (not in JSON `image_url`) are listed in each card's `notes`.

## Could not verify / double-check
1. **Networks**: confirmed from the page for GLORY+世界卡, iLEO, 義享天地, 鈦金商旅, 雙幣鈦金商旅, 御璽商旅, 桃園, 宜蘭,
   綠活, 星璨, icash (JCB 晶緻), 悠遊聯名 (MC/Visa/JCB), 菁英御璽, 環貫綠佳利 (JCB), 媚儷鈦金 (MC), i-Fun (MC + JCB), 長庚
   (Visa), 一卡通 (Visa by 御璽 tier). **Inferred** (page gives no network): 由你分期卡, 里仁, 曼黛瑪璉, 白金商旅卡, 尊榮白金卡,
   i-FIRST生活卡, 臺科大 — filled `["visa","mastercard"]` and flagged in `notes`; check the card faces.
2. **Rates are activity titles**: the 卡片優惠 tab lists promo titles/subtitles (e.g. 鈦金商旅卡 「國內一般消費回饋 現金回饋無上限」
   with no number). Caps, 登錄 requirements and end dates are inside the linked activity pages and were not opened.
   Most 2026 promos run 2026-07-01 to 2026-12-31.
3. 悠遊聯名卡 `image_url` is the 普卡 face (lowest tier); 義享天地 uses the 鈦金卡 face; 里仁 uses 里仁版.
4. 環貫綠佳利聯名卡 general-spend 紅利 rate is not stated on the page.
5. 長庚紀念醫院悠遊認同卡 is employee-only (長庚體系正職員工) but is on the public list, so it is included as `active`.

## banks.json corrections
- `cards_index_url` `https://card.firstbank.com.tw/sites/card/CreditCardList` is correct (JS-rendered; needs a browser).
