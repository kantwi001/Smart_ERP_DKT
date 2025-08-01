import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from '@mui/material';
import EditPayrollDialog from './EditPayrollDialog';
import PayrollForm from './PayrollForm';


const Payroll = () => {
  const [records, setRecords] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const fetchPayroll = () => {
    api.get(`/hr/payroll/`)
      .then(res => setRecords(res.data));
  };

  useEffect(() => {
    fetchPayroll();
  }, [refresh]);

  const handleFormSuccess = () => setRefresh(r => !r);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Payroll Management</Typography>
      <PayrollForm onSuccess={handleFormSuccess} />
      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 && (
              <TableRow><TableCell colSpan={5}>No payroll records found.</TableCell></TableRow>
            )}
            {records.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.employee?.user?.first_name} {r.employee?.user?.last_name}</TableCell>
                <TableCell>{r.period}</TableCell>
                <TableCell>{r.amount}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.payment_date}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => setEditRecord(r)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          
          </TableBody>
        </Table>
      </Paper>
      {editRecord && (
        <EditPayrollDialog
          open={!!editRecord}
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSaved={() => { setEditRecord(null); setRefresh(r => !r); }}
          onDeleted={() => { setEditRecord(null); setRefresh(r => !r); }}
        />
      )}
    </Box>
  );
};

export default Payroll;
