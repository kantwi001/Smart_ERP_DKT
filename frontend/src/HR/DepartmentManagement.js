import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';

const DepartmentForm = ({ open, onClose, department, users, onSaved }) => {
  const [form, setForm] = useState(department || { name: '', supervisor: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(department || { name: '', supervisor: '' });
    setError('');
  }, [department, open]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      if (form.id) {
        await api.patch(`/hr/departments/${form.id}/`, form);
      } else {
        await api.post('/hr/departments/', form);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError('Failed to save department.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{form.id ? 'Edit Department' : 'Add Department'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <FormControl fullWidth margin="normal">
          <InputLabel>Department</InputLabel>
          <Select name="name" value={form.name} label="Department" onChange={handleChange} required disabled={!!form.id}>
            <MenuItem value="">Select</MenuItem>
            <MenuItem value="FINANCE">Finance</MenuItem>
            <MenuItem value="OPERATIONS">Operations</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="CD">CD</MenuItem>
            <MenuItem value="M&E/NBD">M&E/NBD</MenuItem>
            <MenuItem value="PROGRAMS">Programs</MenuItem>
            <MenuItem value="LOGISTICS/PROCUREMENT/SUPPLY CHAIN">Logistics/Procurement/Supply Chain</MenuItem>
            <MenuItem value="SALES">Sales</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Supervisor (HOD)</InputLabel>
          <Select name="supervisor" value={form.supervisor || ''} label="Supervisor (HOD)" onChange={handleChange} required>
            <MenuItem value="">None</MenuItem>
            {users.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.username} ({u.first_name} {u.last_name})</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [editDept, setEditDept] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/hr/departments/').then(res => setDepartments(res.data));
    api.get('/users/').then(res => setUsers(res.data));
  }, [refresh]);

  const handleEdit = dept => setEditDept(dept);
  const handleAdd = () => setEditDept({});
  const handleSaved = () => setRefresh(r => !r);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Department Management</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" color="primary" onClick={handleAdd} sx={{ mb: 2 }}>Add Department</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Supervisor (HOD)</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {departments.map(dept => (
            <TableRow key={dept.id}>
              <TableCell>{dept.name}</TableCell>
              <TableCell>{dept.supervisor_username || ''}</TableCell>
              <TableCell>
                <Button size="small" variant="outlined" onClick={() => handleEdit(dept)}>Edit</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editDept && (
        <DepartmentForm
          open={!!editDept}
          department={editDept}
          users={users}
          onClose={() => setEditDept(null)}
          onSaved={handleSaved}
        />
      )}
      {/* Users Table for Department Assignment */}
      <Typography variant="h6" mt={4} mb={2}>User Department Assignment</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <UserRow key={u.id} user={u} departments={departments} onUpdated={handleSaved} />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// Inline user row editing for department assignment
const UserRow = ({ user, departments, onUpdated }) => {
  const [dept, setDept] = useState(user.department || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setDept(e.target.value);

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log(`🔄 Updating user ${user.id} department to ${dept}`);
      await api.patch(`/users/${user.id}/`, { department: dept });
      
      // Show success message
      setSuccess('Department updated successfully!');
      
      // Trigger parent component refresh
      if (onUpdated) onUpdated();
      
      // IMPORTANT: Refresh user profile in AuthContext if this is the current user
      // This ensures the department change is reflected throughout the app
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === user.id) {
        console.log(`🔄 Refreshing current user profile after department change`);
        try {
          const updatedUserResponse = await api.get('/users/me/');
          const updatedUser = updatedUserResponse.data;
          
          // Update localStorage with new user data
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Trigger a custom event to notify other components
          window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
            detail: updatedUser 
          }));
          
          console.log(`✅ User profile refreshed with new department: ${updatedUser.department_name}`);
        } catch (refreshError) {
          console.warn('Could not refresh user profile:', refreshError);
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      console.error('Failed to update user department:', err);
      setError('Failed to update department.');
    }
    setLoading(false);
  };

  return (
    <TableRow>
      <TableCell>{user.username} ({user.first_name} {user.last_name})</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <Select
          value={dept || ''}
          onChange={handleChange}
          size="small"
          displayEmpty
        >
          <MenuItem value="">None</MenuItem>
          {departments.map(d => (
            <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={loading || dept === user.department}
        >
          {loading ? 'Updating...' : 'Update'}
        </Button>
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
      </TableCell>
    </TableRow>
  );
};

export default DepartmentManagement;
