import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as ProcurementIcon,
  Assignment as OrderIcon,
  TrendingUp as TrendingUpIcon,
  People as VendorIcon,
  Assessment as ReportIcon,
  LocalShipping as LogisticsIcon,
  Timeline as AnalyticsIcon,
  PieChart as ChartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for modern design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #795548 30%, #8D6E63 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#795548',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #795548 0%, #8D6E63 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const ReportCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ProcurementModule = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock data for reports and analytics
  const procurementAnalytics = {
    monthlySpend: [
      { month: 'Jan', amount: 245000 },
      { month: 'Feb', amount: 320000 },
      { month: 'Mar', amount: 280000 },
      { month: 'Apr', amount: 390000 },
      { month: 'May', amount: 420000 },
      { month: 'Jun', amount: 380000 }
    ],
    topVendors: [
      { name: 'ABC Supplies Ltd', totalValue: 850000, orders: 45 },
      { name: 'XYZ Materials Co', totalValue: 720000, orders: 38 },
      { name: 'Global Tech Solutions', totalValue: 650000, orders: 32 },
      { name: 'Premium Office Supplies', totalValue: 480000, orders: 28 },
      { name: 'Industrial Equipment Inc', totalValue: 420000, orders: 22 }
    ],
    categorySpend: [
      { category: 'Office Supplies', amount: 450000, percentage: 25 },
      { category: 'IT Equipment', amount: 540000, percentage: 30 },
      { category: 'Raw Materials', amount: 360000, percentage: 20 },
      { category: 'Services', amount: 270000, percentage: 15 },
      { category: 'Maintenance', amount: 180000, percentage: 10 }
    ]
  };

  const logisticsData = [
    { shipmentId: 'SH001', vendor: 'ABC Supplies Ltd', status: 'In Transit', eta: '2024-01-20', value: 45000 },
    { shipmentId: 'SH002', vendor: 'XYZ Materials Co', status: 'Delivered', eta: '2024-01-18', value: 32000 },
    { shipmentId: 'SH003', vendor: 'Global Tech Solutions', status: 'Processing', eta: '2024-01-25', value: 78000 },
    { shipmentId: 'SH004', vendor: 'Premium Office Supplies', status: 'In Transit', eta: '2024-01-22', value: 25000 }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#795548' }}>
        Procurement & Logistics Report
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <StyledTab 
            icon={<TrendingUpIcon />} 
            label="Overview" 
            iconPosition="start"
          />
          <StyledTab 
            icon={<AnalyticsIcon />} 
            label="Analytics" 
            iconPosition="start"
          />
          <StyledTab 
            icon={<LogisticsIcon />} 
            label="Logistics" 
            iconPosition="start"
          />
          <StyledTab 
            icon={<ReportIcon />} 
            label="Reports" 
            iconPosition="start"
          />
        </StyledTabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#795548', fontWeight: 'bold' }}>
              Procurement Overview
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          156
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Requests
                        </Typography>
                      </Box>
                      <OrderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          42
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Active Vendors
                        </Typography>
                      </Box>
                      <VendorIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          GHS 2.4M
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Total Value
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          18
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Pending Approvals
                        </Typography>
                      </Box>
                      <ReportIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
            </Grid>

            <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', mt: 4 }}>
              Welcome to the Procurement & Logistics Report System. Access detailed procurement workflows, vendor management, and purchase order processing through the Procurement Management module in the side menu.
            </Typography>
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#795548', fontWeight: 'bold' }}>
              Procurement Analytics
            </Typography>
            
            <Grid container spacing={3}>
              {/* Top Vendors */}
              <Grid item xs={12} md={6}>
                <ReportCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#795548' }}>
                      Top Vendors by Value
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Vendor</strong></TableCell>
                            <TableCell align="right"><strong>Total Value</strong></TableCell>
                            <TableCell align="right"><strong>Orders</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {procurementAnalytics.topVendors.map((vendor, index) => (
                            <TableRow key={index}>
                              <TableCell>{vendor.name}</TableCell>
                              <TableCell align="right">GHS {vendor.totalValue.toLocaleString()}</TableCell>
                              <TableCell align="right">{vendor.orders}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </ReportCard>
              </Grid>

              {/* Category Spending */}
              <Grid item xs={12} md={6}>
                <ReportCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#795548' }}>
                      Spending by Category
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell align="right"><strong>%</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {procurementAnalytics.categorySpend.map((category, index) => (
                            <TableRow key={index}>
                              <TableCell>{category.category}</TableCell>
                              <TableCell align="right">GHS {category.amount.toLocaleString()}</TableCell>
                              <TableCell align="right">{category.percentage}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </ReportCard>
              </Grid>

              {/* Monthly Spend Trend */}
              <Grid item xs={12}>
                <ReportCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#795548' }}>
                      Monthly Spending Trend
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {procurementAnalytics.monthlySpend.map((month, index) => (
                              <TableCell key={index} align="center"><strong>{month.month}</strong></TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            {procurementAnalytics.monthlySpend.map((month, index) => (
                              <TableCell key={index} align="center">GHS {month.amount.toLocaleString()}</TableCell>
                            ))}
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </ReportCard>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Logistics Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#795548', fontWeight: 'bold' }}>
              Logistics Tracking
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          24
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Active Shipments
                        </Typography>
                      </Box>
                      <LogisticsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          89%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          On-Time Delivery
                        </Typography>
                      </Box>
                      <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          12
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          In Transit
                        </Typography>
                      </Box>
                      <OrderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                          6
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Delayed
                        </Typography>
                      </Box>
                      <ReportIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Grid>
            </Grid>

            <ReportCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#795548' }}>
                  Current Shipments
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Shipment ID</strong></TableCell>
                        <TableCell><strong>Vendor</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>ETA</strong></TableCell>
                        <TableCell align="right"><strong>Value</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logisticsData.map((shipment, index) => (
                        <TableRow key={index}>
                          <TableCell>{shipment.shipmentId}</TableCell>
                          <TableCell>{shipment.vendor}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                px: 2,
                                py: 0.5,
                                borderRadius: 1,
                                backgroundColor: 
                                  shipment.status === 'Delivered' ? '#4caf50' :
                                  shipment.status === 'In Transit' ? '#ff9800' : '#2196f3',
                                color: 'white',
                                fontSize: '0.8rem',
                                display: 'inline-block'
                              }}
                            >
                              {shipment.status}
                            </Box>
                          </TableCell>
                          <TableCell>{shipment.eta}</TableCell>
                          <TableCell align="right">GHS {shipment.value.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </ReportCard>
          </Box>
        )}

        {/* Reports Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#795548', fontWeight: 'bold' }}>
              Procurement Reports
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <ReportCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChartIcon sx={{ fontSize: 48, color: '#795548', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Vendor Performance Report
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Detailed analysis of vendor delivery times, quality ratings, and cost efficiency.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#795548' }}>
                      Last Updated: Today
                    </Typography>
                  </CardContent>
                </ReportCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <ReportCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 48, color: '#795548', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Cost Analysis Report
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Comprehensive breakdown of procurement costs by category, vendor, and time period.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#795548' }}>
                      Last Updated: Yesterday
                    </Typography>
                  </CardContent>
                </ReportCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <ReportCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ReportIcon sx={{ fontSize: 48, color: '#795548', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Compliance Report
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      Regulatory compliance status, audit trails, and policy adherence metrics.
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#795548' }}>
                      Last Updated: 2 days ago
                    </Typography>
                  </CardContent>
                </ReportCard>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProcurementModule;
