# 國泰世華 (cathay) — research notes (2026-11-01)

## Official card list
- Confirmed index: `https://www.cathay-cube.com.tw/cathaybk/personal/product/credit-card/cards` (the banks.json URL 302-redirects here).
- The index groups cards into active / 已停發 / 停發. Active consumer cards on 2026-11-01: 亞洲萬里通聯名卡、蝦皮購物聯名卡、長榮航空聯名卡、CUBE信用卡、世界卡、現金回饋御璽卡、雙幣卡 (7). 商務卡 (corporate) and CUBE簽帳金融卡 (debit) excluded per brief.
- Cards marked 停發/已停發 on the index (not all captured): Costco聯名卡、eTag聯名卡、(COMBO)悠遊聯名卡、COMBO財富卡、NFC行動信用卡、Taiwan Money卡、國民旅遊卡、聯合報優秀卡、W@card、遠東SOGO(悠遊)聯名卡、太平洋百貨聯名卡、台塑聯名卡、KOKO COMBO icash、KOKO(COMBO)悠遊、KOKO icash、國泰人壽聯名卡、金卡/普卡、享購鈦金卡、白金卡、尊榮御璽(COMBO)卡、鈦金商務卡. Captured only the three most relevant (Costco、台塑、KOKO COMBO icash) as `discontinued`.

## Announcement pages
- Status source is the card index itself (each 停發 card has its own page with the 公告 text). I could not locate a single consolidated 權益變更 announcement page via WebFetch (`/credit-card/notice` returned a client error). Formosa card expiry notice is on `/cards/formosa`.

## Could not verify / to double-check
1. **長榮航空聯名卡 base mile rate**: product page only says 「消費最優10元1哩」; per-tier general-spend rate (e.g. NT$20=1哩) is not in the fetched HTML (tab content). A 2025 極致無限卡 handbook PDF (`https://cathaybk.com.tw/cathaybk/-/media/b81252728597458d86a922576fbf11d9.pdf`) states 一般消費 NT$20=1哩 for that tier only. Re-check 2026 rates for all four tiers.
2. **Card networks** are mostly not stated in text on Cathay pages; inferred from tier names (御璽/無限 → Visa; 鈦金/世界 → Mastercard; 晶緻 → JCB) and page logos. CUBE is confirmed Visa/Mastercard/JCB from card-face images. Dual Currency 白金卡 network unconfirmed.
3. **世界卡**: page lists 「小樹點國內外消費回饋」 but gives no domestic general rate; only overseas 0.9% base + 2.6% boost (cap 7,800 點) and 保費 1.8%.
4. **亞洲萬里通聯名卡**: birthday-month rate inconsistent on page (body 5元=1里 vs meta 10元); per-tier mapping of NT$22~30/里 not shown; first-swipe mile amounts not shown.
5. **CUBE** fixed-rate plan (1.2% / 2.5% overseas) is a time-limited option (switch window 2026/8/3–12/31); 秋日遊 8% ends 2026-11-30.
6. Discontinued cards have placeholder `annual_fee.amount: 0` and inferred `networks` (Costco → visa is a guess); do not surface fee/rate for them on the site.
7. Image URLs: 亞萬 / 長榮 lowest-tier images have Chinese path segments; stored URL-encoded. The Asia Miles World image filename contains a space (`AMcard_world .png`), not used.

## banks.json corrections
- `cards_index_url` for cathay should be `https://www.cathay-cube.com.tw/cathaybk/personal/product/credit-card/cards` (current value redirects 302 to it; product pages live on `cathay-cube.com.tw`, apply pages on `cathaybk.com.tw`).
