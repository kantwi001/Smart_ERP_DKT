import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import BackendChecker from '../utils/BackendChecker';

const SystemStatus = ({ onStatusChange }) => {
  const [backendStatus, setBackendStatus] = useState(null);
  const [moduleStatus, setModuleStatus] = useState({});
  const [systemMessage, setSystemMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      console.log('[SystemStatus] Checking system status...');
      
      // Check backend connectivity
      const backendResult = await BackendChecker.checkBackendStatus();
      setBackendStatus(backendResult);
      
      // If backend is connected, check individual modules
      let moduleResult = {};
      if (backendResult.isConnected) {
        moduleResult = await BackendChecker.checkModuleEndpoints();
        setModuleStatus(moduleResult);
      }
      
      // Create system status message
      const message = BackendChecker.createSystemStatusMessage(backendResult, moduleResult);
      setSystemMessage(message);
      setLastChecked(new Date());
      
      // Notify parent component about status
      if (onStatusChange) {
        onStatusChange({
          backendConnected: backendResult.isConnected,
          moduleStatus: moduleResult,
          systemMessage: message
        });
      }
      
      console.log('[SystemStatus] Status check completed:', {
        backend: backendResult.status,
        modules: Object.keys(moduleResult).length,
        message: message.type
      });
      
    } catch (error) {
      console.error('[SystemStatus] Error checking system status:', error);
      setSystemMessage({
        type: 'error',
        title: 'System Check Failed',
        message: 'Unable to check system status',
        showInstructions: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Checking system status...
        </Typography>
      </Box>
    );
  }

  if (!systemMessage) {
    return null;
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Alert 
          severity={getStatusColor(systemMessage.type)}
          icon={getStatusIcon(systemMessage.type)}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={checkSystemStatus}
                startIcon={<RefreshIcon />}
                disabled={loading}
              >
                Refresh
              </Button>
              {(systemMessage.showInstructions || Object.keys(moduleStatus).length > 0) && (
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>
          }
        >
          <AlertTitle>{systemMessage.title}</AlertTitle>
          {systemMessage.message}
          {lastChecked && (
            <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.7 }}>
              Last checked: {lastChecked.toLocaleTimeString()}
            </Typography>
          )}
        </Alert>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {/* Backend Status */}
            {backendStatus && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Backend Server Status
                </Typography>
                <Chip
                  label={backendStatus.isConnected ? 'Connected' : 'Disconnected'}
                  color={backendStatus.isConnected ? 'success' : 'error'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {backendStatus.message}
                </Typography>
              </Box>
            )}

            {/* Instructions */}
            {systemMessage.instructions && systemMessage.instructions.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  How to Fix
                </Typography>
                <List dense>
                  {systemMessage.instructions.map((instruction, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={instruction}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Module Status */}
            {Object.keys(moduleStatus).length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Module Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(moduleStatus).map(([module, status]) => (
                    <Chip
                      key={module}
                      label={module.charAt(0).toUpperCase() + module.slice(1)}
                      color={status.status === 'available' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;
