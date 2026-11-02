# 中國信託 (ctbc) — research notes (2026-11-01)

## Access problem (read first)
- Every page under `https://www.ctbcbank.com/twrbo/...`, `/content/twrbo/...` and `https://mkt.ctbcbank.com/...` returns a JavaScript bot-challenge shell to non-browser clients (obfuscated script + hidden input; no content). Per instructions this was **not** circumvented (a header-inspection curl was also denied by the sandbox classifier). The banks.json `cards_index_url` (`/twrbo/zh_tw/cc_index/cc_cards.html`) and the 所有卡片 page `/twrbo/zh_tw/cc_index/cc_product/cc_introduction_index.html` could therefore not be read, so the **official active-card list is unconfirmed**.
- What IS readable (official CTBC): static minisites under `https://www.ctbcbank.com/content/dam/minisite/long/creditcard/<Card>/…`, PDFs under `/content/dam/twrbo/pdf/…`, the 小C FAQ knowledge base `https://service.ctbcbank.com/FAQ/Page01?kmid=…`, and CTBC Holding press releases `https://www.ctbcholding.com/content/dam/twhoo/file/news/…`.
- Minisites found: `LINEPay/` (index, notice, gifts, faq, store…), `ANA/` (index, p1–p5, info), `ALLME/` (index, notice, promotions…), `CPC/` (index, faq, point…), `TravelPlayer/` (promo hub), `TravelSP/`, `Foreigners-service/p2.html` (Jan-2026 user guide with full annual-fee table). Guessed names that 404'd: uniopen/UNIOPEN, LOL/LeagueofLegends, Marriott; `CAL/index.html` exists but is an empty shell.
- Annual-fee FAQ pages (official): kmid=15086 (overview), 11631 (e-statement-waiver cards), 11632 (lifetime-free affinity cards), 11633 (app-binding-waiver cards: LINE Pay, 和泰, ALL ME, 中油), 11634 (standard bank cards: 晶緻 1,800/900; 御璽/鈦金/白金 1,500/750; 金卡 600; 普卡 300), 11635 (special cards: 鼎極卡 5,000 etc.).

## Captured (8 cards)
- **Well-sourced (official minisite + FAQ/guide):** LINE Pay卡, ANA聯名卡, ALL ME卡, 中油聯名卡.
- **PARTIAL (flagged in `notes`, rewards not or barely verified):** uniopen聯名卡 (only 「2% OPENPOINT 無上限」 from TravelPlayer page), 英雄聯盟卡 (existence + fee category only), 中華航空聯名卡 (fees from Jan-2026 guide; only 生日國外 NT$6/哩 statement), Agoda聯名卡 (application-form PDF, 2024 revision). Consider hiding these four on the site until the product pages can be read in a browser.
- **Not captured** (seen in official FAQ/guide or third-party lists, no readable official product data): 商旅鈦金卡, 酷玩卡, 無印良品聯名卡 (expires 2026/12/31 per news), 勤美天地聯名卡 (expired 2026/10/31 per news), 和泰聯名卡, 中華電信聯名卡, 大中華攜手飛聯名卡 (fee conflict: guide says 商務御璽 2,200, FAQ says 1,800/900), LEXUS聯名卡 (10,000, 首年免), 萬豪旅享家聯名卡, 遠東SOGO聯名卡 (28,000 無限), TAIPEI 101聯名卡 (28,000 無限), 漢神/秀泰/Global Mall/LaLaport/foodpanda/Yahoo 聯名卡, 寰遊美國運通卡, 雙幣商務卡, 鼎極卡 (5,000, 36 萬消費免), LINE Pay鼎極卡 (`mkt.ctbcbank.com/long/creditcard/N2025072800017_01/` — blocked), 財管鼎鑽卡 (press release 2026/1/6: 鼎富家以上 國內 1%/國外 3%, 首富家 0.8%/1.2%; wealth-members only → excluded per brief).
- **Costco 聯名卡 is not a CTBC product** (no trace on any CTBC source; the coordinator's example list should drop it for CTBC).

## Status / announcements
- No official 停發/停止申請 page readable. News (technews 2026/7/10, non-official) reports 勤美天地聯名卡 ends 2026/10/31 and 無印良品聯名卡 ends 2026/12/31 with replacement by a 中信銀行信用卡 from 2026/9/1 — **unverified, not recorded as status**.
- LINE Pay 卡 overseas 5% promo (2026/7/1–9/30) has ended; 2.8% base overseas rate valid to 2026/12/31.

## Networks — how determined
- LINE Pay卡: Visa (stated: VISA商務御璽卡/VISA御璽卡). ALL ME卡: Mastercard (minisite 'Mastercard優惠'; FAQ tier 商務鈦金卡). ANA: JCB = 極緻/晶緻/白金 (ANA CARD Mile Plus 'JCB 卡別'), Visa = 無限/商務御璽/御璽 — inferred. Agoda: Visa 商務御璽 (form). **中油, uniopen, 英雄聯盟, 中華航空: inferred from tier names only.**

## Top things to double-check
1. Load `cc_introduction_index.html` in a real browser to confirm the active list and capture image URLs; 5 of 8 cards have no `image_url` and the 3 that do use minisite header/og images.
2. Fill reward rates for uniopen / 英雄聯盟 / 中華航空 / Agoda (placeholders say so in `rate` text).
3. ALL ME minisite shows two campaign windows (114/4/1–6/30 vs 115/7/1–12/31) — confirm current table. 中油卡 general (non-CPC) points rate not stated.
4. ANA fee tiers: 御璽/白金 「首年免年費」 per Jan-2026 guide; confirm later-year waiver rules.

## banks.json corrections
- `cards_index_url` is probably right but unverifiable from here. Suggest adding a `notes`/alternate field: official static sources readable without JS are `https://www.ctbcbank.com/content/dam/minisite/long/creditcard/` and `https://service.ctbcbank.com/FAQ/Page01?kmid=15086` (年費 overview). The update-checker for this bank will need a headless browser or should target the minisite/FAQ URLs instead.
