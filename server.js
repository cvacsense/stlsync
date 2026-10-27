app.post('/watchlist/add', auth, (req, res) => {
  const name = req.query.name || req.body.name;
  if (!name) return res.status(400).json({ error: 'name required' });
  state.watchlist[name] = true;
  res.json({ ok: true });
});

app.post('/watchlist/remove', auth, (req, res) => {
  const name = req.query.name || req.body.name;
  if (!name) return res.status(400).json({ error: 'name required' });
  delete state.watchlist[name];
  res.json({ ok: true });
});

app.post('/whitelist/add', auth, (req, res) => {
  const v = req.query.value || req.body.value;
  if (v == null) return res.status(400).json({ error: 'value required' });
  if (!isNaN(v)) state.whitelistIds[v] = true;
  else state.whitelistNames[v] = true;
  res.json({ ok: true });
});

app.post('/whitelist/remove', auth, (req, res) => {
  const v = req.query.value || req.body.value;
  if (v == null) return res.status(400).json({ error: 'value required' });
  if (!isNaN(v)) delete state.whitelistIds[v];
  else delete state.whitelistNames[v];
  res.json({ ok: true });
});
