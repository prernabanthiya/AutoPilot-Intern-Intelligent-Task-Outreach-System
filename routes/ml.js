const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

// Helper function to get the absolute path to the ml_predictor.py script
const getPredictorScriptPath = () => {
  // Use the correct workspace path
  return path.join(__dirname, '..', 'ml-part', 'ml_predictor.py');
};

// GET predictions from the ML model
router.get('/predictions', (req, res) => {
  const pythonScript = getPredictorScriptPath();
  console.log('Attempting to run Python script at:', pythonScript);

  exec(`python "${pythonScript}"`, (error, stdout, stderr) => {
    // Log any stderr output for debugging
    if (stderr) {
      console.log('Python stderr:', stderr);
    }

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Failed to get ML predictions', details: error.message });
    }

    try {
      // Clean the stdout by removing any non-JSON content
      const jsonStr = stdout.trim();
      const predictions = JSON.parse(jsonStr);
      res.json(predictions);
    } catch (parseError) {
      console.error(`JSON parse error: ${parseError}`);
      console.error(`stdout: ${stdout}`);
      res.status(500).json({ 
        error: 'Failed to parse ML predictions output', 
        details: parseError.message,
        rawOutput: stdout 
      });
    }
  });
});

module.exports = router; 