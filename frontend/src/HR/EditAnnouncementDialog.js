import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';

const EditAnnouncementDialog = ({ open, onClose, announcement, onSaved, onDeleted }) => {
  const [form, setForm] = useState(announcement || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setForm(announcement || {});
    setError('');
  }, [announcement, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.patch(`/api/hr/announcements/${form.id}/`, form);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError('Failed to update announcement.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/api/hr/announcements/${form.id}/`);
      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      setError('Failed to delete announcement.');
    }
    setLoading(false);
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Announcement</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Title" name="title" value={form.title || ''} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Message" name="message" value={form.message || ''} onChange={handleChange} fullWidth margin="normal" multiline rows={3} required />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error" disabled={loading}>Delete</Button>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditAnnouncementDialog;
