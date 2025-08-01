import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert } from '@mui/material';

const EditEmployeeDialog = ({ open, onClose, employee, onSaved, onDeleted }) => {
  const [form, setForm] = useState(employee || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setForm(employee || {});
    setError('');
    setSuccess(false);
  }, [employee, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.patch(`/api/hr/employees/${form.id}/`, form);
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
      await axios.delete(`/api/hr/employees/${form.id}/`);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      setError('Failed to delete employee.');
    }
    setLoading(false);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Employee</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="First Name" name="first_name" value={form.first_name || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Last Name" name="last_name" value={form.last_name || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Email" name="email" value={form.email || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Position" name="position" value={form.position || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Department" name="department" value={form.department || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Hire Date" name="hire_date" type="date" value={form.hire_date || ''} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
        <TextField label="Salary" name="salary" type="number" value={form.salary || ''} onChange={handleChange} fullWidth margin="normal" required />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" disabled={loading}>Delete</Button>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEmployeeDialog;
