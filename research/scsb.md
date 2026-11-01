# 上海商銀 (scsb) — research notes

Verified 2026-11-01. All numbers from www.scsb.com.tw only.

## Official card list

- Confirmed 信用卡總覽: https://www.scsb.com.tw/content/card/card03.html
  (tabs: 小小兵卡 / 簡單卡 / 聯名卡 / 一般信用卡 / 認同卡). Card images on this page are
  lazy-loaded via `style="background-image: url(files/cardcover/...)"`, not `<img src>`.
- Credit-card home: https://www.scsb.com.tw/content/card (the menu is injected by
  `content/common/template_mobile_menu.html`, so a plain fetch of the home page shows no card links).
- Fees (all tiers, annual-fee table and waiver rules): https://www.scsb.com.tw/content/card/card05_i.html
- Eligibility: https://www.scsb.com.tw/content/card/card17.html
- Reward T&Cs per card (小小兵 / Teresa / 簡單卡 / 悠遊卡 tables): https://www.scsb.com.tw/content/card/card18.html
- 紅利折抵 (100 點抵 6 元 at most merchants): https://www.scsb.com.tw/content/card/card09_e.html
- Online apply entry (generic): https://apply.scsb.com.tw/creditcard/client/#/cc/card-main
  Card-specific `cardSerial` links exist only for 小小兵回饋卡(64) / 小小兵分期卡(65) / VISA簡單卡(27) /
  萬事達簡單卡(2) / Teresa(24) / 世界商務卡(25) / 牙醫師全聯會世界悠遊卡(5).

## 停發 / 權益變更

- 大戶屋聯名卡: the overview HTML contains a commented-out block stating the 大戶屋 contract expires
  2025-10-31 and new applications stopped 2025-07-01. It is no longer displayed on the public list, so it
  was NOT included in scsb.json (no visible 停發 announcement page found).
- No Pokémon / 寶可夢 card exists on the official SCSB list (coordinator's example was not found; not added).
- No dedicated 停止申請 announcement page found; 熱門活動 list (https://www.scsb.com.tw/content/card/hotList)
  only shows promos. 法定公告事項 (card08_k.html) holds only financial disclosures.

## Cards captured (15) and what to double-check

1. 小小兵回饋卡 / 小小兵分期卡 — rates and caps from card18 table; 12% 影城 promo is 2026/7/1–12/31 and
   requires 本行帳戶自動扣繳. Shared NT$1,000/期 cap across both Minions cards.
2. VISA簡單卡 / 萬事達簡單卡 — 1/2/3%; 3% only for face-to-face JPY/KRW transactions.
3. Teresa Card (JCB 極緻卡) — 3.8% 指定通路 cap NT$380/月; 指定外幣 2% cap NT$1,000/月. The designated
   merchant list is the 2026 one (Coupang added 2026).
4. 世界商務卡 — annual fee NT$10,000; thresholds for 機場接送 / 貴賓室 / 高鐵升等 live on card04_e / card04_f /
   news_081126sh3 and were not transcribed.
5. 悠遊ONE卡 / 悠遊卡 (白金/普卡) — 0.3% + 1% 加油 (cap NT$1,000/期). Fee 普卡 600 / 白金 1,200.
6. 現金回饋商務御璽卡 (overview calls it 利倍商務御璽卡) — 0.6% / 1.5%.
7. JCB晶緻卡, MasterCard鈦金卡／VISA白金卡, 個人商務鈦金卡, 寶吉祥鈦金卡, 鳳凰旅遊卡 — 紅利 20元1點 cards.
   `rate_value` 0.3 is DERIVED from 100點抵6元 (not stated as a % on the site); flagged in each card's
   `conditions`. Maintainer may prefer to drop rate_value for points cards.
8. 寶吉祥鈦金卡 — named 鈦金 but the official card image shows Visa Platinum; recorded as `visa`.
9. 國防醫學院校友會聯名卡 — eligibility (alumni only?) not stated on the page; card face has 校友證號.
10. Cards whose product page only links to the paper form (card012_Download01.html) got the generic
    card-main apply URL from the overview page.

## Not captured (on the list but excluded)

- 傳富理財世界商務卡 — 僅限本行邀請之貴賓申辦 (invitation-only wealth clients).
- 公司商務鈦金卡 — corporate card.
- 認同卡: 牙醫師全聯會世界悠遊卡, 牙醫師公會世界商務卡, 牙醫師公會鈦金卡, 會計師、建築師金卡 — profession-restricted
  (牙醫師執照 / 醫師執照 / 會計師、建築師). Could be added later; 牙醫師全聯會世界悠遊卡 page is card03_c4.html
  (國外 2.2% / 國內 0.3% / 保費 1.2%, 終身免年費 after 1 swipe, image image_card03_c4.png).

## Image URLs

All 15 cards have `image_url` under https://www.scsb.com.tw/content/card/files/cardcover/ (verified HTTP 200,
image/png or image/gif). Note `image_card03_g3.gif` is actually a PNG served as image/gif.

## banks.json corrections

- `cards_index_url` for scsb is wrong: `https://www.scsb.com.tw/content/card/card.html` returns 404.
  Correct value: `https://www.scsb.com.tw/content/card/card03.html`.
