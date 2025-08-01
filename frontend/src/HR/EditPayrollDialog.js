import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Alert } from '@mui/material';

const EditPayrollDialog = ({ open, onClose, record, onSaved, onDeleted }) => {
  const [form, setForm] = useState(record || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setForm(record || {});
    setError('');
  }, [record, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.patch(`/api/hr/payroll/${form.id}/`, form);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError('Failed to update payroll record.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/api/hr/payroll/${form.id}/`);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      setError('Failed to delete payroll record.');
    }
    setLoading(false);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Payroll</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Employee ID" name="employee" value={form.employee || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Period" name="period" value={form.period || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Amount" name="amount" type="number" value={form.amount || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Status" name="status" select value={form.status || ''} onChange={handleChange} fullWidth margin="normal" required>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" disabled={loading}>Delete</Button>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPayrollDialog;
