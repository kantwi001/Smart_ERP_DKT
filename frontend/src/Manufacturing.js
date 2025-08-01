import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Manufacturing = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ product: '', quantity: '', status: 'pending' });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/manufacturing/workorders/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      setError('Failed to load manufacturing orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ product: '', quantity: '', status: 'pending' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/manufacturing/workorders/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      handleClose();
    } catch (err) {
      setError('Failed to create manufacturing order.');
    }
  };

  // Dashboard summary data
  const total = orders.length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const inProgress = orders.filter(o => o.status === 'in_progress').length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const statusData = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending }
  ];
  const recentOrders = orders.slice(0, 5);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Manufacturing</Typography>
        <Button variant="contained" onClick={handleOpen}>New Manufacturing Order</Button>
      </Box>
      {/* Dashboard widgets */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <BuildIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Orders</Typography>
                  <Typography variant="h4">{total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Completed</Typography>
                  <Typography variant="h4">{completed}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HourglassEmptyIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">In Progress</Typography>
                  <Typography variant="h4">{inProgress}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingActionsIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="h4">{pending}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Status chart and recent orders */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Work Orders by Status</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Orders</Typography>
              {recentOrders.length === 0 ? (
                <Typography color="text.secondary">No recent orders.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentOrders.map((o, idx) => (
                    <li key={o.id || idx}>
                      <Typography variant="body2">{o.product} &mdash; Qty: {o.quantity} &mdash; Status: {o.status}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No manufacturing orders found.</TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Manufacturing Order</DialogTitle>
        <DialogContent>
          <form id="manufacturing-form" onSubmit={handleSubmit}>
            <TextField label="Product" name="product" value={form.product} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="normal" select required >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="manufacturing-form" variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Manufacturing;
