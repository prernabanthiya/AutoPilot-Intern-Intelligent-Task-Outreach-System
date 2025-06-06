const crypto = require('crypto');

/**
 * Verify that the request is coming from Slack
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
const verifySlackRequest = (req, res, next) => {
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signature = req.headers['x-slack-signature'];

  // Verify timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return res.status(400).send('Request timestamp is too old');
  }

  // Create signature base string
  const sigBasestring = `v0:${timestamp}:${JSON.stringify(req.body)}`;

  // Create HMAC SHA256 hash
  const mySignature = `v0=${crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(sigBasestring)
    .digest('hex')}`;

  // Compare signatures
  if (crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  )) {
    next();
  } else {
    res.status(400).send('Invalid signature');
  }
};

module.exports = {
  verifySlackRequest,
}; 