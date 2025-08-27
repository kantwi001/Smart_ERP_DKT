import React, { useState, useEffect } from 'react';
import api from '../api';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert, FormControl, InputLabel, Select } from '@mui/material';

const EditEmployeeDialog = ({ open, onClose, employee, onSaved, onDeleted }) => {
  const [form, setForm] = useState(employee || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    setForm(employee || {});
    setError('');
    setSuccess(false);
  }, [employee, open]);

  useEffect(() => {
    // Load departments for dropdown
    const loadDepartments = async () => {
      try {
        const response = await api.get('/hr/departments/');
        setDepartments(response.data || []);
      } catch (error) {
        console.error('Failed to load departments:', error);
        // Fallback departments
        setDepartments([
          { id: 1, name: 'HR' },
          { id: 2, name: 'Sales' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'IT' },
          { id: 5, name: 'Operations' },
          { id: 6, name: 'Marketing' },
          { id: 7, name: 'Procurement' }
        ]);
      }
    };
    
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await api.patch(`/hr/employees/${form.id}/`, form);
      setSuccess(true);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError('Failed to update employee.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/hr/employees/${form.id}/`);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      console.error('Employee deletion error:', err);
      setError(`Failed to delete employee: ${err.response?.data?.detail || err.message}`);
    }
    setLoading(false);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField 
          label="First Name" 
          name="first_name" 
          value={form.first_name || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
        />
        <TextField 
          label="Last Name" 
          name="last_name" 
          value={form.last_name || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
        />
        <TextField 
          label="Email" 
          name="email" 
          value={form.email || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
        />
        <TextField 
          label="Position" 
          name="position" 
          value={form.position || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Department</InputLabel>
          <Select
            name="department"
            value={form.department?.id || form.department || ''}
            onChange={handleChange}
            label="Department"
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField 
          label="Hire Date" 
          name="hire_date" 
          type="date" 
          value={form.hire_date || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          InputLabelProps={{ shrink: true }} 
          required 
        />
        <TextField 
          label="Salary" 
          name="salary" 
          type="number" 
          value={form.salary || ''} 
          onChange={handleChange} 
          fullWidth 
          margin="normal" 
          required 
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select
            name="active"
            value={form.active !== undefined ? form.active : true}
            onChange={handleChange}
            label="Status"
          >
            <MenuItem value={true}>Active</MenuItem>
            <MenuItem value={false}>Inactive</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" disabled={loading}>Delete</Button>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeDialog;
