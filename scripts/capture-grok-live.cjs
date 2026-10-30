#!/usr/bin/env node
// Read-only capture of the PUBLIC alliancegroups.com.au site exactly as it is served today.
// Saves every page and same-site file (HTML, CSS, JS, images, video, fonts) under grok-site/
// so the live design can be edited in Git. Submits no forms, changes nothing on Cloudflare.
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ORIGINS = (process.env.CAPTURE_ORIGINS || 'https://alliancegroups.com.au,https://www.alliancegroups.com.au').split(',');
const START = process.env.CAPTURE_START || 'https://www.alliancegroups.com.au/';
const HOST = new URL(START).origin;
const OUT = path.resolve('grok-site');
const MAX_PAGES = 250;
const report = { started: new Date().toISOString(), pages: [], assets: [], failures: [], external: new Set(), headers: {} };

const sameSite = u => { try { const x = new URL(u); return ORIGINS.includes(x.origin); } catch { return false; } };
const clean = u => { const x = new URL(u); x.hash = ''; return x.toString(); };
const isPage = u => { const p = new URL(u).pathname; return p.endsWith('/') || p.endsWith('.html') || !/\.[a-z0-9]{2,5}$/i.test(p); };

function fileFor(u, isHtml) {
  const p = decodeURIComponent(new URL(u).pathname);
  let rel = p.replace(/^\/+/, '');
  if (isHtml && (rel === '' || rel.endsWith('/'))) rel += 'index.html';
  else if (isHtml && !/\.[a-z0-9]{2,5}$/i.test(rel)) rel += '/index.html';
  const target = path.join(OUT, rel);
  if (!target.startsWith(OUT)) throw new Error('unsafe path ' + u);
  return target;
}
function save(u, buf, isHtml) {
  const target = fileFor(u, isHtml);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buf);
  return path.relative(OUT, target);
}
function refsFromHtml(html, base) {
  const out = new Set();
  const re = /(?:href|src|poster|data-src|data-full|data-image|data-video)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) out.add(m[1]);
  const og = /<meta[^>]+(?:og:image|twitter:image|msapplication-TileImage)[^>]*content\s*=\s*["']([^"']+)["']/gi;
  while ((m = og.exec(html))) out.add(m[1]);
  const ss = /srcset\s*=\s*["']([^"']+)["']/gi;
  while ((m = ss.exec(html))) m[1].split(',').forEach(s => out.add(s.trim().split(/\s+/)[0]));
  const cssUrl = /url\(\s*["']?([^)"']+)["']?\s*\)/gi;
  while ((m = cssUrl.exec(html))) out.add(m[1]);
  const abs = new Set();
  for (const r of out) {
    if (!r || r.startsWith('data:') || r.startsWith('mailto:') || r.startsWith('tel:') || r.startsWith('javascript:') || r.startsWith('#')) continue;
    try { abs.add(clean(new URL(r, base).toString())); } catch {}
  }
  return abs;
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: process.env.CAPTURE_HEADLESS === '1' ? true : false, args: ['--disable-blink-features=AutomationControlled'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }, locale: 'en-AU', timezoneId: 'Australia/Brisbane',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const seenAssets = new Set();
  page.on('response', r => {
    const u = r.url();
    if (sameSite(u) && r.request().resourceType() !== 'document') seenAssets.add(clean(u));
    else if (!sameSite(u) && /^https?:/.test(u)) report.external.add(new URL(u).origin);
  });

  async function open(u) {
    const resp = await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 });
    for (let i = 0; i < 30; i++) {           // wait out a Cloudflare check page if one appears
      const t = await page.title();
      if (!/just a moment|attention required|checking your browser/i.test(t)) break;
      await page.waitForTimeout(2000);
    }
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await page.evaluate(async () => {        // scroll so lazy images and late scripts load
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
    }).catch(() => {});
    return resp;
  }

  // First visit establishes any Cloudflare clearance for the shared request context.
  const first = await open(START);
  report.headers.home = first ? await first.allHeaders() : null;
  report.homeTitle = await page.title();

  const queue = [START];
  const done = new Set();
  for (const sm of [...new Set(ORIGINS.map(o => o + '/sitemap.xml'))]) {
    try {
      const r = await context.request.get(sm);
      if (r.ok()) {
        const xml = await r.text();
        save(sm, Buffer.from(xml), false);
        for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) if (sameSite(m[1])) queue.push(clean(m[1]));
        break;
      }
    } catch (e) { report.failures.push({ url: sm, error: String(e) }); }
  }
  for (const extra of ['/robots.txt', '/favicon.ico', '/site.webmanifest', '/manifest.json', '/404.html', '/llms.txt']) {
    try { const r = await context.request.get(HOST + extra); if (r.ok()) save(HOST + extra, await r.body(), false); } catch {}
  }

  while (queue.length && done.size < MAX_PAGES) {
    const u = queue.shift();
    const key = new URL(u).pathname.replace(/index\.html$/, '');
    if (done.has(key)) continue;
    done.add(key);
    try {
      const resp = u === START ? first : await open(u);
      const status = resp ? resp.status() : 0;
      const raw = resp ? await resp.body() : Buffer.from(await page.content());
      const html = raw.toString('utf8');
      const file = save(u, raw, true);
      report.pages.push({ url: u, status, file, title: await page.title(), bytes: raw.length });
      for (const ref of refsFromHtml(html, u)) {
        if (!sameSite(ref)) { try { report.external.add(new URL(ref).origin); } catch {} continue; }
        if (isPage(ref)) queue.push(ref); else seenAssets.add(ref);
      }
      const links = await page.$$eval('a[href]', as => as.map(a => a.href)).catch(() => []);
      for (const l of links) if (sameSite(l) && isPage(l)) queue.push(clean(l));
    } catch (e) { report.failures.push({ url: u, error: String(e) }); }
  }

  // Download every same-site file in full (also follows url() references inside CSS).
  const fetched = new Set();
  const assetQueue = [...seenAssets];
  while (assetQueue.length) {
    const u = assetQueue.shift();
    const k = u.split('?')[0];
    if (fetched.has(k)) continue;
    fetched.add(k);
    try {
      const r = await context.request.get(u, { timeout: 90000 });
      if (!r.ok()) { report.failures.push({ url: u, status: r.status() }); continue; }
      const body = await r.body();
      const file = save(k, body, false);
      report.assets.push({ url: k, file, bytes: body.length, type: r.headers()['content-type'] || '' });
      if (/\.css$/i.test(k) || (r.headers()['content-type'] || '').includes('css') || /\.js$/i.test(k)) {
        for (const ref of refsFromHtml(body.toString('utf8'), u)) if (sameSite(ref) && !isPage(ref)) assetQueue.push(ref);
      }
    } catch (e) { report.failures.push({ url: u, error: String(e) }); }
  }

  report.external = [...report.external].sort();
  report.finished = new Date().toISOString();
  report.summary = { pages: report.pages.length, assets: report.assets.length, failures: report.failures.length };
  fs.writeFileSync(path.join(OUT, '_capture-report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report.summary), 'home title:', report.homeTitle);
  await browser.close();
  const challenged = /just a moment|attention required/i.test(report.homeTitle || '');
  if (challenged || report.pages.length < 3) { console.error('Capture blocked or incomplete.'); process.exit(2); }
})().catch(e => { console.error(e); process.exit(1); });
