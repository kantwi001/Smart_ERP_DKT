import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';


const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  useEffect(() => {
    api.get(`/hr/meetings/`)
      .then(res => setMeetings(res.data));
  }, []);
  return (
    <Box>
      <Typography variant="h6" mb={2}><GroupsIcon sx={{mr:1}}/>Meetings & Events</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Organizer</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meetings.length === 0 && (
              <TableRow><TableCell colSpan={4}>No meetings found.</TableCell></TableRow>
            )}
            {meetings.map(m => (
              <TableRow key={m.id}>
                <TableCell>{m.title}</TableCell>
                <TableCell>{m.date}</TableCell>
                <TableCell>{m.organizer}</TableCell>
                <TableCell>{m.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Meetings;
