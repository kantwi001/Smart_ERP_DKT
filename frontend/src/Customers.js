import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CustomerMap from './CustomerMap';
import CustomerMapPicker from './CustomerMapPicker';
import { reverseGeocode } from './geocode';

const Customers = () => {
  const { token } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', gps_lat: '', gps_lng: '' });
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/sales/customers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token]);

  const handleOpen = (customer = null) => {
    setEditCustomer(customer);
    if (customer) {
      setForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        gps_lat: customer.gps_lat || '',
        gps_lng: customer.gps_lng || ''
      });
      if (customer.gps_lat && customer.gps_lng) {
        reverseGeocode(customer.gps_lat, customer.gps_lng).then(setAddress).catch(() => setAddress(''));
      } else {
        setAddress('');
      }
    } else {
      setForm({ name: '', email: '', phone: '', gps_lat: '', gps_lng: '' });
      setAddress('');
    }
    setOpen(true);
  };

  useEffect(() => {
    if (form.gps_lat && form.gps_lng) {
      reverseGeocode(form.gps_lat, form.gps_lng).then(setAddress).catch(() => setAddress(''));
    } else {
      setAddress('');
    }
    // eslint-disable-next-line
  }, [form.gps_lat, form.gps_lng]);
  const handleClose = () => {
    setOpen(false);
    setEditCustomer(null);
    setForm({ name: '', email: '', phone: '', gps_lat: '', gps_lng: '' });
  };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMapPick = ([lat, lng]) => setForm({ ...form, gps_lat: lat, gps_lng: lng });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/sales/customers/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCustomers();
    } catch (err) {
      setError('Failed to delete customer.');
    }
  };

  const filteredCustomers = customers.filter(cust =>
    cust.name?.toLowerCase().includes(search.toLowerCase()) ||
    cust.email?.toLowerCase().includes(search.toLowerCase()) ||
    cust.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editCustomer) {
        await api.put(`/sales/customers/${editCustomer.id}/`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/sales/customers/', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchCustomers();
      handleClose();
    } catch (err) {
      setError('Failed to save customer.');
    }
  };

  // Dashboard summary data
  const totalCustomers = customers.length;
  const withGPS = customers.filter(c => c.gps_lat && c.gps_lng).length;
  const withoutGPS = totalCustomers - withGPS;
  const cityCounts = Array.from(
    customers.reduce((map, c) => {
      const key = c.city || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())
  ).map(([city, count]) => ({ city, count }));
  const recentCustomers = customers.slice(0, 5);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Customers</Typography>
        <Button variant="contained" onClick={handleOpen}>Add Customer</Button>
      </Box>
      {/* Dashboard widgets */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <GroupsIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Customers</Typography>
                  <Typography variant="h4">{totalCustomers}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationOnIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">With GPS</Typography>
                  <Typography variant="h4">{withGPS}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <LocationOffIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Without GPS</Typography>
                  <Typography variant="h4">{withoutGPS}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* City chart and recent customers */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Customers by City</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cityCounts} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="city" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Customers</Typography>
              {recentCustomers.length === 0 ? (
                <Typography color="text.secondary">No recent customers.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentCustomers.map((c, idx) => (
                    <li key={c.id || idx}>
                      <Typography variant="body2">{c.name} &mdash; {c.city || 'Unknown'} &mdash; {c.email}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box display="flex" alignItems="center" mb={2}>
        <Button variant="outlined" sx={{ ml: 2 }} component="label">
          Import CSV
          <input type="file" accept=".csv" hidden onChange={async e => {
            if (!e.target.files[0]) return;
            setImporting(true);
            const file = e.target.files[0];
            const text = await file.text();
            const rows = text.split('\n').map(row => row.split(','));
            for (const row of rows.slice(1)) {
              if (row.length < 3) continue;
              await api.post('/sales/customers/', {
                name: row[0],
                email: row[1],
                phone: row[2],
                gps_lat: row[3] || '',
                gps_lng: row[4] || ''
              }, { headers: { Authorization: `Bearer ${token}` } });
            }
            setImporting(false);
            fetchCustomers();
          }} />
        </Button>
        <Button variant="outlined" sx={{ ml: 2 }} onClick={() => {
          const csv = [
            ['Name', 'Email', 'Phone', 'GPS Latitude', 'GPS Longitude'],
            ...customers.map(c => [c.name, c.email, c.phone, c.gps_lat, c.gps_lng])
          ].map(row => row.join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'customers.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}>Export CSV</Button>
        <TextField label="Search" size="small" sx={{ ml: 2 }} value={search} onChange={e => setSearch(e.target.value)} />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Location (GPS)</TableCell>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No customers found.</TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.gps_lat && customer.gps_lng ? `${customer.gps_lat}, ${customer.gps_lng}` : '-'}</TableCell>
                      <TableCell><Button size="small" onClick={() => handleOpen(customer)}>Edit</Button></TableCell>
                      <TableCell><Button size="small" color="error" onClick={() => handleDelete(customer.id)}>Delete</Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={3}>
            <Typography variant="h6" mb={1}>Customer Locations Map</Typography>
            <CustomerMap customers={customers} height={350} />
          </Box>
        </>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <form id="customer-form" onSubmit={handleSubmit}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="GPS Latitude" name="gps_lat" value={form.gps_lat} onChange={handleChange} fullWidth margin="normal" type="number" />
            <TextField label="GPS Longitude" name="gps_lng" value={form.gps_lng} onChange={handleChange} fullWidth margin="normal" type="number" />
            <Box mt={2}>
              <CustomerMapPicker value={[Number(form.gps_lat)||0, Number(form.gps_lng)||0]} onChange={([lat, lng]) => setForm({ ...form, gps_lat: lat, gps_lng: lng })} height={180} />
              <Typography variant="caption">Click on the map to set GPS location</Typography>
              {address && <Typography variant="body2" mt={1}>Address: {address}</Typography>}
            </Box>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="customer-form" variant="contained">{editCustomer ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Customers;
