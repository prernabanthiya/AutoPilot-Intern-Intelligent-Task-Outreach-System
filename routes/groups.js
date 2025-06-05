const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new group
router.post('/', async (req, res) => {
  const { name, memberIds = [] } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  try {
    // Start a transaction
    await pool.query('BEGIN');

    const groupResult = await pool.query(
      'INSERT INTO groups (name) VALUES ($1) RETURNING id, name',
      [name]
    );
    const groupId = groupResult.rows[0].id;

    // Add members to the group if memberIds are provided
    if (memberIds.length > 0) {
      const values = memberIds.map(memberId => `(${groupId}, ${memberId})`).join(',');
      await pool.query(`INSERT INTO group_members (group_id, member_id) VALUES ${values};`);
    }

    await pool.query('COMMIT');
    res.status(201).json({ ...groupResult.rows[0], members: memberIds });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    if (err.code === '23505') { // Unique violation error code
      return res.status(400).json({ error: 'Group name already exists.' });
    } else if (err.code === '23503') { // Foreign key violation (member_id not found)
      return res.status(400).json({ error: 'One or more member IDs not found.' });
    }
    res.status(500).send('Server error');
  }
});

// Get all groups with their member IDs
router.get('/', async (req, res) => {
  try {
    const groupsResult = await pool.query('SELECT * FROM groups ORDER BY name');
    const groupMembersResult = await pool.query('SELECT * FROM group_members');

    const groups = groupsResult.rows;
    const groupMembers = groupMembersResult.rows;

    // Map member IDs to their respective groups
    const groupsWithMembers = groups.map(group => {
      const members = groupMembers
        .filter(gm => gm.group_id === group.id)
        .map(gm => gm.member_id);
      return { ...group, members };
    });

    res.json(groupsWithMembers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a specific group by ID with its member IDs
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const groupResult = await pool.query('SELECT * FROM groups WHERE id = $1', [id]);
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const membersResult = await pool.query('SELECT member_id FROM group_members WHERE group_id = $1', [id]);
    const memberIds = membersResult.rows.map(row => row.member_id);

    res.json({ ...groupResult.rows[0], members: memberIds });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a group by ID (including updating members)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, memberIds = [] } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  try {
    // Start a transaction
    await pool.query('BEGIN');

    const groupResult = await pool.query(
      'UPDATE groups SET name = $1 WHERE id = $2 RETURNING id, name',
      [name, id]
    );

    if (groupResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove existing members for this group
    await pool.query('DELETE FROM group_members WHERE group_id = $1', [id]);

    // Add new set of members if memberIds are provided
    if (memberIds.length > 0) {
      const values = memberIds.map(memberId => `(${id}, ${memberId})`).join(',');
      await pool.query(`INSERT INTO group_members (group_id, member_id) VALUES ${values};`);
    }

    await pool.query('COMMIT');
    res.json({ ...groupResult.rows[0], members: memberIds });

  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    if (err.code === '23505') { // Unique violation error code
      return res.status(400).json({ error: 'Group name already exists.' });
    } else if (err.code === '23503') { // Foreign key violation (member_id not found)
      return res.status(400).json({ error: 'One or more member IDs not found.' });
    }
    res.status(500).send('Server error');
  }
});

// Delete a group by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Start a transaction to also delete related entries in group_members
    await pool.query('BEGIN');

    const result = await pool.query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Group not found' });
    }

    // ON DELETE CASCADE in group_members table should handle deletion of group members automatically,
    // but explicitly deleting here provides clarity or as a fallback depending on schema definition.
    // await pool.query('DELETE FROM group_members WHERE group_id = $1', [id]);

    await pool.query('COMMIT');
    res.json({ message: 'Group deleted', group: result.rows[0] });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 