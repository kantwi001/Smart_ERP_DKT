import React, { useEffect, useState } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import EditEmployeeDialog from './EditEmployeeDialog';
import PeopleIcon from '@mui/icons-material/People';
import EmployeeForm from './EmployeeForm';

const EmployeeData = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);

  const fetchEmployees = () => {
    api.get('/hr/employees/')
      .then(res => setEmployees(res.data));
  };

  useEffect(() => {
    fetchEmployees();
    api.get('/hr/departments/').then(res => setDepartments(res.data));
  }, [refresh]);

  const handleFormSuccess = () => setRefresh(r => !r);

  return (
    <Box>
      <Typography variant="h6" mb={2}><PeopleIcon sx={{mr:1}}/>Employee Data</Typography>
      <EmployeeForm onSuccess={handleFormSuccess} />
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={departmentFilter}
            label="Filter by Department"
            onChange={e => setDepartmentFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {departments.map(d => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Supervisor (HOD)</TableCell>
              <TableCell>Hire Date</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 && (
              <TableRow><TableCell colSpan={6}>No employees found.</TableCell></TableRow>
            )}
            {employees
              .filter(e => !departmentFilter || (e.department && e.department.id === departmentFilter))
              .map(e => (
                <TableRow key={e.id}>
                  <TableCell>{e.user?.first_name} {e.user?.last_name}</TableCell>
                  <TableCell>{e.position}</TableCell>
                  <TableCell>{e.department?.name || ''}</TableCell>
                  <TableCell>{e.supervisor || ''}</TableCell>
                  <TableCell>{e.hire_date}</TableCell>
                  <TableCell>{e.salary}</TableCell>
                  <TableCell>{e.active ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => setEditEmployee(e)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
          
          </TableBody>
        </Table>
      </Paper>
      {editEmployee && (
        <EditEmployeeDialog
          open={!!editEmployee}
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
          onSaved={() => { setEditEmployee(null); setRefresh(r => !r); }}
          onDeleted={() => { setEditEmployee(null); setRefresh(r => !r); }}
        />
      )}
    </Box>
  );
};

export default EmployeeData;
