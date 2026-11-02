# 永豐銀行 (sinopac) — research notes (2026-11-01)

## Official card list
- Confirmed index: `https://bank.sinopac.com/sinopacBT/personal/credit-card/introduction/list.html` (banks.json URL works; server-rendered, WebFetch reads it fine). Bank-card sub-index: `.../introduction/bankcard/list.html`; co-brand pages under `.../introduction/co-brand/`.
- Index lists 45 tiles incl. mobile-pay entries, debit cards, corporate/purchasing cards and 現金儲值卡 — all excluded per brief. Consumer credit cards captured: 20 (15 active, 1 suspended, 4 discontinued).
- Not captured (on index, low priority): 永豐點字金融信用卡 (Braillecombo, combo card), SEA鈦金商務悠遊卡 (foreigners only), 東森網連通聯名卡, 中興大學悠遊認同卡, 其他信用卡 (legacy tiers page).

## Status / announcements
- Index marks three cards 停止申辦; each product page carries the notice 「…於2026年７月１日起，停止受理申辦新卡」: 永豐現金回饋卡(Visa卡), Me Card, 鈦豐卡 → `discontinued`, `status_changed_at: 2026-07-01`.
- 永豐世界卡 product page: 申請說明 heading reads 「(新卡停止受理申辦)」, no date → `discontinued`.
- 永豐財富無限卡: 「新卡停止受理申辦」 + 邀請制 (財富管理貴賓 via 理專) → recorded as `suspended`; maintainer may prefer `active` + requirements note.
- 永富世界卡: from 2026/7/1 only 尊榮理財會員 may apply (still has apply link) → `active` with requirements.
- 永傳世界卡: 邀請制 (永傳會員) but has apply link → `active`.
- No consolidated 權益變更 page found; `https://bank.sinopac.com/sinopacBT/webevents/creditpdf/2024年H1權益或服務調整.pdf` exists (old). 高鐵升等 perk on 永傳/永富/財富無限 ends 2026-12-31.

## How networks/tiers were determined
- Product pages do not state the network in prose. The tier selector markup (`<label class="visa|mc|jcb">御璽卡</label>` with `changeCardPic('<data-id>')`) and the `data-id` on the card `<img>` give a reliable mapping:
  - `15fa3bb0…`=Visa 御璽卡, `15fa95b0…`=Visa 商務御璽卡, `15fe2719…`=Visa 白金卡, `15fa3bb9…`=MC 鈦金卡, `15fa3bbb…`=MC 商務鈦金卡, `15fa95b9…`=JCB 晶緻卡, `15fe2728…`=MC 普卡, `15fe272d…`=MC 白金卡, `15fe2751…`=JCB 白金卡.
  - Single-tier cards: DAWHO=Visa 商務御璽; 幣倍卡/SPORT/Green=MC 商務鈦金; DAWAY=Visa 御璽; JCB卡=JCB 晶緻.
- 永傳/永富/永豐世界卡 (Mastercard) and 財富無限卡 (Visa Infinite) inferred from the page-specific 國際組織優惠 link paths (`master-world-business`, `master-world`, `visa-infinite`). Me Card / 鈦豐卡 networks inferred from tier names only.

## Could not verify / double-check
1. **Tiered cash-back tables are images** on 永傳世界卡 (最高 3.3%) and 永富世界卡 (最高 2%) — only the headline figure is in text.
2. **Annual fee thresholds**: SPORT 卡 page lists no spending-based waiver for SPORT (only generic e-statement waiver); 55688 page shows only the NT$150,000 threshold; MOP page lists thresholds for 晶緻/鈦金商務 but not 御璽.
3. **All reward rates are 2026 H2 promo-framed** (2026/7/1–12/31, some to 2027/3/31). Even "base" 1%/2% on DAWHO/Green/幣倍 is written as 活動期間. Re-check at 2027 H1.
4. **DAWAY** headline 8%/10% assumes DAWAY GO tier + 2026 H2 new-customer bonus; many short-lived LINE Pay promos not captured.
5. **幣倍卡** page claims 「新申辦享最高8%」 without a breakdown.
6. **Image URLs**: taken from the product page `#cardImg` (`data-id`-matched to lowest tier). Green 卡 image is the new miffy face (`1a181cd581b000002779.png`) while the index still shows `1a138f6c2e1000004f25.jpg`. Me Card image taken from index.
7. **Discontinued cards** have placeholder `annual_fee.amount: 0` (fee not on page) — don't surface fee for them.
8. **保倍卡**: fee section mentions a 白金卡 tier (NT$1,500) that is not in the tier selector; omitted from `levels`. 7-ELEVEN promo quota conflicts on page (4,000 vs 2,000).
9. **MITSUI OUTLET PARK** anniversary cash-back figures conflict on page (NT$2,500 vs 4,000 vs 5,500 daily caps).
10. 55688 apply link goes to `app-api.taiwantaxi.com.tw` (linked from the official page).

## banks.json corrections
- None needed; `cards_index_url` is correct. Optionally add `https://bank.sinopac.com/sinopacBT/personal/credit-card/introduction/bankcard/list.html` as the bank-card sub-index.
