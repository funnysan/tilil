// =============================================
// TASKFLOW - routes/tasks.js
// All /api/tasks endpoints live here.
//
// Express Router docs:
// https://expressjs.com/en/guide/routing.html
// =============================================

const express = require('express');
const router  = express.Router();
const db      = require('../db/connection');

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Returns all tasks as a JSON array.
// TODO: Add ?done=true or ?done=false query param to filter results.
// Docs: https://expressjs.com/en/4x/api.html#req.query
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
// Returns a single task by ID.
// The :id in the URL is a "route parameter" — it becomes req.params.id
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});


// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Creates a new task.
// Expects JSON body: { "title": "Buy milk" }
// Returns the newly created task including its new ID.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  // TODO: Learn about input validation libraries like Joi or Zod
  // For now, basic manual validation:
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title) VALUES (?)',
      [title.trim()]
    );

    // result.insertId gives us the auto-incremented ID MySQL assigned
    const newTask = {
      id:    result.insertId,
      title: title.trim(),
      done:  false,
    };

    res.status(201).json(newTask); // 201 = Created
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});


// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
// Updates a task (toggle done, or edit title).
// Expects JSON body with any of: { "done": true } or { "title": "New title" }
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  // Check that the task actually exists first
  try {
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Use the new value if provided, otherwise keep the existing value
    const updatedTitle = title !== undefined ? title.trim() : existing[0].title;
    const updatedDone  = done  !== undefined ? done          : existing[0].done;

    await db.query(
      'UPDATE tasks SET title = ?, done = ? WHERE id = ?',
      [updatedTitle, updatedDone, id]
    );

    res.json({ id: Number(id), title: updatedTitle, done: updatedDone });
  } catch (err) {
    console.error('PATCH /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});


// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
// Deletes a task by ID.
// Returns 204 No Content on success (standard REST practice).
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).send(); // 204 = No Content (success, nothing to return)
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});


module.exports = router;
