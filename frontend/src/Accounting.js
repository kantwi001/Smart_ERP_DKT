import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Card, CardContent } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Finance = () => {
  const { token } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', type: 'credit' });

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
    // eslint-disable-next-line
  }, [token]);

  const fetchEntries = async () => {
    setLoadingEntries(true);
    setError(null);
    try {
      const res = await api.get('/accounting/entries/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(res.data);
    } catch (err) {
      setError('Failed to load accounting entries.');
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await api.get('/accounting/accounts/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(res.data);
    } catch (err) {
      setAccounts([]); // fallback to empty if error
    } finally {
      setLoadingAccounts(false);
    }
  };


  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ description: '', amount: '', type: 'credit' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/accounting/entries/', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEntries();
      handleClose();
    } catch (err) {
      setError('Failed to add entry.');
    }
  };

  // Dashboard summary data
  const totalTransactions = entries.length;
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  const balancesByAccount = accounts.map(acc => ({ name: acc.name, balance: Number(acc.balance) || 0 }));
  const recentTransactions = entries.slice(0, 5);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Finance</Typography>
        <Button variant="contained" onClick={handleOpen}>Add Entry</Button>
      </Box>
      {/* Dashboard widgets */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ReceiptLongIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Transactions</Typography>
                  <Typography variant="h4">{totalTransactions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AccountBalanceIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Accounts</Typography>
                  <Typography variant="h4">{totalAccounts}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SavingsIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Balance</Typography>
                  <Typography variant="h4">₵{totalBalance.toLocaleString()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Balances chart and recent transactions */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Balances by Account</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={balancesByAccount} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="balance" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Transactions</Typography>
              {recentTransactions.length === 0 ? (
                <Typography color="text.secondary">No recent transactions.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentTransactions.map((tx, idx) => (
                    <li key={tx.id || idx}>
                      <Typography variant="body2">{tx.date} &mdash; {tx.account_name || tx.account} &mdash; {tx.transaction_type} &mdash; ₵{tx.amount}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {(loadingEntries || loadingAccounts) ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No entries found.</TableCell>
                </TableRow>
              ) : (
                entries.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.amount}</TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell>{entry.created_at ? new Date(entry.created_at).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Finance Entry</DialogTitle>
        <DialogContent>
          <form id="entry-form" onSubmit={handleSubmit}>
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Amount" name="amount" value={form.amount} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="Type" name="type" value={form.type} onChange={handleChange} fullWidth margin="normal" select required >
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </TextField>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="entry-form" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Finance;
