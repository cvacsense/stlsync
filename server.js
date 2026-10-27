const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA = path.join(__dirname, 'data.json');
const KEY = process.env.API_KEY || 'sk_sentinel_9f8a7c6d5e4b3a2f1e0d9c8b7a6f5e4d';

let state = { watchlist: {}, whitelistIds: {}, whitelistNames: {} };
try {
  if (fs.existsSync(DATA)) state = JSON.parse(fs.readFileSync(DATA, 'utf8'));
} catch {}

function save() {
  try { fs.writeFileSync(DATA, JSON.stringify(state, null, 2)); } catch {}
}

// Auth middleware (accepts key from header OR URL query)
function auth(req, res, next) {
  const k = req.headers['x-api-key'] || req.query.key;
  if (k !== KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/state', auth, (req, res) => res.json(state));

// --- WATCHLIST ---
app.post('/watchlist/add', auth, (req, res) => {
  const name = req.query.name || req.body.name;
  if (!name) return res.status(400).json({ error: 'name required' });
  state.watchlist[name] = true;
  save();
  res.json({ ok: true });
});

app.post('/watchlist/remove', auth, (req, res) => {
  const name = req.query.name || req.body.name;
  if (!name) return res.status(400).json({ error: 'name required' });
  delete state.watchlist[name];
  save();
  res.json({ ok: true });
});

// --- WHITELIST ---
app.post('/whitelist/add', auth, (req, res) => {
  const v = req.query.value || req.body.value;
  if (v == null) return res.status(400).json({ error: 'value required' });
  if (!isNaN(v)) state.whitelistIds[v] = true;
  else state.whitelistNames[v] = true;
  save();
  res.json({ ok: true });
});

app.post('/whitelist/remove', auth, (req, res) => {
  const v = req.query.value || req.body.value;
  if (v == null) return res.status(400).json({ error: 'value required' });
  if (!isNaN(v)) delete state.whitelistIds[v];
  else delete state.whitelistNames[v];
  save();
  res.json({ ok: true });
});

// For Vercel Serverless, export the app
module.exports = app;
