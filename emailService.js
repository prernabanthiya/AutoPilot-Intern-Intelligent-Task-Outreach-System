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
 * Send an email using nodemailer and log it.
 * @param {object} params - Email parameters
 * @param {string|string[]} params.to - Recipient email address(es)
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body
 * @param {UUID|UUID[]} [params.memberId] - Optional member ID(s) for logging (UUID)
 * @param {UUID|null} [params.taskId=null] - Optional task ID for logging (UUID)
 * @returns {Promise<object>}
 */
const sendEmail = async ({ to, subject, body, memberId = null, taskId = null }) => {
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

    // Log the email(s) in the database
    const memberIdsToLog = Array.isArray(memberId) ? memberId : (memberId ? [memberId] : []);

    if (memberIdsToLog.length > 0) {
        const query = 'INSERT INTO email_logs (member_id, task_id, subject, sent_at, status) VALUES ($1, $2, $3, NOW(), $4)';
        for (const id of memberIdsToLog) {
             // Ensure the member_id is a valid UUID if necessary, depending on your DB schema
             // For now, assuming the passed memberId(s) are correct
            await db.query(query, [id, taskId, subject, 'sent']);
        }
    } else if (taskId) {
        // Fallback logging if only taskId is provided (less common for general emails)
         const query = 'INSERT INTO email_logs (task_id, subject, sent_at, status) VALUES ($1, $2, NOW(), $3)';
         await db.query(query, [taskId, subject, 'sent']);
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

module.exports = { sendEmail }; 