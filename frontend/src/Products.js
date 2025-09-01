import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, InputAdornment } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Products = () => {
  const { token, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '', image_url: '', category: '' });
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, [token]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/sales/categories/', { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data);
    } catch {}
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    // Example: upload to /api/upload/ endpoint (backend must support this)
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload/', formData, {
        headers: { Authorization: `Bearer ${token}`,'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, image_url: res.data.url }));
    } catch {}
    setUploading(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/inventory/products/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        image_url: product.image_url || '',
        category: product.category || ''
      });
    } else {
      setEditProduct(null);
      setForm({ name: '', sku: '', price: '', quantity: '', image_url: '', category: '' });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editProduct) {
        await api.put(`/inventory/products/${editProduct.id}/`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await api.post('/inventory/products/', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchProducts();
      handleClose();
    } catch (err) {
      setError('Failed to save product.');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/inventory/products/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (!user || user.role !== 'sales') {
    return <Alert severity="error">Access denied. Only Sales users can access Products.</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>Products</Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Button variant="contained" onClick={() => handleOpen()}>Add Product</Button>
        <TextField label="Search" size="small" sx={{ ml: 2 }} value={search} onChange={e => setSearch(e.target.value)} />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Edit</TableCell>
                <TableCell>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No products found.</TableCell>
                </TableRow>
              ) : (
                filteredProducts.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: 40, height: 40, objectFit: 'cover' }} /> : '-'}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{categories.find(c => c.id === product.category)?.name || product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell><IconButton size="small" onClick={() => handleOpen(product)}><EditIcon /></IconButton></TableCell>
                    <TableCell><IconButton size="small" color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent>
          <form id="product-form" onSubmit={handleSubmit}>
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="SKU" name="sku" value={form.sku} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Price" name="price" value={form.price} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="Category" name="category" value={form.category} onChange={handleChange} select fullWidth margin="normal" required>
              {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
            </TextField>
            <TextField label="Image URL" name="image_url" value={form.image_url} onChange={handleChange} fullWidth margin="normal"
              InputProps={{ endAdornment: uploading ? <InputAdornment position="end">Uploading...</InputAdornment> : null }}
            />
            <Button variant="outlined" component="label" sx={{ mt: 1 }} disabled={uploading}>
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {form.image_url && <img src={form.image_url} alt="Preview" style={{ width: 60, height: 60, objectFit: 'cover', marginTop: 8 }} />}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="product-form" variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
