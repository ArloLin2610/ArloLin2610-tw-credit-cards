/**
 * Fetch a bank page and reduce it to comparable plain text.
 * Plain HTTP first; falls back to headless Chromium (Playwright) when the page
 * is a JS shell or a bot-challenge page and Playwright is installed.
 */
import * as cheerio from 'cheerio';

// Identify ourselves honestly; banks can rate-limit or block us by this string.
const UA = 'tw-credit-cards-updater/1.0 (+https://github.com/ArloLin2610/ArloLin2610-tw-credit-cards; biweekly check of public credit-card pages)';
const MIN_TEXT = 400;

/* ---------- robots.txt ---------- */
const robotsCache = new Map();
async function robotsAllows(url) {
  let origin;
  try {
    origin = new URL(url).origin;
  } catch {
    return true;
  }
  if (!robotsCache.has(origin)) {
    robotsCache.set(
      origin,
      (async () => {
        try {
          const res = await fetch(`${origin}/robots.txt`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(10000) });
          if (!res.ok) return [];
          const txt = await res.text();
          // Collect Disallow rules that apply to "*" (we don't expect bank sites to name us).
          const rules = [];
          let applies = false;
          for (const raw of txt.split('\n')) {
            const line = raw.replace(/#.*/, '').trim();
            if (!line) continue;
            const [k, ...rest] = line.split(':');
            const v = rest.join(':').trim();
            if (/^user-agent$/i.test(k)) applies = v === '*';
            else if (applies && /^disallow$/i.test(k) && v) rules.push(v);
          }
          return rules;
        } catch {
          return [];
        }
      })(),
    );
  }
  const rules = await robotsCache.get(origin);
  const u = new URL(url);
  const p = u.pathname + u.search;
  return !rules.some((rule) => ruleToRegex(rule).test(p));
}

// robots.txt path pattern → regex: "*" matches anything, trailing "$" anchors.
const ruleRegexCache = new Map();
function ruleToRegex(rule) {
  if (!ruleRegexCache.has(rule)) {
    const anchored = rule.endsWith('$');
    const body = (anchored ? rule.slice(0, -1) : rule)
      .split('*')
      .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    ruleRegexCache.set(rule, new RegExp('^' + body + (anchored ? '$' : '')));
  }
  return ruleRegexCache.get(rule);
}
const STOP_WORDS = /停止申請|停發|停止發行|已停止受理|不再受理|暫停申請|停止受理|停止核發/;

let browserPromise = null;
async function getBrowser() {
  if (browserPromise) return browserPromise;
  browserPromise = (async () => {
    try {
      const { chromium } = await import('playwright');
      return await chromium.launch({ headless: true });
    } catch {
      return null;
    }
  })();
  return browserPromise;
}
export async function closeBrowser() {
  const b = await browserPromise;
  if (b) await b.close();
  browserPromise = null;
}

export function htmlToText(html, baseUrl) {
  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg, template').remove();
  $('header, footer, nav, [role="navigation"], .cookie, #cookie, .breadcrumb').remove();
  const links = [];
  $('a[href]').each((_, a) => {
    const text = $(a).text().replace(/\s+/g, ' ').trim();
    let href = $(a).attr('href') || '';
    try {
      href = new URL(href, baseUrl).href;
    } catch {
      return;
    }
    if (text && /^https?:/.test(href)) links.push({ text, href });
  });
  const images = [];
  $('img[src], img[data-src]').each((_, img) => {
    let src = $(img).attr('src') || $(img).attr('data-src') || '';
    try {
      src = new URL(src, baseUrl).href;
    } catch {
      return;
    }
    images.push({ alt: ($(img).attr('alt') || '').trim(), src });
  });
  const title = $('title').first().text().trim();
  const main = $('main').length ? $('main') : $('body');
  const text = main
    .text()
    .replace(/ /g, ' ')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l) => l.length > 1)
    .join('\n');
  return { title, text, links, images };
}

// True when the HTML is a JavaScript shell that needs rendering. A 403/429 is a
// real refusal and is reported as an error, not retried in a browser.
function needsRendering(status, text) {
  if (status === 403 || status === 429) return false;
  if (text.length < MIN_TEXT) return true;
  if (/enable javascript|請開啟 ?javascript/i.test(text) && text.length < 2000) return true;
  return false;
}

async function plainFetch(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml', 'accept-language': 'zh-TW,zh;q=0.9,en;q=0.5' },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    const html = await res.text();
    return { status: res.status, html, finalUrl: res.url || url };
  } finally {
    clearTimeout(t);
  }
}

async function browserFetch(url) {
  const browser = await getBrowser();
  if (!browser) return null;
  // Headless Chromium keeps its own "HeadlessChrome" user agent; we only use it
  // to render JavaScript-built pages, not to look like a person.
  const ctx = await browser.newContext({ locale: 'zh-TW', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  try {
    // domcontentloaded + a short settle beats networkidle here: bank sites keep
    // analytics connections open and would otherwise hit the timeout every time.
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => null);
    await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(800);
    const html = await page.content();
    return { status: res ? res.status() : 0, html, finalUrl: page.url(), viaBrowser: true };
  } finally {
    await ctx.close();
  }
}

/**
 * @returns {Promise<{ok:boolean,status:number,finalUrl:string,title:string,text:string,links:Array,images:Array,viaBrowser:boolean,error?:string,stopKeywords:string[]}>}
 */
// After this many consecutive timeouts/connection failures on one host we stop
// trying that host for the rest of the run (it is down or blocking us).
const HOST_FAIL_LIMIT = 3;
const hostFailures = new Map();
const empty = (url, error) => ({ ok: false, status: 0, finalUrl: url, viaBrowser: false, error, stopKeywords: [], title: '', text: '', links: [], images: [] });

export async function fetchPage(url, { allowBrowser = true } = {}) {
  if (!(await robotsAllows(url))) return empty(url, 'disallowed by robots.txt');
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    return empty(url, 'invalid url');
  }
  if ((hostFailures.get(host) || 0) >= HOST_FAIL_LIMIT) return empty(url, `skipped: ${host} failed ${HOST_FAIL_LIMIT} times in a row this run`);
  let r;
  try {
    r = await plainFetch(url);
    hostFailures.set(host, 0);
  } catch (e) {
    r = { status: 0, html: '', finalUrl: url, error: e.name === 'AbortError' ? 'timeout' : e.message };
    hostFailures.set(host, (hostFailures.get(host) || 0) + 1);
  }
  let parsed = htmlToText(r.html || '', r.finalUrl);
  let viaBrowser = false;
  if (allowBrowser && r.status !== 0 && needsRendering(r.status, parsed.text)) {
    const b = await browserFetch(url).catch(() => null);
    if (b && b.html && htmlToText(b.html, b.finalUrl).text.length > parsed.text.length) {
      r = b;
      parsed = htmlToText(b.html, b.finalUrl);
      viaBrowser = true;
    }
  }
  const ok = r.status >= 200 && r.status < 400 && parsed.text.length >= MIN_TEXT / 4;
  const stopKeywords = [];
  for (const line of parsed.text.split('\n')) if (STOP_WORDS.test(line)) stopKeywords.push(line.slice(0, 160));
  return { ok, status: r.status, finalUrl: r.finalUrl, viaBrowser, error: r.error, stopKeywords: stopKeywords.slice(0, 6), ...parsed };
}

/** Minimal line diff for human review. */
export function lineDiff(oldText, newText) {
  const a = new Set(oldText.split('\n'));
  const b = new Set(newText.split('\n'));
  const removed = [...a].filter((l) => !b.has(l));
  const added = [...b].filter((l) => !a.has(l));
  return { added, removed };
}
