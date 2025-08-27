import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert,
  Tabs, Tab, Paper, Chip, Avatar, LinearProgress, Divider, IconButton, List, ListItem, ListItemText, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, InputAdornment
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SettingsIcon from '@mui/icons-material/Settings';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import TestIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import api from './api';
import { AuthContext } from './AuthContext';
import WorkflowApprovalProcess from './components/workflows/WorkflowApprovalProcess';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#FF5722',
  },
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(255, 87, 34, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(255, 87, 34, 0.4)',
  },
}));

const ConfigCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid #f0f0f0',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`system-settings-tabpanel-${index}`}
      aria-labelledby={`system-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SystemSettingsDashboard = () => {
  const { user, token, systemSettings, fetchSystemSettings, updateSystemSettings } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Local state for form modifications (before saving)
  const [localSmtpSettings, setLocalSmtpSettings] = useState(systemSettings.smtp);
  const [localSystemSettings, setLocalSystemSettings] = useState({
    siteName: systemSettings.general.siteName,
    siteDescription: 'Enterprise Resource Planning System',
    maintenanceMode: systemSettings.general.maintenanceMode,
    registrationEnabled: systemSettings.general.registrationEnabled,
    defaultUserRole: 'employee',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordComplexity: true,
    enableTwoFactor: false,
    backupFrequency: 'daily',
    logRetentionDays: 90,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: systemSettings.notifications.emailNotifications,
    smsNotifications: false,
    pushNotifications: true,
    userRegistration: true,
    passwordReset: true,
    systemAlerts: systemSettings.notifications.systemAlerts,
    maintenanceNotices: true,
    securityAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
  });

  // Check if user is superuser
  const isSuperuser = user?.role === 'superadmin' || user?.is_superuser;

  // Sync local state with global system settings when they change
  useEffect(() => {
    setLocalSmtpSettings(systemSettings.smtp);
    setLocalSystemSettings(prev => ({
      ...prev,
      siteName: systemSettings.general.siteName,
      maintenanceMode: systemSettings.general.maintenanceMode,
      registrationEnabled: systemSettings.general.registrationEnabled,
    }));
    setNotificationSettings(prev => ({
      ...prev,
      emailNotifications: systemSettings.notifications.emailNotifications,
      systemAlerts: systemSettings.notifications.systemAlerts,
    }));
  }, [systemSettings]);

  useEffect(() => {
    if (!isSuperuser) {
      setError('Access denied. Only superusers can access System Settings.');
      return;
    }
    // System settings are now loaded globally via AuthContext
  }, [isSuperuser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSmtpSettingChange = (key, value) => {
    setLocalSmtpSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async (settingsType) => {
    try {
      let settingsData = {};
      
      // Prepare data based on settings type
      if (settingsType === 'general') {
        settingsData = {
          site_name: localSystemSettings.siteName,
          site_description: localSystemSettings.siteDescription,
          maintenance_mode: localSystemSettings.maintenanceMode,
          registration_enabled: localSystemSettings.registrationEnabled,
          default_user_role: localSystemSettings.defaultUserRole,
          session_timeout: localSystemSettings.sessionTimeout,
          max_login_attempts: localSystemSettings.maxLoginAttempts,
          password_min_length: localSystemSettings.passwordMinLength,
          require_password_complexity: localSystemSettings.requirePasswordComplexity,
          enable_two_factor: localSystemSettings.enableTwoFactor,
          backup_frequency: localSystemSettings.backupFrequency,
          log_retention_days: localSystemSettings.logRetentionDays,
        };
      } else if (settingsType === 'smtp') {
        settingsData = {
          smtp_enabled: localSmtpSettings.enabled,
          smtp_host: localSmtpSettings.host,
          smtp_port: localSmtpSettings.port,
          smtp_username: localSmtpSettings.username,
          smtp_password: localSmtpSettings.password,
          smtp_use_tls: localSmtpSettings.useTLS,
          smtp_use_ssl: localSmtpSettings.useSSL,
          smtp_from_email: localSmtpSettings.fromEmail,
          smtp_from_name: localSmtpSettings.fromName,
        };
      } else if (settingsType === 'notifications') {
        settingsData = {
          email_notifications: notificationSettings.emailNotifications,
          sms_notifications: notificationSettings.smsNotifications,
          push_notifications: notificationSettings.pushNotifications,
          user_registration_notifications: notificationSettings.userRegistration,
          password_reset_notifications: notificationSettings.passwordReset,
          system_alerts: notificationSettings.systemAlerts,
          maintenance_notices: notificationSettings.maintenanceNotices,
          security_alerts: notificationSettings.securityAlerts,
          daily_reports: notificationSettings.dailyReports,
          weekly_reports: notificationSettings.weeklyReports,
          monthly_reports: notificationSettings.monthlyReports,
        };
      }
      
      // Use global updateSystemSettings function
      const success = await updateSystemSettings(settingsType, settingsData);
      
      if (success) {
        setSnackbarMessage(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`);
        setSnackbarOpen(true);
        
        console.log(`✅ ${settingsType} settings persisted globally across all modules`);
      } else {
        throw new Error(`Failed to save ${settingsType} settings`);
      }
    } catch (err) {
      console.error(`Error saving ${settingsType} settings:`, err);
      setSnackbarMessage(`Failed to save ${settingsType} settings. Please try again.`);
      setSnackbarOpen(true);
    }
  };

  const handleTestSMTP = async () => {
    if (!localSmtpSettings.testEmail) {
      setSnackbarMessage('Please enter a test email address');
      setSnackbarOpen(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2025/api/users/system/smtp/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          test_email: localSmtpSettings.testEmail
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSnackbarMessage(data.message || 'Test email sent successfully!');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(data.error || 'Failed to send test email');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('SMTP test error:', error);
      setSnackbarMessage('Error testing SMTP settings. Please check your configuration.');
      setSnackbarOpen(true);
    }
  };

  if (!isSuperuser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Access Denied
          </Typography>
          <Typography>
            Only superusers can access System Settings. Please contact your administrator.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress size={60} sx={{ color: '#FF5722' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AdminPanelSettingsIcon sx={{ fontSize: 40, mr: 2 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                System Settings
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Configure system behavior, SMTP server, and notification settings
              </Typography>
            </Box>
          </Box>
          <QuickActionButton
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchSystemSettings}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Refresh Settings
          </QuickActionButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: 3, pt: 2 }}>
        <StyledTabs value={tabValue} onChange={handleTabChange} aria-label="system settings tabs">
          <StyledTab label="General Settings" icon={<SettingsIcon />} />
          <StyledTab label="SMTP Configuration" icon={<EmailIcon />} />
          <StyledTab label="Notifications" icon={<NotificationsIcon />} />
          <StyledTab label="Security" icon={<SecurityIcon />} />
          <StyledTab label="Workflow Approval" icon={<WorkflowIcon />} />
        </StyledTabs>
      </Box>

      {/* General Settings Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ConfigCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <SettingsIcon sx={{ mr: 2, color: '#FF5722' }} />
                  General System Configuration
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Site Name"
                      value={localSystemSettings.siteName}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Default User Role"
                      select
                      value={localSystemSettings.defaultUserRole}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, defaultUserRole: e.target.value }))}
                    >
                      <MenuItem value="employee">Employee</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Site Description"
                      multiline
                      rows={2}
                      value={localSystemSettings.siteDescription}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={localSystemSettings.sessionTimeout}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={localSystemSettings.maxLoginAttempts}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSystemSettings.maintenanceMode}
                            onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                            color="warning"
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSystemSettings.registrationEnabled}
                            onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
                            color="primary"
                          />
                        }
                        label="User Registration Enabled"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSystemSettings.requirePasswordComplexity}
                            onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, requirePasswordComplexity: e.target.checked }))}
                            color="secondary"
                          />
                        }
                        label="Require Password Complexity"
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <QuickActionButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSettings('general')}
                    sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
                  >
                    Save General Settings
                  </QuickActionButton>
                </Box>
              </CardContent>
            </ConfigCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* SMTP Configuration Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ConfigCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 2, color: '#FF5722' }} />
                  SMTP Server Configuration
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSmtpSettings.enabled}
                        onChange={(e) => handleSmtpSettingChange('enabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Enable SMTP Email Service"
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Host"
                      value={localSmtpSettings.host}
                      onChange={(e) => handleSmtpSettingChange('host', e.target.value)}
                      disabled={!localSmtpSettings.enabled}
                      placeholder="smtp.gmail.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      type="number"
                      value={localSmtpSettings.port}
                      onChange={(e) => handleSmtpSettingChange('port', parseInt(e.target.value))}
                      disabled={!localSmtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={localSmtpSettings.username}
                      onChange={(e) => handleSmtpSettingChange('username', e.target.value)}
                      disabled={!localSmtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={localSmtpSettings.password}
                      onChange={(e) => handleSmtpSettingChange('password', e.target.value)}
                      disabled={!localSmtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Email"
                      value={localSmtpSettings.fromEmail}
                      onChange={(e) => handleSmtpSettingChange('fromEmail', e.target.value)}
                      disabled={!localSmtpSettings.enabled}
                      placeholder="noreply@yourcompany.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Name"
                      value={localSmtpSettings.fromName}
                      onChange={(e) => handleSmtpSettingChange('fromName', e.target.value)}
                      disabled={!localSmtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSmtpSettings.useTLS}
                            onChange={(e) => handleSmtpSettingChange('useTLS', e.target.checked)}
                            disabled={!localSmtpSettings.enabled}
                            color="primary"
                          />
                        }
                        label="Use TLS"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSmtpSettings.useSSL}
                            onChange={(e) => handleSmtpSettingChange('useSSL', e.target.checked)}
                            disabled={!localSmtpSettings.enabled}
                            color="secondary"
                          />
                        }
                        label="Use SSL"
                      />
                    </Box>
                  </Grid>
                  
                  {/* Test Email Section */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Test SMTP Configuration
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        label="Test Email Address"
                        value={localSmtpSettings.testEmail}
                        onChange={(e) => handleSmtpSettingChange('testEmail', e.target.value)}
                        disabled={!localSmtpSettings.enabled}
                        placeholder="test@example.com"
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<TestIcon />}
                        onClick={handleTestSMTP}
                        disabled={!localSmtpSettings.enabled || !localSmtpSettings.testEmail}
                        sx={{ borderColor: '#FF5722', color: '#FF5722' }}
                      >
                        Send Test Email
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <QuickActionButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSettings('smtp')}
                    sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
                  >
                    Save SMTP Settings
                  </QuickActionButton>
                </Box>
              </CardContent>
            </ConfigCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ConfigCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 2, color: '#FF5722' }} />
                  Notification Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Notification Channels
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) => handleNotificationSettingChange('smsNotifications', e.target.checked)}
                            color="secondary"
                          />
                        }
                        label="SMS Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.pushNotifications}
                            onChange={(e) => handleNotificationSettingChange('pushNotifications', e.target.checked)}
                            color="success"
                          />
                        }
                        label="Push Notifications"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      System Events
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.userRegistration}
                            onChange={(e) => handleNotificationSettingChange('userRegistration', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="User Registration"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.passwordReset}
                            onChange={(e) => handleNotificationSettingChange('passwordReset', e.target.checked)}
                            color="warning"
                          />
                        }
                        label="Password Reset"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.systemAlerts}
                            onChange={(e) => handleNotificationSettingChange('systemAlerts', e.target.checked)}
                            color="error"
                          />
                        }
                        label="System Alerts"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.securityAlerts}
                            onChange={(e) => handleNotificationSettingChange('securityAlerts', e.target.checked)}
                            color="error"
                          />
                        }
                        label="Security Alerts"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Reports & Maintenance
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.dailyReports}
                            onChange={(e) => handleNotificationSettingChange('dailyReports', e.target.checked)}
                            color="info"
                          />
                        }
                        label="Daily Reports"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.weeklyReports}
                            onChange={(e) => handleNotificationSettingChange('weeklyReports', e.target.checked)}
                            color="info"
                          />
                        }
                        label="Weekly Reports"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.monthlyReports}
                            onChange={(e) => handleNotificationSettingChange('monthlyReports', e.target.checked)}
                            color="info"
                          />
                        }
                        label="Monthly Reports"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notificationSettings.maintenanceNotices}
                            onChange={(e) => handleNotificationSettingChange('maintenanceNotices', e.target.checked)}
                            color="warning"
                          />
                        }
                        label="Maintenance Notices"
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <QuickActionButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSettings('notifications')}
                    sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
                  >
                    Save Notification Settings
                  </QuickActionButton>
                </Box>
              </CardContent>
            </ConfigCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ConfigCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 2, color: '#FF5722' }} />
                  Security Configuration
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Minimum Password Length"
                      type="number"
                      value={localSystemSettings.passwordMinLength}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                      InputProps={{
                        inputProps: { min: 6, max: 20 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Log Retention (Days)"
                      type="number"
                      value={localSystemSettings.logRetentionDays}
                      onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, logRetentionDays: parseInt(e.target.value) }))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSystemSettings.enableTwoFactor}
                            onChange={(e) => setLocalSystemSettings(prev => ({ ...prev, enableTwoFactor: e.target.checked }))}
                            color="primary"
                          />
                        }
                        label="Enable Two-Factor Authentication"
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <QuickActionButton
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveSettings('security')}
                    sx={{ background: 'linear-gradient(45deg, #FF5722 30%, #D84315 90%)' }}
                  >
                    Save Security Settings
                  </QuickActionButton>
                </Box>
              </CardContent>
            </ConfigCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Workflow Approval Tab */}
      <TabPanel value={tabValue} index={4}>
        <WorkflowApprovalProcess />
      </TabPanel>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SystemSettingsDashboard;
