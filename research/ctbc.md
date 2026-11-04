# 中國信託 (ctbc) — research notes

Updated 2026-11-03 (browser pass in the Claude desktop built-in browser). Earlier 2026-11-01 notes are folded in below.

## Official sources confirmed
- **Card list page (所有卡片):** `https://www.ctbcbank.com/twrbo/zh_tw/cc_index/cc_product/cc_introduction_index.html` — renders ~6 "popular" tiles by default, but the tiles and filters are driven by an official JSON feed:
  **`https://www.ctbcbank.com/web/content/twrbo/setting/creditcards.cardlist.json`** — 49 products, each with `cardId`, `cardName`, `cardImg[]` (card-face PNG/JPG paths under `/content/dam/twrbo/images/creditcard/card/`), `issueGroup` (VISA/Mastercard/JCB/AE), `cardLevel`, `cardFeature[]`, `annualFee` (HTML), `specialOffer`, `firstTimeGift`, `introLink`, `applyLink`, `onlineDate/offlineDate`. Discontinued products are marked with `※本卡已停止申辦` as the first `cardFeature` entry. This feed is the best target for the update checker (plain JSON, no JS, fetched fine from the cloud).
- **Product pages:** `https://www.ctbcbank.com/twrbo/zh_tw/cc_index/cc_product/cc_introduction_index/<cardId>.html` (e.g. `C_uniopen.html`, `C_CAL.html`, `B_Top.html`). Content is server-rendered inside `<main>` (tabs 卡片特色 / 專屬優惠 / 附加權益 / 申請辦法&年費; the last one has 一、發行卡片 (network + tiers), 二、申請條件, 四、年費).
- **Cloud access:** the card-list JSON, the card images and the first 1–2 product-page fetches return 200 from the cloud; after a few page requests the site returns the JS bot-challenge shell (HTTP 202, ~18 KB). All product pages were therefore read in the person's built-in browser. Images: all 16 `image_url`s downloaded with a plain `fetch` from the cloud (200, image/png or image/jpeg, 20–180 KB) — the image script should work without a browser.
- No standalone 停發／權益變更 announcement page exists; the 用卡須知 page (`.../cc_introduction_index/Card_Notice.html`) is general. Status flags live in the card-list JSON / product tiles (`※本卡已停止申辦`) and inside product pages.

## Captured (16 cards in data/cards/ctbc.json, all `last_verified: 2026-11-03`)
| id | name | status | source |
|---|---|---|---|
| ctbc-linepay | LINE Pay信用卡 | active | product page (tiers/fee) + official LINE Pay minisite (rates) |
| ctbc-ana | ANA聯名卡 | active | product page (networks/tiers/fee table) + ANA minisite (miles) |
| ctbc-allme | ALL ME卡 | active | product page + ALLME minisite |
| ctbc-cpc | 中油聯名卡 | active | product page (+ CPC minisite for 中油 Pay 儲值 4%) |
| ctbc-uniopen | uniopen聯名卡 | active | product page — fully re-verified, `needs_review` removed |
| ctbc-lol | 英雄聯盟信用卡 | **discontinued** (停止申辦 since 2025/10/31) | product page |
| ctbc-china-airlines | 中華航空聯名卡 | active (needs 華夏會員 since 2025/11/27) | product page — fully re-verified |
| ctbc-agoda | Agoda聯名卡 | active | product page — fully re-verified |
| ctbc-marriott | 萬豪旅享家聯名卡 (new 2026/9/16) | active | product page |
| ctbc-sogo | 遠東SOGO聯名卡 | active | product page |
| ctbc-bank-card | 中國信託銀行卡 (new 2026) | active | product page |
| ctbc-business-titanium | 中信商旅鈦金卡 | active | product page |
| ctbc-cht | 中華電信聯名卡 | active | product page |
| ctbc-foodpanda | foodpanda聯名卡 | active | product page |
| ctbc-hotai | 和泰聯名卡 | active | product page |
| ctbc-top | 中信鼎極卡 | active | product page |

All 16 have `image_url` (official card-list PNG/JPG, lowest tier chosen). The non-schema `needs_review` flag was removed from all four previously partial cards.

## Products on the official list but not captured (49 total)
- **Active, lower priority:** 漢神聯名卡(台中漢神洲際) C_HanShin, 漢神聯名卡(高雄漢神百貨) C_HanShin_K (new 2026/4), LaLaport聯名卡 C_LaLaport, TAIPEI 101聯名卡 C_TAIPEI101, 中信紅利御璽卡 B_Bounspoint_Signature, 寰遊美國運通卡 B_HAE (AE 金卡, insurance 1.68%), 中信兄弟聯名卡 C_Brother, 大中華攜手飛聯名卡 C_GCC, LEXUS聯名卡 C_LEXUS (LEXUS 車主限定), Global Mall聯名卡, 秀泰聯名卡, 大葉高島屋聯名卡, 南紡購物中心聯名卡, 家扶認同卡, 慈濟蓮花卡, 紙風車認同卡, 東吳大學認同卡.
- **Excluded per brief:** 財管鼎鑽卡 B_Top_F (wealth-management only, no apply link); 中信商務卡/雙幣商務卡 B_EC (商務卡已停止申辦, 雙幣卡 paper-only).
- **Listed as 停止申辦 / 停止發行 (not captured, record if the site wants a discontinued section):** 中信紅利晶緻卡, 中信現金回饋御璽卡, 中信現金回饋鈦金卡, 中信紅利卡, iPlan卡, Super Life VISA卡, 勤美天地聯名卡, 無印良品聯名卡, 酷玩卡, 學學認同卡 (115/7/1 停止申辦), 商旅卡 (停止發行), 分期紅利卡, 統一企業認同卡, 享想生活卡. (This confirms the earlier unverified news about 勤美／無印良品.)
- Costco 聯名卡 is not a CTBC product.

## Status / tier changes seen on product pages (2026-11-03)
- LINE Pay: JCB 極緻卡 stopped 2026/1/1, JCB 晶緻卡 stopped 2026/6/1 → networks now Visa only (御璽／商務御璽; 無限卡 邀請制).
- 中油聯名卡: 自 2026/1/1 起僅發行 VISA 御璽卡 (白金卡 paused).
- 中華電信聯名卡: 自 2025/1/1 起停止新發 VISA 白金卡及 Mastercard 世界／鈦金／白金卡 → VISA 無限卡／御璽卡 only.
- 中華航空聯名卡: 自 2025/11/27 起需具華航華夏會員身份方可申辦.
- 英雄聯盟卡: 2025/10/31 停止發卡 → `discontinued`.

## Things the maintainer should double-check
1. **Annual-fee amounts that are not on the product page** (page says 首年免年費 only): 遠東SOGO, 中國信託銀行卡, 商旅鈦金, 中華電信, 鼎極卡 come from the card-list JSON `annualFee` field; foodpanda and 和泰 use the bank's standard 御璽 NT$1,800/900 (fee FAQ) — neither page nor JSON states foodpanda's amount. 英雄聯盟 fee likewise inferred (card is discontinued anyway).
2. **rate_value for 紅利點數 cards** (中油, 鼎極): approximations using 紅利 100 點 = NT$8; the base NT$30/點 accrual is from the bank 刷卡得利計劃 and is not restated on the product pages.
3. **Promo expiry:** nearly every rate carries `valid_until: 2026-12-31` (uniopen 2026/9/1–12/31, Marriott/SOGO 2026/9–10 → 12/31). Re-run the check in January 2027; the card-list JSON `specialOffer`/`annualFee` text usually changes with the new program year.
4. Agoda / foodpanda `reward_type` set to `cashback` because A 金／胖達幣 are NT$ 1:1 but only redeemable on the partner platform — switch to `other` if the site wants to flag restricted redemption.
5. 中華電信: the card-list JSON calls the top tier 鼎極卡 (NT$5,000) while the product page calls it 無限卡 — recorded as 無限卡 with the 5,000 fee.

## banks.json corrections
- `cards_index_url` is **wrong** (`/twrbo/zh_tw/cc_index/cc_cards.html` → HTTP 404 "此功能尚未開放"). Use:
  `https://www.ctbcbank.com/twrbo/zh_tw/cc_index/cc_product/cc_introduction_index.html`
- Suggested machine-readable source for the update checker: `https://www.ctbcbank.com/web/content/twrbo/setting/creditcards.cardlist.json` (no JS, reachable from the cloud; diff `cardFeature`, `annualFee`, `specialOffer`, `isOnline`, `offlineDate`, and the `※本卡已停止申辦` marker).
- No dedicated 停發公告 URL; status markers are inside the card-list JSON and on each product page.
- Still-useful static sources: minisites under `https://www.ctbcbank.com/content/dam/minisite/long/creditcard/` and the fee FAQ `https://service.ctbcbank.com/FAQ/Page01?kmid=15086`.
