import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

const AnnouncementForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    message: ''
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
      await axios.post('/hr/announcements/', form);
      setSuccess(true);
      setForm({ title: '', message: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to submit announcement.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h6" mb={2}>New Announcement</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Announcement posted!</Alert>}
      <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="normal" required />
      <TextField label="Message" name="message" value={form.message} onChange={handleChange} fullWidth margin="normal" multiline rows={3} required />
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Posting...' : 'Post Announcement'}
      </Button>
    </Box>
  );
};

export default AnnouncementForm;
