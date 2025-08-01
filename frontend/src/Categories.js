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

  useEffect(() => { fetchCategories(); }, [token]);
  const fetchCategories = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/categories/', { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch { setError('Failed to load categories.'); }
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
        await api.put(`/categories/${editCategory.id}/`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/categories/', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchCategories(); handleClose();
    } catch { setError('Failed to save category.'); }
  };
  const handleDelete = async id => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCategories();
    } catch { setError('Failed to delete category.'); }
  };
  if (!user || user.role !== 'sales') return <Alert severity="error">Access denied. Only Sales users can manage Categories.</Alert>;
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
