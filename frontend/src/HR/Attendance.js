import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';


const Attendance = () => {
  const [records, setRecords] = useState([]);
  useEffect(() => {
    api.get(`/hr/attendance/`)
      .then(res => setRecords(res.data));
  }, []);
  return (
    <Box>
      <Typography variant="h6" mb={2}>Attendance Tracking</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={5}>No attendance records found.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.employee?.user?.first_name} {r.employee?.user?.last_name}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.check_in}</TableCell>
                <TableCell>{r.check_out}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Attendance;
