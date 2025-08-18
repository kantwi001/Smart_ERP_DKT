import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  FormControl, InputLabel, Select, CircularProgress, Alert, Chip, IconButton,
  List, ListItem, ListItemText, Divider, Avatar, LinearProgress, Tooltip,
  Switch, FormControlLabel, Rating
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as RequestIcon,
  Business as VendorIcon,
  Assessment as AnalysisIcon,
  Gavel as BidIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ShoppingBag as OrderIcon
} from '@mui/icons-material';
import { AuthContext } from '../AuthContext';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProcurementDashboardManagement = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for different modules
  const [requests, setRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [iqcContracts, setIqcContracts] = useState([]);
  const [bidAnalysis, setBidAnalysis] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  
  // Mock data for demonstration
  const mockRequests = [
    {
      id: 1,
      title: 'Office Supplies Procurement',
      department: 'Administration',
      priority: 'high',
      status: 'pending_approval',
      budget: 15000,
      deadline: '2024-01-15',
      requested_by: 'John Doe'
    },
    {
      id: 2,
      title: 'IT Equipment Purchase',
      department: 'IT',
      priority: 'medium',
      status: 'approved',
      budget: 50000,
      deadline: '2024-02-01',
      requested_by: 'Jane Smith'
    }
  ];

  const mockVendors = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      contact_person: 'Sarah Wilson',
      email: 'sarah@techcorp.com',
      category: 'IT Equipment',
      preferred: true,
      rating: 4.5,
      compliance_score: 95,
      on_time_delivery: 92
    },
    {
      id: 2,
      name: 'Office Plus Ltd',
      contact_person: 'David Brown',
      email: 'david@officeplus.com',
      category: 'Office Supplies',
      preferred: true,
      rating: 4.2,
      compliance_score: 88,
      on_time_delivery: 85
    }
  ];

  const mockIqcContracts = [
    {
      id: 1,
      contract_number: 'IQC-2024-001',
      vendor_name: 'TechCorp Solutions',
      contract_title: 'IT Equipment Supply Contract',
      contract_type: 'Indefinite Quantity',
      min_quantity: 10,
      max_quantity: 1000,
      unit_price: 1200,
      contract_value: 1200000,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      status: 'active',
      orders_placed: 15,
      remaining_quantity: 850
    },
    {
      id: 2,
      contract_number: 'IQC-2024-002',
      vendor_name: 'Office Plus Ltd',
      contract_title: 'Office Supplies Contract',
      contract_type: 'Indefinite Quantity',
      min_quantity: 50,
      max_quantity: 5000,
      unit_price: 25,
      contract_value: 125000,
      start_date: '2024-02-01',
      end_date: '2024-12-31',
      status: 'active',
      orders_placed: 8,
      remaining_quantity: 4200
    }
  ];

  const mockBidAnalysis = [
    {
      id: 1,
      request_title: 'Office Supplies Procurement',
      total_bids: 4,
      lowest_bid: 12000,
      recommended_vendor: 'Office Plus Ltd',
      cost_savings: 3000,
      bids: [
        { vendor: 'Office Plus Ltd', amount: 12000, delivery_time: 7, quality_score: 8.5 },
        { vendor: 'Supply Chain Co', amount: 13500, delivery_time: 10, quality_score: 7.8 }
      ]
    }
  ];

  const mockPurchaseOrders = [
    {
      id: 1,
      order_number: 'PO-2024-001',
      vendor_name: 'TechCorp Solutions',
      order_date: '2024-01-05',
      total_amount: 12000,
      status: 'pending',
      items: [
        { item_name: 'Laptop', quantity: 10, unit_price: 1200 },
        { item_name: 'Printer', quantity: 5, unit_price: 500 }
      ]
    },
    {
      id: 2,
      order_number: 'PO-2024-002',
      vendor_name: 'Office Plus Ltd',
      order_date: '2024-02-10',
      total_amount: 15000,
      status: 'approved',
      items: [
        { item_name: 'Office Chair', quantity: 20, unit_price: 750 },
        { item_name: 'Desk', quantity: 15, unit_price: 1000 }
      ]
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load mock data
        setRequests(mockRequests);
        setVendors(mockVendors);
        setIqcContracts(mockIqcContracts);
        setBidAnalysis(mockBidAnalysis);
        setPurchaseOrders(mockPurchaseOrders);
        
        console.log('Procurement data loaded successfully:', {
          requests: mockRequests.length,
          vendors: mockVendors.length,
          contracts: mockIqcContracts.length,
          bidAnalysis: mockBidAnalysis.length,
          purchaseOrders: mockPurchaseOrders.length
        });
      } catch (err) {
        console.error('Error loading procurement data:', err);
        setError('Failed to load procurement data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApproveRequest = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    alert('Request approved successfully!');
  };

  const handleTogglePreferredVendor = (vendorId) => {
    setVendors(vendors.map(v => 
      v.id === vendorId ? { ...v, preferred: !v.preferred } : v
    ));
    alert('Vendor preference updated!');
  };

  const handleExportBidReport = (analysisId) => {
    const analysis = bidAnalysis.find(a => a.id === analysisId);
    if (!analysis) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Bid Analysis Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Request: ${analysis.request_title}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Total Bids: ${analysis.total_bids}`, 20, 55);
    doc.text(`Lowest Bid: ${formatCurrency(analysis.lowest_bid)}`, 20, 65);
    doc.text(`Recommended Vendor: ${analysis.recommended_vendor}`, 20, 75);
    doc.text(`Cost Savings: ${formatCurrency(analysis.cost_savings)}`, 20, 85);

    // Bid comparison table
    const tableData = analysis.bids.map(bid => [
      bid.vendor,
      formatCurrency(bid.amount),
      `${bid.delivery_time} days`,
      `${bid.quality_score}/10`
    ]);

    autoTable(doc, {
      head: [['Vendor', 'Bid Amount', 'Delivery Time', 'Quality Score']],
      body: tableData,
      startY: 95,
      theme: 'striped',
      headStyles: { fillColor: [121, 85, 72] }
    });

    doc.save(`bid-analysis-${analysis.id}.pdf`);
  };

  const handleNewRequest = () => {
    // This would open a dialog to create a new procurement request
    alert('New Request dialog would open here');
  };

  const handleNewVendor = () => {
    // This would open a dialog to add a new vendor
    alert('New Vendor dialog would open here');
  };

  const handleNewIqcContract = () => {
    // This would open a dialog to create a new IQC contract
    alert('New IQC Contract dialog would open here');
  };

  const handleViewRequest = (requestId) => {
    // This would open a dialog to view request details
    alert(`View request ${requestId} details`);
  };

  const handleViewVendor = (vendorId) => {
    // This would open a dialog to view vendor details
    alert(`View vendor ${vendorId} details`);
  };

  const handleEditVendor = (vendorId) => {
    // This would open a dialog to edit vendor details
    alert(`Edit vendor ${vendorId}`);
  };

  const handleViewContract = (contractId) => {
    // This would open a dialog to view contract details
    alert(`View contract ${contractId} details`);
  };

  const handleEditContract = (contractId) => {
    // This would open a dialog to edit contract details
    alert(`Edit contract ${contractId}`);
  };

  const formatCurrency = (amount) => {
    return `GHS ${amount?.toLocaleString() || '0'}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending_approval': return 'warning';
      case 'passed': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 0 }}>
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
        color: 'white',
        p: 4,
        borderRadius: '0 0 24px 24px',
        mb: 3
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Procurement Dashboard Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage workflows, requests, vendors, IQC, and bid analysis
            </Typography>
          </Box>
          <IconButton 
            onClick={() => window.location.reload()} 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Pending Requests</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {requests.filter(r => r.status === 'pending_approval').length}
                  </Typography>
                </Box>
                <RequestIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Preferred Vendors</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {vendors.filter(v => v.preferred).length}
                  </Typography>
                </Box>
                <VendorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>IQC Contracts</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {iqcContracts.length}
                  </Typography>
                </Box>
                <AnalysisIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Active Bids</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {bidAnalysis.length}
                  </Typography>
                </Box>
                <BidIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Interface */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            backgroundColor: '#fff',
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: 'linear-gradient(45deg, #795548 30%, #5D4037 90%)',
            },
          }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<RequestIcon />} label="Requests" />
          <Tab icon={<VendorIcon />} label="Vendors" />
          <Tab icon={<AnalysisIcon />} label="IQC Contracts" />
          <Tab icon={<BidIcon />} label="Bid Analysis" />
          <Tab icon={<OrderIcon />} label="Purchase Orders" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1, color: '#795548' }} />
                    Procurement Workflow Status
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[
                      { stage: 'Request Submission', completed: 15, total: 18, color: '#4CAF50' },
                      { stage: 'Approval Process', completed: 12, total: 15, color: '#2196F3' },
                      { stage: 'Vendor Selection', completed: 8, total: 12, color: '#FF9800' },
                      { stage: 'Indefinite Quantity Contracts (IQC)', completed: 6, total: 8, color: '#9C27B0' }
                    ].map((stage) => (
                      <Box key={stage.stage}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {stage.stage}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stage.completed}/{stage.total}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(stage.completed / stage.total) * 100} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': { bgcolor: stage.color }
                          }} 
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <WarningIcon sx={{ mr: 1, color: '#FF9800' }} />
                    Priority Actions Required
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List sx={{ py: 0 }}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="5 requests pending approval"
                        secondary="Review and approve urgent procurement requests"
                      />
                      <Chip label="High" color="error" size="small" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="3 vendors need compliance review"
                        secondary="Update vendor compliance scores"
                      />
                      <Chip label="Medium" color="warning" size="small" />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="2 IQC contracts expiring soon"
                        secondary="Review and renew indefinite quantity contracts"
                      />
                      <Chip label="High" color="error" size="small" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Requests Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Procurement Requests</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
                onClick={handleNewRequest}
              >
                New Request
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.title}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.priority} 
                          color={request.priority === 'high' ? 'error' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(request.budget)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status.replace('_', ' ')} 
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewRequest(request.id)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'pending_approval' && (
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Vendors Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Vendor Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
                onClick={handleNewVendor}
              >
                Add Vendor
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {vendors.map((vendor) => (
                <Grid item xs={12} md={6} key={vendor.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {vendor.name}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={vendor.preferred}
                              onChange={() => handleTogglePreferredVendor(vendor.id)}
                              color="primary"
                            />
                          }
                          label={
                            <Box display="flex" alignItems="center">
                              <StarIcon sx={{ fontSize: 16, mr: 0.5, color: vendor.preferred ? '#FFD700' : '#ccc' }} />
                              Preferred
                            </Box>
                          }
                          labelPlacement="start"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Contact: {vendor.contact_person}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Category: {vendor.category}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Rating</Typography>
                          <Rating value={vendor.rating} precision={0.1} size="small" readOnly />
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Compliance Score</Typography>
                          <Typography variant="body2" color={vendor.compliance_score >= 90 ? 'success.main' : 'warning.main'}>
                            {vendor.compliance_score}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" gap={1}>
                        <IconButton size="small" color="primary" onClick={() => handleViewVendor(vendor.id)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => handleEditVendor(vendor.id)}>
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* IQC Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Indefinite Quantity Contracts (IQC)</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
                onClick={handleNewIqcContract}
              >
                New IQC Contract
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contract Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Contract Title</TableCell>
                    <TableCell>Contract Type</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Contract Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {iqcContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.contract_number}</TableCell>
                      <TableCell>{contract.vendor_name}</TableCell>
                      <TableCell>{contract.contract_title}</TableCell>
                      <TableCell>{contract.contract_type}</TableCell>
                      <TableCell>{formatCurrency(contract.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={contract.status} 
                          color={contract.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleViewContract(contract.id)}>
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => handleEditContract(contract.id)}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Bid Analysis Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Bid Analysis & Comparison</Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
              >
                Export Report
              </Button>
            </Box>
            
            {bidAnalysis.map((analysis) => (
              <Paper key={analysis.id} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {analysis.request_title}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">Total Bids</Typography>
                    <Typography variant="h6">{analysis.total_bids}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">Lowest Bid</Typography>
                    <Typography variant="h6">{formatCurrency(analysis.lowest_bid)}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">Recommended</Typography>
                    <Typography variant="h6">{analysis.recommended_vendor}</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">Cost Savings</Typography>
                    <Typography variant="h6" color="success.main">{formatCurrency(analysis.cost_savings)}</Typography>
                  </Grid>
                </Grid>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Bid Amount</TableCell>
                        <TableCell>Delivery Time</TableCell>
                        <TableCell>Quality Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysis.bids.map((bid, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{bid.vendor}</TableCell>
                          <TableCell>{formatCurrency(bid.amount)}</TableCell>
                          <TableCell>{bid.delivery_time} days</TableCell>
                          <TableCell>{bid.quality_score}/10</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
                  onClick={() => handleExportBidReport(analysis.id)}
                >
                  Export Report
                </Button>
              </Paper>
            ))}
          </Box>
        )}

        {/* Purchase Orders Tab */}
        {tabValue === 5 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Purchase Orders</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: '#795548', '&:hover': { bgcolor: '#5D4037' } }}
                onClick={() => alert('New Purchase Order dialog would open here')}
              >
                New Purchase Order
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order Number</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Order Date</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.vendor_name}</TableCell>
                      <TableCell>{order.order_date}</TableCell>
                      <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status} 
                          color={order.status === 'approved' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => alert(`View order ${order.id} details`)}>
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProcurementDashboardManagement;
