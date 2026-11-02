# 卡比 — 台灣信用卡福利比較

把台灣各大銀行的信用卡權益放在同一個地方：依**現金回饋／哩程／點數**分類、附卡圖、年費與官網申請連結，並且每兩週自動對照各銀行官網，偵測新卡、停發與權益變動，經人工審核後上線。

- 網站：Astro 靜態站 + React 互動元件（篩選、並排比較），部署在 Netlify
- 資料：`data/cards/<bank>.json`（每家銀行一個檔案），schema 在 `data/schema/`
- 自動更新：GitHub Actions 排程 → `scripts/check-updates.mjs` → 審核 PR → 合併後 Netlify 自動部署

## 專案結構

```
data/
  banks.json            發卡銀行清單（含要監看的官方卡片總覽頁）
  cards/<bank>.json     每家銀行的卡片資料（網站唯一資料來源）
  changelog.json        網站「最近更新」頁的紀錄
  schema/               JSON Schema（驗證用）
  snapshots/            官網頁面文字快照（自動產生，供比對）
  proposals/<date>/     每次核對的報告（PR 內容）
public/cards/           卡圖（由 scripts/fetch-card-images.mjs 下載，<id>.webp）
scripts/
  validate-data.mjs     驗證資料；build 前會自動跑
  check-updates.mjs     官網核對主程式
  fetch-card-images.mjs 下載官方卡圖
  lib/fetch-page.mjs    抓頁面（HTTP → 失敗時改用 Playwright Chromium）
  lib/llm.mjs           Claude API 結構化擷取（沒有 API key 時自動略過）
src/                    Astro 網站
research/               第一版資料的研究筆記（每家銀行一個 .md）
```

## 本機開發

```bash
npm install
npm run dev            # http://localhost:4321
npm run data:validate  # 驗證 data/
npm run build          # 驗證 + 建置到 dist/
```

## 部署（Netlify）

1. Netlify → Add new site → Import from Git → 選這個 repo。`netlify.toml` 已經設定 build command 與 publish 目錄，不用改。
2. Site configuration → Environment variables：加 `SITE_URL=https://<你的網域>`（sitemap 與 canonical 用；不加會用 Netlify 給的 URL）。
3. 之後每次 `main` 有新 commit（也就是你合併審核 PR 時），Netlify 會自動重新建置。

## 自動更新流程

`.github/workflows/check-updates.yml` 每月 1 日與 15 日執行（也可以在 Actions 頁手動觸發，可只跑單一銀行）。流程：

1. 抓每家銀行 `banks.json` 裡的 `cards_index_url` 與 `watch_urls`（卡片總覽、停發公告），以及每張卡的 `source_url`。
2. 與 `data/snapshots/` 內上一次的文字快照比對。
3. 偵測三類事件：
   - **新卡**：總覽頁出現資料庫沒有的卡名 → 抓產品頁 → 用 Claude 依 schema 擷取成卡片資料
   - **停止申請**：產品頁 404、被導回總覽頁、或出現「停止申請／停發」等字樣 → Claude 判讀（信心 ≥ 0.75 才改狀態，否則只標記請人工確認）
   - **權益變動**：產品頁文字變動 → Claude 依新頁面重新擷取，列出改了哪些欄位
4. 變更直接寫進 `data/cards/*.json` 與 `data/changelog.json`，連同報告 `data/proposals/<date>/REPORT.md` 開成一個 PR（label `needs-review`）。
5. **你審核 PR**：報告列出每一項變更的依據與文字差異；不對的 hunk 可以直接在 PR 上修改或還原，確認後合併 → Netlify 部署。

沒有變更時，workflow 只會 commit 更新後的快照與 `last_verified` 日期。

### 需要設定的 Secrets / Variables

| 名稱 | 位置 | 說明 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Settings → Secrets → Actions | 啟用 LLM 擷取。沒有的話只會偵測變動並開 PR 列出差異，不會自動改資料。 |
| `LLM_MODEL` | Settings → Variables → Actions（選填） | 預設 `claude-sonnet-5-5`。 |

另外請到 Settings → Actions → General → Workflow permissions 勾選 **Allow GitHub Actions to create and approve pull requests**，否則 workflow 無法開 PR。

### 第一次啟用

資料整理完、確認無誤後，先建立快照基準，之後的排程才會只回報「變化」：

```bash
node scripts/check-updates.mjs --snapshot-only
git add data/snapshots && git commit -m "chore: 建立快照基準"
```

（或在 Actions 手動觸發，勾 `snapshot_only`。）

### 手動操作

```bash
node scripts/check-updates.mjs --bank cathay          # 只檢查國泰
node scripts/check-updates.mjs --no-llm --dry-run     # 只看偵測結果，不寫檔
node scripts/fetch-card-images.mjs --bank esun --force # 重新下載玉山卡圖
```

## 新增銀行或卡片

1. `data/banks.json` 加一筆（`cards_index_url` 要是官方卡片總覽頁）。
2. `data/cards/<bank-id>.json` 新增卡片，欄位見 `data/schema/card.schema.json`；`id` 必須是 `<bank-id>-<slug>`。
3. `npm run data:validate`，再 `node scripts/fetch-card-images.mjs --bank <bank-id>`。

### 資料原則

- 資料不完整或未經官網確認的卡片設 ，網站會隱藏它，等補齊後把旗標拿掉即可上線。
- 目前已知缺口：華南銀行（官網拒絕雲端連線，0 張）、中信 4 張與第一銀行 4 張標為 needs_review；詳見 。

- 每一個數字都要能在 `source_url` 的官方頁面上找到；不採用部落格或第三方整理。
- 哩程卡的 `rate_value` 是「每一哩需要多少元」，數字越小越好；現金／點數卡的 `rate_value` 是百分比。
- 不確定的欄位留空、寫在 `notes`，比寫錯好。

## 授權

程式碼 MIT。卡片名稱、卡圖與權益文字屬各發卡銀行所有，本站僅作資訊整理並附來源連結。
