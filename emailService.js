const nodemailer = require('nodemailer');
const db = require('./db'); // Assuming your database connection is in ./db

// Load environment variables
require('dotenv').config();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASSWORD, // your email password or app password
  },
});

/**
 * Send an email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @param {number|null} taskId - Optional task ID for logging
 * @param {number|null} memberId - Optional member ID for logging
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendEmail = async ({ to, subject, body, taskId = null }) => {
  if (!to || !subject || !body) {
    throw new Error('To, subject, and body are required');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address
    to: to, // Recipient email address(es)
    subject: subject, // Subject line
    text: body, // Plain text body
    // html: '<p>HTML body</p>' // HTML body (optional)
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    // Log the email in the database if taskId is provided
    if (taskId) {
      const query = 'INSERT INTO email_logs (member_id, task_id, subject, sent_at, status) VALUES ($1, $2, $3, NOW(), $4)';
      // We need the actual member_id(s) here. This service might need to accept member_id(s) as well.
      // For now, let's assume 'to' is a single email or comma-separated string and we can find the member_id.
      // A more robust solution would pass member_id(s) from the route handler.
      const memberEmails = Array.isArray(to) ? to : [to];
      for (const email of memberEmails) {
        const memberQuery = 'SELECT id FROM members WHERE email = $1';
        const memberResult = await db.query(memberQuery, [email]);
        if (memberResult.rows.length > 0) {
          await db.query(query, [memberResult.rows[0].id, taskId, subject, 'sent']);
        }
      }
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = {
  sendEmail
}; 