# 滙豐（台灣） (hsbc) — research notes

Verified 2026-11-01. Source of truth: www.hsbc.com.tw only.

## Official card list

- 信用卡首頁（卡片總覽，含每張卡的摘要）: `https://www.hsbc.com.tw/credit-cards/` — confirmed, static HTML, fetchable.
- 比較信用卡（lists all 7 consumer cards in one selector）: `https://www.hsbc.com.tw/credit-cards/compare/`
- Product pages: `/credit-cards/products/{cashback-signature, cashback-titanium, liveplus, travel/visa-infinite, travelone-signature, travelone, premier}/`
- 信用卡收費標準 PDF (annual fees for every card): `https://www.hsbc.com.tw/content/dam/hsbc/tw/docs/help/tariffs-credit-card.pdf` (linked from `https://www.hsbc.com.tw/help/tariffs/`). Note: the PDF uses CID fonts that poppler/pypdf cannot decode; PyMuPDF (`pip install pymupdf`) extracts it correctly.
- 信用卡權益手冊 PDF: `https://www.hsbc.com.tw/content/dam/hsbc/tw/docs/credit-cards/previleges.pdf`
- 線上申辦: `https://card.apply.hsbc.com.tw/hsbcoa/credit_card/select_your_card` (cardid 1 = 現金回饋御璽卡/VM, 13 = 匯鑽卡/MK, 15 = Live+/VK, 10 = 旅人卡系列, 5 = 卓越理財/MH).

## Cards captured (7, all active)

現金回饋御璽卡, 滙豐匯鑽卡, Live+現金回饋卡, 旅人無限卡, 旅人御璽卡, 旅人輕旅卡, 卓越理財信用卡.

Excluded: 現金回饋商務鈦金卡 / 商務卡 / 公司卡 (business). Legacy cards named only in the tariff PDF (紅利好點御璽卡, 滙豐白金卡/金卡/普卡, 現金回饋白金卡/金卡, 運籌理財信用卡) are not on the public card list and were not added.

## Status announcements

- No 停止申請 / 停發 page found. The only product-level notice: 卓越理財信用卡 was upgraded from 白金卡 to Mastercard 世界卡 in 2026; un-reissued old cards stop working 2026-12-31 (on the premier product page FAQ). The card itself remains `active`.
- 旅人卡 banner: from 2026-04-01 中華航空 conversion ratio is 1 旅遊積分 = 1 哩.

## Could not verify / maintainers should double-check

1. **Annual fee amounts** for 現金回饋御璽卡 / 匯鑽卡 / Live+ (NT$2,000), 輕旅卡 (NT$2,000) and 卓越理財 (NT$2,000) come from the tariff PDF, not the product pages (which only say 首年免年費 / 電子帳單終身免年費). 旅人無限卡 NT$8,000 and 旅人御璽卡 NT$2,500 appear on both the index page and the PDF.
2. **Networks** of 旅人御璽卡 (Visa Signature) and 旅人輕旅卡 (Visa) are inferred: the Chinese product pages never print "Visa". Evidence: `御璽` is the Visa Signature tier name; the English 輕旅卡 page lists "Visa SmartDelay"; the infinite card URL is `travel/visa-infinite`. 匯鑽卡 is Mastercard (鈦金 tier, CardType=MK). Live+ image filename says `visa-signature`.
3. **Promo windows**: 現金回饋御璽卡 and Live+ cash-point programs run to 2026-12-31 and the site already states the 2027-01-01 to 2027-03-31 program is unchanged. 匯鑽卡 runs 2026-07-01 to 2027-06-30. 卓越理財 bonus-points program is 2026-07-21 to 2026-12-31 and its base entitlement is 30 元 = 1 點 outside the promo.
4. **匯鑽卡 6%** is an effective rate (5,000 points redeemed for 10,000 刷卡金, max 2 redemptions per year, requires average HSBC account balance ≥ NT$300,000). The headline numbers 2%/6% are not per-transaction rates.
5. **旅人卡 rate_value** is TWD-per-point (10 / 15 / 18 / 20). The bank's own equivalence: 5,000 積分 = NT$1,500 刷卡金, i.e. 無限卡 海外 ≈ 3%, 御璽卡 海外 ≈ 2%, 國內 ≈ 1.66%.
6. **卓越理財信用卡** is restricted to Premier clients (monthly average balance ≥ NT$3M). Included because it is on the public list; `requirements` states the restriction.
7. 新戶首刷禮 amounts (1,000 刷卡金 / 8,000 / 3,000 / 1,000 旅遊積分 / 3,000–13,000 紅利點數) are Q4-2026 campaign values (2026-10-01 to 2026-12-31); re-check in January 2027.

## banks.json corrections

- `cards_index_url` `https://www.hsbc.com.tw/credit-cards/` is correct. No changes needed.
