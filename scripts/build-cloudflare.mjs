import { copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
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
