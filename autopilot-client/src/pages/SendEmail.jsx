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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '' });
  const [editTemplateId, setEditTemplateId] = useState(null);

  // Fetch members, groups, and templates on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [membersRes, groupsRes, templatesRes] = await Promise.all([
          api.get('/api/members'),
          api.get('/api/groups'),
          api.get('/api/email-templates'),
        ]);

        setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
        setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);

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

    try {
      const res = await api.post('/api/emails/send', payload);
      setSuccess(res.data.message || 'Email(s) sent successfully.');
       // Optionally clear form after sending
       // setRecipients([]);
       // setSelectedGroup('');
       // setSubject('');
       // setBody('');
       // setSelectedTemplate('');
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
                         // Value should be the selected memberId or the group value string
                        value={recipients.length > 0 ? recipients[0] : (selectedGroup ? `group-${selectedGroup}` : '')}
                        label="Select Recipient(s)"
                         onChange={(e) => {
                             const value = e.target.value;
                             const stringValue = String(value);
                             if (stringValue.startsWith('group-')) {
                                 setSelectedGroup(stringValue.replace('group-', ''));
                                 setRecipients([]); // Clear individual recipients if a group is selected
                             } else if (value === '') {
                                 setSelectedGroup('');
                                 setRecipients([]);
                             }
                             else {
                                 setRecipients([value]); // Select individual member
                                 setSelectedGroup(''); // Clear selected group
                             }
                         }}
                      >
                           <MenuItem value=""><em>Select a member or group</em></MenuItem>
                           <MenuItem disabled>-- Individual Members --</MenuItem>
                           {members.map(member => (
                               <MenuItem key={member.id} value={member.id}>{member.name} ({member.email})</MenuItem>
                           ))}
                           <MenuItem disabled>-- Groups --</MenuItem>
                           {groups.map(group => (
                                <MenuItem key={group.id} value={`group-${group.id}`}>{group.name}</MenuItem>
                           ))}
                      </Select>
                  </FormControl>
             </Grid>

             {/* Template Selection */}
            <Grid item xs={12} sm={6}> {/* Adjust grid sizing */}
              <FormControl fullWidth disabled={loading}>
                <InputLabel id="template-label">Select Template</InputLabel>
                <Select
                  labelId="template-label"
                  value={selectedTemplate}
                  label="Select Template"
                  onChange={handleTemplateChange}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {templates.map(template => (
                    <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subject */}
            <Grid item xs={12}>
              <TextField
                label="Subject"
                fullWidth
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                margin="normal"
                 disabled={loading}
              />
            </Grid>

            {/* Body */}
            <Grid item xs={12}>
              <TextField
                label="Body"
                fullWidth
                multiline
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                margin="normal"
                 disabled={loading}
              />
            </Grid>

            {/* Send Button */}
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                onClick={handleSendEmail}
                disabled={loading || (!selectedGroup && recipients.length === 0)}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Email'}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Email Templates</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenTemplateDialog()}
            >
              Add Template
            </Button>
          </Box>

          {templates.length > 0 ? (
            <Grid container spacing={2}>
              {templates.map((template) => (
                <Grid item xs={12} key={template.id}>
                  <Paper sx={{ p: 2, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{template.name}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          Subject: {template.subject}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                          {template.body}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton onClick={() => handleOpenTemplateDialog(template)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTemplate(template.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
              No templates found. Click "Add Template" to create one.
            </Typography>
          )}
        </Paper>
      )}

      <Dialog open={templateDialogOpen} onClose={handleCloseTemplateDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editTemplateId ? 'Edit Template' : 'Add New Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Template Name"
                name="name"
                value={templateForm.name}
                onChange={handleTemplateFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subject"
                name="subject"
                value={templateForm.subject}
                onChange={handleTemplateFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Body"
                name="body"
                value={templateForm.body}
                onChange={handleTemplateFormChange}
                fullWidth
                multiline
                rows={6}
                required
                helperText="Use {Name} and {Task description} as placeholders"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" disabled={loading}>
            {editTemplateId ? 'Save Changes' : 'Add Template'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SendEmail; 