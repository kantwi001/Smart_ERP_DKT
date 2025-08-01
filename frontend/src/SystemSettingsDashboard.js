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
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'ERP System',
    siteDescription: 'Enterprise Resource Planning System',
    maintenanceMode: false,
    registrationEnabled: true,
    defaultUserRole: 'employee',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requirePasswordComplexity: true,
    enableTwoFactor: false,
    backupFrequency: 'daily',
    logRetentionDays: 90,
  });

  // SMTP Settings State
  const [smtpSettings, setSmtpSettings] = useState({
    enabled: false,
    host: '',
    port: 587,
    username: '',
    password: '',
    useTLS: true,
    useSSL: false,
    fromEmail: '',
    fromName: 'ERP System',
    testEmail: '',
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    userRegistration: true,
    passwordReset: true,
    systemAlerts: true,
    maintenanceNotices: true,
    securityAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
  });

  // Check if user is superuser
  const isSuperuser = user?.role === 'superadmin' || user?.is_superuser;

  useEffect(() => {
    if (!isSuperuser) {
      setError('Access denied. Only superusers can access System Settings.');
      return;
    }
    fetchSystemSettings();
  }, [isSuperuser]);

  const fetchSystemSettings = async () => {
    if (!token || !isSuperuser) return;
    
    setLoading(true);
    try {
      const settingsRes = await api.get('/users/system/settings/');
      const data = settingsRes.data;
      
      // Update system settings state
      setSystemSettings({
        siteName: data.site_name || 'ERP System',
        siteDescription: data.site_description || 'Enterprise Resource Planning System',
        maintenanceMode: data.maintenance_mode || false,
        registrationEnabled: data.registration_enabled || true,
        defaultUserRole: data.default_user_role || 'employee',
        sessionTimeout: data.session_timeout || 30,
        maxLoginAttempts: data.max_login_attempts || 5,
        passwordMinLength: data.password_min_length || 8,
        requirePasswordComplexity: data.require_password_complexity || true,
        enableTwoFactor: data.enable_two_factor || false,
        backupFrequency: data.backup_frequency || 'daily',
        logRetentionDays: data.log_retention_days || 90,
      });
      
      // Update SMTP settings state
      setSmtpSettings({
        enabled: data.smtp_enabled || false,
        host: data.smtp_host || '',
        port: data.smtp_port || 587,
        username: data.smtp_username || '',
        password: data.smtp_password || '',
        useTLS: data.smtp_use_tls || true,
        useSSL: data.smtp_use_ssl || false,
        fromEmail: data.smtp_from_email || '',
        fromName: data.smtp_from_name || 'ERP System',
        testEmail: '',
      });
      
      // Update notification settings state
      setNotificationSettings({
        emailNotifications: data.email_notifications || true,
        smsNotifications: data.sms_notifications || false,
        pushNotifications: data.push_notifications || true,
        userRegistration: data.user_registration_notifications || true,
        passwordReset: data.password_reset_notifications || true,
        systemAlerts: data.system_alerts || true,
        maintenanceNotices: data.maintenance_notices || true,
        securityAlerts: data.security_alerts || true,
        dailyReports: data.daily_reports || false,
        weeklyReports: data.weekly_reports || true,
        monthlyReports: data.monthly_reports || true,
      });
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load system settings.');
      console.error('System settings error:', err);
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSmtpSettingChange = (key, value) => {
    setSmtpSettings(prev => ({
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
          site_name: systemSettings.siteName,
          site_description: systemSettings.siteDescription,
          maintenance_mode: systemSettings.maintenanceMode,
          registration_enabled: systemSettings.registrationEnabled,
          default_user_role: systemSettings.defaultUserRole,
          session_timeout: systemSettings.sessionTimeout,
          max_login_attempts: systemSettings.maxLoginAttempts,
          password_min_length: systemSettings.passwordMinLength,
          require_password_complexity: systemSettings.requirePasswordComplexity,
          enable_two_factor: systemSettings.enableTwoFactor,
          backup_frequency: systemSettings.backupFrequency,
          log_retention_days: systemSettings.logRetentionDays,
        };
      } else if (settingsType === 'smtp') {
        settingsData = {
          smtp_enabled: smtpSettings.enabled,
          smtp_host: smtpSettings.host,
          smtp_port: smtpSettings.port,
          smtp_username: smtpSettings.username,
          smtp_password: smtpSettings.password,
          smtp_use_tls: smtpSettings.useTLS,
          smtp_use_ssl: smtpSettings.useSSL,
          smtp_from_email: smtpSettings.fromEmail,
          smtp_from_name: smtpSettings.fromName,
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
      
      // Save settings via API
      const response = await api.put('/users/system/settings/', settingsData);
      
      setSnackbarMessage(`${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)} settings saved successfully!`);
      setSnackbarOpen(true);
      
      // Refresh settings to get updated data
      await fetchSystemSettings();
      
    } catch (error) {
      console.error('Save settings error:', error);
      setSnackbarMessage(`Failed to save ${settingsType} settings: ${error.response?.data?.error || error.message}`);
      setSnackbarOpen(true);
    }
  };

  const handleTestSMTP = async () => {
    if (!smtpSettings.testEmail) {
      setSnackbarMessage('Please enter a test email address');
      setSnackbarOpen(true);
      return;
    }

    try {
      // First save current SMTP settings if they haven't been saved
      await handleSaveSettings('smtp');
      
      // Test SMTP configuration
      const response = await api.post('/users/system/smtp/test/', { 
        test_email: smtpSettings.testEmail 
      });
      
      setSnackbarMessage(`Test email sent successfully to ${smtpSettings.testEmail}!`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Test SMTP error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send test email';
      setSnackbarMessage(`Failed to send test email: ${errorMessage}`);
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
                      value={systemSettings.siteName}
                      onChange={(e) => handleSystemSettingChange('siteName', e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Default User Role"
                      select
                      value={systemSettings.defaultUserRole}
                      onChange={(e) => handleSystemSettingChange('defaultUserRole', e.target.value)}
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
                      value={systemSettings.siteDescription}
                      onChange={(e) => handleSystemSettingChange('siteDescription', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Session Timeout (minutes)"
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => handleSystemSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Max Login Attempts"
                      type="number"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => handleSystemSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.maintenanceMode}
                            onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
                            color="warning"
                          />
                        }
                        label="Maintenance Mode"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.registrationEnabled}
                            onChange={(e) => handleSystemSettingChange('registrationEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="User Registration Enabled"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.requirePasswordComplexity}
                            onChange={(e) => handleSystemSettingChange('requirePasswordComplexity', e.target.checked)}
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
                        checked={smtpSettings.enabled}
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
                      value={smtpSettings.host}
                      onChange={(e) => handleSmtpSettingChange('host', e.target.value)}
                      disabled={!smtpSettings.enabled}
                      placeholder="smtp.gmail.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="SMTP Port"
                      type="number"
                      value={smtpSettings.port}
                      onChange={(e) => handleSmtpSettingChange('port', parseInt(e.target.value))}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={smtpSettings.username}
                      onChange={(e) => handleSmtpSettingChange('username', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={smtpSettings.password}
                      onChange={(e) => handleSmtpSettingChange('password', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Email"
                      value={smtpSettings.fromEmail}
                      onChange={(e) => handleSmtpSettingChange('fromEmail', e.target.value)}
                      disabled={!smtpSettings.enabled}
                      placeholder="noreply@yourcompany.com"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="From Name"
                      value={smtpSettings.fromName}
                      onChange={(e) => handleSmtpSettingChange('fromName', e.target.value)}
                      disabled={!smtpSettings.enabled}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={smtpSettings.useTLS}
                            onChange={(e) => handleSmtpSettingChange('useTLS', e.target.checked)}
                            disabled={!smtpSettings.enabled}
                            color="primary"
                          />
                        }
                        label="Use TLS"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={smtpSettings.useSSL}
                            onChange={(e) => handleSmtpSettingChange('useSSL', e.target.checked)}
                            disabled={!smtpSettings.enabled}
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
                        value={smtpSettings.testEmail}
                        onChange={(e) => handleSmtpSettingChange('testEmail', e.target.value)}
                        disabled={!smtpSettings.enabled}
                        placeholder="test@example.com"
                        sx={{ flexGrow: 1 }}
                      />
                      <QuickActionButton
                        variant="outlined"
                        startIcon={<TestIcon />}
                        onClick={handleTestSMTP}
                        disabled={!smtpSettings.enabled || !smtpSettings.testEmail}
                        sx={{ borderColor: '#FF5722', color: '#FF5722' }}
                      >
                        Send Test Email
                      </QuickActionButton>
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
                      value={systemSettings.passwordMinLength}
                      onChange={(e) => handleSystemSettingChange('passwordMinLength', parseInt(e.target.value))}
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
                      value={systemSettings.logRetentionDays}
                      onChange={(e) => handleSystemSettingChange('logRetentionDays', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={systemSettings.enableTwoFactor}
                            onChange={(e) => handleSystemSettingChange('enableTwoFactor', e.target.checked)}
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
