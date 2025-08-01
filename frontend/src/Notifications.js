import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Badge, IconButton, Menu, MenuItem, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
    // Optionally poll every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token]);

  const fetchNotifications = async () => {
    try {
      // const res = await api.get('/notifications/', { headers: { Authorization: `Bearer ${token}` } });
      // setNotifications(res.data);
      setNotifications([]); // No notifications endpoint, show empty list
    } catch {}
  };

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map(n => (
            <MenuItem key={n.id}>
              <ListItemText primary={n.message} secondary={n.created_at ? new Date(n.created_at).toLocaleString() : ''} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default Notifications;
