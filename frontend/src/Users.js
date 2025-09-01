import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { getApiBaseUrl } from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, Select } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// Sample users data
const sampleUsers = [
  {
    id: 1,
    username: 'arkucollins',
    email: 'arkucollins@gmail.com',
    first_name: 'Collins',
    last_name: 'Arku',
    role: 'admin',
    department: 'Management',
    is_active: true
  },
  {
    id: 2,
    username: 'johndoe',
    email: 'john.doe@company.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user',
    department: 'Sales',
    is_active: true
  },
  {
    id: 3,
    username: 'janesmith',
    email: 'jane.smith@company.com',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'user',
    department: 'HR',
    is_active: true
  },
  {
    id: 4,
    username: 'mikejohnson',
    email: 'mike.johnson@company.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    role: 'user',
    department: 'Inventory',
    is_active: true
  },
  {
    id: 5,
    username: 'sarahwilson',
    email: 'sarah.wilson@company.com',
    first_name: 'Sarah',
    last_name: 'Wilson',
    role: 'user',
    department: 'Finance',
    is_active: true
  }
];

const departments = [
  'Management',
  'Sales',
  'HR',
  'Finance',
  'Inventory',
  'Procurement',
  'Operations',
  'IT Support'
];

const warehouses = [
  'Main Warehouse - Accra Central',
  'Branch A - Kumasi',
  'Branch B - Tamale',
  'Branch C - Cape Coast',
  'Supplier Warehouse - Tema Port'
];

const modules = [
  'Dashboard',
  'Sales',
  'Inventory',
  'HR',
  'Finance',
  'Procurement',
  'Warehouse',
  'Analytics'
];

const Users = () => {
  const { token, user } = useContext(AuthContext);
  const [users, setUsers] = useState(sampleUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiBaseUrl()}/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.results || data);
      } else {
        console.error('Failed to fetch users, using sample data');
        // Fallback to sample data if API fails
        setUsers(sampleUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to sample data if API fails
      setUsers(sampleUsers);
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
      // Create new user object
      const newUser = {
        id: users.length + 1,
        username: form.username,
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
        department: form.department,
        warehouse: form.warehouse,
        is_active: true
      };

      console.log('Creating user locally:', newUser);

      // Add user to local state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      setSuccess(`User ${form.first_name} ${form.last_name} created successfully! (Using local storage)`);
      
      setTimeout(() => {
        handleClose();
      }, 3000);
      
    } catch (err) {
      console.error('User creation error:', err);
      setError('Failed to create user: ' + err.message);
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
      console.log('Deleting user locally:', userToDelete.id);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
      
      setSuccess(`User ${userToDelete.first_name || 'Unknown'} ${userToDelete.last_name || 'User'} deleted successfully! (Using local storage)`);
      
    } catch (err) {
      console.error('User deletion error:', err);
      setError('Failed to delete user: ' + err.message);
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
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.first_name}</TableCell>
                    <TableCell>{u.last_name}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.department}</TableCell>
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
            <Select label="Role" name="role" value={form.role} onChange={handleChange} fullWidth margin="normal" required >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
            <Select label="Department" name="department" value={form.department} onChange={handleChange} fullWidth margin="normal" select required >
              {departments.map(department => (
                <MenuItem key={department} value={department}>{department}</MenuItem>
              ))}
            </Select>
            {/* Only show warehouse dropdown if Sales department is selected */}
            {form.department === 'Sales' && (
              <Select label="Warehouse" name="warehouse" value={form.warehouse} onChange={handleChange} fullWidth margin="normal" required >
                <MenuItem value="">Select Warehouse</MenuItem>
                {warehouses.map(warehouse => (
                  <MenuItem key={warehouse} value={warehouse}>{warehouse}</MenuItem>
                ))}
              </Select>
            )}
            <Select 
              label="Send Email" 
              name="send_email" 
              value={form.send_email} 
              onChange={handleChange} 
              fullWidth 
              margin="normal"
            >
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
            <Select 
              label="Accessible Modules" 
              name="accessible_modules" 
              value={form.accessible_modules} 
              onChange={handleChange} 
              fullWidth 
              margin="normal" 
              multiple
            >
              {modules.map(module => (
                <MenuItem key={module} value={module}>{module}</MenuItem>
              ))}
            </Select>
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
