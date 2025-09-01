import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getApiBaseUrl } from './api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SalesReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    topProducts: [],
    topCustomers: []
  });

  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [reportType, setReportType] = useState('overview');

  // Chart data
  const [chartData, setChartData] = useState({
    dailySales: [],
    productSales: [],
    customerSales: [],
    statusDistribution: []
  });

  useEffect(() => {
    fetchSalesReports();
  }, [dateRange, selectedCustomer, selectedProduct, selectedStatus]);

  const fetchSalesReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams({
        start_date: dateRange.startDate.toISOString().split('T')[0],
        end_date: dateRange.endDate.toISOString().split('T')[0],
        customer: selectedCustomer !== 'all' ? selectedCustomer : '',
        product: selectedProduct !== 'all' ? selectedProduct : '',
        status: selectedStatus !== 'all' ? selectedStatus : ''
      });

      const response = await fetch(`${getApiBaseUrl()}/sales/reports/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSalesData(data.sales || []);
        setSummaryStats(data.summary || {});
        processChartData(data.sales || []);
      } else {
        setError('Failed to fetch sales reports');
      }
    } catch (error) {
      console.error('Error fetching sales reports:', error);
      setError('Failed to load sales reports');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (sales) => {
    // Daily sales chart
    const dailyData = sales.reduce((acc, sale) => {
      const date = new Date(sale.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += parseFloat(sale.total_amount || 0);
      acc[date].orders += 1;
      return acc;
    }, {});

    // Product sales chart
    const productData = sales.reduce((acc, sale) => {
      sale.items?.forEach(item => {
        const productName = item.product_name || 'Unknown';
        if (!acc[productName]) {
          acc[productName] = { name: productName, quantity: 0, revenue: 0 };
        }
        acc[productName].quantity += item.quantity || 0;
        acc[productName].revenue += parseFloat(item.total_price || 0);
      });
      return acc;
    }, {});

    // Customer sales chart
    const customerData = sales.reduce((acc, sale) => {
      const customerName = sale.customer_name || 'Unknown';
      if (!acc[customerName]) {
        acc[customerName] = { name: customerName, orders: 0, revenue: 0 };
      }
      acc[customerName].orders += 1;
      acc[customerName].revenue += parseFloat(sale.total_amount || 0);
      return acc;
    }, {});

    // Status distribution
    const statusData = sales.reduce((acc, sale) => {
      const status = sale.status || 'Unknown';
      if (!acc[status]) {
        acc[status] = { name: status, value: 0 };
      }
      acc[status].value += 1;
      return acc;
    }, {});

    setChartData({
      dailySales: Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date)),
      productSales: Object.values(productData).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      customerSales: Object.values(customerData).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      statusDistribution: Object.values(statusData)
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Customer', 'Total Amount', 'Status', 'Payment Method'],
      ...salesData.map(sale => [
        new Date(sale.created_at).toLocaleDateString(),
        sale.customer_name || 'N/A',
        sale.total_amount || 0,
        sale.status || 'N/A',
        sale.payment_method || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Sales Reports
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSalesReports}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="overview">Overview</MenuItem>
                  <MenuItem value="detailed">Detailed</MenuItem>
                  <MenuItem value="trends">Trends</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Statistics */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Revenue"
              value={`₵${summaryStats.totalRevenue?.toLocaleString() || 0}`}
              icon={<MoneyIcon fontSize="large" />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Orders"
              value={summaryStats.totalOrders || 0}
              icon={<CartIcon fontSize="large" />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Customers"
              value={summaryStats.totalCustomers || 0}
              icon={<PeopleIcon fontSize="large" />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Avg Order Value"
              value={`₵${summaryStats.avgOrderValue?.toFixed(2) || 0}`}
              icon={<InventoryIcon fontSize="large" />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} mb={3}>
          {/* Daily Sales Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Sales Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₵)" />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Status Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Products by Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.productSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Top Customers */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Customers by Revenue
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.customerSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Sales Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Sales Details
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesData.slice(0, 20).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{sale.customer_name || 'N/A'}</TableCell>
                    <TableCell>₵{parseFloat(sale.total_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={sale.status}
                        color={
                          sale.status === 'confirmed' ? 'success' :
                          sale.status === 'pending' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{sale.payment_method || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <InventoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default SalesReports;
