# 彰化銀行 (chb) — research notes

Verified 2026-11-01. Source of truth: www.bankchb.com only.

## Official card list

- 信用卡商品介紹 → 個人卡: `https://www.bankchb.com/frontend/mashup.jsp?funcId=f0f6e5d215`
  (the same funcId is also the Visa 無限卡 page; the left menu on that page lists all 個人卡 / 聯名卡/認同卡 / 商務卡 / 政府採購卡 / 行動信用卡 / 簽帳金融卡.)
- 聯名卡/認同卡: `https://www.bankchb.com/frontend/mashup.jsp?funcId=265deea915`
- 信用卡專區 landing: `https://www.bankchb.com/frontend/subarea.jsp?funcId=f1f12f6d15`
- 信用卡各項費用及利率一覽表 (annual fees for every card in one place): `https://www.bankchb.com/frontend/mashup.jsp?funcId=4292862915`
- 『刷得有禮－紅利積點暨現金回饋』酬賓活動辦法 (base rates for all non-cashback cards, 2026-01-01 to 2026-12-31): `https://www.bankchb.com/frontend/mashup.jsp?funcId=de50b7fa15`
- 信用卡線上申請: `https://ecounter.bankchb.com/chb_ecounter/PO03007A_1.jsp`

Card-face images are not in the static HTML; they are loaded by `POST https://www.bankchb.com/frontend/jsp/getCreditcardSlider.jsp` with `type_id=<typeid>` (the `typeid` attribute on `<div id="creditcard_slider">`). All image URLs in chb.json come from that endpoint and were HEAD/GET-checked (200, image/png or jpeg). They live under `https://www.bankchb.com/chb_2a_resource/leap_do/card_picture/...` with URL-encoded Chinese filenames.

## Cards captured (12)

Personal: My購卡, My樂現金回饋卡, Visa 無限卡, MasterCard 世界卡, 商旅御璽Fun心卡, 鈦金卡/晶緻卡/白金卡 (one product page, three networks), 金卡/普卡, Combo 信用卡.
Co-branded/affinity: 悠遊聯名卡 (御璽/晶緻/普卡), JCB 哆啦A夢悠遊晶緻卡 (discontinued), 一卡通聯名卡, 馬偕認同卡.

Excluded: 商務御璽卡 / 商務白金卡 / 商務金卡 (business), 政府採購卡, 簽帳金融卡, 行動信用卡 (a feature page, not a product).

## Status announcements

- No general 停止申請/停發 announcement page was found on the official site. The news feed (`getNewsInfo.jsp`) and the 優惠訊息 feed (`getBonusInfo.jsp`, type 49) contained no card-discontinuation items as of 2026-11-01.
- The only explicit 停止發行 text is inside the 悠遊聯名卡 slider: "原名：JCB哆啦A夢悠遊晶緻卡，自112年11月1日起停止發行…更名為「JCB悠遊晶緻卡」" → recorded as `chb-doraemon-easycard`, status `discontinued`, 2023-11-01.

## Could not verify / maintainers should double-check

1. **"Me 卡" does not exist on the official CHB list.** The brief/coordinator mentioned 彰銀 "Me 卡"; the official products are My購卡 and My樂現金回饋卡 (mylove). A web search for 彰化銀行 "Me卡" only turns up those two. Treat "Me 卡" as a naming confusion.
2. **馬偕認同卡 "指定藥妝、藥局最高 5%"** appears only in the slider summary on bankchb.com. The detailed 活動辦法 is on `https://creditcard.bankchb.com/MackayAffinity/index.html`, which blocks fetching (robots). Rate recorded as "最高 5%" with a note; conditions not verified.
3. **金卡/普卡 and Combo rebate rates** are not stated on the product pages; they come from the 刷得有禮 program page (金卡 0.2% / 普卡 0.1% cash, 25 元 1 點). Combo is 金卡 level per its image/name, so the same rates were applied — confirm.
4. **無限卡 / 世界卡 reward_type** set to `cashback` although the default scheme is 紅利積點 (cardholder must phone to switch to cash). Both options are recorded in `rewards`. The 0.8%/1.8% rates are stated "至115年12月31日止".
5. **All promo rates** (My購卡 加碼, My樂 加碼, 無限/世界 3% 國外, Fun心卡 2.5% 國外, 馬偕 rates) run to 2026-12-31; re-verify in January 2027.
6. **Networks for 金卡/普卡**: confirmed from the three official card-face images (Visa 4907…, Mastercard 5441…, JCB 3567…). 鈦金/晶緻/白金 networks are explicit in the card names.
7. 商旅御璽Fun心卡 FIFA 主題版 image: slider typeid 50 returns empty data; the regular-version image was used.
8. My樂 landing page `https://mylove.bankchb.com/` resets connections from this environment; all My樂 numbers were taken from the bankchb.com product page instead.

## banks.json corrections

- `cards_index_url` for chb currently `https://www.bankchb.com/frontend/mashup.jsp?funcId=credit`. That page loads (it is the 信用卡 subarea shell) but the actual card list is `https://www.bankchb.com/frontend/mashup.jsp?funcId=f0f6e5d215` (個人卡 商品介紹). Suggest changing `cards_index_url` to `https://www.bankchb.com/frontend/mashup.jsp?funcId=f0f6e5d215`.
- `website` `https://www.bankchb.com/` is correct.
