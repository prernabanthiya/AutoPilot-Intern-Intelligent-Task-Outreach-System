import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add as AddIcon, Save as SaveIcon, Cancel as CancelIcon, List as ListIcon, Email as EmailIcon, Group as GroupIcon } from '@mui/icons-material';

const initialMemberForm = {
  name: '',
  email: '',
};

const initialTaskForm = {
  description: '',
  deadline: '',
};

const Members = () => {
  const [newMemberFormData, setNewMemberFormData] = useState(initialMemberForm);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editMemberId, setEditMemberId] = useState(null);
  const [assignTaskDialogOpen, setAssignTaskDialogOpen] = useState(false);
  const [selectedMemberIdForTask, setSelectedMemberIdForTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewMemberRow, setShowNewMemberRow] = useState(false);

  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [viewTasksDialogOpen, setViewTasksDialogOpen] = useState(false);
  const [memberTasks, setMemberTasks] = useState([]);

  const [viewLogsDialogOpen, setViewLogsDialogOpen] = useState(false);
  const [memberEmailLogs, setMemberEmailLogs] = useState([]);
  const [selectedMemberForLogs, setSelectedMemberForLogs] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({ name: '', memberIds: [] });
  const [editGroupId, setEditGroupId] = useState(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersRes, tasksRes] = await Promise.all([
        api.get('/api/members'),
        api.get('/api/tasks'),
      ]);

      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);

    } catch (err) {
      setError('Failed to load data.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/api/groups');
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError('Failed to load groups.');
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, []);

  const handleNewMemberFormChange = (e) => {
    setNewMemberFormData({ ...newMemberFormData, [e.target.name]: e.target.value });
  };

  const handleTaskFormChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleAddMember = async () => {
     if (!newMemberFormData.name || !newMemberFormData.email) {
         setError('Name and Email are required to add a new member.');
         return;
     }
    setLoading(true);
    setError('');
    try {
      await api.post('/api/members', newMemberFormData);
      setShowNewMemberRow(false);
      setNewMemberFormData(initialMemberForm);
      fetchData();
    } catch (err) {
      setError('Failed to add member. Ensure email is unique.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/api/tasks', {
        member_id: selectedMemberIdForTask,
        description: taskForm.description,
        deadline: taskForm.deadline,
      });
      setAssignTaskDialogOpen(false);
      setTaskForm(initialTaskForm);
      setSelectedMemberIdForTask(null);
      fetchData();
    } catch (err) {
      setError('Failed to assign task.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleEditMember = (member) => {
     console.log('Edit Member', member);
     setError('Edit functionality for members is under development.');
  };

  const handleDeleteMember = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/members/${id}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete member.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleAssignTaskClick = (memberId) => {
    setSelectedMemberIdForTask(memberId);
    setTaskForm(initialTaskForm);
    setAssignTaskDialogOpen(true);
  };

   const handleCancelAddMember = () => {
       setShowNewMemberRow(false);
       setNewMemberFormData(initialMemberForm);
       setError('');
   };

   const getTasksForMember = (memberId) => {
        return tasks.filter(task => task.member_id === memberId);
   };

   const handleEditTask = (task) => {
       console.log('Edit Task', task);
       setEditingTask(task);
       setEditTaskDialogOpen(true);
   };

    const handleDeleteTask = async (taskId) => {
        setLoading(true);
        setError('');
        try {
            await api.delete(`/api/tasks/${taskId}`);
            fetchData();
        } catch (err) {
            setError('Failed to delete task.');
            console.error('API Error:', err);
        }
        setLoading(false);
    };

   const handleUpdateTask = async () => {
       if (!editingTask || !editingTask.description || !editingTask.deadline) {
           setError('Task description and deadline are required.');
           return;
       }
       setLoading(true);
       setError('');
       try {
           await api.put(`/api/tasks/${editingTask.id}`, editingTask);
           setEditTaskDialogOpen(false);
           setEditingTask(null);
           fetchData();
       } catch (err) {
           setError('Failed to update task.');
           console.error('API Error:', err);
       }
       setLoading(false);
   };

   const handleEditTaskFormChange = (e) => {
       setEditingTask({ ...editingTask, [e.target.name]: e.target.value });
   };

   const handleViewTasksClick = (memberId) => {
       setMemberTasks(getTasksForMember(memberId));
       setViewTasksDialogOpen(true);
   };

   const handleViewLogsClick = async (member) => {
       setLoading(true);
       setError('');
       try {
           const res = await api.get(`/api/email-logs/member/${member.id}`);
           setMemberEmailLogs(Array.isArray(res.data) ? res.data : []);
           setSelectedMemberForLogs(member);
           setViewLogsDialogOpen(true);
       } catch (err) {
           setError('Failed to load email logs.');
           console.error('API Error:', err);
       }
       setLoading(false);
   };

   const handleTaskStatusChange = async (taskId, newStatus) => {
       setLoading(true);
       setError('');
       try {
           const taskToUpdate = memberTasks.find(task => task.id === taskId);
           if (!taskToUpdate) {
               setError('Task not found for status update.');
               setLoading(false);
               return;
           }
           await api.put(`/api/tasks/${taskId}`, { ...taskToUpdate, status: newStatus });

           setMemberTasks(prevTasks =>
               prevTasks.map(task =>
                   task.id === taskId ? { ...task, status: newStatus } : task
               )
           );

       } catch (err) {
           setError('Failed to update task status.');
           console.error('API Error:', err);
       }
       setLoading(false);
   };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGroupFormChange = (e) => {
    const { name, value } = e.target;
    setGroupForm({ ...groupForm, [name]: value });
  };

  const handleMemberSelectChange = (e) => {
    setGroupForm({ ...groupForm, memberIds: e.target.value });
  };

  const handleOpenGroupDialog = (group = null) => {
    if (group) {
      setGroupForm({ name: group.name, memberIds: group.members || [] });
      setEditGroupId(group.id);
    } else {
      setGroupForm({ name: '', memberIds: [] });
      setEditGroupId(null);
    }
    setGroupDialogOpen(true);
  };

  const handleCloseGroupDialog = () => {
    setGroupDialogOpen(false);
    setGroupForm({ name: '', memberIds: [] });
    setEditGroupId(null);
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name) {
      setError('Group name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editGroupId) {
        await api.put(`/api/groups/${editGroupId}`, groupForm);
      } else {
        await api.post('/api/groups', groupForm);
      }
      handleCloseGroupDialog();
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save group.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const handleDeleteGroup = async (id) => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/groups/${id}`);
      fetchGroups();
    } catch (err) {
      setError('Failed to delete group.');
      console.error('API Error:', err);
    }
    setLoading(false);
  };

  const getMemberNames = (memberIds) => {
    if (!members || members.length === 0 || !memberIds || memberIds.length === 0) return 'None';
    return members
      .filter(member => memberIds.includes(member.id))
      .map(member => member.name)
      .join(', ');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', pb: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Member Management
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Members" />
        <Tab label="Groups" />
      </Tabs>

      {activeTab === 0 ? (
        <>
          {!showNewMemberRow && !loading && members && Array.isArray(members) && members.length === 0 && (
            <Button
              variant="contained"
              sx={{ mb: 2, borderRadius: 2 }}
              onClick={() => setShowNewMemberRow(true)}
            >
              + Add First Member
            </Button>
          )}
          {!showNewMemberRow && !loading && members && Array.isArray(members) && members.length > 0 && (
            <Button
              variant="contained"
              sx={{ mb: 2, borderRadius: 2 }}
              onClick={() => setShowNewMemberRow(true)}
            >
              + Add New Member
            </Button>
          )}

          <Dialog open={assignTaskDialogOpen} onClose={() => setAssignTaskDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Task</DialogTitle>
            <form onSubmit={handleTaskSubmit}>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Description"
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskFormChange}
                      fullWidth
                      required
                      multiline
                      minRows={2}
                    />
                  </Grid>
                   <Grid item xs={12}>
                    <TextField
                      label="Deadline"
                      name="deadline"
                      value={taskForm.deadline}
                      onChange={handleTaskFormChange}
                      fullWidth
                      required
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAssignTaskDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  Assign Task
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Dialog open={editTaskDialogOpen} onClose={() => setEditTaskDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Task</DialogTitle>
            {editingTask && (
             <form onSubmit={(e) => { e.preventDefault(); handleUpdateTask(); }}>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Task Description"
                      name="description"
                      value={editingTask.description}
                      onChange={handleEditTaskFormChange}
                      fullWidth
                      required
                      multiline
                      minRows={2}
                    />
                  </Grid>
                   <Grid item xs={12}>
                    <TextField
                      label="Deadline"
                      name="deadline"
                      value={editingTask.deadline}
                      onChange={handleEditTaskFormChange}
                      fullWidth
                      required
                      type="date"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditTaskDialogOpen(false)}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  Save Changes
                </Button>
              </DialogActions>
            </form>
            )}
          </Dialog>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Paper sx={{ mt: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                       <TableCell>Name</TableCell>
                       <TableCell>Email</TableCell>
                       <TableCell>Tasks</TableCell>
                       <TableCell>Reliability Score</TableCell>
                       <TableCell>Logs</TableCell>
                       <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {showNewMemberRow ? (
                        <TableRow>
                             <TableCell>
                                <TextField
                                    label="Name"
                                    name="name"
                                    value={newMemberFormData.name}
                                    onChange={handleNewMemberFormChange}
                                    fullWidth
                                    size="small"
                                    required
                                />
                            </TableCell>
                            <TableCell>
                                 <TextField
                                    label="Email"
                                    name="email"
                                    value={newMemberFormData.email}
                                    onChange={handleNewMemberFormChange}
                                    fullWidth
                                    size="small"
                                    required
                                    type="email"
                                />
                            </TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell>N/A</TableCell>
                            <TableCell align="center">
                                <IconButton onClick={handleAddMember} color="primary" disabled={loading}>
                                    <SaveIcon />
                                </IconButton>
                                <IconButton onClick={handleCancelAddMember} color="error" disabled={loading}>
                                    <CancelIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ) : (
                        members && Array.isArray(members) && members.length > 0 ? (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.name}</TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewTasksClick(member.id)} size="small">
                                            <ListIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewLogsClick(member)} size="small">
                                            <EmailIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton onClick={() => handleAssignTaskClick(member.id)} color="primary">
                                        <AddIcon />
                                      </IconButton>
                                      <IconButton onClick={() => handleDeleteMember(member.id)} color="error">
                                        <Delete />
                                      </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : ( !loading && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No members found. Click "Add First Member" above to add one.
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          <Dialog open={viewTasksDialogOpen} onClose={() => setViewTasksDialogOpen(false)} maxWidth="md" fullWidth>
            <DialogTitle>Tasks for Member</DialogTitle>
            <DialogContent>
              {memberTasks.length > 0 ? (
                  <Table size="small" aria-label="member tasks">
                      <TableHead>
                          <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell>Deadline</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="center">Actions</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {memberTasks.map((task) => (
                              <TableRow key={task.id}>
                                  <TableCell>{task.description}</TableCell>
                                  <TableCell>{task.deadline}</TableCell>
                                  <TableCell>
                                      <FormControl fullWidth size="small">
                                          <InputLabel id={`status-select-label-${task.id}`}>Status</InputLabel>
                                          <Select
                                              labelId={`status-select-label-${task.id}`}
                                              value={task.status || 'pending'}
                                              label="Status"
                                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                                          >
                                              <MenuItem value="pending">Pending</MenuItem>
                                              <MenuItem value="in progress">In Progress</MenuItem>
                                              <MenuItem value="done">Done</MenuItem>
                                              <MenuItem value="not done">Not Done</MenuItem>
                                          </Select>
                                      </FormControl>
                                  </TableCell>
                                  <TableCell align="center">
                                      <IconButton onClick={() => handleEditTask(task)} size="small">
                                          <Edit />
                                      </IconButton>
                                      <IconButton onClick={() => handleDeleteTask(task.id)} size="small" color="error">
                                          <Delete />
                                      </IconButton>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ) : (
                  <Typography variant="body1" sx={{ mt: 2 }}>No tasks assigned to this member.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewTasksDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={viewLogsDialogOpen} onClose={() => setViewLogsDialogOpen(false)} maxWidth="lg" fullWidth>
            <DialogTitle>Email Logs for {selectedMemberForLogs ? selectedMemberForLogs.name : '...'}</DialogTitle>
            <DialogContent>
              {memberEmailLogs.length > 0 ? (
                  <Table size="small" aria-label="member email logs">
                      <TableHead>
                          <TableRow>
                              <TableCell>Subject</TableCell>
                              <TableCell>Sent At</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Task (if applicable)</TableCell>
                              <TableCell>Follow-ups</TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {memberEmailLogs.map((log) => (
                              <TableRow key={log.id}>
                                  <TableCell>{log.subject}</TableCell>
                                  <TableCell>{new Date(log.sent_at).toLocaleString()}</TableCell>
                                  <TableCell>{log.status}</TableCell>
                                  <TableCell>{log.task_id ? `Task ID: ${log.task_id}` : 'N/A'}</TableCell>
                                  <TableCell>{log.follow_up_count}</TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              ) : (
                  <Typography variant="body1" sx={{ mt: 2 }}>No email logs found for this member.</Typography>
              )}
              {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewLogsDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mb: 2, borderRadius: 2 }}
            onClick={() => handleOpenGroupDialog()}
          >
            Add New Group
          </Button>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : groups.length > 0 ? (
            <Paper sx={{ mt: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(30, 34, 90, 0.08)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Members</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>{group.name}</TableCell>
                        <TableCell>
                          {group.members && group.members.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {group.members.map(memberId => {
                                const member = members.find(m => m.id === memberId);
                                return member ? (
                                  <Chip
                                    key={memberId}
                                    label={member.name}
                                    size="small"
                                    sx={{ m: 0.5 }}
                                  />
                                ) : null;
                              })}
                            </Box>
                          ) : (
                            'No members'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => handleOpenGroupDialog(group)} size="small">
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteGroup(group.id)} size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ) : (
            <Typography variant="body1" sx={{ mt: 4, textAlign: 'center' }}>
              No groups found. Click "Add New Group" to create one.
            </Typography>
          )}
        </>
      )}

      <Dialog open={groupDialogOpen} onClose={handleCloseGroupDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editGroupId ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={groupForm.name}
            onChange={handleGroupFormChange}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth disabled={loading}>
            <InputLabel id="select-members-label">Select Members</InputLabel>
            <Select
              labelId="select-members-label"
              multiple
              value={groupForm.memberIds}
              onChange={handleMemberSelectChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = members.find(m => m.id === value);
                    return member ? (
                      <Chip key={value} label={member.name} size="small" />
                    ) : null;
                  })}
                </Box>
              )}
            >
              {members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupDialog}>Cancel</Button>
          <Button onClick={handleSaveGroup} variant="contained" disabled={loading || !groupForm.name}>
            {editGroupId ? 'Save Changes' : 'Add Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Members; 