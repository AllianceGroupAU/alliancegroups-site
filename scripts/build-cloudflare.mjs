import { copyFile, cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

const staticDirectories = [
  'assets',
  'case-studies',
  'compliance-shield',
  'css',
  'images',
  'intake',
  'ops',
  'js',
  'knowledge',
  'videos'
];

const staticFiles = [
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt'
];

const excludedHtml = new Set([
  'index-original.html',
  'index-static-backup.html'
]);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

// Cloudflare Pages advanced-mode worker: handles /api/intake and forwards assets.
// Without _worker.js the static build has no endpoint for enquiry submissions.
await copyFile(path.join(root, 'worker.js'), path.join(out, '_worker.js'));

// This repository also ships a standalone Cloudflare Worker (wrangler.live.jsonc
// main: worker.js, assets.directory: dist). The copy above is necessary for a
// Cloudflare Pages build, but must NEVER be uploaded as a publicly served
// static asset by Wrangler Workers. Wrangler honours this ignore rule for the
// Worker asset upload while leaving the source worker.js as the executable.
await writeFile(path.join(out, '.assetsignore'), '_worker.js\n');


const entries = await readdir(root, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith('.html') || excludedHtml.has(entry.name)) {
    continue;
  }
  await copyFile(path.join(root, entry.name), path.join(out, entry.name));
}

for (const file of staticFiles) {
  await copyFile(path.join(root, file), path.join(out, file));
}

for (const directory of staticDirectories) {
  await cp(path.join(root, directory), path.join(out, directory), { recursive: true });
}

console.log('Cloudflare Pages build ready in dist/');
