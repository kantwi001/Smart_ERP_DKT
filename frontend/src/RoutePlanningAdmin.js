import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button, Typography, Paper, List, ListItem, ListItemText, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, Box, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/route-planning';

export default function RoutePlanningAdmin() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [routeName, setRouteName] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [stops, setStops] = useState([]);
  const [stopDialog, setStopDialog] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopName, setStopName] = useState('');
  const [stopOrder, setStopOrder] = useState(0);
  const [stopLat, setStopLat] = useState('');
  const [stopLng, setStopLng] = useState('');
  const [stopArrival, setStopArrival] = useState('');
  const [users, setUsers] = useState([]);
  const [assignedUser, setAssignedUser] = useState('');

  useEffect(() => { fetchRoutes(); fetchUsers(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/routes/`);
      setRoutes(res.data);
    } catch (e) {}
    setLoading(false);
  };
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/`);
      setUsers(res.data);
    } catch (e) {}
  };

  const handleOpenDialog = (route = null) => {
    setEditingRoute(route);
    setRouteName(route ? route.name : '');
    setRouteDesc(route ? route.description : '');
    setStops(route ? route.stops || [] : []);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRoute(null);
    setRouteName('');
    setRouteDesc('');
    setStops([]);
  };
  const handleSaveRoute = async () => {
    let route;
    if (editingRoute) {
      route = await axios.patch(`${API_BASE}/routes/${editingRoute.id}/`, {
        name: routeName, description: routeDesc
      });
    } else {
      route = await axios.post(`${API_BASE}/routes/`, {
        name: routeName, description: routeDesc
      });
    }
    // Save stops
    for (const s of stops) {
      if (!s.id) {
        await axios.post(`${API_BASE}/route-stops/`, {
          route: route.data.id,
          name: s.name,
          order: s.order,
          latitude: s.latitude,
          longitude: s.longitude,
          arrival_time: s.arrival_time
        });
      } else {
        await axios.patch(`${API_BASE}/route-stops/${s.id}/`, {
          name: s.name,
          order: s.order,
          latitude: s.latitude,
          longitude: s.longitude,
          arrival_time: s.arrival_time
        });
      }
    }
    fetchRoutes();
    handleCloseDialog();
  };
  const handleDeleteRoute = async (route) => {
    await axios.delete(`${API_BASE}/routes/${route.id}/`);
    fetchRoutes();
  };

  // Stop dialog handlers
  const handleOpenStopDialog = (s = null) => {
    setEditingStop(s);
    setStopName(s ? s.name : '');
    setStopOrder(s ? s.order : stops.length);
    setStopLat(s ? s.latitude : '');
    setStopLng(s ? s.longitude : '');
    setStopArrival(s ? s.arrival_time : '');
    setStopDialog(true);
  };
  const handleCloseStopDialog = () => {
    setEditingStop(null);
    setStopName('');
    setStopOrder(stops.length);
    setStopLat('');
    setStopLng('');
    setStopArrival('');
    setStopDialog(false);
  };
  const handleSaveStop = () => {
    const newS = { ...editingStop, name: stopName, order: stopOrder, latitude: stopLat, longitude: stopLng, arrival_time: stopArrival };
    let newStops = [...stops];
    if (editingStop) {
      newStops = newStops.map(s => s === editingStop ? newS : s);
    } else {
      newStops.push(newS);
    }
    setStops(newStops);
    handleCloseStopDialog();
  };
  const handleDeleteStop = (s) => {
    setStops(stops.filter(ss => ss !== s));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Route Planning Admin</Typography>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>New Route</Button>
      <List>
        {routes.map(route => (
          <ListItem key={route.id} secondaryAction={
            <Box>
              <IconButton onClick={() => handleOpenDialog(route)}><EditIcon /></IconButton>
              <IconButton onClick={() => handleDeleteRoute(route)}><DeleteIcon /></IconButton>
            </Box>
          }>
            <ListItemText primary={route.name} secondary={route.description} />
          </ListItem>
        ))}
      </List>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingRoute ? 'Edit Route' : 'New Route'}</DialogTitle>
        <DialogContent>
          <TextField label="Route Name" fullWidth sx={{ mb: 2 }} value={routeName} onChange={e => setRouteName(e.target.value)} />
          <TextField label="Description" fullWidth sx={{ mb: 2 }} value={routeDesc} onChange={e => setRouteDesc(e.target.value)} />
          <Typography variant="subtitle1">Stops</Typography>
          <List>
            {stops.map((s, i) => (
              <ListItem key={i} secondaryAction={
                <Box>
                  <IconButton onClick={() => handleOpenStopDialog(s)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteStop(s)}><DeleteIcon /></IconButton>
                </Box>
              }>
                <ListItemText primary={`${s.name} (Order: ${s.order})`} secondary={`Lat: ${s.latitude}, Lng: ${s.longitude}, Arrival: ${s.arrival_time || 'N/A'}`} />
              </ListItem>
            ))}
          </List>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenStopDialog()} sx={{ mt: 2 }}>Add Stop</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoute}>Save</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={stopDialog} onClose={handleCloseStopDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStop ? 'Edit Stop' : 'Add Stop'}</DialogTitle>
        <DialogContent>
          <TextField label="Stop Name" fullWidth sx={{ mb: 2 }} value={stopName} onChange={e => setStopName(e.target.value)} />
          <TextField label="Order" type="number" fullWidth sx={{ mb: 2 }} value={stopOrder} onChange={e => setStopOrder(Number(e.target.value))} />
          <TextField label="Latitude" fullWidth sx={{ mb: 2 }} value={stopLat} onChange={e => setStopLat(e.target.value)} />
          <TextField label="Longitude" fullWidth sx={{ mb: 2 }} value={stopLng} onChange={e => setStopLng(e.target.value)} />
          <TextField label="Arrival Time (ISO)" fullWidth sx={{ mb: 2 }} value={stopArrival} onChange={e => setStopArrival(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStopDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveStop}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
