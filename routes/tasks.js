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

// Complete task endpoint
router.get('/complete/:taskId', async (req, res) => {
  const { taskId } = req.params;
  
  try {
    // Update task status to completed
    const taskUpdateResult = await pool.query(
      'UPDATE tasks SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, member_id',
      ['completed', taskId]
    );

    if (taskUpdateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or already completed' });
    }

    const { id, member_id } = taskUpdateResult.rows[0];

    // Find the most recent email log for this task to link the reply
    const emailLogResult = await pool.query(
        'SELECT id FROM email_logs WHERE task_id = $1 ORDER BY sent_at DESC LIMIT 1',
        [taskId]
    );

    const emailLogId = emailLogResult.rows.length > 0 ? emailLogResult.rows[0].id : null;

    // Insert a record into the replies table to acknowledge completion via button click
    await pool.query(
      'INSERT INTO replies (task_id, member_id, email_log_id, content, reply_classification) VALUES ($1, $2, $3, $4, $5)',
      [id, member_id, emailLogId, 'Task completed via email button', 'Done']
    );

    // Return success page HTML
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Task Completed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 { color: #4CAF50; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Task Completed Successfully!</h1>
            <p>Thank you for completing the task. The status has been updated.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error completing task and logging reply:', err);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

// Get task completion data aggregated by day (example)
router.get('/analytics/completion-daily', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(DATE(deadline), DATE(created_at)) as date,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status IN ('pending', 'in progress', 'not done')) as pending
      FROM tasks
      GROUP BY COALESCE(DATE(deadline), DATE(created_at))
      ORDER BY date;
    `);
    console.log('Task Completion Daily Analytics Data:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
