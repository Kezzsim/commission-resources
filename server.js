const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const ROOT = __dirname;
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif', '.tiff', '.tif']);

// Resolve and validate a path stays within ROOT
function safePath(reqPath) {
  const normalized = path.normalize('/' + (reqPath || '')).replace(/\\/g, '/');
  const full = path.join(ROOT, normalized);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

// API: list directory contents
app.get('/api/list', (req, res) => {
  const full = safePath(req.query.path);
  if (!full) return res.status(403).json({ error: 'Forbidden' });

  let entries;
  try {
    entries = fs.readdirSync(full);
  } catch {
    return res.status(404).json({ error: 'Not found' });
  }

  const folders = [];
  const images = [];

  for (const entry of entries) {
    // Skip hidden files and system files
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'package.json' ||
        entry === 'package-lock.json' || entry === 'server.js' || entry === 'index.html') continue;

    const entryFull = path.join(full, entry);
    let stat;
    try { stat = fs.statSync(entryFull); } catch { continue; }

    if (stat.isDirectory()) {
      folders.push(entry);
    } else {
      const ext = path.extname(entry).toLowerCase();
      if (IMAGE_EXTS.has(ext)) images.push(entry);
    }
  }

  // Sort folders and images alphabetically
  folders.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  images.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Try to read metadata.json
  let metadata = null;
  const metaPath = path.join(full, 'metadata.json');
  if (fs.existsSync(metaPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    } catch {
      metadata = null;
    }
  }

  res.json({ folders, images, metadata });
});

// Serve static files (images etc.) — index.html explicitly
app.get('/', (req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.use(express.static(ROOT, {
  // Don't auto-serve index.html for directories
  index: false,
  // Don't list directories
  dotfiles: 'ignore',
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Kezzbi's Commission Resources`);
  console.log(`  → http://localhost:${PORT}\n`);
});
