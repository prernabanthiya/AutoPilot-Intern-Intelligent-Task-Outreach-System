import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';

const Settings = () => {
  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Settings
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
        <Typography variant="body1">
          Settings configuration options will be available here.
        </Typography>
        {/* Add specific settings components here */}
      </Paper>
    </Box>
  );
};

export default Settings; 