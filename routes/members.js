const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { name, email } = req.body;
    console.log('POST /api/members payload:', req.body);
    try {
      const result = await pool.query(
        'INSERT INTO members (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      );
      console.log('Insert Result:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: 'Email already exists or invalid input' });
    }
  });
  
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM members ORDER BY id DESC');
  res.json(result.rows);
});

// Update a member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE members SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid input or email already exists' });
  }
});

// Delete a member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted', member: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get member reliability (task completion rate per member)
router.get('/analytics/reliability', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.name,
        m.email,
        COUNT(t.id) as total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'Completed') as completed_tasks,
        CASE
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE (COUNT(t.id) FILTER (WHERE t.status = 'Completed')) * 100.0 / COUNT(t.id)
        END as completion_rate
      FROM members m
      LEFT JOIN tasks t ON m.id = t.member_id
      GROUP BY m.id, m.name, m.email
      ORDER BY completion_rate DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching member reliability:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;