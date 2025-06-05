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

  try {
    if (memberId) {
      // Sending to a single member
      const memberResult = await db.query('SELECT email FROM members WHERE id = $1', [memberId]);
      if (memberResult.rows.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      recipients = [memberResult.rows[0].email];
    } else if (groupId) {
      // Sending to a group
      const groupResult = await db.query('SELECT member_ids FROM groups WHERE id = $1', [groupId]);
      if (groupResult.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      const memberIds = groupResult.rows[0].member_ids || [];
      if (memberIds.length === 0) {
          return res.status(400).json({ error: 'Group has no members' });
      }
      const membersResult = await db.query('SELECT email FROM members WHERE id = ANY($1::uuid[])', [memberIds]);
      recipients = membersResult.rows.map(row => row.email);
    } else {
      return res.status(400).json({ error: 'Please provide a memberId or groupId' });
    }

    if (recipients.length === 0) {
        return res.status(400).json({ error: 'No valid recipients found' });
    }

    // Send the email using the email service
    // The email service will handle logging if a taskId is provided (though not required for general emails)
    await sendEmail({ to: recipients, subject, body });

    res.status(200).json({ message: 'Email(s) sent successfully' });

  } catch (error) {
    console.error('Error in /api/emails/send:', error);
    // Handle the specific Nodemailer EAUTH error more gracefully if needed, 
    // but for now, just return a generic 500 and log the detailed error on the backend.
    res.status(500).json({ error: 'Failed to send email(s)', details: error.message });
  }
});

module.exports = router; 