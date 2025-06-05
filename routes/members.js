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

module.exports = router;