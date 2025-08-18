import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Dialog, DialogTitle, 
  DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, 
  TextField, Chip, LinearProgress, IconButton, Divider
} from '@mui/material';
import {
  Assessment as ReportIcon, GetApp as DownloadIcon, PictureAsPdf as PdfIcon, 
  TableChart as CsvIcon, DateRange as DateIcon, TrendingUp as TrendingUpIcon, 
  People as PeopleIcon, Schedule as ScheduleIcon, AttachMoney as PayrollIcon, 
  School as TrainingIcon, Security as ComplianceIcon, CheckCircle as CheckIcon, 
  Warning as WarningIcon, Error as ErrorIcon
} from '@mui/icons-material';
// Date picker imports now available
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    monthlyReports: { performance: [], attendance: [], payroll: [] },
    complianceReports: { regulatory: [], training: [], certifications: [] }
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [exportDialog, setExportDialog] = useState(false);
  const [exportType, setExportType] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Mock data
  const mockPerformanceData = [
    { id: 1, employee: 'John Doe', department: 'Engineering', rating: 4.5, goals_met: 8, goals_total: 10, feedback_score: 4.2 },
    { id: 2, employee: 'Jane Smith', department: 'Marketing', rating: 4.8, goals_met: 9, goals_total: 10, feedback_score: 4.7 },
    { id: 3, employee: 'Mike Johnson', department: 'Sales', rating: 4.1, goals_met: 7, goals_total: 10, feedback_score: 4.0 }
  ];

  const mockAttendanceData = [
    { id: 1, employee: 'John Doe', days_present: 22, days_total: 23, late_arrivals: 2, early_departures: 1, attendance_rate: 95.7 },
    { id: 2, employee: 'Jane Smith', days_present: 23, days_total: 23, late_arrivals: 0, early_departures: 0, attendance_rate: 100 },
    { id: 3, employee: 'Mike Johnson', days_present: 20, days_total: 23, late_arrivals: 3, early_departures: 2, attendance_rate: 87.0 }
  ];

  const mockPayrollData = [
    { id: 1, employee: 'John Doe', base_salary: 75000, overtime: 2500, bonuses: 5000, deductions: 1200, net_pay: 81300 },
    { id: 2, employee: 'Jane Smith', base_salary: 68000, overtime: 1800, bonuses: 3000, deductions: 1100, net_pay: 71700 },
    { id: 3, employee: 'Mike Johnson', base_salary: 72000, overtime: 3200, bonuses: 4500, deductions: 1300, net_pay: 78400 }
  ];

  const mockTrainingData = [
    { id: 1, employee: 'John Doe', completed_courses: 8, required_courses: 10, completion_rate: 80, last_training: '2024-07-15' },
    { id: 2, employee: 'Jane Smith', completed_courses: 10, required_courses: 10, completion_rate: 100, last_training: '2024-07-20' },
    { id: 3, employee: 'Mike Johnson', completed_courses: 6, required_courses: 10, completion_rate: 60, last_training: '2024-06-10' }
  ];

  const mockComplianceData = [
    { id: 1, requirement: 'Safety Training', status: 'Compliant', employees_compliant: 45, total_employees: 50, due_date: '2024-12-31' },
    { id: 2, requirement: 'Data Privacy', status: 'Non-Compliant', employees_compliant: 38, total_employees: 50, due_date: '2024-09-30' },
    { id: 3, requirement: 'Code of Conduct', status: 'Compliant', employees_compliant: 50, total_employees: 50, due_date: '2024-11-15' }
  ];

  const mockCertificationData = [
    { id: 1, employee: 'John Doe', certification: 'PMP', status: 'Valid', expiry_date: '2025-03-15', renewal_required: false },
    { id: 2, employee: 'Jane Smith', certification: 'Google Analytics', status: 'Expired', expiry_date: '2024-06-30', renewal_required: true },
    { id: 3, employee: 'Mike Johnson', certification: 'Salesforce Admin', status: 'Valid', expiry_date: '2024-12-20', renewal_required: false }
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedMonth]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      setReportData({
        monthlyReports: {
          performance: mockPerformanceData,
          attendance: mockAttendanceData,
          payroll: mockPayrollData
        },
        complianceReports: {
          training: mockTrainingData,
          regulatory: mockComplianceData,
          certifications: mockCertificationData
        }
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = (data, title, columns) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Report Period: ${selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 14, 40);
    
    const tableData = data.map(row => columns.map(col => row[col.key] || ''));
    const tableHeaders = columns.map(col => col.label);
    
    autoTable(doc, {
      head: [[...tableHeaders]], // Update this line
      body: tableData,
      startY: 50,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save(`${title.replace(/\s+/g, '_')}_${selectedMonth.getFullYear()}_${selectedMonth.getMonth() + 1}.pdf`);
  };

  const exportToCSV = (data, title, columns) => {
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(row => 
      columns.map(col => {
        const value = row[col.key] || '';
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${selectedMonth.getFullYear()}_${selectedMonth.getMonth() + 1}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = (type, format) => {
    let data, title, columns;
    
    switch (type) {
      case 'performance':
        data = reportData.monthlyReports.performance;
        title = 'Employee Performance Report';
        columns = [
          { key: 'employee', label: 'Employee' },
          { key: 'department', label: 'Department' },
          { key: 'rating', label: 'Rating' },
          { key: 'goals_met', label: 'Goals Met' },
          { key: 'goals_total', label: 'Total Goals' },
          { key: 'feedback_score', label: 'Feedback Score' }
        ];
        break;
      case 'attendance':
        data = reportData.monthlyReports.attendance;
        title = 'Employee Attendance Report';
        columns = [
          { key: 'employee', label: 'Employee' },
          { key: 'days_present', label: 'Days Present' },
          { key: 'days_total', label: 'Total Days' },
          { key: 'late_arrivals', label: 'Late Arrivals' },
          { key: 'early_departures', label: 'Early Departures' },
          { key: 'attendance_rate', label: 'Attendance Rate (%)' }
        ];
        break;
      case 'payroll':
        data = reportData.monthlyReports.payroll;
        title = 'Payroll Summary Report';
        columns = [
          { key: 'employee', label: 'Employee' },
          { key: 'base_salary', label: 'Base Salary' },
          { key: 'overtime', label: 'Overtime' },
          { key: 'bonuses', label: 'Bonuses' },
          { key: 'deductions', label: 'Deductions' },
          { key: 'net_pay', label: 'Net Pay' }
        ];
        break;
      case 'training':
        data = reportData.complianceReports.training;
        title = 'Training Completion Report';
        columns = [
          { key: 'employee', label: 'Employee' },
          { key: 'completed_courses', label: 'Completed Courses' },
          { key: 'required_courses', label: 'Required Courses' },
          { key: 'completion_rate', label: 'Completion Rate (%)' },
          { key: 'last_training', label: 'Last Training Date' }
        ];
        break;
      case 'compliance':
        data = reportData.complianceReports.regulatory;
        title = 'Regulatory Compliance Report';
        columns = [
          { key: 'requirement', label: 'Requirement' },
          { key: 'status', label: 'Status' },
          { key: 'employees_compliant', label: 'Compliant Employees' },
          { key: 'total_employees', label: 'Total Employees' },
          { key: 'due_date', label: 'Due Date' }
        ];
        break;
      case 'certifications':
        data = reportData.complianceReports.certifications;
        title = 'Certification Tracking Report';
        columns = [
          { key: 'employee', label: 'Employee' },
          { key: 'certification', label: 'Certification' },
          { key: 'status', label: 'Status' },
          { key: 'expiry_date', label: 'Expiry Date' },
          { key: 'renewal_required', label: 'Renewal Required' }
        ];
        break;
      default:
        return;
    }
    
    if (format === 'pdf') {
      exportToPDF(data, title, columns);
    } else {
      exportToCSV(data, title, columns);
    }
    
    setExportDialog(false);
  };

  const openExportDialog = (type) => {
    setExportType(type);
    setExportDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
      case 'valid':
        return 'success';
      case 'non-compliant':
      case 'expired':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
      case 'valid':
        return <CheckIcon />;
      case 'non-compliant':
      case 'expired':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <ReportIcon sx={{ mr: 2 }} />
          HR Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monthly Reports: Employee performance, attendance, and payroll summaries for the current month.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Compliance Reports: Regulatory compliance, training completion, and certification tracking.
        </Typography>
      </Box>

      {/* Date Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Report Month"
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  views={['year', 'month']}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                onClick={loadReportData}
                disabled={loading}
                startIcon={<DateIcon />}
              >
                Generate Reports
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Report Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Monthly Reports" />
          <Tab label="Compliance Reports" />
        </Tabs>

        <CardContent>
          {/* Monthly Reports Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Performance Report */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} />
                    Employee Performance
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('performance')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Goals Met</TableCell>
                        <TableCell>Feedback Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.monthlyReports.performance.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee}</TableCell>
                          <TableCell>{row.department}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={(row.rating / 5) * 100}
                                sx={{ width: 60, mr: 1 }}
                              />
                              {row.rating}/5
                            </Box>
                          </TableCell>
                          <TableCell>{row.goals_met}/{row.goals_total}</TableCell>
                          <TableCell>{row.feedback_score}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Attendance Report */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    Attendance Summary
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('attendance')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Days Present</TableCell>
                        <TableCell>Attendance Rate</TableCell>
                        <TableCell>Late Arrivals</TableCell>
                        <TableCell>Early Departures</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.monthlyReports.attendance.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee}</TableCell>
                          <TableCell>{row.days_present}/{row.days_total}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={row.attendance_rate}
                                sx={{ width: 60, mr: 1 }}
                                color={row.attendance_rate >= 95 ? 'success' : row.attendance_rate >= 85 ? 'warning' : 'error'}
                              />
                              {row.attendance_rate}%
                            </Box>
                          </TableCell>
                          <TableCell>{row.late_arrivals}</TableCell>
                          <TableCell>{row.early_departures}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Payroll Report */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PayrollIcon sx={{ mr: 1 }} />
                    Payroll Summary
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('payroll')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Base Salary</TableCell>
                        <TableCell>Overtime</TableCell>
                        <TableCell>Bonuses</TableCell>
                        <TableCell>Deductions</TableCell>
                        <TableCell>Net Pay</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.monthlyReports.payroll.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee}</TableCell>
                          <TableCell>${row.base_salary?.toLocaleString()}</TableCell>
                          <TableCell>${row.overtime?.toLocaleString()}</TableCell>
                          <TableCell>${row.bonuses?.toLocaleString()}</TableCell>
                          <TableCell>${row.deductions?.toLocaleString()}</TableCell>
                          <TableCell><strong>${row.net_pay?.toLocaleString()}</strong></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}

          {/* Compliance Reports Tab */}
          {activeTab === 1 && (
            <Box>
              {/* Training Completion */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrainingIcon sx={{ mr: 1 }} />
                    Training Completion
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('training')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Completed Courses</TableCell>
                        <TableCell>Completion Rate</TableCell>
                        <TableCell>Last Training</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.complianceReports.training.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee}</TableCell>
                          <TableCell>{row.completed_courses}/{row.required_courses}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={row.completion_rate}
                                sx={{ width: 60, mr: 1 }}
                                color={row.completion_rate >= 80 ? 'success' : row.completion_rate >= 60 ? 'warning' : 'error'}
                              />
                              {row.completion_rate}%
                            </Box>
                          </TableCell>
                          <TableCell>{row.last_training}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Regulatory Compliance */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <ComplianceIcon sx={{ mr: 1 }} />
                    Regulatory Compliance
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('compliance')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Requirement</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Compliance Rate</TableCell>
                        <TableCell>Due Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.complianceReports.regulatory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.requirement}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              color={getStatusColor(row.status)}
                              icon={getStatusIcon(row.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress
                                variant="determinate"
                                value={(row.employees_compliant / row.total_employees) * 100}
                                sx={{ width: 60, mr: 1 }}
                                color={row.status === 'Compliant' ? 'success' : 'error'}
                              />
                              {row.employees_compliant}/{row.total_employees}
                            </Box>
                          </TableCell>
                          <TableCell>{row.due_date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Certification Tracking */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckIcon sx={{ mr: 1 }} />
                    Certification Tracking
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<PdfIcon />}
                    onClick={() => openExportDialog('certifications')}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee</TableCell>
                        <TableCell>Certification</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell>Action Required</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.complianceReports.certifications.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.employee}</TableCell>
                          <TableCell>{row.certification}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              color={getStatusColor(row.status)}
                              icon={getStatusIcon(row.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{row.expiry_date}</TableCell>
                          <TableCell>
                            {row.renewal_required ? (
                              <Chip label="Renewal Required" color="warning" size="small" />
                            ) : (
                              <Chip label="No Action" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Export Format</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              label="Export Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleExport(exportType, exportFormat)}
            variant="contained"
            startIcon={exportFormat === 'pdf' ? <PdfIcon /> : <CsvIcon />}
          >
            Export {exportFormat.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
