# 合作金庫 (tcb) — research notes (verified 2026-11-01/02)

## Official card list
- Confirmed index: `https://www.tcb-bank.com.tw/personal-banking/credit-card/intro/overview` (所有卡片). The page is
  JS-rendered (WebFetch shows "查無資料"); the card list comes from the site's own JSON (46 entries, cached in the
  scratchpad as `dl/tcb/cards.json`). Landing page `/personal-banking/credit-card` lists the 10 featured cards.
- The coordinator's examples "CoCo 卡 / ESG 卡 / uniopen 聯名" do **not** exist on the TCB site. Actual lineup (46):
  無限金鑽卡、卡娜赫拉悠遊聯名卡(環保綠能卡)、卡娜赫拉無實體卡、合庫利High卡、世界卡、無限卡、i享樂生活卡(Master/VISA)、
  鹿港天后宮認同卡、樂活卡、i運動卡、雙幣信用卡、漢來美食聯名卡(晶緻/鈦金/世界)、活力御璽卡、晶片COMBO卡、
  卡娜赫拉icash聯名卡(夢想鑽現卡/夢想鑽點卡)、台大醫院卡、一般醫院卡、政府採購卡、iCash聯名卡、悠遊聯名卡、晶緻卡、
  白金商旅卡、白金卡、御璽商旅卡、愛家卡(房貸戶限定)、雄獅旅遊旺來卡、臺灣菸酒採購卡、靈鷲山富貴卡、臺北商業大學認同卡、
  國立臺中科技大學認同卡、中台世界博物館認同卡、國防醫學院認同卡、9 張信用合作社聯名卡、VISA金融卡.
- Captured 22 consumer cards. Skipped: 政府採購卡/雄獅旺來卡/臺灣菸酒採購卡 (corporate/purchasing), VISA金融卡 (debit),
  晶片COMBO卡 (tier-less bank-account tied; rates depend on deposit balance), 悠遊聯名卡/晶緻卡/白金商旅卡 (no rates
  stated), 9 信合社聯名卡 + 靈鷲山/北商大/中科大認同卡 (regional/affinity with no rates on list), 台大醫院卡 (same
  content as 一般醫院卡, employees-only).
- No card is marked 停止申請/停發 on the index. 合庫利High卡 page notes the *old card face* stopped issuing 2023-08-01
  (card itself still active).

## Announcement pages
- 信用卡公告訊息: `https://www.tcb-bank.com.tw/personal-banking/credit-card/common-services/announcement`
  - 2026-10-29: 本行自 115/10/28 起恢復受理新客戶申請信用卡並全面開放線上申請 (i.e. new-customer applications
    were suspended before 2026-10-28 — all cards are `active` as of today).
  - 2026-04-20 樂活卡優惠變更 (`.../announcement/27`): 樂活加碼 2% monthly cap 300 → 100 from 2026-07-01.
  - 2026-06-26 約定條款修訂 (`.../announcement/115-0168`).
- 年費／費用總表: `https://www.tcb-bank.com.tw/personal-banking/credit-card/common-services/fee` (used for 御璽商旅卡、
  白金卡、i享樂、樂活、漢來 fees; also lists 靈鷲山富貴卡/心臟病兒童基金會認同卡/聯電卡 as 免年費).

## Could not verify / double-check
1. **i享樂生活卡、樂活卡、漢來美食聯名卡**: detail pages live on `https://portal.tcb-bank.com.tw:8443/Campaign/...`
   which is unreachable (robots-disallowed for WebFetch; connection reset on port 8443). Rates are from the index
   subtitles only (i享樂 1% + 四大通路最高 5%; 樂活 單筆最高 9%; 漢來 9 折). Channel lists, thresholds, caps,
   base rates and promo periods are **unverified**; 漢來 has `reward_type: other` with no cashback rate.
2. **Networks**: the index filter says 不限 for 卡娜赫拉無實體卡, 中台世界博物館御璽卡, 醫院卡; filled from tier names /
   page links (御璽→Visa, 鈦金 Combo→Mastercard, virtual→Mastercard via the Mastercard offers link). Confirm.
3. Many base rates are labelled "2026/7/1–12/31 活動期間" (活力御璽卡 1%/1.5%, i運動卡 0.5%/1.5%, 國防醫學院 0.8%/3%,
   卡娜赫拉 1%). Post-2026 base rates need re-checking.
4. 無限金鑽卡 新卡迎賓禮 and 保費 0.5% are 2026 promos (`promo_until` set).
5. 白金卡 points value not stated (無限卡 page says 1,000 點 = 刷卡金 60 元, may not apply).
6. Image URLs: Sitecore media paths with `?sc_lang&hash` stripped; all 22 verified HTTP 200 with curl.
7. 愛家卡 captured with `amount 1200 / max 1800` (白金 vs 鈦金/御璽); it is 房貸戶限定 but on the public list.

## banks.json corrections
- `cards_index_url` works (`/personal-banking/credit-card`), but the full list is at
  `https://www.tcb-bank.com.tw/personal-banking/credit-card/intro/overview`. Consider switching.
