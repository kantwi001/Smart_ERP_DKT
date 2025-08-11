import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Users = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null); // ID of user being confirmed for deletion
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    first_name: '', 
    last_name: '', 
    role: 'user', 
    department: 'Sales', 
    warehouse: '', 
    send_email: false, 
    accessible_modules: [] 
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ 
      username: '', 
      email: '', 
      first_name: '', 
      last_name: '', 
      role: 'user', 
      department: 'Sales', 
      warehouse: '', 
      send_email: false, 
      accessible_modules: [] 
    });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const userData = {
        name: `${form.first_name} ${form.last_name}`,
        email: form.email,
        role: form.role,
        department: form.department,
        assignedWarehouse: form.warehouse,
        generatePassword: true,
        sendEmail: form.send_email,
        moduleAccess: form.accessible_modules.length > 0 ? form.accessible_modules : ['dashboard']
      };

      console.log('Creating user with data:', userData);

      const response = await api.post('/users/create/', userData);
      
      setSuccess(`User ${form.first_name} ${form.last_name} created successfully! ${response.data.email_sent ? 'Login credentials sent via email.' : 'Password: ' + response.data.generated_password}`);
      fetchUsers();
      
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (err) {
      console.error('User creation error:', err);
      setError('Failed to create user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteClick = (e, userToDelete) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deleting) return;
    
    if (!userToDelete || !userToDelete.id) {
      setError('Invalid user data. Please refresh the page and try again.');
      return;
    }
    
    console.log('Setting confirmation for user:', userToDelete.id);
    setConfirmingDelete(userToDelete.id);
  };

  const handleDeleteCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Delete cancelled');
    setConfirmingDelete(null);
  };

  const handleDeleteConfirm = async (e, userToDelete) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userToDelete) return;
    
    console.log('Delete confirmed for:', userToDelete);
    
    setConfirmingDelete(null);
    setDeleting(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Deleting user:', userToDelete.id);
      
      const response = await api.delete(`/users/${userToDelete.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.status);
      
      if (response.status === 200 || response.status === 204) {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
        setSuccess(`User ${userToDelete.first_name || 'Unknown'} ${userToDelete.last_name || 'User'} deleted successfully!`);
        
        setTimeout(() => {
          fetchUsers();
        }, 1000);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
      
    } catch (err) {
      console.error('User deletion error:', err);
      setError('Failed to delete user: ' + (err.response?.data?.error || err.message));
      fetchUsers();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">User Management</Typography>
        {user && user.role === 'admin' && (
          <Button variant="contained" onClick={handleOpen}>Add User</Button>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.first_name}</TableCell>
                    <TableCell>{u.last_name}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      {user && user.role === 'admin' && (
                        <Box display="flex" alignItems="center" gap={1}>
                          {confirmingDelete === u.id ? (
                            // Show inline confirmation buttons
                            <>
                              <Chip 
                                label="Delete this user?" 
                                color="error" 
                                size="small" 
                                sx={{ mr: 1 }}
                              />
                              <IconButton 
                                color="success" 
                                onClick={(e) => handleDeleteConfirm(e, u)}
                                title="Confirm Delete"
                                size="small"
                                disabled={deleting}
                              >
                                <CheckIcon />
                              </IconButton>
                              <IconButton 
                                color="default" 
                                onClick={handleDeleteCancel}
                                title="Cancel Delete"
                                size="small"
                                disabled={deleting}
                              >
                                <CloseIcon />
                              </IconButton>
                            </>
                          ) : (
                            // Show normal delete button
                            <IconButton 
                              color="error" 
                              onClick={(e) => handleDeleteClick(e, u)}
                              title="Delete User"
                              size="small"
                              disabled={deleting || confirmingDelete !== null}
                            >
                              {deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <form id="user-form" onSubmit={handleSubmit}>
            <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" select required >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField label="Department" name="department" value={form.department} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} fullWidth margin="normal" />
            <TextField label="Send Email" name="send_email" value={form.send_email} onChange={handleChange} fullWidth margin="normal" type="checkbox" />
            <TextField label="Accessible Modules" name="accessible_modules" value={form.accessible_modules} onChange={handleChange} fullWidth margin="normal" />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="user-form" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
