import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Box
} from '@mui/material';

const DeadlineDialog = ({ 
  open, 
  onClose, 
  deadlineForm, 
  setDeadlineForm, 
  onSubmit, 
  users = [],
  departments = [] 
}) => {
  const handleAssignedToChange = (event) => {
    const value = event.target.value;
    setDeadlineForm({
      ...deadlineForm,
      assigned_to: typeof value === 'string' ? value.split(',') : value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Deadline</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Deadline Title"
              value={deadlineForm.title}
              onChange={(e) => setDeadlineForm({...deadlineForm, title: e.target.value})}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Deadline Type</InputLabel>
              <Select
                value={deadlineForm.deadline_type}
                onChange={(e) => setDeadlineForm({...deadlineForm, deadline_type: e.target.value})}
              >
                <MenuItem value="performance_review">Performance Review</MenuItem>
                <MenuItem value="training_completion">Training Completion</MenuItem>
                <MenuItem value="document_submission">Document Submission</MenuItem>
                <MenuItem value="policy_acknowledgment">Policy Acknowledgment</MenuItem>
                <MenuItem value="compliance">Compliance</MenuItem>
                <MenuItem value="recruitment">Recruitment</MenuItem>
                <MenuItem value="payroll">Payroll</MenuItem>
                <MenuItem value="benefits">Benefits</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={deadlineForm.department}
                onChange={(e) => setDeadlineForm({...deadlineForm, department: e.target.value})}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={deadlineForm.due_date}
              onChange={(e) => setDeadlineForm({...deadlineForm, due_date: e.target.value})}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Due Time"
              type="time"
              value={deadlineForm.due_time}
              onChange={(e) => setDeadlineForm({...deadlineForm, due_time: e.target.value})}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={deadlineForm.description}
              onChange={(e) => setDeadlineForm({...deadlineForm, description: e.target.value})}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                multiple
                value={deadlineForm.assigned_to}
                onChange={handleAssignedToChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find(u => u.id === value);
                      return (
                        <Chip key={value} label={user?.name || user?.username || value} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name || user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Reminder Days Before"
              type="number"
              value={deadlineForm.reminder_days}
              onChange={(e) => setDeadlineForm({...deadlineForm, reminder_days: parseInt(e.target.value) || 0})}
              inputProps={{ min: 0, max: 30 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={deadlineForm.send_reminders}
                  onChange={(e) => setDeadlineForm({...deadlineForm, send_reminders: e.target.checked})}
                />
              }
              label="Send Reminder Notifications"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">Create Deadline</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeadlineDialog;
