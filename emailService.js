const nodemailer = require('nodemailer');
const db = require('./db'); // Assuming your database connection is in ./db
// const { sendSlackMessage } = require('./slackService'); // Removed Slack import

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
 * @param {string} params.body - Email body (plain text)
 * @param {UUID|UUID[]} [params.memberId] - Optional member ID(s) for logging (UUID)
 * @param {UUID|null} [params.taskId=null] - Optional task ID for task completion button (UUID)
 */
const sendEmail = async ({ to, subject, body, memberId = null, taskId = null }) => {
  try {
    // Generate task completion link if taskId is provided and BACKEND_URL is set
    const completionLink = taskId && process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL}/api/tasks/complete/${taskId}`
      : null;

    let htmlBody = `
      <p>${body.replace(/\n/g, '<br>')}</p>
    `;

    if (completionLink) {
      htmlBody += `
        <p>Click the button below to mark this task as done:</p>
        <a href="${completionLink}" target="_blank" style="
          display: inline-block;
          background-color: #4CAF50; /* Green background */
          color: white; /* White text */
          padding: 10px 20px; /* Some padding */
          text-align: center; /* Centered text */
          text-decoration: none; /* Remove underline */
          border-radius: 5px; /* Rounded corners */
          font-weight: bold; /* Bold text */
          cursor: pointer;
        ">
          Mark Task as Done
        </a>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: htmlBody,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    // Log email in database if memberId is provided
    if (memberId) {
        const recipientMemberIds = Array.isArray(memberId) ? memberId : [memberId];

        for (const id of recipientMemberIds) {
          await db.query(
            'INSERT INTO email_logs (member_id, subject, task_id, status) VALUES ($1, $2, $3, $4)',
            [id, subject, taskId, 'sent']
          );
        }
    }

  } catch (error) {
    console.error('Error sending or logging email:', error);
    throw error; // Re-throw to be caught by the calling route
  }
};

// Removed inbound email processing logic
// const processEmailNotification = async (event) => { /* ... */ };
// const extractTaskIdFromEmail = (emailContent) => { /* ... */ };

module.exports = {
  sendEmail,
  // sendSlackMessage, // Removed as inbound processing is no longer via Slack
}; 