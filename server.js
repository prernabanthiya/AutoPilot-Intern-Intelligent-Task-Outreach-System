const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const membersRoutes = require('./routes/members');
const tasksRoutes = require('./routes/tasks');
const emailLogRoutes = require('./routes/emailLogs');
const emailRoutes = require('./routes/emails');
const emailTemplateRoutes = require('./routes/emailTemplates');
const groupRoutes = require('./routes/groups');
const mlRoutes = require('./routes/ml');
const slackRoutes = require('./routes/slack');

const pool = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Check DB connection status
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => console.error('Error connecting to the database:', err.stack));

app.use('/api/members', membersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/email-logs', emailLogRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/slack', slackRoutes);

app.get('/', (req, res) => res.send('AutoPilot Intern API Running'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});