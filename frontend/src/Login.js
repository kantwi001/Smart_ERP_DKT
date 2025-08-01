import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper, IconButton, InputAdornment, Link as MuiLink } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, loading, error, user } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  // Demo credentials placeholder
  const demoUsers = [
    { username: 'demo1', password: 'password123' },
    { username: 'demo2', password: 'password123' }
  ];

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={5} sx={{ p: 4, minWidth: 340 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <MuiLink component={Link} to="/register">Register</MuiLink>
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">Demo Credentials (for training):</Typography>
          {demoUsers.map((u, i) => (
            <Typography key={i} variant="caption">{u.username} / {u.password}</Typography>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
