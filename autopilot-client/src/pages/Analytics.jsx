import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch analytics data from backend
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [taskRes, sentEmailsRes, repliedEmailsRes, memberRes] = await Promise.all([
        axios.get('/api/tasks/analytics/completion-daily'),
        axios.get('/api/email-logs/analytics/sent-daily'),
        axios.get('/api/email-logs/analytics/replies-daily'),
        axios.get('/api/members/analytics/reliability'),
      ]);

      // Format Task Completion Data
      const formattedTaskData = Array.isArray(taskRes.data) ? taskRes.data.map(item => ({
        name: item.date, // Or format date nicely
        completed: parseInt(item.completed, 10),
        pending: parseInt(item.pending, 10),
      })) : [];
      setTaskCompletionData(formattedTaskData);

      // Format Email Engagement Data
      // Merge sent and replied data by date
      const sentEmailsMap = new Map(Array.isArray(sentEmailsRes.data) ? sentEmailsRes.data.map(item => [item.date, parseInt(item.sent_count, 10)]) : []);
      const repliedEmailsMap = new Map(Array.isArray(repliedEmailsRes.data) ? repliedEmailsRes.data.map(item => [item.date, parseInt(item.replied_count, 10) || 0]) : []);

      const emailDates = Array.from(new Set([...sentEmailsMap.keys(), ...repliedEmailsMap.keys()])).sort();

      const formattedEmailData = emailDates.map(date => ({
        name: date, // Or format date nicely
        sent: sentEmailsMap.get(date) || 0,
        replied: repliedEmailsMap.get(date) || 0,
      }));
      setEmailResponseData(formattedEmailData);

      // Format Member Reliability Data
      const formattedMemberData = Array.isArray(memberRes.data) ? memberRes.data.map(item => ({
        name: item.name, // Or member identifier
        completionRate: parseFloat(item.completion_rate).toFixed(1),
      })) : [];
      setMemberReliabilityData(formattedMemberData);


    } catch (err) {
      setError('Failed to load analytics data.');
      console.error(err);
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

          {/* Member Reliability (Example - might need different chart/data) */}
          <Grid item xs={12}>
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
                  <Bar dataKey="completionRate" fill={theme.palette.info.main} name="Completion Rate (%) " radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Add more analytics charts as needed */}
        </Grid>
      )}
    </Box>
  );
};

export default Analytics; 