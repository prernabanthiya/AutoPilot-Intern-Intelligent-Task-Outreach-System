import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
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

const StatCard = ({ title, value, icon, color, bg }) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: 3,
      boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': {
        transform: 'translateY(-4px) scale(1.03)',
        boxShadow: '0 6px 24px rgba(30, 34, 90, 0.13)',
      },
      background: '#fff',
      p: 0,
    }}
  >
    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
      <Box
        sx={{
          backgroundColor: bg,
          borderRadius: 2,
          p: 1.2,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 700, mt: 0.5 }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totalTasks, setTotalTasks] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [taskCompletionRate, setTaskCompletionRate] = useState('0%');
  const [taskOverviewData, setTaskOverviewData] = useState([]);
  const [emailEngagementData, setEmailEngagementData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch daily task completion data
        const taskRes = await api.get('/api/tasks/analytics/completion-daily');
        setTaskOverviewData(Array.isArray(taskRes.data) ? taskRes.data : []);

        // Fetch daily email engagement data
        const emailRes = await api.get('/api/email-logs/analytics/sent-daily');
        setEmailEngagementData(Array.isArray(emailRes.data) ? emailRes.data : []);

        // Fetch total members (assuming this endpoint returns an array of members)
        const membersRes = await api.get('/api/members');
        const membersArray = Array.isArray(membersRes.data) ? membersRes.data : [];
        setActiveMembers(membersArray.length);

        // TODO: Fetch/Calculate Total Tasks, Total Emails Sent, and Task Completion Rate accurately.
        // For now, setting placeholders or calculating simply from available data.

        // Simple calculation for Total Tasks and Emails Sent from daily data (may not be accurate totals)
        if (Array.isArray(taskRes.data)) {
            const totalCompleted = taskRes.data.reduce((sum, day) => sum + parseInt(day.completed, 10), 0);
            const totalPending = taskRes.data.reduce((sum, day) => sum + parseInt(day.pending, 10), 0);
            setTotalTasks(totalCompleted + totalPending);
             // Simple completion rate calculation
            if (totalCompleted + totalPending > 0) {
                 setTaskCompletionRate(`${Math.round((totalCompleted / (totalCompleted + totalPending)) * 100)}%`);
             } else {
                 setTaskCompletionRate('0%');
             }
        }

         if (Array.isArray(emailRes.data)) {
            const totalSent = emailRes.data.reduce((sum, day) => sum + day.sent, 0);
            setEmailsSent(totalSent);
         }


      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error('API Error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', pb: 4 }}>
      <Typography variant="h3" sx={{ mb: { xs: 3, md: 5 }, fontWeight: 700, fontSize: { xs: 28, md: 36 } }}>
        Dashboard Overview
      </Typography>
       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
         </Box>
      ) : (
        <>
            <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: { xs: 2, md: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Tasks"
                    value={totalTasks}
                    icon={<TaskIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />}
                    color={theme.palette.primary.main}
                    bg={theme.palette.primary.light + '22'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Active Members"
                    value={activeMembers}
                    icon={<PeopleIcon sx={{ color: theme.palette.success.main, fontSize: 32 }} />}
                    color={theme.palette.success.main}
                    bg={theme.palette.success.light + '22'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Emails Sent"
                    value={emailsSent}
                    icon={<EmailIcon sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />}
                    color={theme.palette.secondary.main}
                    bg={theme.palette.secondary.light + '22'}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Task Completion Rate"
                    value={taskCompletionRate}
                    icon={<TrendingUpIcon sx={{ color: theme.palette.info.main, fontSize: 32 }} />}
                    color={theme.palette.info.main}
                    bg={theme.palette.info.light + '22'}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Task Completion Overview
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={taskOverviewData}>
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
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Email Engagement
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={emailEngagementData}>
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
                          dataKey="replies"
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
              </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard; 