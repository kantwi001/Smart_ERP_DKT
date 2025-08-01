import React, { useState, useEffect } from 'react';
import api from '../api';
import { Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';

const EmployeeForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department_id: '',
    hire_date: '',
    salary: ''
  });
  const [departments, setDepartments] = useState([]);
  const [supervisor, setSupervisor] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get('/hr/departments/').then(res => setDepartments(res.data));
  }, []);

  useEffect(() => {
    const dept = departments.find(d => d.id === form.department_id);
    setSupervisor(dept && dept.supervisor_username ? dept.supervisor_username : '');
  }, [form.department_id, departments]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await api.post('/hr/employees/', form);
      setSuccess(true);
      setForm({ first_name: '', last_name: '', email: '', position: '', department: '', hire_date: '', salary: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit employee.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" mb={2}>Add Employee</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Employee added!</Alert>}
      <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Position" name="position" value={form.position} onChange={handleChange} fullWidth margin="normal" required />
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Department</InputLabel>
        <Select
          name="department_id"
          value={form.department_id}
          label="Department"
          onChange={handleChange}
        >
          <MenuItem value="">Select</MenuItem>
          {departments.map(d => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {supervisor && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Supervisor (HOD): {supervisor}
        </Typography>
      )}
      <TextField label="Hire Date" name="hire_date" type="date" value={form.hire_date} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
      <TextField label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} fullWidth margin="normal" required />
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Submitting...' : 'Add Employee'}
      </Button>
    </Box>
  );
};

export default EmployeeForm;
