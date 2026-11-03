# 台灣美國運通 (amex) — research notes

Verified 2026-11-01 (fetched 2026-11-03). Source of truth: www.americanexpress.com/zh-tw/ only. All pages were fetched with curl (plain static HTML; the card data is embedded as JSON in the page, no browser needed).

## Official card list

- 卡片總覽（美國運通卡介紹 / 所有卡片）: `https://www.americanexpress.com/zh-tw/credit-cards/all-cards/` — confirmed. `/zh-tw/credit-cards/` (without `all-cards/`) returns a client error, and `/zh-tw/credit-cards/compare/` is 404.
- Product pages (all static, 200):
  - 簽帳白金卡 `https://www.americanexpress.com/zh-tw/charge-cards/plat/`
  - 長榮航空簽帳白金卡 `https://www.americanexpress.com/zh-tw/charge-cards/eva-plat/`
  - 耀金卡 `https://www.americanexpress.com/zh-tw/charge-cards/gold/`
  - 長榮航空簽帳金卡 `https://www.americanexpress.com/zh-tw/charge-cards/eva-gold/`
  - 信用白金卡 `https://www.americanexpress.com/zh-tw/credit-cards/grcc-plat/`
  - 晶華珍饌信用白金卡 `https://www.americanexpress.com/zh-tw/credit-cards/regent-plat/`
  - 簽帳卡（Green）`https://www.americanexpress.com/zh-tw/charge-cards/green/`
- 權益總引 PDFs (linked from each product page, not read this round): `https://www.americanexpress.com/content/dam/amex/tw/TaiwanWP/{rcp_eva_platinum_wp,gold_wp,eva_gold_wp,grcc_wp,regent_grcc_wp,green_wp}.pdf`; 簽帳白金卡 uses `https://www.americanexpress.com/taiwan/ewp_platinumcharge/`.
- Benefit microsites: `https://www.americanexpress.com/tw/platinum/`, `/tw/benefits/rcp-platinum.html`, `/tw/benefits/evaplat-charge-card.html`, `/tw/benefits/evagold.html`.
- Images: `https://icm.aexp-static.com/Internet/internationalcardshop/zh_tw/images/cards/*.png` — all 7 return 200 image/png from the cloud, so the fetch script should work.

## Cards captured (7, all active)

5 簽帳卡 (charge cards): 簽帳白金卡, 長榮航空簽帳白金卡, 耀金卡, 長榮航空簽帳金卡, 簽帳卡(Green). 2 信用卡 (credit cards): 信用白金卡, 晶華珍饌信用白金卡. The charge/credit distinction is stated in the first `highlights` bullet and in `notes` of every card.

Not on the public list, not added: 百夫長卡 (Centurion, invitation only; only mentioned in 首刷禮 exclusions), 國泰航空 co-brand (none exists in Taiwan), all 企業卡/採購卡/商務差旅帳戶 (business).

## Status announcements

- No 停止申請 / 停發 / 暫停申請 page or notice found anywhere on the zh-tw site, the all-cards page, or the 7 product pages. The only corporate notice page is 關於美國運通之重要訊息 `https://www.americanexpress.com/taiwan/aboutamex.shtml` (AML, fraud, True Yoga refund notice etc.; no product notices). Added as a `watch_urls` candidate.
- Forward-looking change on the 長榮航空簽帳白金卡 page: for members approved from 2027-01-01 the 續卡兩次升等 condition changes from NT$1.2M annual spend to "累計轉哩 55,000 哩 from the main-card account to 無限萬哩遊", which implies the earn mechanism may become points-to-miles transfer in 2027. Re-check in January 2027.

## Could not verify / maintainers should double-check

1. **`rate_value` omitted on all points (會員酬賓) rewards.** The pages state only NT$30 = 1 積分 and 1:1 transfer to airline miles; no 刷卡金 redemption % is published, so no percent was invented. If the site needs a sort value, a maintainer decision is needed (e.g. treat 1 積分 = 1 哩 → NT$30/哩, or use Amex's NT$1/積分 claw-back price in the T&Cs as a proxy).
2. **長榮航空簽帳白金卡 overseas rate 16.67** is derived (NT$25 ÷ 1.5) from the page text "每滿 NT$25 可得 1 哩，海外消費、長榮機票及長榮假期再享哩程加碼 50%"; the page gives no monthly cap for the bonus. The base 25 is verbatim.
3. **長榮航空簽帳金卡**: NT$20 / NT$15 = 1 哩 apply only to the first 2,000 哩 per month (then NT$25 = 1 哩); the page states them as "最優" values with 25% / 67% 加碼. Lounge access is paid (NT$300 per visit), so no `airport-lounge` tag.
4. **耀金卡 NT$4,400 刷卡金** is an annual headline maximum across 星巴克 / Uber Eats / Expedia / KLOOK; the per-channel thresholds live on a "看詳情" campaign page that was not read.
5. **Stale legal text on product pages**: 信用白金卡 still carries a 2023-07-01~09-30 首刷禮 clause (NT$7,000 / 20,000 積分) and 晶華珍饌 still carries 2022 hotel rates — treated as expired and excluded; only clauses with 2026/2027 dates were used for welcome offers. The all-cards page shows no 新申辦刷卡禮 for 信用白金卡 or Green.
6. **English names** (`name_en`) are not printed on the zh-tw pages; they are the usual Amex product names and should be treated as editorial.
7. **Annual fees** come from the 申請資格與年費 block on each product page: 簽帳白金卡 36,800 (incl. 2 附卡, 3rd+ NT$3,000 each), 長榮簽帳白金卡 36,800 (incl. 2 附卡), 耀金卡 8,500, 長榮簽帳金卡 2,500 (incl. 4 附卡), 信用白金卡 8,500, 晶華珍饌 19,800, 簽帳卡 1,800. None lists a 免年費 waiver, so `effectively_free` is false everywhere and no card carries `no-annual-fee`.
8. **Welcome offers** currently stated: 簽帳白金卡 up to NT$25,000 刷卡金 or 60,000 積分 + 白金美饌 NT$10,000 (to 2027-03-31 / 2026-12-31); 長榮簽帳白金卡 60,000 哩 (to 2027-03-31); 耀金卡 NT$7,000 or 20,000 積分 (to 2027-03-31, new-to-Amex only); 長榮簽帳金卡 3,000 哩 (to 2027-03-31); 晶華珍饌 NT$8,000 禮券 (to 2026-12-31). All require paying the annual fee and one purchase within 3 months.
9. Eligibility on every page is the same three lines (中華民國國民或外僑居留證、年滿 18 歲、財力證明); no income threshold is published.

## banks.json corrections

`amex` is missing from banks.json. Proposed entry (validator currently reports `unknown bank "amex"` for all 7 cards until this is added):

```json
{
  "id": "amex",
  "name": "台灣美國運通國際股份有限公司",
  "short_name": "美國運通",
  "name_en": "American Express Taiwan",
  "website": "https://www.americanexpress.com/zh-tw/",
  "cards_index_url": "https://www.americanexpress.com/zh-tw/credit-cards/all-cards/",
  "watch_urls": [
    "https://www.americanexpress.com/taiwan/aboutamex.shtml",
    "https://www.americanexpress.com/zh-tw/charge-cards/plat/",
    "https://www.americanexpress.com/zh-tw/charge-cards/eva-plat/",
    "https://www.americanexpress.com/zh-tw/charge-cards/gold/",
    "https://www.americanexpress.com/zh-tw/charge-cards/eva-gold/",
    "https://www.americanexpress.com/zh-tw/credit-cards/grcc-plat/",
    "https://www.americanexpress.com/zh-tw/credit-cards/regent-plat/",
    "https://www.americanexpress.com/zh-tw/charge-cards/green/"
  ],
  "color": "#006FCF",
  "notes": "非銀行，為信用卡/簽帳卡發行機構；5 張簽帳卡（無預設額度）+ 2 張信用卡。all-cards 頁為靜態 HTML，卡片資料內嵌於頁面 JSON。"
}
```

`color` #006FCF is Amex's standard "Bright Blue" brand colour. `/zh-tw/credit-cards/` without `all-cards/` is not a valid index URL.
