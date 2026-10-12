const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const host = 'https://www.alliancegroups.com.au';
const pages = [
  'emergency-roof-repairs.html',
  'asbestos-removal-brisbane.html',
  'asbestos-removal-moreton-bay.html',
  'building-remediation-brisbane.html',
  'commercial-roof-repairs.html'
];
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

test('Google-selected www host remains the canonical host in sitemap and robots', () => {
  assert.match(fs.readFileSync('robots.txt', 'utf8'), /Sitemap: https:\/\/www\.alliancegroups\.com\.au\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/www\.alliancegroups\.com\.au\/<\/loc>/);
});

for (const page of pages) {
  test('commercial SEO path: ' + page, () => {
    const html = fs.readFileSync(page, 'utf8');
    assert.ok(html.includes('<link rel="canonical" href="' + host + '/' + page + '"'));
    assert.ok(sitemap.includes('<loc>' + host + '/' + page + '</loc>'));
    const title = html.match(/<title>([^<]+)<\/title>/);
    const desc = html.match(/<meta name="description" content="([^"]+)"/);
    assert.ok(title && title[1].length >= 40 && title[1].length <= 100);
    assert.ok(desc && desc[1].length >= 95 && desc[1].length <= 220);
    assert.match(html, /tel:0403126276/);
    assert.match(html, /href="\/#enquiry"/);
    assert.match(html, /href="\/intake\/"/);
    assert.doesNotMatch(html, /tel:0410942905|info@alliancegroups\.com\.au/);
    for (const m of html.matchAll(/<script type="application\/ld\+json">\s*([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(m[1]));
    }
  });
}

test('updated service pages have accurate dates without claiming all legacy pages were changed', () => {
  for (const page of pages) {
    const i = sitemap.indexOf('<loc>' + host + '/' + page + '</loc>');
    assert.ok(i >= 0);
    assert.match(sitemap.slice(i, sitemap.indexOf('</url>', i)), /<lastmod>2026-10-12<\/lastmod>/);
  }
});
