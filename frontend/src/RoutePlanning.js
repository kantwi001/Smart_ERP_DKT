import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Paper, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Alert } from '@mui/material';
import { saveRoutes, getRoutes } from './offline';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/route-planning';

export default function RoutePlanning() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [stopsDialog, setStopsDialog] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    setOffline(false);
    try {
      const res = await axios.get(`${API_BASE}/routes/`);
      setRoutes(res.data);
      await saveRoutes(res.data);
    } catch (e) {
      // fallback to offline cache
      const cached = await getRoutes();
      setRoutes(cached);
      setOffline(true);
    }
    setLoading(false);
  };


  const handleOpenRoute = (route) => {
    setSelectedRoute(route);
    setStopsDialog(true);
  };

  const handleCloseDialog = () => {
    setStopsDialog(false);
    setSelectedRoute(null);
  };

  return (
    <Paper style={{ padding: 24 }}>
      <Typography variant="h5" gutterBottom>Route Planning</Typography>
      {offline && <Alert severity="info">Loaded from offline cache.</Alert>}
      {loading ? <CircularProgress /> : (
        <List>
          {routes.map((route) => (
            <ListItem button key={route.id} onClick={() => handleOpenRoute(route)}>
              <ListItemText primary={route.name} secondary={route.description} />
            </ListItem>
          ))}
        </List>
      )}
      <Dialog open={stopsDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Route: {selectedRoute?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Stops:</Typography>
          <List>
            {selectedRoute?.stops?.map((stop, i) => (
              <ListItem key={stop.id || i}>
                <ListItemText
                  primary={stop.name}
                  secondary={`Order: ${stop.order}, Lat: ${stop.latitude}, Lng: ${stop.longitude}, Arrival: ${stop.arrival_time || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
