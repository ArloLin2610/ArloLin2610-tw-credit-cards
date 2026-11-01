# 台北富邦 (fubon) — research notes

Verified 2026-11-01.

## Official card list

- Confirmed `cards_index_url`: https://www.fubon.com/banking/personal/credit_card/all_card/all_card.htm (works with plain fetch; lists 31 credit cards + debit cards). Status labels used on the page: 「已停止申辦」, 「暫不開放申請」, 「請電洽本行申請」.
- Product pages are static HTML; all tabs (優惠與權益 / 申請資格／年費) are in the page source, so a raw fetch gives everything. WebFetch summaries often miss the 年費 tab — download the HTML and strip tags instead.
- Costco detail page (base rates 店內 2% / 線上 3% / 店外 1%): https://www.fubon.com/banking/event/credit_card/costcoweb/index.html
- momo 回饋方式調整公告 (2026/4/1 店外改現金回饋): linked PDF on the momo page; momo 新卡面公告 2026/7/14: https://www.fubon.com/banking/news/creditcard/relate_msg_20260626momo.htm
- 財神 icash 聯名卡轉換 J 卡 (2026/7/1, 停卡 2026/10/1): stated on https://www.fubon.com/banking/personal/credit_card/all_card/fortune/fortune.htm
- icash 聯名合約 2026/6/30 終止 notice appears on Open Possible, 富利生活, 數位生活 pages.

## Cards captured (19)

Active (14): J卡, momo聯名卡, Costco聯名卡, Open Possible聯名卡, 鑽保卡, 富利生活系列卡, 悍將勇士聯名卡, IMPERIAL尊御世界卡 (邀請制), Angel天使公益認同卡, 法鼓山自在卡, 台北市政府認同卡, 台茂聯名卡, 采盟聯名卡, 福華聯名卡.

Discontinued (5): 數位生活卡 (2025/1/1), 財神系列卡 (2025/2/1), 世界卡 (2026/1/1), 無限卡 (2026/1/1), a miles航空卡.

Not captured (on the list as 已停止申辦 but low value / business): 鈦金卡, 銀行卡, 商務卡, 政府採購卡, Costco採購卡(暫不開放), LINE FRIENDS卡 (權益同數位生活卡), Amoney卡, 台灣大哥大悠遊聯名卡, 悍將悠遊聯名卡, 廣三SOGO, 麗嬰房, DHC.

## Things to double-check

1. **Card networks are not printed on most Fubon product pages.** I inferred them from image file-name suffixes (`_MT` = Mastercard Titanium, `_VS` = Visa Signature, `_VW` = Visa World, `_MW` = Mastercard World, `_MP` = Mastercard Platinum) and from which network's promo section (JCB / Visa / Mastercard) is on the page. Least certain: 台茂, 福華, Angel, 法鼓山, 台北市政府.
2. **All J卡 / 尊御 / momo / Open Possible rates are 2026 promo-period rates (to 2026/12/31)** with the "need 自扣 or 電子帳單, otherwise 0.5%" condition. Re-verify in January 2027.
3. **尊御世界卡 annual fee changed 2026/7/1** (2.5萬 → 1萬, new waiver thresholds 50萬/25萬). Page shows both old and new; I recorded the new one.
4. 鑽保卡 lowest tier recorded as 白金卡 NT$1,500 (御璽 1,800); fee table on the page is the generic Fubon table (普卡 800 / 金卡 1,200 / 白金 1,500 / 鈦金御璽晶緻 1,800) so tier-to-card mapping for the affinity cards (Angel/法鼓山/台北市/台茂/福華) relies on the 申請資格 line "金/普/白金卡" vs "御璽/鈦金/晶緻卡".
5. momo 「精選品牌最高 7%」 is momo 卡 3% + 品牌 mo 點 4% — a momo-side promo, not a bank rate.
6. Image URLs: the J卡 gif URL occasionally returned a transient error on HEAD; it does resolve (169 KB). 世界卡 / 無限卡 / a miles product-page images have no file extension so I used the 卡片總覽 images instead.

## banks.json corrections

None needed — `cards_index_url` and `website` are correct.
