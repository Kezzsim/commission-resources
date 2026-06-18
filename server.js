// Local development server — mirrors exactly what GitHub Pages serves.
// Generates manifest.json on startup, then serves the repo root as static files.
//
// Usage: npm start
//
'use strict';

const express = require('express');
const path    = require('path');

// Regenerate manifest before serving — keeps it in sync with any file changes
require('./build');

const app  = express();
const ROOT = __dirname;

app.use(express.static(ROOT, { index: false, dotfiles: 'ignore' }));

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
  console.log(`  → http://localhost:${PORT}\n`);
});
