import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, List, ListItem, ListItemText, Button } from '@mui/material';
import EditAnnouncementDialog from './EditAnnouncementDialog';
import CampaignIcon from '@mui/icons-material/Campaign';
import AnnouncementForm from './AnnouncementForm';


const handleDelete = (a) => {
  // TODO: implement delete logic
  alert('Delete not implemented');
};

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);

  const fetchAnnouncements = () => {
    api.get(`/hr/announcements/`)
      .then(res => setAnnouncements(res.data));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [refresh]);

  const handleFormSuccess = () => setRefresh(r => !r);

  return (
    <Box>
      <Typography variant="h6" mb={2}><CampaignIcon sx={{mr:1}}/>Announcements</Typography>
      <AnnouncementForm onSuccess={handleFormSuccess} />
      <Paper>
        <List sx={{ mt: 3 }}>
          {announcements.length === 0 && (
            <ListItem><ListItemText primary="No announcements found." /></ListItem>
          )}
          {announcements.map(a => (
            <ListItem key={a.id}>
              <ListItemText
                primary={a.title}
                secondary={a.content + ' — ' + new Date(a.created_at).toLocaleString()}
              />
              <Button size="small" variant="outlined" onClick={() => setEditAnnouncement(a)} sx={{ ml: 2 }}>Edit</Button>
              <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(a)} sx={{ ml: 2 }}>Delete</Button>
            </ListItem>
          ))}
        </List>
      </Paper>
      {editAnnouncement && (
        <EditAnnouncementDialog
          open={!!editAnnouncement}
          announcement={editAnnouncement}
          onClose={() => setEditAnnouncement(null)}
          onSaved={() => { setEditAnnouncement(null); setRefresh(r => !r); }}
          onDeleted={() => { setEditAnnouncement(null); setRefresh(r => !r); }}
        />
      )}
    </Box>
  );
};

export default Announcement;
