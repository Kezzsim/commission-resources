'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

const IMAGE_EXTS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.svg', '.bmp', '.avif', '.tiff', '.tif',
]);

// Files/dirs at the repo root that belong to the app, not the content
const ROOT_EXCLUDE = new Set([
  'node_modules', '.git', '.gitignore',
  'package.json', 'package-lock.json',
  'server.js', 'build.js',
  'index.html', '404.html', 'manifest.json',
  'resources',
]);

const manifest = {};

function walk(dirAbs, virtualPath) {
  let entries;
  try {
    entries = fs.readdirSync(dirAbs);
  } catch {
    return;
  }

  const folders = [];
  const images  = [];
  let   metadata = null;

  for (const entry of entries) {
    if (entry.startsWith('.')) continue;
    if (virtualPath === '/' && ROOT_EXCLUDE.has(entry)) continue;

    const entryAbs = path.join(dirAbs, entry);
    let stat;
    try { stat = fs.statSync(entryAbs); } catch { continue; }

    if (stat.isDirectory()) {
      folders.push(entry);
    } else if (entry === 'metadata.json') {
      try { metadata = JSON.parse(fs.readFileSync(entryAbs, 'utf8')); } catch {}
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (IMAGE_EXTS.has(ext)) images.push(entry);
    }
  }

  folders.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  images.sort( (a, b) => a.localeCompare(b, undefined, { numeric: true }));

  manifest[virtualPath] = { folders, images, metadata };

  const base = virtualPath === '/' ? '' : virtualPath;
  for (const folder of folders) {
    walk(path.join(dirAbs, folder), base + '/' + folder);
  }
}

walk(ROOT, '/');

const outPath = path.join(ROOT, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`manifest.json written — ${Object.keys(manifest).length} paths indexed`);
