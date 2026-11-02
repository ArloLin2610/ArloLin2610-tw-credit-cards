# 遠東商銀 (feib) — research notes

Verified 2026-11-01/02. 16 cards captured in `data/cards/feib.json` (13 active, 3 discontinued).

## Official sources

- Card index (server-rendered, curl works; WebFetch is robots-blocked):
  - 遠東商銀信用卡: https://www.feib.com.tw/introduce/cardInfo?type=1
  - 聯名／認同卡: https://www.feib.com.tw/introduce/cardInfo?type=2
  - Card-face images live at `https://www.feib.com.tw/upload/WebSiteImages/creditcard/card/<file>` (codes: VS = Visa Signature 御璽, VP = Visa Platinum, MP = Mastercard Platinum, MS = Mastercard 鈦金, JS = JCB 晶緻, VI = Visa Infinite, MI = Mastercard World).
- 信用卡費用／利率一覽表 (annual fee by tier): https://www.feib.com.tw/detail?id=312
  - 頂級快樂卡 24,000；HAPPY GO 頂級卡 12,000 (15,000 with 1 附卡)；世界商務／世界／無限 10,000；商務御璽 2,000；御璽／晶緻／鈦金 2,000；白金 1,200；金卡 600；普卡 300. Waivers: 世界／無限 首年免＋年刷 30 萬；白金／金／普 首年免＋每年刷 1 次；御璽／晶緻／鈦金 首年免＋年刷 6 萬或 12 筆. "聯名卡、認同卡年費依個別專案年費收取".
- 卡友權益 (HAPPY GO / 紅利點數 rules): https://www.feib.com.tw/detail?id=179 ; 專屬權益: detail?id=175 ; 旅平險: detail?id=180 ; 貴賓室: detail?id=178.
- Product pages used as `source_url`: HappyCardRed, YACard (page2 = 消費回饋, page6 = 首刷及年費), HappyPremium, HappyCardinfinite (+ fee.html), HGTOP, NCTOP, HWCard, CestMOI, TRAVELJCard, NC, iCloudyCard, eTagCard, Eden under `https://www.feib.com.tw/upload/creditcard/`.
- Discontinued markers: the type=2 index labels 飲食男女卡, 遠東快樂信用卡(原台塑聯名卡), Esprit聯名卡 as "(終止新卡申請)". No separate 停發 announcement page found; termination dates not stated.
- Online application: https://iapp.feib.com.tw/iapp/jsp/creditCardNew/index.jsp (states 正卡申請人須成年至 70 歲，頂級卡 25–65 歲).

## Cards on the index that were NOT captured

- 遠東頂極商務卡 (EBCard) — corporate card (公司戶申請), excluded per brief.
- Combo卡 (detail?id=413), MC2卡 (detail?id=408), 華信航空聯名卡 (detail?id=410), 遠企尊榮金卡 (detail?id=409), 校園卡 (detail?id=404), 工會卡 (detail?id=412), C'est Moi我的卡(原南山人壽認同卡) (PDF c29.pdf) — their official pages contain only a card image and no text about fees/rewards, so nothing could be verified. 校園卡／工會卡 are 專案 cards. Add later only if the bank publishes product text.
- **Bankee 信用卡** (遠銀數位品牌, https://www.bankee.com.tw/card.html) — official page states rewards: 社群圈等級 3 級 (Bankee 帳戶月均 60 萬) 國內 1.2% / 國外 3%；2 級 (5 萬) 1% / 1%；1 級 0.15%；新卡友核卡 3 個月內享 3 級；社群圈消費 0.15% 回饋無上限；慢慢付 3 期 0 利率；旅平險最高 2,000 萬 (鈦金卡)；新戶任刷 3 筆享 NT$368 帳單折抵金. **Not added** because the card network and annual fee are not in any fetchable official text (the apply page `event/card36826Q1/index.html` returns 403 and is robots-blocked; the FEIB iapp card list is served through an encrypted API). Maintainer: open the Bankee page in a browser, confirm network (卡面) + 年費, then add `feib-bankee` with the rates above.

## Fields to double-check

1. **Annual fees for 樂家＋卡, 快樂信用卡, 旅遊悠遊卡, iCloud 卡, eTag 聯名卡, 伊甸愛心卡 and the 3 discontinued cards** were taken from the tier table on detail?id=312 (product pages show fees only as images, or not at all). For 聯名／認同卡 the table says fees follow each 專案, so the NT$1,200 on eTag／伊甸 is a stated assumption, flagged in `notes`.
2. **遠東樂行卡 tier** — Mastercard card face, fee NT$2,000, but no tier name on the page; `levels` left empty.
3. **遠東快樂信用卡 滿額最高 NT$500** — the tier table is an image; only the headline amount was recorded. 5% 通路 detail lives at activity?id=1980.
4. iCloud 卡 — the index image is a shopping-cart placeholder, so no `image_url`; tier/network inferred from the image code 001MP (Mastercard Platinum).
5. New Century 信用卡 — only a Visa face is shown; confirm whether Mastercard is also issued.
6. HAPPY GO point rows carry no `rate_value` because the bank does not state a NT$ value per point.
7. All promo rows are 2026/7/1–12/31 (promo_until 2026-12-31); re-verify in January 2027.

## banks.json corrections

- `cards_index_url` `https://www.feib.com.tw/creditcard` redirects to the site's 404 page. Use `https://www.feib.com.tw/introduce/cardInfo?type=1` (bank cards) — the co-branded list is `?type=2`.
- Note for the update pipeline: feib.com.tw refuses WebFetch (robots) but serves full HTML to curl with a browser UA; connections are occasionally reset, so retry.
