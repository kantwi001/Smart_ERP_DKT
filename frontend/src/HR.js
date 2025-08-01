import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const HR = () => {
  const { token } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', position: '' });

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [token]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hr/employees/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(res.data);
    } catch (err) {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ first_name: '', last_name: '', email: '', position: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/hr/employees/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmployees();
      handleClose();
    } catch (err) {
      setError('Failed to add employee.');
    }
  };

  // Dashboard summary data
  const totalEmployees = employees.length;
  const positions = Array.from(new Set(employees.map(e => e.position || 'Unknown')));
  const uniquePositions = positions.length;
  const recentEmployees = employees.slice(0, 5);
  const positionChartData = positions.map(pos => ({ position: pos, count: employees.filter(e => (e.position || 'Unknown') === pos).length }));

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">HR - Employees</Typography>
        <Button variant="contained" onClick={handleOpen}>Add Employee</Button>
      </Box>
      {/* Dashboard widgets */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Employees</Typography>
                  <Typography variant="h4">{totalEmployees}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WorkIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Unique Positions</Typography>
                  <Typography variant="h4">{uniquePositions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonAddAltIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Recently Added</Typography>
                  <Typography variant="h4">{recentEmployees.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Position chart and recent employees */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Employees by Position</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={positionChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="position" interval={0} angle={-15} textAnchor="end" height={60} />
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
              <Typography variant="subtitle1" gutterBottom>Recent Employees</Typography>
              {recentEmployees.length === 0 ? (
                <Typography color="text.secondary">No recent employees.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentEmployees.map((e, idx) => (
                    <li key={e.id || idx}>
                      <Typography variant="body2">{e.first_name} {e.last_name} &mdash; {e.position || 'Unknown'}</Typography>
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
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Position</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No employees found.</TableCell>
                </TableRow>
              ) : (
                employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell>{emp.first_name}</TableCell>
                    <TableCell>{emp.last_name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent>
          <form id="employee-form" onSubmit={handleSubmit}>
            <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Position" name="position" value={form.position} onChange={handleChange} fullWidth margin="normal" required />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="employee-form" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HR;
