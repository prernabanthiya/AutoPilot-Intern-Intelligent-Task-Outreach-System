const express = require('express');
const router = express.Router();
const pool = require('../db');

// Log a sent email for a task
router.post('/', async (req, res) => {
  const { task_id } = req.body;

  if (!task_id) {
    return res.status(400).json({ error: 'task_id is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO email_logs (task_id) VALUES ($1) RETURNING *',
      [task_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error logging email:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all email logs (optional)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT email_logs.*, tasks.description
      FROM email_logs
      JOIN tasks ON email_logs.task_id = tasks.id
      ORDER BY sent_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email logs:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
