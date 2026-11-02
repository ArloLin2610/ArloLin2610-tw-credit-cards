# 台新銀行 (taishin) — research notes (2026-11-01)

## Official card list
- banks.json URL `https://www.taishinbank.com.tw/TSB/personal/credit/intro/overview/` errored twice (server_error) via WebFetch; the same page works with a query string: `https://www.taishinbank.com.tw/TSB/personal/credit/intro/overview/index.html?type=type1` (熱門推薦卡), `?type=type2` (頂級卡), `?type=type3` (銀行卡), `?type=type4` (聯名卡, 20 tiles, has a page 2 that was not readable). Product pages: `.../overview/cgNNN/cardNNN/`.
- Captured 21 cards: 18 active + 3 renamed/discontinued. Not captured (on list): 企業卡 cg035 / 台新商務卡 cg005 (corporate), Mercedes-Benz 信用卡 cg006, SKM Park Outlets 聯名卡 cg043, 美麗華聯名卡 cg048 & 義大世界聯名卡 cg049 (coming-soon placeholders tied to the 2027/1/1 Taishin–SKBank merger, no apply link), 棉花田 cg030, 比漾 cg015, 尊爵世界卡 cg011 (停止受理 since 2016/9/1), 台新Richart卡(原大買家/原Woojii/原三商美邦) cg034/cg041/cg029 (停止開放新申辦), 台新Richart卡(原太陽卡/玫瑰卡切換刷) cg046.

## Status / announcements — IMPORTANT
- **@GoGo卡 (cg021), FlyGo卡 (cg018/flygo), 玫瑰Giving卡 (cg040) and 太陽卡/玫瑰卡(切換刷) (cg046) were all renamed 「台新Richart卡」 effective 2025/9/1 and are marked 停止新申辦 (「於2025/9/1起停止新申辦」).** The coordinator's expected @GoGo / FlyGo / 玫瑰Giving cards therefore exist only as `discontinued` records pointing to `taishin-richart`. Richart card page: `cg047/card001/`. Rename notice text: 「2025/9/1(含)起將提供全新權益並更名為「台新Richart卡」，7大方案任你切，享最高3.8%台新Point(信用卡)回饋！」.
- 全家Fish聯名卡 renamed 全家Richart聯名卡 2026/9/15; 大潤發聯名卡 renamed 大全聯信用卡 2025/9/12; 亞洲無限卡 upgraded to 環球無限卡 (stopped 2023/12/1).
- 美麗華聯名卡 / 義大世界聯名卡 tiles reference the FSC-approved merger of Taishin Bank and Shin Kong Bank (merger base date 2027/1/1) — these are presumably ex-SKBank co-brands; not captured.
- Taishin news releases live under `https://www.taishinbank.com.tw/TSB/personal/common/news/TSBankNews-NNNNNN/`; important notices under `/personal/common/important-notice/`. No consolidated 權益變更 page captured.

## Networks — how determined
- Stated on page: 台新Richart卡 (Visa 商務御璽 / Mastercard 鈦金商務 / JCB 晶緻 via 國際組織 perks section), 大全聯 (JCB 晶緻 + Visa 御璽), 街口 (Mastercard 商務鈦金 + JCB 晶緻), 玫瑰卡/太陽卡 (「太陽/玫瑰(指定套餐)VISA卡」), 台新雙幣卡 (Visa 商務御璽卡), 全家Richart (御璽卡(V)/鈦金卡(M)/鈦金商務卡(M)), 國泰航空 翱翔鈦金/世界卡 (Mastercard), 卓富無限 & 財富無限 (Visa無限卡禮遇), 玫瑰Giving (Visa/Mastercard stated), 環球無限卡 (「匯率以Visa國際組織公告為準」).
- **Inferred from tier names only (verify from card faces):** 新光三越御璽/鈦金/白金 (Visa+MC), 新光三越無限/世界 (Visa+MC), 燦坤聯名卡 (MC), 昇恆昌 (Visa, from 御璽卡 BIN 41476353/41476368), **Gogoro Rewards (MC — pure guess from the NT$4,500 鈦金商務-level fee)**, **遠傳friDay (Visa — placeholder guess, no tier named on page)**, @GoGo 御璽 (Visa), FlyGo 鈦金商務 (MC).

## Could not verify / double-check
1. **Richart card LEVEL 1 rates** (no auto-debit) — the table is garbled in the page HTML; only LEVEL 2 (扣繳) rates captured. Richart card has no dedicated fee row; generic table used (鈦金商務/商務御璽 4,500; 御璽/鈦金/晶緻 3,000; 白金 1,500; 世界商務 6,000).
2. **國泰航空世界卡 general-spend mile rate** not captured (page text only shows 指定類別/官網購票 NT$5=1哩). 翱翔鈦金卡 vs plain 鈦金卡 rate differences not clear.
3. **卓富無限卡 cash-back %** lives on a separate 「極致禮遇」 page not read.
4. **玫瑰卡 / 太陽卡**: which tier a new applicant receives is not stated; `levels` lists the whole fee table. 自由選 plan closed to new applicants since 2021/8/31.
5. **Apply URLs**: 昇恆昌, 燦坤, 財富無限卡 use the generic apply page (card-specific `pc=` code not captured).
6. **Images**: 太陽卡 and 財富無限卡 product pages have no static card face → index thumbnails (166x127 gif/png) used. Richart card image is `R111.gif` (index thumbnail, also on product page). Discontinued cards use their legacy page images.
7. 台新雙幣卡 page both says 「目前暫不提供各項分期功能」 and lists a 保費 12 期 0 利率 promo — inconsistent.
8. Fee period labels: most co-brand pages state 2026 年費優惠 (任刷一筆 or LINE 綁定 免年費) valid 2026/1/1–12/31 only.

## banks.json corrections
- `cards_index_url` should be `https://www.taishinbank.com.tw/TSB/personal/credit/intro/overview/index.html?type=type1` (the bare `/overview/` URL returned server errors to the fetcher; the `?type=` variants render the list).
