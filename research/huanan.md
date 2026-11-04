# 華南銀行 (huanan) — research notes (attempted 2026-11-02, retried with the built-in browser 2026-11-03)

## Result
`data/cards/huanan.json` is still intentionally an **empty array**: no official Hua Nan page could be loaded from the
cloud **or** from the person's own computer, and the brief forbids taking numbers from third-party sites.

## 2026-11-03 attempt (Claude desktop app built-in browser, person's computer in the US)
- Site access for `hncb.com.tw` was granted (`request_access`, scope site), but every navigation failed at the network
  level ("denied or failed", the tab reports "the last page load failed"): `https://www.hncb.com.tw/wps/portal/HNCB/creditcard`,
  `https://www.hncb.com.tw/`, `https://www.hncb.com.tw/wps/portal/HNCB/creditcard/card-intro`, `https://card.hncb.com.tw/`,
  `https://m.hncb.com.tw/`, and the plain-http variant. Other sites (card.firstbank.com.tw) loaded fine in the same tab, so
  this is the bank refusing the connection, not the browser.
- From the cloud, `curl` to www/card/event.hncb.com.tw returns no HTTP response at all (connection reset), same as 11-02.
- `WebSearch site:hncb.com.tw` again returns no hncb.com.tw pages, so no official PDF (年費表／權益手冊) URL could be found.
- Conclusion: hncb.com.tw appears to block non-Taiwan traffic at the edge. It must be collected from a Taiwan IP (or
  Taiwan VPN) — the person's Taiwan trip (Nov 14–29) would be a natural time to do it from the built-in browser.

## 2026-11-02 attempt (cloud only) — unchanged
- WebFetch: `https://www.hncb.com.tw/wps/portal/HNCB/creditcard`, `.../creditcard/card-intro`, `https://card.hncb.com.tw/`,
  `https://m.hncb.com.tw/` → all "robots_disallowed".
- curl (Mozilla UA, HTTP/1.1): every hncb.com.tw host → "Recv failure: Connection reset by peer".
- Wayback Machine: only a 2018 homepage snapshot; nothing for card.hncb.com.tw.

## For the maintainer
- Card names seen on third-party discovery pages (NOT verified, do not publish): i網購生活卡, SuperCard超級卡, Rich 世界卡,
  財富無限卡, 台塑聯名卡, 環球購物中心聯名卡, 悠遊聯名卡, 現金回饋卡, ANA/JAL 聯名卡. These only tell you what to look for.
- Re-run from a Taiwan IP: start at `https://www.hncb.com.tw/wps/portal/HNCB/creditcard`, find the 卡片介紹／卡片總覽 link,
  then the 年費／權益 PDFs.

## banks.json corrections
- `cards_index_url` could **not** be confirmed; `https://www.hncb.com.tw/wps/portal/HNCB/creditcard` is the URL the bank
  publishes in third-party listings and has never been fetched successfully. No correction proposed; keep the existing
  `notes` text ("華南銀行官網目前無法由本站系統讀取，卡片資料整理中。").
