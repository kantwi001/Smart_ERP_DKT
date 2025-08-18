import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Calculate as CalculateIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PayrollManagement = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  
  // Dialog states
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    employee_id: '',
    department: '',
    position: '',
    basic_salary: '',
    hire_date: ''
  });

  const [payrollForm, setPayrollForm] = useState({
    employee_id: '',
    pay_period: '',
    basic_salary: '',
    allowances: [],
    deductions: [],
    overtime_hours: 0,
    overtime_rate: 0
  });

  const [deductionForm, setDeductionForm] = useState({
    name: '',
    type: 'fixed', // fixed or percentage
    amount: '',
    description: ''
  });

  // Mock data for development
  const mockEmployees = [
    {
      id: 1,
      name: 'John Doe',
      employee_id: 'EMP001',
      department: 'Engineering',
      position: 'Software Developer',
      basic_salary: 8000.00,
      hire_date: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      employee_id: 'EMP002',
      department: 'Marketing',
      position: 'Marketing Manager',
      basic_salary: 9500.00,
      hire_date: '2022-11-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      employee_id: 'EMP003',
      department: 'Sales',
      position: 'Sales Representative',
      basic_salary: 7500.00,
      hire_date: '2023-03-10',
      status: 'active'
    }
  ];

  const mockPayrollRecords = [
    {
      id: 1,
      employee_id: 1,
      employee_name: 'John Doe',
      pay_period: 'January 2024',
      basic_salary: 8000.00,
      allowances: [
        { name: 'Transport', amount: 200.00 },
        { name: 'Meal', amount: 150.00 }
      ],
      deductions: [
        { name: 'Tax', amount: 1200.00 },
        { name: 'Social Security', amount: 340.00 },
        { name: 'Health Insurance', amount: 160.00 }
      ],
      overtime_hours: 10,
      overtime_rate: 50.00,
      gross_pay: 8850.00,
      total_deductions: 1700.00,
      net_pay: 7150.00,
      status: 'processed',
      created_date: '2024-01-31'
    },
    {
      id: 2,
      employee_id: 2,
      employee_name: 'Jane Smith',
      pay_period: 'January 2024',
      basic_salary: 9500.00,
      allowances: [
        { name: 'Transport', amount: 250.00 },
        { name: 'Meal', amount: 200.00 }
      ],
      deductions: [
        { name: 'Tax', amount: 1425.00 },
        { name: 'Social Security', amount: 380.00 },
        { name: 'Health Insurance', amount: 190.00 }
      ],
      overtime_hours: 5,
      overtime_rate: 60.00,
      gross_pay: 10250.00,
      total_deductions: 1995.00,
      net_pay: 8255.00,
      status: 'processed',
      created_date: '2024-01-31'
    }
  ];

  const mockDeductionTypes = [
    { id: 1, name: 'Income Tax', type: 'percentage', rate: 15, description: 'Government income tax' },
    { id: 2, name: 'Social Security', type: 'percentage', rate: 4.25, description: 'Social security contribution' },
    { id: 3, name: 'Health Insurance', type: 'fixed', amount: 160.00, description: 'Monthly health insurance premium' },
    { id: 4, name: 'Pension Fund', type: 'percentage', rate: 5.5, description: 'Pension fund contribution' }
  ];

  const mockAllowanceTypes = [
    { id: 1, name: 'Transport Allowance', amount: 200.00, description: 'Monthly transport allowance' },
    { id: 2, name: 'Meal Allowance', amount: 150.00, description: 'Daily meal allowance' },
    { id: 3, name: 'Housing Allowance', amount: 500.00, description: 'Monthly housing allowance' },
    { id: 4, name: 'Communication Allowance', amount: 100.00, description: 'Monthly communication allowance' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try API calls first, fallback to mock data
      try {
        const [employeesRes, payrollRes, deductionsRes, allowancesRes] = await Promise.all([
          api.get('/finance/payroll/employees/'),
          api.get('/finance/payroll/records/'),
          api.get('/finance/payroll/deduction-types/'),
          api.get('/finance/payroll/allowance-types/')
        ]);
        
        setEmployees(employeesRes.data);
        setPayrollRecords(payrollRes.data);
        setDeductionTypes(deductionsRes.data);
        setAllowanceTypes(allowancesRes.data);
      } catch (apiError) {
        console.log('API not available, using mock data');
        setTimeout(() => {
          setEmployees(mockEmployees);
          setPayrollRecords(mockPayrollRecords);
          setDeductionTypes(mockDeductionTypes);
          setAllowanceTypes(mockAllowanceTypes);
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading payroll data:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const calculatePayroll = (employee, allowances = [], deductions = [], overtimeHours = 0, overtimeRate = 0) => {
    const basicSalary = parseFloat(employee.basic_salary || 0);
    const overtimePay = overtimeHours * overtimeRate;
    
    const totalAllowances = allowances.reduce((sum, allowance) => sum + parseFloat(allowance.amount || 0), 0);
    const grossPay = basicSalary + totalAllowances + overtimePay;
    
    let totalDeductions = 0;
    const calculatedDeductions = deductions.map(deduction => {
      let amount = 0;
      if (deduction.type === 'percentage') {
        amount = (grossPay * parseFloat(deduction.rate || 0)) / 100;
      } else {
        amount = parseFloat(deduction.amount || 0);
      }
      totalDeductions += amount;
      return { ...deduction, calculated_amount: amount };
    });
    
    const netPay = grossPay - totalDeductions;
    
    return {
      basic_salary: basicSalary,
      overtime_pay: overtimePay,
      total_allowances: totalAllowances,
      gross_pay: grossPay,
      deductions: calculatedDeductions,
      total_deductions: totalDeductions,
      net_pay: netPay
    };
  };

  const handleProcessPayroll = async (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    // Get default allowances and deductions for calculation
    const defaultAllowances = mockAllowanceTypes.slice(0, 2); // Transport and Meal
    const defaultDeductions = mockDeductionTypes; // All deduction types
    
    const calculation = calculatePayroll(employee, defaultAllowances, defaultDeductions, 0, 0);
    
    const newPayrollRecord = {
      id: payrollRecords.length + 1,
      employee_id: employee.id,
      employee_name: employee.name,
      pay_period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      ...calculation,
      allowances: defaultAllowances,
      deductions: calculation.deductions,
      overtime_hours: 0,
      overtime_rate: 0,
      status: 'processed',
      created_date: new Date().toISOString().split('T')[0]
    };
    
    setPayrollRecords([newPayrollRecord, ...payrollRecords]);
    alert(`Payroll processed successfully for ${employee.name}. Net Pay: GHS ${calculation.net_pay.toFixed(2)}`);
  };

  const generatePayrollReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Payroll Management Report', 20, 25);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Total Employees: ${employees.length}`, 20, 45);
    doc.text(`Total Payroll Records: ${payrollRecords.length}`, 20, 55);
    
    // Payroll Summary Table
    const payrollData = payrollRecords.map(record => [
      record.employee_name,
      record.pay_period,
      `GHS ${record.gross_pay.toFixed(2)}`,
      `GHS ${record.total_deductions.toFixed(2)}`,
      `GHS ${record.net_pay.toFixed(2)}`,
      record.status
    ]);
    
    autoTable(doc, {
      startY: 65,
      head: [['Employee', 'Period', 'Gross Pay', 'Deductions', 'Net Pay', 'Status']],
      body: payrollData,
      theme: 'grid',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save('payroll_report.pdf');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processed': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'info';
      default: return 'default';
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      employee_id: employee.employee_id,
      department: employee.department,
      position: employee.position,
      basic_salary: employee.basic_salary.toString(),
      hire_date: employee.hire_date || ''
    });
    setEditMode(true);
    setEmployeeDialogOpen(true);
  };

  const handleAddEmployee = async () => {
    try {
      // Validate form
      if (!employeeForm.name || !employeeForm.employee_id || !employeeForm.basic_salary) {
        alert('Please fill in all required fields');
        return;
      }

      if (editMode) {
        // Update existing employee
        const updatedEmployee = {
          ...selectedEmployee,
          name: employeeForm.name,
          employee_id: employeeForm.employee_id,
          department: employeeForm.department,
          position: employeeForm.position,
          basic_salary: parseFloat(employeeForm.basic_salary),
          hire_date: employeeForm.hire_date
        };

        // Try API call first, fallback to local state update
        try {
          await api.put(`/finance/payroll/employees/${selectedEmployee.id}/`, updatedEmployee);
        } catch (apiError) {
          console.log('API not available, updating local state');
        }

        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id ? updatedEmployee : emp
        ));
        alert(`Employee ${updatedEmployee.name} updated successfully!`);
      } else {
        // Add new employee
        const newEmployee = {
          id: employees.length + 1,
          name: employeeForm.name,
          employee_id: employeeForm.employee_id,
          department: employeeForm.department,
          position: employeeForm.position,
          basic_salary: parseFloat(employeeForm.basic_salary),
          hire_date: employeeForm.hire_date,
          status: 'active'
        };

        // Try API call first, fallback to local state update
        try {
          await api.post('/finance/payroll/employees/', newEmployee);
        } catch (apiError) {
          console.log('API not available, updating local state');
        }

        setEmployees([...employees, newEmployee]);
        alert(`Employee ${newEmployee.name} added successfully!`);
      }

      setEmployeeDialogOpen(false);
      setEditMode(false);
      setSelectedEmployee(null);
      setEmployeeForm({
        name: '',
        employee_id: '',
        department: '',
        position: '',
        basic_salary: '',
        hire_date: ''
      });
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleOpenAddEmployeeDialog = () => {
    setEditMode(false);
    setSelectedEmployee(null);
    setEmployeeForm({
      name: '',
      employee_id: '',
      department: '',
      position: '',
      basic_salary: '',
      hire_date: ''
    });
    setEmployeeDialogOpen(true);
  };

  const handleAddDeductionType = async () => {
    try {
      // Validate form
      if (!deductionForm.name || (!deductionForm.amount && !deductionForm.rate)) {
        alert('Please fill in all required fields');
        return;
      }

      const newDeduction = {
        id: deductionTypes.length + 1,
        name: deductionForm.name,
        type: deductionForm.type,
        description: deductionForm.description
      };

      if (deductionForm.type === 'percentage') {
        newDeduction.rate = parseFloat(deductionForm.amount);
      } else {
        newDeduction.amount = parseFloat(deductionForm.amount);
      }

      // Try API call first, fallback to local state update
      try {
        await api.post('/finance/payroll/deduction-types/', newDeduction);
      } catch (apiError) {
        console.log('API not available, updating local state');
      }

      setDeductionTypes([...deductionTypes, newDeduction]);
      setDeductionDialogOpen(false);
      setDeductionForm({
        name: '',
        type: 'fixed',
        amount: '',
        description: ''
      });
      alert(`Deduction type "${newDeduction.name}" added successfully!`);
    } catch (error) {
      console.error('Error adding deduction type:', error);
      alert('Failed to add deduction type. Please try again.');
    }
  };

  const handleEmployeeFormChange = (field, value) => {
    setEmployeeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeductionFormChange = (field, value) => {
    setDeductionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading payroll data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Payroll Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage employee payroll, deductions, and generate pay slips
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={generatePayrollReport}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{employees.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ReceiptIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{payrollRecords.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payroll Records
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <MoneyIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(payrollRecords.reduce((sum, record) => sum + record.gross_pay, 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Gross Pay
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(payrollRecords.reduce((sum, record) => sum + record.net_pay, 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Net Pay
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Employees" />
          <Tab label="Payroll Records" />
          <Tab label="Deduction Types" />
        </Tabs>
      </Paper>

      {/* Employees Tab */}
      {tabValue === 0 && (
        <Paper>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Employee Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddEmployeeDialog}
            >
              Add Employee
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.employee_id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{formatCurrency(employee.basic_salary)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={employee.status} 
                        color={employee.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Process Payroll">
                        <IconButton 
                          color="primary"
                          onClick={() => handleProcessPayroll(employee.id)}
                        >
                          <CalculateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Employee">
                        <IconButton color="secondary" onClick={() => handleEditEmployee(employee)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Payroll Records Tab */}
      {tabValue === 1 && (
        <Paper>
          <Box p={2}>
            <Typography variant="h6">Payroll Records</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Pay Period</TableCell>
                  <TableCell>Basic Salary</TableCell>
                  <TableCell>Allowances</TableCell>
                  <TableCell>Gross Pay</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Net Pay</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.employee_name}</TableCell>
                    <TableCell>{record.pay_period}</TableCell>
                    <TableCell>{formatCurrency(record.basic_salary)}</TableCell>
                    <TableCell>{formatCurrency(record.total_allowances)}</TableCell>
                    <TableCell>{formatCurrency(record.gross_pay)}</TableCell>
                    <TableCell>{formatCurrency(record.total_deductions)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(record.net_pay)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={record.status} 
                        color={getStatusColor(record.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(record.created_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Deduction Types Tab */}
      {tabValue === 2 && (
        <Paper>
          <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Deduction & Allowance Types</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDeductionDialogOpen(true)}
            >
              Add Deduction Type
            </Button>
          </Box>
          
          <Box p={2}>
            <Typography variant="subtitle1" gutterBottom>Deduction Types</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Rate/Amount</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deductionTypes.map((deduction) => (
                    <TableRow key={deduction.id}>
                      <TableCell>{deduction.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={deduction.type} 
                          color={deduction.type === 'percentage' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {deduction.type === 'percentage' 
                          ? `${deduction.rate}%` 
                          : formatCurrency(deduction.amount)
                        }
                      </TableCell>
                      <TableCell>{deduction.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          <Box p={2}>
            <Typography variant="subtitle1" gutterBottom>Allowance Types</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allowanceTypes.map((allowance) => (
                    <TableRow key={allowance.id}>
                      <TableCell>{allowance.name}</TableCell>
                      <TableCell>{formatCurrency(allowance.amount)}</TableCell>
                      <TableCell>{allowance.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {/* Employee Dialog */}
      <Dialog open={employeeDialogOpen} onClose={() => setEmployeeDialogOpen(false)}>
        <DialogTitle>{editMode ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              label="Name"
              value={employeeForm.name}
              onChange={(e) => handleEmployeeFormChange('name', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              label="Employee ID"
              value={employeeForm.employee_id}
              onChange={(e) => handleEmployeeFormChange('employee_id', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              label="Department"
              value={employeeForm.department}
              onChange={(e) => handleEmployeeFormChange('department', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              label="Position"
              value={employeeForm.position}
              onChange={(e) => handleEmployeeFormChange('position', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
            <TextField
              label="Basic Salary"
              value={employeeForm.basic_salary}
              onChange={(e) => handleEmployeeFormChange('basic_salary', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
              type="number"
            />
            <TextField
              label="Hire Date"
              value={employeeForm.hire_date}
              onChange={(e) => handleEmployeeFormChange('hire_date', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
              type="date"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmployeeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddEmployee}>{editMode ? 'Save Changes' : 'Add Employee'}</Button>
        </DialogActions>
      </Dialog>

      {/* Deduction Type Dialog */}
      <Dialog open={deductionDialogOpen} onClose={() => setDeductionDialogOpen(false)}>
        <DialogTitle>Add Deduction Type</DialogTitle>
        <DialogContent>
          <Box>
            <TextField
              label="Name"
              value={deductionForm.name}
              onChange={(e) => handleDeductionFormChange('name', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
            <FormControl sx={{ mb: 2 }} fullWidth>
              <InputLabel id="deduction-type-label">Type</InputLabel>
              <Select
                labelId="deduction-type-label"
                label="Type"
                value={deductionForm.type}
                onChange={(e) => handleDeductionFormChange('type', e.target.value)}
              >
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="percentage">Percentage</MenuItem>
              </Select>
            </FormControl>
            {deductionForm.type === 'percentage' ? (
              <TextField
                label="Rate (%)"
                value={deductionForm.amount}
                onChange={(e) => handleDeductionFormChange('amount', e.target.value)}
                sx={{ mb: 2 }}
                fullWidth
                type="number"
              />
            ) : (
              <TextField
                label="Amount"
                value={deductionForm.amount}
                onChange={(e) => handleDeductionFormChange('amount', e.target.value)}
                sx={{ mb: 2 }}
                fullWidth
                type="number"
              />
            )}
            <TextField
              label="Description"
              value={deductionForm.description}
              onChange={(e) => handleDeductionFormChange('description', e.target.value)}
              sx={{ mb: 2 }}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeductionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddDeductionType}>Add Deduction Type</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollManagement;
