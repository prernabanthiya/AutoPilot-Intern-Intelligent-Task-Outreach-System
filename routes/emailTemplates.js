const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new email template
router.post('/', async (req, res) => {
  const { name, subject, body } = req.body;
  if (!name || !subject || !body) {
    return res.status(400).json({ error: 'Name, subject, and body are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO email_templates (name, subject, body) VALUES ($1, $2, $3) RETURNING *',
      [name, subject, body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Unique violation error code
        return res.status(400).json({ error: 'Template name already exists.' });
    }
    res.status(500).send('Server error');
  }
});

// Get all email templates
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM email_templates ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific email template by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM email_templates WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update an email template by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, subject, body } = req.body;
  if (!name || !subject || !body) {
    return res.status(400).json({ error: 'Name, subject, and body are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE email_templates SET name = $1, subject = $2, body = $3 WHERE id = $4 RETURNING *',
      [name, subject, body, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
     if (err.code === '23505') { // Unique violation error code
        return res.status(400).json({ error: 'Template name already exists.' });
    }
    res.status(500).send('Server error');
  }
});

// Delete an email template by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM email_templates WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted', template: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 