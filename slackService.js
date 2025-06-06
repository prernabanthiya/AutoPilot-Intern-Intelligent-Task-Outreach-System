const { WebClient } = require('@slack/web-api');
const db = require('./db');
require('dotenv').config();

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Send a message to a Slack channel.
 * @param {string} channel - The Slack channel ID.
 * @param {string} text - The fallback text for the message.
 * @param {array} [blocks] - Optional message blocks for rich formatting.
 */
const sendSlackMessage = async (channel, text, blocks) => {
  try {
    await slack.chat.postMessage({
      channel: channel,
      text: text,
      blocks: blocks,
    });
    console.log('Slack message sent successfully');
  } catch (error) {
    console.error('Error sending Slack message:', error);
  }
};

// Removed inbound email processing logic
// const processEmailNotification = async (event) => { /* ... */ };
// const extractTaskIdFromEmail = (emailContent) => { /* ... */ };

module.exports = {
  sendSlackMessage,
}; 