const express = require('express');
const router = express.Router();
// const { processEmailNotification } = require('../slackService'); // Removed as inbound processing is no longer via Slack
const { verifySlackRequest } = require('../middleware/slackAuth');

// Middleware to verify Slack requests (Keep if needed for other Slack features, otherwise remove)
// Based on current context, this middleware only served the /events route, so it can be removed.
// router.use(verifySlackRequest);

// The /events route is no longer needed for processing inbound email replies.
// If other Slack events need to be handled in the future, this route might need to be re-added or modified.
// router.post('/events', async (req, res) => { /* ... */ });

module.exports = router; 