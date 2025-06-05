const express = require('express');
const router = express.Router();
const { sendEmail } = require('../emailService');
const db = require('../db'); // Assuming your database connection is in ../db

// POST endpoint to send email
router.post('/send', async (req, res) => {
  const { memberId, groupId, subject, body } = req.body;

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

    // Send the email using the email service, passing memberId(s) for logging
    await sendEmail({ to: recipients, subject, body, memberId: recipientMemberIds });

    res.status(200).json({ message: 'Email(s) sent successfully' });

  } catch (error) {
    console.error('Error in /api/emails/send:', error);
    // Handle the specific Nodemailer EAUTH error more gracefully if needed, 
    // but for now, just return a generic 500 and log the detailed error on the backend.
    res.status(500).json({ error: 'Failed to send email(s)', details: error.message });
  }
});

module.exports = router; 