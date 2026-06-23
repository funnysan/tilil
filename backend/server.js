// =============================================
// TASKFLOW - server.js (Node.js + Express)
// This is the entry point for the backend.
// Run it with: node server.js
// =============================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config(); // loads variables from .env file

const taskRoutes = require('./routes/tasks'); // we split routes into their own file

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────
app.use(cors());

app.use(express.json());


// ── ROUTES ───────────────────────────────────
app.use('/api/tasks', taskRoutes);

// Health check — always good to have one
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow API is running!' });
});

// 404 handler — catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── START SERVER ─────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health`);
});
