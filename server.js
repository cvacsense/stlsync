const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA = path.join(__dirname, 'data.json');
const KEY = process.env.API_KEY || 'CHANGE_ME';

let state = { watchlist: {}, whitelistIds: {}, whitelistNames: {} };
try {
  if (fs.existsSync(DATA)) state = JSON.parse(fs.readFileSync(DATA, 'utf8'));
} catch {}

function save() {
  fs.writeFileSync(DATA, JSON.stringify(state, null, 2));
}

function auth(req, res, next) {
  const k = req.headers['x-api-key'] || req.query.key;
  if (k !== KEY) return res.status(401).json({ error: 'unauthorized' });
  next();
}

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/state', auth, (req, res) => res.json(state));

app.post('/watchlist/add', auth, (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name required' });
  state.watchlist[req.body.name] = true;
  save();
  res.json({ ok: true });
});

app.post('/watchlist/remove', auth, (req, res) => {
  delete state.watchlist[req.body.name];
  save();
  res.json({ ok: true });
});

app.post('/whitelist/add', auth, (req, res) => {
  const v = req.body.value;
  if (v == null) return res.status(400).json({ error: 'value required' });
  if (typeof v === 'number') state.whitelistIds[v] = true;
  else state.whitelistNames[v] = true;
  save();
  res.json({ ok: true });
});

app.post('/whitelist/remove', auth, (req, res) => {
  const v = req.body.value;
  if (typeof v === 'number') delete state.whitelistIds[v];
  else delete state.whitelistNames[v];
  save();
  res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => console.log('API running'));
