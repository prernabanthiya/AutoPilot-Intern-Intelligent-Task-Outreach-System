const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all tasks with member info
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tasks.*, members.name, members.email
      FROM tasks
      JOIN members ON tasks.member_id = members.id
      ORDER BY tasks.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Insert new task
router.post('/', async (req, res) => {
  const { member_id, description, deadline } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (member_id, description, deadline) VALUES ($1, $2, $3) RETURNING *',
      [member_id, description, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: 'Invalid input or member_id does not exist' });
  }
});

// Update a task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { member_id, description, deadline, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET member_id = $1, description = $2, deadline = $3, status = $4 WHERE id = $5 RETURNING *',
      [member_id, description, deadline, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: 'Invalid input' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted', task: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get task completion data aggregated by day (example)
router.get('/analytics/completion-daily', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(deadline) as date,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed,
        COUNT(*) FILTER (WHERE status != 'Completed') as pending
      FROM tasks
      WHERE deadline IS NOT NULL
      GROUP BY DATE(deadline)
      ORDER BY date;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
