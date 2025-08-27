import React, { useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { Wifi, WifiOff } from '@mui/icons-material';
import { isOnline } from '../offline';

const NetworkStatusIndicator = ({ size = 'small', variant = 'outlined' }) => {
  const [networkStatus, setNetworkStatus] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setNetworkStatus(true);
    const handleOffline = () => setNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setNetworkStatus(isOnline());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Chip
      icon={networkStatus ? <Wifi /> : <WifiOff />}
      label={networkStatus ? 'Online' : 'Offline'}
      color={networkStatus ? 'success' : 'error'}
      variant={variant}
      size={size}
      sx={{
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-icon': {
          fontSize: '16px'
        }
      }}
    />
  );
};

export default NetworkStatusIndicator;
