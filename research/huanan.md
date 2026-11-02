# 華南銀行 (huanan) — research notes (attempted 2026-11-02)

## Result
`data/cards/huanan.json` is intentionally an **empty array**: no official Hua Nan page could be retrieved, and the brief
forbids taking numbers from third-party sites.

## What was tried (all failed)
- WebFetch: `https://www.hncb.com.tw/wps/portal/HNCB/creditcard`, `.../creditcard/card-intro`, `https://card.hncb.com.tw/`,
  `https://m.hncb.com.tw/` → all "robots_disallowed".
- curl (plain Mozilla UA, HTTP/1.1): `www.hncb.com.tw`, `card.hncb.com.tw`, `m.hncb.com.tw`, `event.hncb.com.tw`,
  `www.hncb.com.tw/robots.txt` → "Recv failure: Connection reset by peer" on every request (the agent proxy logs
  `ws_closed_mid_exchange` for hncb.com.tw:443). The bank appears to drop non-Taiwan traffic at the edge.
- Wayback Machine: only a 2018 snapshot of the homepage exists; nothing for card.hncb.com.tw.
- Chrome extension (user's browser) was not connected to this session.
- WebSearch `site:hncb.com.tw` returned no hncb.com.tw results at all (third-party pages only), so no official PDF URLs
  (權益手冊/年費表) could even be discovered.

## For the maintainer
- Card names seen on third-party discovery pages (NOT verified, do not publish): i網購生活卡, SuperCard超級卡,
  Rich富利卡, 現金回饋卡 and ANA/JAL 聯名卡 mentions. These only tell you what to look for.
- Re-run from a Taiwan IP or with the Chrome extension connected; start at
  `https://www.hncb.com.tw/wps/portal/HNCB/creditcard` and the 卡片總覽 link, then look for the 年費/權益 PDFs.

## banks.json corrections
- Could not confirm `cards_index_url` (`https://www.hncb.com.tw/wps/portal/HNCB/creditcard`); it is the URL the bank
  publishes in third-party listings, so it is probably right, but it was never fetched successfully.
