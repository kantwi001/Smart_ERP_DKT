import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { getApiBaseUrl } from './api';

const API_BASE = process.env.REACT_APP_API_BASE || `${getApiBaseUrl()}/reporting`;

export default function PowerBIDashboard() {
  const [embedUrl, setEmbedUrl] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmbed = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/powerbi/embed/`);
        setEmbedUrl(res.data.embed_url);
        setToken(res.data.token);
      } catch (e) {
        setError('Failed to fetch PowerBI embed info.');
      }
      setLoading(false);
    };
    fetchEmbed();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>PowerBI Dashboard</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && embedUrl && (
        <Box sx={{ mt: 2 }}>
          <iframe
            title="PowerBI Dashboard"
            src={embedUrl}
            width="100%"
            height="600"
            style={{ border: 0 }}
            allowFullScreen
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            (Token: {token})
          </Typography>
        </Box>
      )}
      {!loading && !error && !embedUrl && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          PowerBI embed URL not available. Please check your backend integration or PowerBI configuration.
        </Alert>
      )}
    </Paper>
  );
}
