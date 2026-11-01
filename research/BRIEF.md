# Research brief — Taiwan credit-card data collection

You are collecting the **seed dataset** for a Taiwan credit-card comparison website. Accuracy matters more than coverage: wrong rates on a comparison site hurt real people. Only use the **issuing bank's official website** as the source of truth. Third-party blogs / Dcard / PTT / Money101 may be used only to *discover* card names or find the official URL, never as the source of a number.

Today's date: 2026-11-01.

## What to produce (per bank)

1. `/home/claude/tw-credit-cards/data/cards/<bank-id>.json` — a JSON **array** of card objects following `/home/claude/tw-credit-cards/data/schema/card.schema.json` exactly (read the schema first; `additionalProperties: false`).
2. `/home/claude/tw-credit-cards/research/<bank-id>.md` — short notes: the official card-list URL you confirmed, any 停發／停止申請／權益變更 announcement page URL, which cards or fields you could not verify and why, and anything the maintainer should double-check.
3. If the `cards_index_url` or other fields in `/home/claude/tw-credit-cards/data/banks.json` are wrong for your banks, put the corrected values in your notes file under a `## banks.json corrections` heading (do not edit banks.json yourself — other agents share it).

Validate every JSON file parses before you finish: `node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" <file>`.

## Which cards to include

- All **consumer** credit cards the bank currently markets on its official card list page, including co-branded (聯名卡) and affinity (認同卡) cards. Prioritize flagship / widely-applied cards if the bank has more than ~15; it is fine to stop at ~15 per bank.
- Exclude: business/corporate cards, purchasing cards, debit/金融卡, prepaid cards, cards clearly only for existing wealth-management clients unless they are on the public list.
- If the official site explicitly lists a card as 停止申請 / 停發 / 暫停申請, include it with `status: "discontinued"` or `"suspended"` and a `status_note`. Do not guess statuses — if a card is on the public list and accepting applications, it is `active`.

## Field guidance

- `id`: `<bank-id>-<slug>` (lowercase, ASCII, hyphens), e.g. `cathay-cube`, `ctbc-linepay`, `esun-unicard`.
- `networks`: which card networks the product is issued on (visa / mastercard / jcb / amex / unionpay). Look at the card images or product spec.
- `levels`: tiers listed for the product (御璽 / 鈦金 / 白金 / 無限 / 世界 / 晶緻 / 尊榮 ... ). Empty array if there is only one.
- `annual_fee.amount`: the standard annual fee in TWD for the lowest tier **as stated on the official page** (0 if the page says 免年費). `max_amount` for the highest tier if the page lists several. `waiver` = the waiver condition text in Traditional Chinese. `effectively_free` = true when the page says 免年費 or the waiver is trivially met (e.g. 首年免年費，次年消費滿 1 次免年費).
- `reward_type`: the card's **primary** reward: `cashback` (現金回饋 / 刷卡金 / 帳單折抵), `miles` (哩程：亞洲萬里通、華航、長榮、星宇、聯合 等), `points` (紅利點數 / 回饋點數 / OPENPOINT / LINE POINTS / 小樹點 / 玉山e點 等 — if the points are effectively cash e.g. LINE POINTS 1 點 = 1 元 and the bank markets it as a 回饋 %, still use `points` and put the % in rewards), `other` (e.g. pure insurance / lifestyle cards).
- `tags`: pick from the enum in the schema; be generous but truthful. `no-annual-fee` only when `effectively_free`. `new-cardholder` when there is a 新戶 bonus. `premium` for 無限/世界/鼎極 tier cards.
- `headline`: ≤ 60 chars, Traditional Chinese, the single strongest selling point with the number, e.g. `指定通路最高 3.3% 小樹點回饋`.
- `rewards`: one entry per distinct rate the official page states. `rate` is text (`1%`, `3.3%`, `NT$20/哩`), `rate_value` numeric (percent for cashback/points; **TWD per mile** for miles), `cap` text, `conditions` text (登錄、限定通路、消費門檻、需綁定 etc.), `valid_until` if the page gives an end date. Do not invent a general rate if the page doesn't state one.
- `highlights`: 3–6 bullets in Traditional Chinese, each ≤ 120 chars. Concrete perks (機場接送、貴賓室、分期 0 利率、新戶禮 …).
- `requirements`: eligibility if stated (年齡、年收入).
- `apply_url`: the online application link if there is one; `source_url`: the official product page you read (required).
- `image_url`: the official card-face image URL (the `<img src>` on the product page, absolute URL). This is important — the site needs card images. If the page has several tier images, pick the lowest tier's. If you truly cannot find one, omit the field and say so in the notes.
- `last_verified`: `2026-11-01`.
- `notes`: anything a maintainer should re-check (e.g. "promo rate — base rate not stated on page").

## Tools and tactics

- `WebFetch` the official page. Bank sites are often JS-heavy; if a fetch returns an empty shell, try: the bank's 卡片總覽 / 信用卡介紹 page, individual card pages found via `WebSearch` with `site:<bank-domain>`, the mobile site, or the bank's sitemap. Only after real attempts, record the gap in notes.
- `WebSearch` with queries like `site:cathaybk.com.tw 信用卡 卡片總覽`, `<bank> 信用卡 停止申請 2026`, `<bank> 信用卡 權益變更 2026` to discover pages.
- Write the JSON file incrementally (write after each few cards) so partial progress survives.
- Do **not** write to any file other than your own `data/cards/<bank-id>.json` and `research/<bank-id>.md`.
- Do not attempt to download images; just record `image_url`.

## Final report back to the coordinator

A short summary: per bank — number of cards captured, number marked discontinued/suspended, how many cards lack `image_url`, confirmed `cards_index_url`, and the top 3 things to double-check. No file dumps.
