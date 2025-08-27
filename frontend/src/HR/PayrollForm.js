import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';

const PayrollForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    employee: '',
    period: '',
    amount: '',
    status: ''
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
      await axios.post('/hr/payroll/', form);
      setSuccess(true);
      setForm({ employee: '', period: '', amount: '', status: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit payroll.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" mb={2}>Add Payroll Record</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Payroll record added!</Alert>}
      <TextField label="Employee ID" name="employee" value={form.employee} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Period" name="period" value={form.period} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Amount" name="amount" type="number" value={form.amount} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Status" name="status" select value={form.status} onChange={handleChange} fullWidth margin="normal" required>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="paid">Paid</MenuItem>
      </TextField>
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Submitting...' : 'Add Payroll'}
      </Button>
    </Box>
  );
};

export default PayrollForm;
