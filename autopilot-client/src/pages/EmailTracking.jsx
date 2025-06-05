import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';

const EmailTracking = () => {
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch email logs from backend
  const fetchEmailLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/email-logs');
      // Ensure data is an array before setting state
      setEmailLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load email logs.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Email Tracking
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        // Render content based on whether emailLogs is an array and has data
        emailLogs && Array.isArray(emailLogs) && emailLogs.length > 0 ? (
          <Paper sx={{ mt: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Task Description</TableCell>
                    {/* Add more columns if needed */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emailLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.sent_at).toLocaleString()}</TableCell>
                      <TableCell>{log.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : ( // Handle empty or non-array data case
           !error && (
            <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
              No email logs found.
            </Typography>
           )
        )
      )}
    </Box>
  );
};

export default EmailTracking; 