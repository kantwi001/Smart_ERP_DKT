import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';


const VisitLogs = () => {
  const [visits, setVisits] = useState([]);
  useEffect(() => {
    api.get(`/hr/visit-logs/`)
      .then(res => setVisits(res.data));
  }, []);
  return (
    <Box>
      <Typography variant="h6" mb={2}><LocationOnIcon sx={{mr:1}}/>Visit Logs</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Visitor Name</TableCell>
              <TableCell>Visit Date</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Host</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.length === 0 && (
              <TableRow><TableCell colSpan={5}>No visit logs found.</TableCell></TableRow>
            )}
            {visits.map(v => (
              <TableRow key={v.id}>
                <TableCell>{v.visitor_name}</TableCell>
                <TableCell>{v.visit_date}</TableCell>
                <TableCell>{v.purpose}</TableCell>
                <TableCell>{v.host}</TableCell>
                <TableCell>{v.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default VisitLogs;
