# 凱基銀行 (kgi) — research notes

Verified 2026-11-01. Source of truth: www.kgibank.com.tw only.

## Official card list

- 信用卡首頁: `https://www.kgibank.com.tw/zh-tw/personal/credit-card` (fetchable, static HTML).
- 全部卡片 (the real list, 13 cards): `https://www.kgibank.com.tw/zh-tw/personal/credit-card/list`
- Product pages: `/zh-tw/personal/credit-card/list/<slug>`; two cards (幣享卡, 誠品聯名卡) only have campaign micro-sites under `/webpages/...`.
- 信用卡權益手冊 PDF (annual-fee table in section 12.10, 42 pages, ~25 MB): `https://www.kgibank.com.tw/zh-tw/-/media/files/kgib/credit-card-landing/02/appendix-1-rights-and-interests-manual-generalcomplete-editionfirst-quarter.pdf` — extract with PyMuPDF.
- Card images: the 195×195 list thumbnails under `https://www.kgibank.com.tw/zh-tw/-/media/images/kgib/personal/0004-credit-card-detail/...` (all checked 200).

## Cards captured (13: 12 active, 1 suspended)

魔BUY悠遊鈦金卡, 現金回饋卡（御璽/鈦金）, 雙幣哩程卡, 幣享悠遊鈦金卡, 誠品悠遊御璽卡, 魔FUN悠遊御璽卡, 凱基人壽御璽卡, 凱基人壽無限卡 (邀請制), 凱基無限卡 (邀請制), 魔利悠遊御璽卡 (邀請制, 新戶限定), 丁丁藥局悠遊鈦金卡, 丁丁藥局金卡, 悠遊聯名白金卡 (**suspended** — "115/1/1 起暫停申辦" printed on the list page and product page).

Not on the list / not added: "Deal 卡" mentioned by the coordinator does not exist on the official KGI list (likely confusion with another bank's product or a retired card). 魔BUY鈦金卡 (non-悠遊) is marked 已不開放申請 in the manual and only appears as a fee line; folded into the 魔BUY entry note. Karry 荷包乖乖金融卡 is a debit card (excluded).

## Status announcements

- 悠遊聯名白金卡: 115/1/1 起暫停申辦 (list page + product page) → `suspended`, `status_changed_at` 2026-01-01.
- 凱基人壽卡 series: from 116/3/1 statement cycles the reward switches from 刷卡金 to 現金點 (notice on both 人壽 product pages).
- No dedicated 停發/權益變更 index page found; announcements live inside each product page.

## Could not verify / maintainers should double-check

1. **Annual fee amounts** for 雙幣哩程卡, 幣享悠遊鈦金卡, 誠品悠遊御璽卡 and 悠遊聯名白金卡 come from the 權益手冊 PDF table (12.10), not the product/campaign pages (which only say 電子帳單免年費). The manual lists 雙幣哩程卡 as "雙幣哩程商務御璽卡" — level recorded as 商務御璽卡.
2. **Networks**: pages rarely print Visa/Mastercard. Inferred from tier names (御璽 = Visa Signature, 鈦金 = Mastercard), URL slugs (visa-infinite, visa-signature, mastercard-titanium, mastercard-gold), and the 丁丁 page's list of "其他指定萬事達卡：魔BUY悠遊鈦金卡、幣享悠遊鈦金卡、現金回饋(悠遊)鈦金卡". 雙幣哩程卡 inferred Visa from "本優惠由Visa信用卡國際組織提供" on its campaign page. 悠遊聯名白金卡 page explicitly says Visa白金卡 / MasterCard白金卡.
3. **現金回饋卡** is one product page covering 御璽/鈦金/悠遊/Combo versions; rates are identical, fee 3,000 for all.
4. **魔FUN卡 50% 影城/影音 回饋** is real but capped at 500/150 points per statement and needs NT$3,000 general spend; `rate_value` intentionally omitted so it does not top the sort.
5. **幣享卡 15%** requires taking out a 備用金 (credit line) — treat as a marketing rate; the base figures are 1% / 2% + fee waiver / 3%.
6. **凱基無限卡** rebate rate depends on wealth-management tier (0.6%–1% domestic, 1.5%–2% overseas); rewards array shows the top tier.
7. Three cards are 邀請制 (凱基無限卡, 凱基人壽無限卡, 魔利悠遊御璽卡) and have no `apply_url`; still `active` because the site lists them with current benefits.
8. All 2026 program dates end 2026-12-31 (雙幣哩程卡 累哩 program is 115/7/1–115/12/31); re-verify in January 2027.
9. Apply URLs are the bank's `www.kgibank.com/obd/...` short links taken from each product page's 立即申辦 button; the two campaign-site cards use `obd/cc/CC_identity` / `CC_landing` links found in the page source.

## banks.json corrections

- `cards_index_url` `https://www.kgibank.com.tw/zh-tw/personal/credit-card` works but is the hub page; the full list is `https://www.kgibank.com.tw/zh-tw/personal/credit-card/list`. Suggest switching `cards_index_url` to the `/list` URL.
