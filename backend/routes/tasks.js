const express = require('express');
const router  = express.Router();
const db      = require('../db/connection');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

router.post('/', async (req, res) => {
  const { title, status, priority, due_date, notes } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (title, status, priority, due_date, notes) VALUES (?, ?, ?, ?, ?)',
      [title.trim(), status || 'upcoming', priority || 'Medium', due_date || null, notes || null]
    );

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/tasks error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, status, priority, due_date, notes } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Task not found' });

    const old = existing[0];
    const updatedTitle    = title    !== undefined ? title.trim()  : old.title;
    const updatedStatus   = status   !== undefined ? status        : old.status;
    const updatedPriority = priority !== undefined ? priority      : old.priority;
    const updatedDueDate  = due_date !== undefined ? due_date      : old.due_date;
    const updatedNotes    = notes    !== undefined ? notes         : old.notes;

    await db.query(
      'UPDATE tasks SET title = ?, status = ?, priority = ?, due_date = ?, notes = ? WHERE id = ?',
      [updatedTitle, updatedStatus, updatedPriority, updatedDueDate, updatedNotes, id]
    );

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  } catch (err) {
    console.error('DELETE /api/tasks/:id error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
