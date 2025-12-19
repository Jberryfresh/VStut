const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDb, getClient } = require('./db');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files (disable aggressive caching for dev files)
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// API
app.get('/api/todos', async (req, res) => {
  const client = await getClient();
  try {
    const { rows } = await client.query('SELECT id, text, completed, created_at FROM todos ORDER BY created_at');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) return res.status(400).json({ error: 'text required' });
  const client = await getClient();
  try {
    const { rows } = await client.query('INSERT INTO todos(text, completed) VALUES($1, false) RETURNING id, text, completed, created_at', [text.trim()]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body || {};
  const client = await getClient();
  try {
    // Build dynamic update
    if (typeof completed === 'boolean') {
      const { rows } = await client.query('UPDATE todos SET completed = $1 WHERE id = $2 RETURNING id, text, completed, created_at', [completed, id]);
      return res.json(rows[0] || null);
    }
    if (typeof text === 'string') {
      const { rows } = await client.query('UPDATE todos SET text = $1 WHERE id = $2 RETURNING id, text, completed, created_at', [text.trim(), id]);
      return res.json(rows[0] || null);
    }
    res.status(400).json({ error: 'Nothing to update' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const client = await getClient();
  try {
    await client.query('DELETE FROM todos WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Start
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});
