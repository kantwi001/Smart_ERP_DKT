import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';


const ExitInterview = () => {
  const [interviews, setInterviews] = useState([]);
  useEffect(() => {
    api.get(`/hr/exit-interviews/`)
      .then(res => setInterviews(res.data));
  }, []);
  return (
    <Box>
      <Typography variant="h6" mb={2}><ExitToAppIcon sx={{mr:1}}/>Employee Exit Interview</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Interviewer</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interviews.length === 0 && (
              <TableRow><TableCell colSpan={5}>No exit interviews found.</TableCell></TableRow>
            )}
            {interviews.map(i => (
              <TableRow key={i.id}>
                <TableCell>{i.employee?.user?.first_name} {i.employee?.user?.last_name}</TableCell>
                <TableCell>{i.date}</TableCell>
                <TableCell>{i.interviewer}</TableCell>
                <TableCell>{i.reason}</TableCell>
                <TableCell>{i.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ExitInterview;
