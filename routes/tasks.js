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

module.exports = router;
