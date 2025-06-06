const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios

// GET predictions from the ML model running as a separate service
router.get('/predictions', async (req, res) => {
  try {
    // Make a GET request to the Python ML service
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001'; // Use environment variable or default
    const response = await axios.get(`${mlServiceUrl}/predictions`);

    // Forward the response from the ML service to the frontend
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Error communicating with ML service:', error.message);
    // Check if it's an Axios error with a response from the ML service
    if (error.response) {
      // Forward the ML service's error response to the frontend
      res.status(error.response.status).json(error.response.data);
    } else {
      // Handle other errors (e.g., network issues, service not running)
      res.status(500).json({ error: 'Failed to connect to or receive response from ML service' });
    }
  }
});

module.exports = router; 