const express = require('express');
const router = express.Router();
const { sendEmail } = require('../emailService');
const db = require('../db'); // Assuming your database connection is in ../db

// POST endpoint to send email
router.post('/send', async (req, res) => {
  const { memberId, groupId, subject, body, taskId } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }

  let recipients = [];
  let recipientMemberIds = []; // Array to store member IDs for logging

  try {
    if (memberId) {
      // Sending to a single member
      const memberResult = await db.query('SELECT id, email FROM members WHERE id = $1', [memberId]);
      if (memberResult.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      recipients = [memberResult.rows[0].email];
      recipientMemberIds = [memberResult.rows[0].id]; // Store member ID for logging

    } else if (groupId) {
      // Sending to a group
      // Fetch member IDs from the group_members linking table
      const groupMembersResult = await db.query('SELECT member_id FROM group_members WHERE group_id = $1', [groupId]);
      const memberIds = groupMembersResult.rows.map(row => row.member_id);

      if (memberIds.length === 0) {
        return res.status(400).json({ error: 'Group has no members' });
      }

      // Fetch emails for these member IDs
      const membersResult = await db.query('SELECT id, email FROM members WHERE id = ANY($1)', [memberIds]);
      recipients = membersResult.rows.map(row => row.email);
      recipientMemberIds = membersResult.rows.map(row => row.id); // Store member IDs for logging

    } else {
      return res.status(400).json({ error: 'Please provide a memberId or groupId' });
    }

    if (recipients.length === 0) {
        return res.status(400).json({ error: 'No valid recipients found' });
    }

    // If taskId is provided, verify it exists and get task details
    let taskDetails = null;
    if (taskId) {
      const taskResult = await db.query(
        'SELECT t.*, m.email FROM tasks t JOIN members m ON t.member_id = m.id WHERE t.id = $1',
        [taskId]
      );
      
      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      taskDetails = taskResult.rows[0];
      
      // Verify the recipient email matches the task's assigned member
      if (recipients[0] !== taskDetails.email) {
        return res.status(400).json({ error: 'Email recipient does not match task assignee' });
      }
    }

    // Send the email with task completion button if taskId is provided
    await sendEmail({
      to: recipients,
      subject,
      body,
      memberId: recipientMemberIds,
      taskId: taskId || null // Pass taskId to include completion button
    });

    res.status(200).json({ message: 'Email(s) sent successfully' });

  } catch (error) {
    console.error('Error in /api/emails/send:', error);
    // Handle the specific Nodemailer EAUTH error more gracefully if needed, 
    // but for now, just return a generic 500 and log the detailed error on the backend.
    res.status(500).json({ error: 'Failed to send email(s)', details: error.message });
  }
});

// POST endpoint to receive inbound emails
router.post('/inbound', async (req, res) => {
  console.log('Received inbound email data:', req.body);

  // TODO: Implement logic here to parse the incoming email data,
  // identify replies, extract info, link to tasks/members, and save to the replies table.
  // The structure of req.body will depend on the inbound email service/method used.
  // You will likely need to parse email headers (like In-Reply-To, References) 
  // to link replies to sent emails and tasks.

  // For now, just acknowledge receipt
  res.status(200).json({ message: 'Inbound email data received (processing not yet implemented)' });
});

module.exports = router; 