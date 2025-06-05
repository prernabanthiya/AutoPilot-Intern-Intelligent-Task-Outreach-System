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
      SELECT
        email_logs.*,
        tasks.description AS task_description
      FROM email_logs
      LEFT JOIN tasks ON email_logs.task_id = tasks.id
      ORDER BY sent_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching email logs:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get email engagement data aggregated by day (example: counts sent emails)
router.get('/analytics/sent-daily', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(sent_at) as date,
        COUNT(*) as sent_count
      FROM email_logs
      GROUP BY DATE(sent_at)
      ORDER BY date;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching daily sent email count:', err.message);
    res.status(500).send('Server error');
  }
});

// Get email engagement data aggregated by day (example: counts replies)
// NOTE: This assumes you have a way to identify and count replies in your email_logs or a related table.
// You might need to adjust the query based on your actual database schema and email processing logic.
router.get('/analytics/replies-daily', async (req, res) => {
  try {
    // TODO: Write the actual query to count replies per day based on your schema
    const result = await pool.query(`
      SELECT
        DATE(received_at) as date, -- Assuming replies have a received_at timestamp
        COUNT(*) as replied_count
      FROM email_logs -- Or a separate replies table if you have one
      WHERE is_reply = TRUE -- Assuming you have an 'is_reply' flag
      GROUP BY DATE(received_at)
      ORDER BY date;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching daily reply count:', err.message);
    res.status(500).send('Server error');
  }
});

// Get email logs for a specific member
router.get('/member/:member_id', async (req, res) => {
  const { member_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM email_logs WHERE member_id = $1 ORDER BY sent_at DESC',
      [member_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching email logs for member ${member_id}:`, err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
