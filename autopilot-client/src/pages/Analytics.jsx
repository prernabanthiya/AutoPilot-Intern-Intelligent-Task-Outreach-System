import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const Analytics = () => {
  const theme = useTheme();
  const [taskCompletionData, setTaskCompletionData] = useState([]);
  const [emailResponseData, setEmailResponseData] = useState([]);
  const [memberReliabilityData, setMemberReliabilityData] = useState([]);
  const [mlPredictions, setMlPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch analytics data from backend and ML predictions from Flask API
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      // Wrap API calls to log individual outcomes
      const [taskRes, sentEmailsRes, repliedEmailsRes, memberRes] = await Promise.all([
        api.get('/api/tasks/analytics/completion-daily').catch(err => { console.error('Task Completion API Error:', err); return null; }),
        api.get('/api/email-logs/analytics/sent-daily').catch(err => { console.error('Emails Sent API Error:', err); return null; }),
        api.get('/api/email-logs/analytics/replies-daily').catch(err => { console.error('Email Replies API Error:', err); return null; }),
        api.get('/api/members/analytics/reliability').catch(err => { console.error('Member Reliability API Error:', err); return null; }),
      ]);

      console.log('API Responses:', { taskRes, sentEmailsRes, repliedEmailsRes, memberRes }); // Log all responses

      // Fetch ML predictions from the backend API
      const mlPredictionsRes = await api.get('/api/ml/predictions').catch(err => { console.error('ML Predictions API Error:', err); return null; });
      console.log('ML Predictions Response:', mlPredictionsRes);

      // Format Task Completion Data
      const formattedTaskData = Array.isArray(taskRes?.data) ? taskRes.data.map(item => ({
        name: new Date(item.date).toISOString().split('T')[0],
        completed: parseInt(item.completed, 10),
        pending: parseInt(item.pending, 10),
      })) : [];
      setTaskCompletionData(formattedTaskData);

      // Format Email Engagement Data
      const sentEmailsMap = new Map(Array.isArray(sentEmailsRes?.data) ? sentEmailsRes.data.map(item => [item.date, parseInt(item.sent_count, 10)]) : []);
      const repliedEmailsMap = new Map(Array.isArray(repliedEmailsRes?.data) ? repliedEmailsRes.data.map(item => [item.date, parseInt(item.replied_count, 10) || 0]) : []);

      const emailDates = Array.from(new Set([...sentEmailsMap.keys(), ...repliedEmailsMap.keys()])).sort();

      const formattedEmailData = emailDates.map(date => ({
        name: new Date(date).toISOString().split('T')[0],
        sent: sentEmailsMap.get(date) || 0,
        replied: repliedEmailsMap.get(date) || 0,
      }));
      setEmailResponseData(formattedEmailData);

      // Format Member Reliability Data
      const formattedMemberData = Array.isArray(memberRes?.data) ? memberRes.data.map(item => ({
        name: item.name, // Or member identifier
        completionRate: parseFloat(item.completion_rate).toFixed(1),
      })) : [];
      setMemberReliabilityData(formattedMemberData);

      // Set ML Predictions
      setMlPredictions(Array.isArray(mlPredictionsRes?.data) ? mlPredictionsRes.data : []);

    } catch (err) {
      setError('Failed to load analytics data.');
      console.error('Fetch Analytics Data Error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Analytics Dashboard
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {/* Task Completion Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Task Completion Trend (Daily)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill={theme.palette.primary.main} name="Completed" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="pending" fill={theme.palette.secondary.main} name="Pending" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Email Engagement Trend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Email Engagement Trend (Daily)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={emailResponseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sent"
                    stroke={theme.palette.primary.main}
                    name="Emails Sent"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="replied"
                    stroke={theme.palette.success.main}
                    name="Replies Received"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Member Reliability */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Member Reliability (Task Completion Rate)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={memberReliabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="completionRate" fill={theme.palette.info.main} name="Completion Rate (%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* ML Predictions */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ML Task Completion Predictions
              </Typography>
              {mlPredictions.length > 0 ? (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Task ID</TableCell>
                        <TableCell align="right">Predicted Probability</TableCell>
                        <TableCell align="right">Actual Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mlPredictions.map((prediction) => (
                        <TableRow
                          key={prediction.task_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {prediction.task_id}
                          </TableCell>
                          <TableCell align="right">
                            {(prediction.completion_prob * 100).toFixed(2)}%
                          </TableCell>
                          <TableCell align="right">
                            {prediction.task_completed === 1 ? 'Completed' : 'Pending'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ML predictions available.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Analytics; 