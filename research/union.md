# 聯邦銀行 (union) — research notes

Verified 2026-11-01.

## Official card list

- `cards_index_url` https://card.ubot.com.tw/ is a Vue SPA (empty shell on fetch). The card overview route is https://card.ubot.com.tw/Card and the data comes from the official JSON API **https://card.ubot.com.tw/eCardServiceAPI/api/Cards** (fields: name, desc, imgUrl, applyUrl, url, catalog, note). `note` carries status: `不再受理申辦`, `(邀請制)`, `每人限申請一張`.
- Each card's detail page is static HTML at `https://card.ubot.com.tw/ecard_source/html/CardDetail/cardDetailNNN.htm` (all tabs 卡片特色／年費政策／申請條件 included). The user-facing URL is `https://card.ubot.com.tw/CardDetail/cardDetailNNN` — that is what I put in `source_url`.
- Card images: `https://activity.ubot.com.tw/eCardWeb/images/cardInfo/<code>.png` (all verified 200).
- 一般消費定義 page: https://card.ubot.com.tw/AnnounceDescription/nofeedback

## Cards captured (18)

Active (16): 賴點卡, 吉鶴卡, M卡, 綠卡, M世界卡, 聯邦無限卡, 聯邦世界卡, 理財型無限卡, 理財型白金卡, 幸福御守卡, 國民旅遊卡(一般民眾), 微風聯名卡, 微風黑鑽無限卡, 全國加油聯名卡, MaiCoin聯名卡, LINE Bank聯名卡.

Discontinued (2): 聯邦旅遊卡, 樂活御璽卡.

Not captured: 邀請制 cards without public product pages (大立無限卡, 臻富金鑽無限卡, 農金無限卡); 珍鑽無限卡 (不再受理); 微風晶鑽無限卡 / 微風無限卡 (lower-prominence Breeze tiers); numerous 不再受理申辦 legacy cards (紅利卡, 經典御璽卡, 分期便利卡, F1加油卡, 個人商務白金卡, Mini卡, 樂活鈦金卡, 大統/美華泰/Tiger City 等); small co-brands (農金, 安麗, 大樂, 淡水信合社, 凱撒飯店, 順發, 天外天) and 公益認同卡 (守護天使, 平安, 八福); 桃園市市民卡 (不再受理); 商務差旅卡 (corporate).

## Things to double-check

1. **Almost every Union reward requires 申辦電子化帳單** (and for 賴點卡 also LINE Pay binding). Without it the rate drops to 0.5%/1.5% or zero. Recorded in `conditions`, but the site should surface this prominently.
2. **Promo windows**: 賴點卡/吉鶴卡/M卡/綠卡/M世界卡 rates are 115/7/1–115/12/31 (or 115/4/10–12/31) activity rates; LINE Bank 聯名卡 to 116/7/31; MaiCoin to 116/4/30. "最高 11%" headlines are stacked promo maxima (documented in `notes`).
3. 年費 for most 御璽/鈦金/晶緻 cards is 1,000 or 2,000 depending on product; 國民旅遊卡 / 全國加油 / 微風白金 use the tiered 500/1,000 table. 理財型 cards are 預收年費制 with monthly rebate (recorded as not effectively free).
4. 聯邦無限卡 / 世界卡 premium perks (機場接送 4 次 etc.) live in the 附加服務 tab which loads a shared `addonService.htm` — not captured per card; only the headline "機接服務最多4次" from the API desc was used.
5. No age/income requirements are printed for non-premium cards; `requirements` omitted for those.
6. Image for 聯邦旅遊卡 is `MP55.png`; the active 國民旅遊卡 uses `MT55.png` (different product, same number).

## banks.json corrections

- `cards_index_url`: suggest `https://card.ubot.com.tw/Card` (the overview route) instead of the bare domain; for scripted verification use the JSON API `https://card.ubot.com.tw/eCardServiceAPI/api/Cards`.
