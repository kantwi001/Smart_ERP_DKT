import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemText, Badge, IconButton, Popover, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Notifications = ({ sidebar = false, onUnreadChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchNotifications = () => {
    setNotifications([]); // No notifications endpoint, show empty list
    setUnread && setUnread(0);
  };

  useEffect(() => {
    fetchNotifications();
    let ws;
    let interval;
    try {
      // ws = new window.WebSocket('ws://' + window.location.host + '/ws/notifications/'); // Disabled: backend does not support WebSocket notifications
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          fetchNotifications();
        }
      };
      ws.onerror = () => {
        // fallback to polling if websocket fails
        interval = setInterval(fetchNotifications, 60000);
      };
    } catch (e) {
      // fallback to polling if websocket is not available
      interval = setInterval(fetchNotifications, 60000);
    }
    return () => {
      if (ws) ws.close();
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  const markAsRead = (id) => {
    // Notifications backend is disabled; do nothing.
  };

  if (sidebar) {
    return (
      <>
        <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
          <Badge badgeContent={unread} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, minWidth: 320 }}>
            <Typography variant="h6" mb={1}>Notifications</Typography>
            <List>
              {notifications.length === 0 && (
                <ListItem><ListItemText primary="No notifications" /></ListItem>
              )}
              {notifications.map(n => (
                <ListItem key={n.id} sx={{ bgcolor: n.read ? 'inherit' : '#e3f2fd', cursor: 'pointer' }}
                  onClick={() => { if (!n.read) markAsRead(n.id); }}>
                  <ListItemText
                    primary={n.message}
                    secondary={new Date(n.created_at).toLocaleString()}
                  />
                  {!n.read && <Button size="small" onClick={e => { e.stopPropagation(); markAsRead(n.id); }}>Mark as read</Button>}
                </ListItem>
              ))}
            </List>
          </Box>
        </Popover>
      </>
    );
  }

  // Default: full-page notifications list
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Badge badgeContent={unread} color="secondary">
          <NotificationsIcon />
        </Badge>
        <Typography variant="h6" ml={1}>Notifications</Typography>
      </Box>
      <List>
        {notifications.length === 0 && (
          <ListItem><ListItemText primary="No notifications" /></ListItem>
        )}
        {notifications.map(n => (
          <ListItem key={n.id} sx={{ bgcolor: n.read ? 'inherit' : '#e3f2fd', cursor: 'pointer' }}
            onClick={() => { if (!n.read) markAsRead(n.id); }}>
            <ListItemText
              primary={n.message}
              secondary={new Date(n.created_at).toLocaleString()}
            />
            {!n.read && <Button size="small" onClick={e => { e.stopPropagation(); markAsRead(n.id); }}>Mark as read</Button>}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Notifications;
