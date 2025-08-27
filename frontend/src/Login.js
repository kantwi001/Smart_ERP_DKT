import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Container,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Dashboard,
  Inventory,
  People,
  PointOfSale,
  Assessment,
  AccountBalance,
  Security,
  CheckCircle
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import api from './api';
import './mobile.css'; // Import mobile styles

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallPhone = useMediaQuery('(max-width:480px)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Handle viewport height for mobile browsers
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Extract username from email if it contains @
      const username = email.includes('@') ? email.split('@')[0] : email;
      await login(username, password, rememberMe);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotLoading(true);
    try {
      await api.post('/users/forgot-password/', { email: forgotEmail });
      setForgotSuccess(true);
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotSuccess(false);
        setForgotEmail('');
      }, 3000);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const demoUsers = [
    { label: 'Admin', email: 'admin@erp.com', password: 'admin123', color: '#1976d2' },
    { label: 'Manager', email: 'manager@erp.com', password: 'manager123', color: '#388e3c' },
    { label: 'Employee', email: 'employee@erp.com', password: 'employee123', color: '#f57c00' },
    { label: 'Sales', email: 'sales@erp.com', password: 'sales123', color: '#7b1fa2' }
  ];

  const fillDemoCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  // Dynamic grid configuration based on screen size and orientation
  const getGridConfig = () => {
    if (isMobile && isLandscape) {
      return { brandingSize: 5, formSize: 7 };
    }
    if (isMobile) {
      return { brandingSize: 12, formSize: 12 };
    }
    return { brandingSize: 6, formSize: 6 };
  };

  const { brandingSize, formSize } = getGridConfig();

  return (
    <Box
      className="login-page-container mobile-optimized"
      sx={{
        minHeight: '100vh',
        minHeight: 'calc(var(--vh, 1vh) * 100)', // Use CSS custom property for mobile
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(56, 142, 60, 0.1) 0%, transparent 50%)
          `,
          zIndex: 1
        }
      }}
    >
      <Container 
        maxWidth={isMobile ? false : "lg"} 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          width: isMobile ? '100%' : 'auto',
          maxWidth: isMobile ? '100%' : '1200px',
          px: isMobile ? 0 : 3
        }}
      >
        <Grid 
          container 
          spacing={0} 
          className="login-grid-container" 
          sx={{ 
            minHeight: isMobile ? 'calc(var(--vh, 1vh) * 100)' : '80vh',
            flexDirection: isMobile && !isLandscape ? 'column' : 'row'
          }}
        >
          {/* Left Side - Branding */}
          <Grid 
            item 
            xs={brandingSize}
            className="login-branding-section"
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              alignItems: 'center',
              p: isMobile ? (isSmallPhone ? 2 : 3) : 4,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              borderRadius: isMobile ? (isLandscape ? '20px 0 0 20px' : '20px 20px 0 0') : '20px 0 0 20px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              minHeight: isMobile && !isLandscape ? '35vh' : 'auto',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                  radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 50%)
                `,
                zIndex: 1
              }
            }}
          >
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                {/* Smart ERP Software Logo */}
                <Box
                  sx={{
                    width: { xs: 120, sm: 150 },
                    height: { xs: 120, sm: 150 },
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '20px',
                    padding: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: '2px solid rgba(25, 118, 210, 0.1)',
                  }}
                >
                  <img
                    src="/smart-erp-logo.png"
                    alt="Smart ERP Software"
                    style={{
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1976d2',
                    textAlign: 'center',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                    mb: 1,
                  }}
                >
                  Smart ERP
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#666',
                    textAlign: 'center',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    fontWeight: 500,
                  }}
                >
                  SOFTWARE
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#888',
                    textAlign: 'center',
                    mt: 1,
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  }}
                >
                  Complete Business Management Solution
                </Typography>
              </Box>
              {/* Feature Icons - Only show if there's enough space */}
              {(!isMobile || !isSmallPhone || isLandscape) && (
                <Grid container spacing={isMobile ? 1 : 3} className="feature-icons-grid" justifyContent="center">
                  {[
                    { icon: Dashboard, text: 'Analytics' },
                    { icon: Inventory, text: 'Inventory' },
                    { icon: People, text: 'HR' },
                    { icon: PointOfSale, text: 'POS' },
                    { icon: Assessment, text: 'Reports' },
                    { icon: AccountBalance, text: 'Finance' }
                  ].map((feature, index) => (
                    <Grid item xs={4} sm={2} key={index}>
                      <Box 
                        className="feature-icon-item"
                        sx={{ 
                          textAlign: 'center',
                          opacity: 0.8,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            opacity: 1,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <feature.icon 
                          className="feature-icon" 
                          sx={{ 
                            fontSize: isMobile ? (isSmallPhone ? 20 : 24) : 32, 
                            mb: 0.5 
                          }} 
                        />
                        <Typography 
                          variant="caption" 
                          className="feature-text" 
                          display="block"
                          sx={{
                            fontSize: isMobile ? (isSmallPhone ? '0.6rem' : '0.7rem') : '0.75rem'
                          }}
                        >
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid 
            item 
            xs={formSize}
            className="login-form-section"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: isMobile ? (isSmallPhone ? 2 : 3) : 5,
              minHeight: isMobile && !isLandscape ? '65vh' : 'auto',
              maxHeight: isMobile && !isLandscape ? '65vh' : 'none',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <Card 
              elevation={0}
              className="login-card"
              sx={{ 
                width: '100%',
                maxWidth: isMobile ? '100%' : 400,
                background: 'white',
                borderRadius: isMobile ? (isLandscape ? '0 20px 20px 0' : '0 0 20px 20px') : '0 20px 20px 0',
                boxShadow: isMobile ? 'none' : '0 10px 40px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent sx={{ p: isMobile ? (isSmallPhone ? 3 : 4) : 5 }}>
                {/* Header */}
                <Box textAlign="center" className="form-header" mb={isMobile ? 3 : 4}>
                  <Security className="form-security-icon" sx={{ 
                    fontSize: isMobile ? (isSmallPhone ? 36 : 40) : 48, 
                    color: '#1976d2',
                    mb: isMobile ? 1 : 2
                  }} />
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    className="form-welcome-title"
                    sx={{ 
                      fontWeight: 600,
                      color: '#1976d2',
                      mb: 0.5,
                      fontSize: isMobile ? (isSmallPhone ? '1.3rem' : '1.5rem') : '2rem'
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography 
                    variant="body2" 
                    className="form-welcome-subtitle"
                    sx={{ 
                      color: 'rgba(0,0,0,0.6)',
                      fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem'
                    }}
                  >
                    Please sign in to your account
                  </Typography>
                </Box>

                {/* Demo Credentials */}
                <Box className="demo-credentials-section" mb={isMobile ? 2 : 3}>
                  <Typography 
                    variant="body2" 
                    className="demo-credentials-title" 
                    sx={{ 
                      mb: isMobile ? 1 : 2, 
                      color: 'rgba(0,0,0,0.7)', 
                      fontWeight: 500,
                      textAlign: 'center',
                      fontSize: isMobile ? (isSmallPhone ? '0.75rem' : '0.8rem') : '0.875rem'
                    }}
                  >
                    Quick Demo Access:
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    className="demo-chips-container" 
                    flexWrap="wrap" 
                    useFlexGap
                    justifyContent="center"
                  >
                    {demoUsers.map((user, index) => (
                      <Chip
                        key={index}
                        label={user.label}
                        className="demo-chip"
                        onClick={() => fillDemoCredentials(user)}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor: `${user.color}15`,
                          color: user.color,
                          border: `1px solid ${user.color}30`,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: isMobile ? (isSmallPhone ? '0.65rem' : '0.75rem') : '0.875rem',
                          height: isMobile ? (isSmallPhone ? 24 : 28) : 32,
                          '&:hover': {
                            backgroundColor: `${user.color}25`,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${user.color}20`
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    className="login-input"
                    size={isMobile ? "medium" : "large"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#1976d2', fontSize: isMobile ? 20 : 24 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: isMobile ? '16px' : '1rem', // Prevent zoom on iOS
                        minHeight: isMobile ? 48 : 56
                      }
                    }}
                    InputLabelProps={{
                      sx: {
                        fontSize: isMobile ? '16px' : '1rem'
                      }
                    }}
                    sx={{ 
                      mb: isMobile ? 2 : 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2'
                          }
                        }
                      }
                    }}
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    className="login-input"
                    size={isMobile ? "medium" : "large"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#1976d2', fontSize: isMobile ? 20 : 24 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size={isMobile ? "small" : "medium"}
                            sx={{ 
                              minWidth: isMobile ? 40 : 48,
                              minHeight: isMobile ? 40 : 48
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: isMobile ? '16px' : '1rem',
                        minHeight: isMobile ? 48 : 56
                      }
                    }}
                    InputLabelProps={{
                      sx: {
                        fontSize: isMobile ? '16px' : '1rem'
                      }
                    }}
                    sx={{ 
                      mb: isMobile ? 2 : 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2'
                          }
                        }
                      }
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#1976d2',
                          '&.Mui-checked': {
                            color: '#1976d2',
                          },
                        }}
                      />
                    }
                    label="Remember Me"
                    sx={{
                      fontSize: isMobile ? (isSmallPhone ? '0.8rem' : '0.875rem') : '1rem',
                      mb: isMobile ? 2 : 2.5,
                    }}
                  />

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 2, 
                        borderRadius: 2,
                        fontSize: isMobile ? (isSmallPhone ? '0.8rem' : '0.875rem') : '1rem'
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    className="login-button"
                    sx={{ 
                      py: isMobile ? 1.5 : 2,
                      borderRadius: 2,
                      fontSize: isMobile ? '16px' : '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      minHeight: isMobile ? 48 : 56,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                      touchAction: 'manipulation',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                      '&:active': {
                        transform: 'scale(0.98)'
                      },
                      '&:disabled': {
                        background: 'rgba(0, 0, 0, 0.12)',
                        color: 'rgba(0, 0, 0, 0.26)'
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress 
                        size={isMobile ? 20 : 24} 
                        color="inherit" 
                        thickness={4}
                      />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>

                {/* Forgot Password Link */}
                <Box textAlign="center" mt={isMobile ? 2 : 3}>
                  <Button
                    variant="text"
                    className="forgot-password-link"
                    onClick={() => setForgotPasswordOpen(true)}
                    size={isMobile ? "medium" : "large"}
                    sx={{
                      color: '#1976d2',
                      fontWeight: 500,
                      textTransform: 'none',
                      minHeight: isMobile ? 44 : 48,
                      fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem',
                      touchAction: 'manipulation',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                      }
                    }}
                  >
                    Forgot your password?
                  </Button>
                </Box>

                {/* Footer */}
                <Box textAlign="center" className="login-footer" mt={isMobile ? 3 : 4}>
                  <Divider className="login-footer-divider" sx={{ mb: isMobile ? 1.5 : 2 }} />
                  <Typography 
                    variant="body2" 
                    className="login-footer-text"
                    sx={{ 
                      color: 'rgba(0,0,0,0.5)',
                      fontSize: isMobile ? (isSmallPhone ? '0.7rem' : '0.75rem') : '0.875rem',
                      lineHeight: 1.4
                    }}
                  >
                    2024 ERP System • Secure Business Management
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile && isSmallPhone}
        className="forgot-password-dialog"
        PaperProps={{
          sx: {
            borderRadius: isMobile ? (isSmallPhone ? 0 : 3) : 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            margin: isMobile ? (isSmallPhone ? 0 : 2) : 3,
            width: isMobile ? (isSmallPhone ? '100%' : 'calc(100% - 32px)') : 'auto',
            maxHeight: isMobile ? '90vh' : '80vh'
          }
        }}
      >
        <DialogTitle 
          className="dialog-title" 
          sx={{ 
            textAlign: 'center',
            pb: 1,
            color: '#1976d2',
            fontWeight: 600,
            fontSize: isMobile ? (isSmallPhone ? '1.1rem' : '1.25rem') : '1.5rem',
            px: isMobile ? 2 : 3,
            pt: isMobile ? 2 : 3
          }}
        >
          <Security sx={{ mr: 1, verticalAlign: 'middle', fontSize: 'inherit' }} />
          Reset Your Password
        </DialogTitle>
        
        <DialogContent 
          className="dialog-content" 
          sx={{ 
            pt: 1,
            px: isMobile ? 2 : 3,
            fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem'
          }}
        >
          {forgotSuccess ? (
            <Box textAlign="center" py={isMobile ? 2 : 3}>
              <CheckCircle sx={{ 
                fontSize: isMobile ? 40 : 48, 
                color: '#4caf50', 
                mb: isMobile ? 1.5 : 2 
              }} />
              <Typography 
                variant="h6" 
                color="primary" 
                mb={1}
                sx={{
                  fontSize: isMobile ? (isSmallPhone ? '1.1rem' : '1.25rem') : '1.5rem'
                }}
              >
                Reset Email Sent!
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{
                  fontSize: isMobile ? (isSmallPhone ? '0.8rem' : '0.875rem') : '1rem'
                }}
              >
                Check your email for password reset instructions.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography 
                variant="body1" 
                mb={3} 
                sx={{ 
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem',
                  lineHeight: 1.5
                }}
              >
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <TextField
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                fullWidth
                required
                size={isMobile ? "medium" : "large"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#1976d2', fontSize: isMobile ? 20 : 24 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: isMobile ? '16px' : '1rem',
                    minHeight: isMobile ? 48 : 56
                  }
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: isMobile ? '16px' : '1rem'
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        
        {!forgotSuccess && (
          <DialogActions 
            className="dialog-actions" 
            sx={{ 
              p: isMobile ? 2 : 3, 
              pt: 1,
              gap: isMobile ? 1 : 1.5,
              flexDirection: isMobile && isSmallPhone ? 'column' : 'row'
            }}
          >
            <Button 
              onClick={() => setForgotPasswordOpen(false)}
              className="dialog-button"
              size={isMobile ? "medium" : "large"}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minHeight: isMobile ? 44 : 48,
                fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem',
                flex: isMobile && isSmallPhone ? '1' : 'auto',
                width: isMobile && isSmallPhone ? '100%' : 'auto',
                touchAction: 'manipulation'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleForgotPassword}
              variant="contained"
              disabled={forgotLoading}
              className="dialog-button"
              size={isMobile ? "medium" : "large"}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minHeight: isMobile ? 44 : 48,
                fontSize: isMobile ? (isSmallPhone ? '0.85rem' : '0.9rem') : '1rem',
                flex: isMobile && isSmallPhone ? '1' : 'auto',
                width: isMobile && isSmallPhone ? '100%' : 'auto',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                touchAction: 'manipulation',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                }
              }}
            >
              {forgotLoading ? (
                <CircularProgress 
                  size={isMobile ? 18 : 20} 
                  color="inherit" 
                  thickness={4}
                />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default Login;
