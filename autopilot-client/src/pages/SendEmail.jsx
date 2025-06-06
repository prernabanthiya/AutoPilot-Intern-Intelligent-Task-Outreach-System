import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Paper, Grid, CircularProgress, Alert, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../utils/api';

const SendEmail = () => {
  const [recipients, setRecipients] = useState([]); // State for selected recipient member IDs (for individual send)
  const [selectedGroup, setSelectedGroup] = useState(''); // State for selected group ID
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [members, setMembers] = useState([]); // State for all members (to populate recipient select)
  const [groups, setGroups] = useState([]); // State for all groups (to populate group select)
  const [tasks, setTasks] = useState([]); // State for all tasks (to populate task select)
  const [selectedTask, setSelectedTask] = useState(''); // State for selected task ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '' });
  const [editTemplateId, setEditTemplateId] = useState(null);

  // Fetch members, groups, templates, and tasks on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [membersRes, groupsRes, templatesRes, tasksRes] = await Promise.all([
          api.get('/api/members'),
          api.get('/api/groups'),
          api.get('/api/email-templates'),
          api.get('/api/tasks'), // Fetch tasks
        ]);

        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
        setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []); // Set tasks

      } catch (err) {
        setError('Failed to load data for email sending.');
        console.error('API Error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handler for template selection
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      let templateBody = template.body || '';
      // Basic placeholder replacement preview (can be enhanced)
      // Replace {Name} with a placeholder like [Member Name]
      templateBody = templateBody.replace(/{Name}/g, '[Member Name]');
       // Replace {Task description} with a placeholder like [Task Description]
      templateBody = templateBody.replace(/{Task description}/g, '[Task Description]');

      setSubject(template.subject || '');
      setBody(templateBody);
    } else {
      setSubject('');
      setBody('');
    }
  };

  // Handler for sending email
  const handleSendEmail = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (!subject || !body) {
      setError('Subject and body cannot be empty.');
      setLoading(false);
      return;
    }

    let payload = { subject, body };

    if (selectedGroup) {
      payload.groupId = selectedGroup;
    } else if (recipients.length === 1) { // Ensure only one individual recipient is selected for now
       payload.memberId = recipients[0];
    } else {
         setError('Please select a recipient member or a group.');
         setLoading(false);
         return;
    }

    // Include selected task ID in payload if a task is selected
    if (selectedTask) {
      payload.taskId = selectedTask;
    }

    try {
      const res = await api.post('/api/emails/send', payload);
      setSuccess(res.data.message || 'Email(s) sent successfully.');
       // Optionally clear form after sending
       // setRecipients([]);
       // setSelectedGroup('');
       // setSubject('');
       // setBody('');
       // setSelectedTemplate('');
       // setSelectedTask(''); // Clear selected task
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email(s).');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleTemplateFormChange = (e) => {
    const { name, value } = e.target;
    setTemplateForm({ ...templateForm, [name]: value });
  };

  const handleOpenTemplateDialog = (template = null) => {
    if (template) {
      setTemplateForm({ name: template.name, subject: template.subject, body: template.body });
      setEditTemplateId(template.id);
    } else {
      setTemplateForm({ name: '', subject: '', body: '' });
      setEditTemplateId(null);
    }
    setTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setTemplateForm({ name: '', subject: '', body: '' });
    setEditTemplateId(null);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.body) {
      setError('All fields are required for the template.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editTemplateId) {
        await api.put(`/api/email-templates/${editTemplateId}`, templateForm);
      } else {
        await api.post('/api/email-templates', templateForm);
      }
      handleCloseTemplateDialog();
      // Refresh templates
      const templatesRes = await api.get('/api/email-templates');
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save template.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleDeleteTemplate = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/email-templates/${id}`);
      // Refresh templates
      const templatesRes = await api.get('/api/email-templates');
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
    } catch (err) {
      setError('Failed to delete template.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Send Email
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Compose Email" />
        <Tab label="Email Templates" />
      </Tabs>

      {activeTab === 0 ? (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
          <Grid container spacing={3}>
             {/* Recipient Selection */}
             <Grid item xs={12} sm={6}> {/* Adjust grid sizing */}
                  <FormControl fullWidth disabled={loading}>
                      <InputLabel id="recipient-label">Select Recipient(s)</InputLabel>
                       {/* TODO: Implement multi-select for individual members if needed */}
                      <Select
                        labelId="recipient-label"
                        id="recipient-select"
                        value={recipients}
                        onChange={(e) => setRecipients(typeof e.target.value === 'string' ? e.target.value.split(',') : [e.target.value])}
                        // multiple // Enable if multi-select is desired later
                      >
                        {members.map((member) => (
                          <MenuItem key={member.id} value={member.id}>
                            {member.name} ({member.email})
                          </MenuItem>
                        ))}
                      </Select>
                  </FormControl>
             </Grid>
             {/* Task Selection */}
             <Grid item xs={12} sm={6}> {/* Add new grid item for task selection */}
                <FormControl fullWidth disabled={loading}>
                    <InputLabel id="task-label">Select Task (Optional)</InputLabel>
                    <Select
                      labelId="task-label"
                      id="task-select"
                      value={selectedTask}
                      onChange={(e) => setSelectedTask(e.target.value)}
                    >
                      <MenuItem value="">None</MenuItem> {/* Option for no task */}
                      {tasks.map((task) => (
                        <MenuItem key={task.id} value={task.id}>
                          Task ID: {task.id} - {task.description}
                        </MenuItem>
                      ))}
                    </Select>
                </FormControl>
             </Grid>
            {/* Template Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="template-label">Select Template (Optional)</InputLabel>
                <Select
                  labelId="template-label"
                  id="template-select"
                  value={selectedTemplate}
                  onChange={handleTemplateChange}
                >
                  <MenuItem value="">None</MenuItem>
                  {templates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subject */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Body */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Body"
                multiline
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Send Button */}
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={handleSendEmail}
                disabled={loading || (!recipients.length && !selectedGroup) || !subject || !body}
                sx={{
                  mt: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(30, 34, 90, 0.2)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(30, 34, 90, 0.3)' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Email'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Email Templates Tab
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenTemplateDialog()}
            sx={{ mb: 3 }}
          >
            Create New Template
          </Button>
          <Grid container spacing={2}>
            {templates.length === 0 ? (
              <Grid item xs={12}>
                <Typography>No templates available.</Typography>
              </Grid>
            ) : (
              templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 1px 6px rgba(30, 34, 90, 0.05)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>{template.name}</Typography>
                      <Box>
                        <IconButton size="small" onClick={() => handleOpenTemplateDialog(template)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary">Subject: {template.subject}</Typography>
                    {/* Displaying just a snippet of the body */}
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {template.body}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>

          {/* Template Dialog */}
          <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} fullWidth maxWidth="sm">
            <DialogTitle>{editTemplateId ? 'Edit Email Template' : 'Create New Email Template'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Template Name"
                type="text"
                fullWidth
                variant="outlined"
                value={templateForm.name}
                onChange={handleTemplateFormChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="subject"
                label="Subject"
                type="text"
                fullWidth
                variant="outlined"
                value={templateForm.subject}
                onChange={handleTemplateFormChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="body"
                label="Body"
                type="text"
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                value={templateForm.body}
                onChange={handleTemplateFormChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseTemplateDialog} color="secondary">Cancel</Button>
              <Button onClick={handleSaveTemplate} color="primary" disabled={loading}>{editTemplateId ? 'Save Changes' : 'Create'}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

export default SendEmail; 