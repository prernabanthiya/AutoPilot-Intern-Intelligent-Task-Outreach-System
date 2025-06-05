const express = require('express');
const cors = require('cors');
require('dotenv').config();

const membersRoutes = require('./routes/members');
const tasksRoutes = require('./routes/tasks');
const emailLogRoutes = require('./routes/emailLogs');

const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => res.send('AutoPilot Intern API Running'));

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});