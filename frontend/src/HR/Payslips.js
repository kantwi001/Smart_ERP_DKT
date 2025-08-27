import React, { useEffect, useState } from 'react';
import api from '../api';
import { 
  Box, 
  Typography, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Download as DownloadIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock payslips data for development
  const mockPayslips = [
    {
      id: 1,
      period: 'January 2024',
      gross_amount: 8500.00,
      net_amount: 6800.00,
      status: 'Paid',
      payment_date: '2024-01-31',
      deductions: {
        tax: 1200.00,
        social_security: 340.00,
        health_insurance: 160.00
      },
      allowances: {
        transport: 200.00,
        meal: 150.00
      },
      employee_info: {
        name: 'John Doe',
        employee_id: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer'
      }
    },
    {
      id: 2,
      period: 'December 2023',
      gross_amount: 8500.00,
      net_amount: 6800.00,
      status: 'Paid',
      payment_date: '2023-12-31',
      deductions: {
        tax: 1200.00,
        social_security: 340.00,
        health_insurance: 160.00
      },
      allowances: {
        transport: 200.00,
        meal: 150.00
      },
      employee_info: {
        name: 'John Doe',
        employee_id: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer'
      }
    },
    {
      id: 3,
      period: 'November 2023',
      gross_amount: 8500.00,
      net_amount: 6800.00,
      status: 'Paid',
      payment_date: '2023-11-30',
      deductions: {
        tax: 1200.00,
        social_security: 340.00,
        health_insurance: 160.00
      },
      allowances: {
        transport: 200.00,
        meal: 150.00
      },
      employee_info: {
        name: 'John Doe',
        employee_id: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer'
      }
    },
    {
      id: 4,
      period: 'February 2024',
      gross_amount: 8500.00,
      net_amount: 6800.00,
      status: 'Processing',
      payment_date: null,
      deductions: {
        tax: 1200.00,
        social_security: 340.00,
        health_insurance: 160.00
      },
      allowances: {
        transport: 200.00,
        meal: 150.00
      },
      employee_info: {
        name: 'John Doe',
        employee_id: 'EMP001',
        department: 'Engineering',
        position: 'Software Developer'
      }
    }
  ];

  const fetchMyPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first, fall back to mock data
      try {
        const response = await api.get('/hr/payroll/my-payslips/');
        setPayslips(response.data);
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Use mock data when API is not available
        setTimeout(() => {
          setPayslips(mockPayslips);
        }, 1000); // Simulate loading time
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);
      setError('Failed to load payslips. Please try again later.');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const generatePayslipPDF = (payslip) => {
    const doc = new jsPDF();
    
    // Company header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('ERP SYSTEM', 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Employee Payslip', 20, 35);
    
    // Payslip title
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(`Payslip for ${payslip.period}`, 20, 50);
    
    // Employee information
    doc.setFontSize(12);
    doc.text('Employee Information:', 20, 70);
    
    const employeeData = [
      ['Employee Name', payslip.employee_info?.name || 'John Doe'],
      ['Employee ID', payslip.employee_info?.employee_id || 'EMP001'],
      ['Department', payslip.employee_info?.department || 'Engineering'],
      ['Position', payslip.employee_info?.position || 'Software Developer'],
      ['Pay Period', payslip.period],
      ['Payment Date', payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString() : 'Pending']
    ];
    
    // Create employee info table manually
    let yPosition = 80;
    doc.setFontSize(10);
    
    employeeData.forEach(([field, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(field + ':', 20, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });
    
    // Earnings and Deductions
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Earnings & Deductions:', 20, yPosition);
    yPosition += 15;
    
    const payrollData = [
      ['Basic Salary', formatCurrency(payslip.gross_amount - (payslip.allowances?.transport || 0) - (payslip.allowances?.meal || 0))],
      ['Transport Allowance', formatCurrency(payslip.allowances?.transport || 0)],
      ['Meal Allowance', formatCurrency(payslip.allowances?.meal || 0)],
      ['Gross Amount', formatCurrency(payslip.gross_amount)],
      ['', ''],
      ['Tax Deduction', `-${formatCurrency(payslip.deductions?.tax || 0)}`],
      ['Social Security', `-${formatCurrency(payslip.deductions?.social_security || 0)}`],
      ['Health Insurance', `-${formatCurrency(payslip.deductions?.health_insurance || 0)}`],
      ['Total Deductions', `-${formatCurrency((payslip.deductions?.tax || 0) + (payslip.deductions?.social_security || 0) + (payslip.deductions?.health_insurance || 0))}`],
      ['', ''],
      ['Net Amount', formatCurrency(payslip.net_amount)]
    ];
    
    // Create payroll table manually
    doc.setFontSize(10);
    payrollData.forEach(([description, amount], index) => {
      if (description === '' && amount === '') {
        yPosition += 4;
        return;
      }
      
      if (index === payrollData.length - 1) {
        doc.setFont(undefined, 'bold');
      } else {
        doc.setFont(undefined, 'normal');
      }
      
      doc.text(description, 20, yPosition);
      doc.text(amount, 120, yPosition);
      yPosition += 8;
    });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'normal');
    doc.text('This is a computer-generated payslip. No signature required.', 20, pageHeight - 20);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
    
    return doc;
  };

  const handleDownloadPayslip = async (payslipId, period) => {
    console.log('Download attempt for payslip:', payslipId, period);
    
    // Skip API call and go directly to local PDF generation
    const payslip = payslips.find(p => p.id === payslipId);
    console.log('Found payslip:', payslip);
    
    if (!payslip) {
      console.error('Payslip not found in data');
      alert('Payslip not found. Please refresh and try again.');
      return;
    }

    try {
      console.log('Generating PDF...');
      const doc = generatePayslipPDF(payslip);
      console.log('PDF generated successfully');
      doc.save(`payslip_${period.replace(/\s+/g, '_')}.pdf`);
      console.log('PDF download initiated');
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(`PDF generation failed: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading your payslips...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Payslips
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" mb={3}>
        View and download your payslips. All payslips are generated by the HR department.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Pay Period</strong></TableCell>
              <TableCell><strong>Gross Amount</strong></TableCell>
              <TableCell><strong>Net Amount</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Payment Date</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payslips.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No payslips available yet. Payslips will appear here once HR processes your payroll.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {payslips.map((payslip) => (
              <TableRow key={payslip.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {payslip.period}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatCurrency(payslip.gross_amount || payslip.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(payslip.net_amount || payslip.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={payslip.status || 'Pending'}
                    color={getStatusColor(payslip.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {payslip.payment_date ? new Date(payslip.payment_date).toLocaleDateString() : 'Not paid yet'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadPayslip(payslip.id, payslip.period)}
                    disabled={payslip.status?.toLowerCase() !== 'paid'}
                  >
                    Download PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {payslips.length > 0 && (
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary">
            💡 You can only download payslips that have been marked as "Paid" by HR.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Payslips;
