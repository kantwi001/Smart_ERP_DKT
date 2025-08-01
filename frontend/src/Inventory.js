import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Grid, Card, CardContent } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Inventory = () => {
  const { token } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/inventory/transfers/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(res.data);
      } catch (err) {
        setError('Failed to load inventory.');
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  // Dashboard summary data
  const totalItems = items.length;
  const lowStock = items.filter(i => i.quantity !== undefined && i.quantity < 10 && i.quantity > 0).length;
  const outOfStock = items.filter(i => i.quantity === 0).length;
  const stockChartData = items.slice(0, 8).map(i => ({ name: i.name, quantity: i.quantity }));
  const recentItems = items.slice(0, 5);

  // Fallback UI if no items or loading/error
  const showFallback = !loading && (error || items.length === 0);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Inventory</Typography>
      {showFallback ? (
        <Alert severity={error ? "error" : "info"} sx={{ mb: 2 }}>
          {error ? error : "No inventory found."}
        </Alert>
      ) : (
        <>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <InventoryIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Total Items</Typography>
                      <Typography variant="h4">{totalItems}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WarningIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Low Stock</Typography>
                      <Typography variant="h4">{lowStock}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <RemoveShoppingCartIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                    <Box>
                      <Typography variant="h6">Out of Stock</Typography>
                      <Typography variant="h4">{outOfStock}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Stock Levels (Top 8)</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stockChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#1976d2" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>Recent Items</Typography>
                  {recentItems.length === 0 ? (
                    <Typography color="text.secondary">No recent items.</Typography>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {recentItems.map((item, idx) => (
                        <li key={item.id || idx}>
                          <Typography variant="body2">{item.name} &mdash; SKU: {item.sku} &mdash; Qty: {item.quantity}</Typography>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      {loading ? (
        <CircularProgress />
      ) : !showFallback && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No inventory found.</TableCell>
                </TableRow>
              ) : (
                items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Inventory;
