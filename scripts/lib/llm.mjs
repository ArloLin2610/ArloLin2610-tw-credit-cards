/**
 * Structured extraction with the Claude API. Every function is a no-op
 * (returns null) when ANTHROPIC_API_KEY is not set, so the checker still
 * detects and reports changes without it.
 */
import fs from 'node:fs';
import path from 'node:path';

const MODEL = process.env.LLM_MODEL || 'claude-sonnet-5-5';
export const hasLLM = Boolean(process.env.ANTHROPIC_API_KEY);

let client = null;
async function getClient() {
  if (!hasLLM) return null;
  if (client) return client;
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 });
  return client;
}

const root = path.resolve(new URL('../..', import.meta.url).pathname);
const cardSchema = JSON.parse(fs.readFileSync(path.join(root, 'data/schema/card.schema.json'), 'utf8'));

// Tool input schemas must not contain $schema/$id.
function toolSchema(schema) {
  const { $schema, $id, ...rest } = schema;
  return rest;
}

async function callTool({ system, user, name, description, schema, maxTokens = 4000 }) {
  const c = await getClient();
  if (!c) return null;
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    tools: [{ name, description, input_schema: schema }],
    tool_choice: { type: 'tool', name },
    messages: [{ role: 'user', content: user }],
  });
  const block = res.content.find((b) => b.type === 'tool_use');
  return block ? block.input : null;
}

const SYSTEM = `你是台灣信用卡資料整理員。只根據提供的官方網頁文字作答，不可以補充頁面沒有的數字或條件。所有文字使用繁體中文。無法確認的欄位請省略，不要猜。`;

/** Extract the list of consumer credit cards named on a bank's card-index page. */
export async function extractCardList(bankName, pageText, links) {
  const linkHints = links
    .filter((l) => /card|credit|卡/i.test(l.href + l.text))
    .slice(0, 150)
    .map((l) => `${l.text} -> ${l.href}`)
    .join('\n');
  return callTool({
    system: SYSTEM,
    user: `以下是「${bankName}」官方信用卡總覽頁的文字。列出頁面上所有「消費者信用卡」的卡片名稱（排除商務卡、採購卡、金融卡、簽帳卡）。若能從連結清單對應到該卡的產品頁網址，一併給出。\n\n=== 頁面文字 ===\n${pageText.slice(0, 30000)}\n\n=== 連結清單 ===\n${linkHints}`,
    name: 'card_list',
    description: '回傳卡片清單',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['cards'],
      properties: {
        cards: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['name'],
            properties: {
              name: { type: 'string', description: '官方卡名' },
              url: { type: 'string', description: '產品頁網址（若有）' },
              status_hint: { enum: ['active', 'suspended', 'discontinued', 'unknown'], description: '頁面是否標示停止申請' },
            },
          },
        },
      },
    },
  });
}

/** Extract or refresh one card's structured data from its official product page. */
export async function extractCard({ bankId, bankName, url, pageText, existing }) {
  const schema = toolSchema(cardSchema);
  const result = await callTool({
    system: SYSTEM,
    user: [
      `銀行：${bankName}（bank id: ${bankId}）`,
      `產品頁網址：${url}`,
      existing ? `目前資料庫中的版本（請以新頁面內容更新，欄位語意不變；id、bank、source_url 保持不變）：\n${JSON.stringify(existing, null, 2)}` : `這是新卡，請建立完整資料。id 格式：${bankId}-<英文小寫 slug>。`,
      `欄位說明：reward_type 取主要回饋型態（cashback 現金回饋 / miles 哩程 / points 點數）；rewards.rate_value 為數字：現金或點數填百分比，哩程填「每一哩需要的新台幣元數」；annual_fee.amount 為最低卡別標準年費（免年費填 0）；headline ≤ 60 字；highlights 3–6 條；status 依頁面是否開放申請判斷；last_verified 填 ${new Date().toISOString().slice(0, 10)}；image_url 從頁面圖片清單挑卡面圖。`,
      `=== 官方頁面文字 ===\n${pageText.slice(0, 40000)}`,
    ].join('\n\n'),
    name: 'card',
    description: '回傳符合 schema 的信用卡資料',
    schema,
    maxTokens: 6000,
  });
  return result;
}

/** Decide whether a product page now says the card is closed to applications. */
export async function classifyStatus({ cardName, pageText, httpStatus, stopKeywords }) {
  return callTool({
    system: SYSTEM,
    user: `卡片：${cardName}\nHTTP 狀態：${httpStatus}\n命中關鍵字：${stopKeywords.join(' | ') || '無'}\n\n根據下列頁面文字判斷此卡目前是否仍開放申請。\n\n${pageText.slice(0, 20000)}`,
    name: 'status',
    description: '判斷申請狀態',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['status', 'confidence', 'reason'],
      properties: {
        status: { enum: ['active', 'suspended', 'discontinued', 'unknown'] },
        confidence: { type: 'number', minimum: 0, maximum: 1 },
        reason: { type: 'string', description: '一句話說明依據（引用頁面文字）' },
        status_note: { type: 'string', description: '可放到網站上的簡短說明' },
      },
    },
    maxTokens: 800,
  });
}

/** One-paragraph Chinese summary of what changed on a page (for the review PR). */
export async function summarizeChange({ bankName, url, added, removed }) {
  const c = await getClient();
  if (!c) return null;
  const res = await c.messages.create({
    model: MODEL,
    max_tokens: 400,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `「${bankName}」的頁面 ${url} 文字有變動。請用 1–3 句繁體中文摘要對信用卡申請人有意義的變化（新卡、停發、回饋率、年費、活動期間）。若只是版面或無關文字變動，回答「無實質變化」。\n\n新增的行：\n${added.slice(0, 80).join('\n')}\n\n移除的行：\n${removed.slice(0, 80).join('\n')}`,
      },
    ],
  });
  return res.content.find((b) => b.type === 'text')?.text?.trim() ?? null;
}
