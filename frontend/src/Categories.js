import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Categories = () => {
  const { token, user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editCategory, setEditCategory] = useState(null);

  // Sample categories data
  const sampleCategories = [
    { id: 1, name: 'Electronics', description: 'Electronic devices and accessories' },
    { id: 2, name: 'Furniture', description: 'Office and home furniture' },
    { id: 3, name: 'Office Supplies', description: 'General office supplies and stationery' },
    { id: 4, name: 'Stationery', description: 'Writing materials and paper products' },
    { id: 5, name: 'Software', description: 'Software licenses and digital products' }
  ];

  useEffect(() => { fetchCategories(); }, [token]);
  const fetchCategories = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/api/categories/', { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch (err) { 
      console.log('Categories API not available, using sample data');
      setCategories(sampleCategories);
    }
    finally { setLoading(false); }
  };
  const handleOpen = (cat = null) => {
    setEditCategory(cat);
    setForm(cat ? { name: cat.name, description: cat.description } : { name: '', description: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editCategory) {
        await api.put(`/api/categories/${editCategory.id}/`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/api/categories/', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchCategories(); handleClose();
    } catch { setError('Failed to save category.'); }
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/api/categories/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    } catch { setError('Failed to delete category.'); }
  };

  // Check if user is in Sales department or has sales role
  const isSalesUser = (user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales') || 
                     (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales') ||
                     user?.role === 'sales_manager' ||
                     user?.role === 'sales_rep' ||
                     user?.role === 'sales' ||
                     (user?.role === 'employee' && ((user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales') || (user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales')));

  // Allow superusers and admins temporary access for debugging
  const hasAccess = isSalesUser || user?.is_superuser || user?.role === 'admin' || user?.role === 'superadmin';

  // Debug logging
  console.log('🔍 Categories Access Debug:', {
    user: user,
    username: user?.username,
    email: user?.email,
    role: user?.role,
    department: user?.department,
    department_name: user?.department_name,
    is_superuser: user?.is_superuser,
    isSalesUser: isSalesUser,
    hasAccess: hasAccess,
    'department_name check': user?.department_name && typeof user.department_name === 'string' && user.department_name.toLowerCase() === 'sales',
    'department check': user?.department && typeof user.department === 'string' && user.department.toLowerCase() === 'sales',
    'role checks': {
      sales_manager: user?.role === 'sales_manager',
      sales_rep: user?.role === 'sales_rep', 
      sales: user?.role === 'sales',
      admin: user?.role === 'admin',
      superadmin: user?.role === 'superadmin'
    }
  });

  if (!user || !hasAccess) return <Alert severity="error">Access denied. Only Sales users can manage Categories.</Alert>;

  return (
    <Box>
      <Typography variant="h5" mb={2}>Categories</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpen()}>Add Category</Button>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Edit</TableCell><TableCell>Delete</TableCell></TableRow></TableHead>
            <TableBody>
              {categories.length === 0 ? (<TableRow><TableCell colSpan={4} align="center">No categories found.</TableCell></TableRow>) : (
                categories.map(cat => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.description}</TableCell>
                    <TableCell><IconButton size="small" onClick={() => handleOpen(cat)}><EditIcon /></IconButton></TableCell>
                    <TableCell><IconButton size="small" color="error" onClick={() => handleDelete(cat.id)}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          <form id="category-form" onSubmit={handleSubmit}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="category-form" variant="contained">{editCategory ? 'Save' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default Categories;
