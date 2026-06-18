// Local development server — mirrors exactly what GitHub Pages serves.
// Generates manifest.json on startup, then serves the repo root as static files.
//
// Usage: npm start
//
'use strict';

const express = require('express');
const path    = require('path');

// Must match the <base href> in index.html and the GitHub Pages repo subdirectory.
const BASE = '/commission-resources';

// Regenerate manifest before serving — keeps it in sync with any file changes
require('./build');

const app  = express();
const ROOT = __dirname;

const staticOpts = { index: false, dotfiles: 'ignore' };

// Serve at the base path so relative URLs resolved via <base href="/commission-resources/">
// work correctly (e.g. fetch('manifest.json') → /commission-resources/manifest.json).
app.use(BASE, express.static(ROOT, staticOpts));

// Also serve at root for convenience when accessing http://localhost:3000/ directly.
app.use(express.static(ROOT, staticOpts));

// SPA catch-all: any extensionless path returns index.html,
// matching the behaviour of the GitHub Pages 404 → redirect → index.html flow.
app.get('*', (req, res) => {
  const ext = path.extname(req.path);
  if (!ext || ext === '.html') {
    res.sendFile(path.join(ROOT, 'index.html'));
  } else {
    res.status(404).send('Not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Kezzbi's Commission Resources`);
  console.log(`  → http://localhost:${PORT}/`);
  console.log(`  → http://localhost:${PORT}${BASE}/  (mirrors GitHub Pages)\n`);
});
