import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';

const LeaveForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    leave_type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post('/api/hr/leave-requests/', form);
      setSuccess(true);
      setForm({ start_date: '', end_date: '', reason: '', leave_type: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit leave request.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" mb={2}>Request Leave</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Leave request submitted!</Alert>}
      <TextField
        label="Start Date"
        name="start_date"
        type="date"
        value={form.start_date}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="End Date"
        name="end_date"
        type="date"
        value={form.end_date}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        label="Leave Type"
        name="leave_type"
        select
        value={form.leave_type}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      >
        <MenuItem value="annual">Annual</MenuItem>
        <MenuItem value="sick">Sick</MenuItem>
        <MenuItem value="unpaid">Unpaid</MenuItem>
      </TextField>
      <TextField
        label="Reason"
        name="reason"
        value={form.reason}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={2}
        required
      />
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Submitting...' : 'Submit Leave Request'}
      </Button>
    </Box>
  );
};

export default LeaveForm;
