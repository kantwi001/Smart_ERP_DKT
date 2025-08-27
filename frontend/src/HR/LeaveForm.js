import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Alert, 
  Card,
  CardContent,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { CalendarToday, AccessTime, Warning } from '@mui/icons-material';

const LeaveForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    leave_type: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 0,
    sick: 0,
    unpaid: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState('');

  // Function to calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };

  // Load leave balance on component mount
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      try {
        const response = await axios.get('/hr/leave-balance/');
        setLeaveBalance(response.data);
      } catch (err) {
        console.error('Failed to fetch leave balance:', err);
      }
    };
    fetchLeaveBalance();
  }, []);

  // Check balance warning when leave type or calculated days change
  useEffect(() => {
    if (form.leave_type && calculatedDays > 0) {
      const availableBalance = leaveBalance[form.leave_type] || 0;
      if (calculatedDays > availableBalance && form.leave_type !== 'unpaid') {
        setBalanceWarning(`Warning: You are requesting ${calculatedDays} days but only have ${availableBalance} ${form.leave_type} days remaining.`);
      } else {
        setBalanceWarning('');
      }
    } else {
      setBalanceWarning('');
    }
  }, [form.leave_type, calculatedDays, leaveBalance]);

  const handleChange = e => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    // Auto-calculate days when dates change
    if (name === 'start_date' || name === 'end_date') {
      const days = calculateWorkingDays(
        name === 'start_date' ? value : form.start_date,
        name === 'end_date' ? value : form.end_date
      );
      setCalculatedDays(days);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Include calculated days in the submission
      const submissionData = {
        ...form,
        calculated_days: calculatedDays
      };
      
      await axios.post('/hr/leave-requests/', submissionData);
      setSuccess(true);
      setForm({ start_date: '', end_date: '', reason: '', leave_type: '' });
      setCalculatedDays(0);
      setBalanceWarning('');
      
      // Refresh leave balance after successful submission
      const response = await axios.get('/hr/leave-balance/');
      setLeaveBalance(response.data);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit leave request.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarToday color="primary" />
        Request Leave
      </Typography>

      {/* Leave Balance Display */}
      <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Your Leave Balance
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main">{leaveBalance.annual}</Typography>
                <Typography variant="body2" color="textSecondary">Annual Days</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="info.main">{leaveBalance.sick}</Typography>
                <Typography variant="body2" color="textSecondary">Sick Days</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main">∞</Typography>
                <Typography variant="body2" color="textSecondary">Unpaid Days</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Leave request submitted successfully!</Alert>}
      {balanceWarning && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
          {balanceWarning}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
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

        {/* Days Calculation Display */}
        {calculatedDays > 0 && (
          <Card sx={{ my: 2, bgcolor: '#e3f2fd' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime color="primary" />
                <Typography variant="h6" color="primary">
                  Total Working Days: {calculatedDays}
                </Typography>
                <Chip 
                  label={`${calculatedDays} ${calculatedDays === 1 ? 'day' : 'days'}`} 
                  color="primary" 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        )}

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
          <MenuItem value="annual">Annual Leave</MenuItem>
          <MenuItem value="sick">Sick Leave</MenuItem>
          <MenuItem value="unpaid">Unpaid Leave</MenuItem>
        </TextField>
        <TextField
          label="Reason"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          required
          placeholder="Please provide a detailed reason for your leave request..."
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          disabled={loading || calculatedDays === 0} 
          sx={{ mt: 3, py: 1.5 }}
        >
          {loading ? 'Submitting...' : `Submit Leave Request (${calculatedDays} days)`}
        </Button>
      </Box>
    </Box>
  );
};

export default LeaveForm;
