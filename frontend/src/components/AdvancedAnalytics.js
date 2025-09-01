// AdvancedAnalytics.js - Enhanced analytics with Gantt charts and time-based trends
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  Assessment,
  DateRange,
  BarChart,
  ShowChart,
  PieChart,
  Refresh,
  Download,
  Fullscreen,
  ZoomIn,
  ZoomOut,
  AttachMoney,
  ShoppingCart
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Enhanced Chart Components (using Chart.js or similar)
const ChartContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '400px',
  width: '100%',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const GanttContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '500px',
  width: '100%',
  overflow: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const TrendCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const AdvancedAnalytics = ({ 
  moduleId, 
  data = {}, 
  selectedAgent,
  agentAnalytics,
  timeRange = '30d',
  onTimeRangeChange,
  title = "Advanced Analytics" 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState('line');
  const [viewMode, setViewMode] = useState('trend');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(false);

  // Calculate real analytics from provided data
  const calculateRealAnalytics = useMemo(() => {
    if (!data || !agentAnalytics) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        monthlyTrend: [],
        topProducts: [],
        recentActivity: []
      };
    }

    return {
      totalRevenue: parseFloat(agentAnalytics.totalRevenue || 0),
      totalOrders: agentAnalytics.totalOrders || 0,
      conversionRate: parseFloat(agentAnalytics.conversionRate || 0),
      averageOrderValue: parseFloat(agentAnalytics.averageOrderValue || 0),
      monthlyTrend: agentAnalytics.monthlyTrend || [],
      topProducts: data.topProducts || [],
      recentActivity: agentAnalytics.recentOrders || []
    };
  }, [data, agentAnalytics]);

  // Performance metrics cards
  const performanceMetrics = [
    {
      title: 'Total Revenue',
      value: `$${calculateRealAnalytics.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: <AttachMoney />,
      color: '#4CAF50'
    },
    {
      title: 'Total Sales',
      value: calculateRealAnalytics.totalOrders.toLocaleString(),
      change: '+8.3%',
      trend: 'up',
      icon: <ShoppingCart />,
      color: '#2196F3'
    },
    {
      title: 'Completed with Payments',
      value: (agentAnalytics?.completedWithPayments || 0).toLocaleString(),
      change: '+5.2%',
      trend: 'up',
      icon: <Assessment />,
      color: '#FF9800'
    },
    {
      title: 'Outstanding Balance',
      value: `$${parseFloat(agentAnalytics?.agingBalances?.total || 0).toLocaleString()}`,
      change: '-3.1%',
      trend: 'down',
      icon: <TrendingDown />,
      color: '#F44336'
    }
  ];

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last Year' },
    { value: '2y', label: 'Last 2 Years' },
    { value: 'all', label: 'All Time' }
  ];

  // Metric options for trends
  const metricOptions = [
    { value: 'transactions', label: 'Transaction Count', icon: <Assessment /> },
    { value: 'revenue', label: 'Revenue', icon: <TrendingUp /> },
    { value: 'volume', label: 'Transaction Volume', icon: <BarChart /> },
    { value: 'success_rate', label: 'Success Rate', icon: <ShowChart /> },
    { value: 'processing_time', label: 'Processing Time', icon: <Timeline /> }
  ];

  // Generate mock Gantt chart data for projects/workflows
  const generateGanttData = useMemo(() => {
    const projects = [
      {
        id: 1,
        name: 'Sales Order Workflow',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-28'),
        progress: 85,
        status: 'active',
        tasks: [
          { name: 'Order Creation', start: '2024-01-15', end: '2024-01-20', progress: 100 },
          { name: 'Inventory Check', start: '2024-01-18', end: '2024-01-25', progress: 100 },
          { name: 'Payment Processing', start: '2024-01-22', end: '2024-02-05', progress: 90 },
          { name: 'Fulfillment', start: '2024-02-01', end: '2024-02-20', progress: 70 },
          { name: 'Delivery', start: '2024-02-15', end: '2024-02-28', progress: 40 }
        ]
      },
      {
        id: 2,
        name: 'Manufacturing Process',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-03-15'),
        progress: 60,
        status: 'active',
        tasks: [
          { name: 'Material Procurement', start: '2024-02-01', end: '2024-02-10', progress: 100 },
          { name: 'Production Planning', start: '2024-02-08', end: '2024-02-15', progress: 100 },
          { name: 'Manufacturing', start: '2024-02-12', end: '2024-03-05', progress: 65 },
          { name: 'Quality Control', start: '2024-02-28', end: '2024-03-10', progress: 30 },
          { name: 'Packaging', start: '2024-03-08', end: '2024-03-15', progress: 10 }
        ]
      },
      {
        id: 3,
        name: 'HR Onboarding',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-02-10'),
        progress: 95,
        status: 'completed',
        tasks: [
          { name: 'Recruitment', start: '2024-01-10', end: '2024-01-20', progress: 100 },
          { name: 'Documentation', start: '2024-01-18', end: '2024-01-25', progress: 100 },
          { name: 'Training', start: '2024-01-22', end: '2024-02-05', progress: 100 },
          { name: 'System Access', start: '2024-02-01', end: '2024-02-08', progress: 90 },
          { name: 'Final Review', start: '2024-02-06', end: '2024-02-10', progress: 80 }
        ]
      }
    ];
    return projects;
  }, []);

  // Generate trend data for different time periods
  const generateTrendData = useMemo(() => {
    const now = new Date();
    const trends = {};

    // Daily trends (last 30 days)
    trends.daily = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        transactions: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        volume: Math.floor(Math.random() * 500) + 100,
        success_rate: Math.floor(Math.random() * 20) + 80,
        processing_time: Math.floor(Math.random() * 300) + 100
      };
    });

    // Monthly trends (last 12 months)
    trends.monthly = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (11 - i));
      return {
        date: date.toISOString().slice(0, 7),
        transactions: Math.floor(Math.random() * 3000) + 500,
        revenue: Math.floor(Math.random() * 300000) + 50000,
        volume: Math.floor(Math.random() * 15000) + 3000,
        success_rate: Math.floor(Math.random() * 15) + 85,
        processing_time: Math.floor(Math.random() * 200) + 150
      };
    });

    // Yearly trends (last 5 years)
    trends.yearly = Array.from({ length: 5 }, (_, i) => {
      const year = now.getFullYear() - (4 - i);
      return {
        date: year.toString(),
        transactions: Math.floor(Math.random() * 30000) + 10000,
        revenue: Math.floor(Math.random() * 3000000) + 500000,
        volume: Math.floor(Math.random() * 150000) + 50000,
        success_rate: Math.floor(Math.random() * 10) + 90,
        processing_time: Math.floor(Math.random() * 100) + 200
      };
    });

    return trends;
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'active': return '#2196f3';
      case 'pending': return '#ff9800';
      case 'delayed': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const renderGanttChart = () => (
    <GanttContainer>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Project Timeline & Workflow Progress
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timeline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {generateGanttData.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{project.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {project.startDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {project.endDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption">
                        {project.progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(project.status),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 200, height: 20, position: 'relative' }}>
                      {/* Simplified Gantt bar representation */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: `${project.progress}%`,
                          backgroundColor: getStatusColor(project.status),
                          borderRadius: 1,
                          opacity: 0.7
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          height: '100%',
                          width: '100%',
                          border: `1px solid ${getStatusColor(project.status)}`,
                          borderRadius: 1
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Task breakdown for selected project */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Task Breakdown - {generateGanttData[0]?.name}
          </Typography>
          <Grid container spacing={1}>
            {generateGanttData[0]?.tasks.map((task, index) => (
              <Grid item xs={12} key={index}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Typography variant="body2" sx={{ minWidth: 150 }}>
                    {task.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: 80 }}>
                    {task.start}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: 80 }}>
                    {task.end}
                  </Typography>
                  <Box sx={{ flexGrow: 1, maxWidth: 200 }}>
                    <LinearProgress
                      variant="determinate"
                      value={task.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  <Typography variant="caption">
                    {task.progress}%
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </GanttContainer>
  );

  const renderTrendChart = () => {
    const currentTrend = generateTrendData[viewMode] || [];
    const currentMetricData = currentTrend.map(item => item[selectedMetric]);
    
    return (
      <ChartContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {metricOptions.find(m => m.value === selectedMetric)?.label} Trends
          </Typography>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                label="View"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                label="Metric"
              >
                {metricOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Trend visualization (simplified representation) */}
        <Box sx={{ height: 300, display: 'flex', alignItems: 'end', gap: 1, p: 2 }}>
          {currentTrend.map((item, index) => {
            const value = item[selectedMetric];
            const maxValue = Math.max(...currentMetricData);
            const height = (value / maxValue) * 250;
            
            return (
              <Tooltip
                key={index}
                title={`${item.date}: ${selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value)}`}
              >
                <Box
                  sx={{
                    width: `${100 / currentTrend.length}%`,
                    height: `${height}px`,
                    backgroundColor: 'primary.main',
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scaleY(1.1)'
                    }
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>

        {/* Trend summary cards */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={3}>
            <TrendCard>
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h6">
                  {selectedMetric === 'revenue' 
                    ? formatCurrency(currentMetricData[currentMetricData.length - 1] || 0)
                    : formatNumber(currentMetricData[currentMetricData.length - 1] || 0)
                  }
                </Typography>
                <Typography variant="caption">Current</Typography>
              </CardContent>
            </TrendCard>
          </Grid>
          <Grid item xs={3}>
            <TrendCard sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h6">
                  {selectedMetric === 'revenue' 
                    ? formatCurrency(Math.max(...currentMetricData))
                    : formatNumber(Math.max(...currentMetricData))
                  }
                </Typography>
                <Typography variant="caption">Peak</Typography>
              </CardContent>
            </TrendCard>
          </Grid>
          <Grid item xs={3}>
            <TrendCard sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h6" color="textPrimary">
                  {selectedMetric === 'revenue' 
                    ? formatCurrency(currentMetricData.reduce((a, b) => a + b, 0) / currentMetricData.length)
                    : formatNumber(Math.round(currentMetricData.reduce((a, b) => a + b, 0) / currentMetricData.length))
                  }
                </Typography>
                <Typography variant="caption" color="textSecondary">Average</Typography>
              </CardContent>
            </TrendCard>
          </Grid>
          <Grid item xs={3}>
            <TrendCard sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="h6" color="textPrimary">
                  {currentMetricData.length > 1 
                    ? `${((currentMetricData[currentMetricData.length - 1] - currentMetricData[currentMetricData.length - 2]) / currentMetricData[currentMetricData.length - 2] * 100).toFixed(1)}%`
                    : '0%'
                  }
                </Typography>
                <Typography variant="caption" color="textSecondary">Change</Typography>
              </CardContent>
            </TrendCard>
          </Grid>
        </Grid>
      </ChartContainer>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => setLoading(!loading)}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Report">
              <IconButton>
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Fullscreen">
              <IconButton>
                <Fullscreen />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={2} mb={2}>
          {performanceMetrics.map((metric, index) => (
            <Grid item xs={3} key={index}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="textPrimary">
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {metric.title}
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: metric.color }} />
                    <Typography variant="caption" color="textSecondary">
                      {metric.change} ({metric.trend})
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab 
            label="Gantt Chart" 
            icon={<Timeline />} 
            iconPosition="start"
          />
          <Tab 
            label="Trend Analysis" 
            icon={<TrendingUp />} 
            iconPosition="start"
          />
          <Tab 
            label="Comparative Analytics" 
            icon={<Assessment />} 
            iconPosition="start"
          />
        </Tabs>

        {/* Gantt Chart Tab */}
        {tabValue === 0 && renderGanttChart()}

        {/* Trend Analysis Tab */}
        {tabValue === 1 && renderTrendChart()}

        {/* Comparative Analytics Tab */}
        {tabValue === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Comparative analytics across modules, time periods, and performance metrics.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Module Performance Comparison
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                      {['Sales', 'Inventory', 'Manufacturing', 'HR'].map((module, index) => (
                        <Box key={module} sx={{ textAlign: 'center', flex: 1 }}>
                          <Box
                            sx={{
                              height: `${Math.random() * 150 + 50}px`,
                              backgroundColor: `hsl(${index * 90}, 70%, 60%)`,
                              borderRadius: 1,
                              mb: 1
                            }}
                          />
                          <Typography variant="caption">{module}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Time Period Comparison
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'end', gap: 1 }}>
                      {['This Week', 'Last Week', 'This Month', 'Last Month'].map((period, index) => (
                        <Box key={period} sx={{ textAlign: 'center', flex: 1 }}>
                          <Box
                            sx={{
                              height: `${Math.random() * 150 + 50}px`,
                              backgroundColor: `hsl(${200 + index * 30}, 70%, 60%)`,
                              borderRadius: 1,
                              mb: 1
                            }}
                          />
                          <Typography variant="caption">{period}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedAnalytics;
