import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';


const Task = () => {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    api.get(`/hr/tasks/`)
      .then(res => setTasks(res.data));
  }, []);
  return (
    <Box>
      <Typography variant="h6" mb={2}><AssignmentTurnedInIcon sx={{mr:1}}/>Tasks</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow><TableCell colSpan={5}>No tasks found.</TableCell></TableRow>
            )}
            {tasks.map(t => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.assigned_to?.user?.first_name} {t.assigned_to?.user?.last_name}</TableCell>
                <TableCell>{t.due_date}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>{t.priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Task;
