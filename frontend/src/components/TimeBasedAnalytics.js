// TimeBasedAnalytics.js - Comprehensive time-based analytics with daily, monthly, yearly trends
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Avatar
} from '@mui/material';
import {
  Timeline,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  DateRange,
  ShowChart,
  BarChart,
  PieChart,
  Refresh,
  Download,
  ZoomIn,
  ZoomOut,
  PlayArrow,
  Pause,
  FastForward,
  FastRewind,
  CompareArrows,
  Analytics
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ChartContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '400px',
  width: '100%',
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden'
}));

const TrendIndicator = styled(Box)(({ trend }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  color: trend === 'up' ? '#4caf50' : trend === 'down' ? '#f44336' : '#ff9800',
  fontWeight: 600
}));

const MetricCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: color === 'primary' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : color === 'success'
    ? 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)'
    : color === 'warning'
    ? 'linear-gradient(135deg, #ff9800 0%, #ffc107 100%)'
    : 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
  },
}));

const TimeBasedAnalytics = ({ 
  moduleId, 
  data = {}, 
  onDataRequest,
  title = "Time-Based Analytics" 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [timeFrame, setTimeFrame] = useState('daily');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Time frame options - moved outside useMemo to avoid initialization issues
  const timeFrameOptions = useMemo(() => [
    { value: 'hourly', label: 'Hourly', icon: <Timeline /> },
    { value: 'daily', label: 'Daily', icon: <CalendarToday /> },
    { value: 'weekly', label: 'Weekly', icon: <DateRange /> },
    { value: 'monthly', label: 'Monthly', icon: <BarChart /> },
    { value: 'quarterly', label: 'Quarterly', icon: <ShowChart /> },
    { value: 'yearly', label: 'Yearly', icon: <Analytics /> }
  ], []);

  // Period options based on time frame - function to get period options
  const getPeriodOptions = useCallback((timeFrame) => {
    switch (timeFrame) {
      case 'hourly':
        return [
          { value: '24h', label: 'Last 24 Hours' },
          { value: '48h', label: 'Last 48 Hours' },
          { value: '7d', label: 'Last 7 Days (Hourly)' }
        ];
      case 'daily':
        return [
          { value: '7d', label: 'Last 7 Days' },
          { value: '30d', label: 'Last 30 Days' },
          { value: '90d', label: 'Last 3 Months' }
        ];
      case 'weekly':
        return [
          { value: '4w', label: 'Last 4 Weeks' },
          { value: '12w', label: 'Last 12 Weeks' },
          { value: '26w', label: 'Last 6 Months' }
        ];
      case 'monthly':
        return [
          { value: '6m', label: 'Last 6 Months' },
          { value: '12m', label: 'Last 12 Months' },
          { value: '24m', label: 'Last 2 Years' }
        ];
      case 'quarterly':
        return [
          { value: '4q', label: 'Last 4 Quarters' },
          { value: '8q', label: 'Last 8 Quarters' },
          { value: '12q', label: 'Last 3 Years' }
        ];
      case 'yearly':
        return [
          { value: '3y', label: 'Last 3 Years' },
          { value: '5y', label: 'Last 5 Years' },
          { value: '10y', label: 'Last 10 Years' }
        ];
      default:
        return [{ value: '30d', label: 'Last 30 Days' }];
    }
  }, []);

  // Generate comprehensive trend data with safe initialization
  const generateTrendData = useMemo(() => {
    // Create a simple, safe data structure
    const createSampleData = (timeFrame, period) => {
      const now = new Date();
      const dataPoints = [];
      let count = 30; // Default count
      
      // Simple count determination
      if (timeFrame === 'hourly') count = 24;
      else if (timeFrame === 'daily') count = 30;
      else if (timeFrame === 'weekly') count = 12;
      else if (timeFrame === 'monthly') count = 12;
      else if (timeFrame === 'quarterly') count = 4;
      else if (timeFrame === 'yearly') count = 5;
      
      // Generate simple data points
      for (let i = 0; i < count; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (count - 1 - i));
        
        dataPoints.push({
          date: date.toISOString(),
          displayDate: date.toLocaleDateString(),
          transactions: Math.floor(Math.random() * 100) + 20,
          revenue: Math.floor(Math.random() * 10000) + 1000,
          volume: Math.floor(Math.random() * 500) + 100,
          success_rate: Math.floor(Math.random() * 20) + 80,
          processing_time: Math.floor(Math.random() * 200) + 100,
          users: Math.floor(Math.random() * 50) + 10,
          orders: Math.floor(Math.random() * 80) + 15
        });
      }
      
      return dataPoints;
    };
    
    // Create safe trend data structure
    const trendData = {
      hourly: {
        '24h': createSampleData('hourly', '24h'),
        '48h': createSampleData('hourly', '48h'),
        '7d': createSampleData('hourly', '7d')
      },
      daily: {
        '7d': createSampleData('daily', '7d'),
        '30d': createSampleData('daily', '30d'),
        '90d': createSampleData('daily', '90d')
      },
      weekly: {
        '4w': createSampleData('weekly', '4w'),
        '12w': createSampleData('weekly', '12w'),
        '26w': createSampleData('weekly', '26w')
      },
      monthly: {
        '6m': createSampleData('monthly', '6m'),
        '12m': createSampleData('monthly', '12m'),
        '24m': createSampleData('monthly', '24m')
      },
      quarterly: {
        '4q': createSampleData('quarterly', '4q'),
        '8q': createSampleData('quarterly', '8q'),
        '12q': createSampleData('quarterly', '12q')
      },
      yearly: {
        '3y': createSampleData('yearly', '3y'),
        '5y': createSampleData('yearly', '5y'),
        '10y': createSampleData('yearly', '10y')
      }
    };
    
    return trendData;
  }, []);

  const formatDateForTimeFrame = (date, timeFrame) => {
    switch (timeFrame) {
      case 'hourly':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${getWeekNumber(date)}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      case 'quarterly':
        return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getCurrentData = () => {
    return generateTrendData[timeFrame]?.[selectedPeriod] || [];
  };

  const calculateTrend = (data, metric) => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = data.slice(-5).reduce((sum, item) => sum + item[metric], 0) / 5;
    const previous = data.slice(-10, -5).reduce((sum, item) => sum + item[metric], 0) / 5;
    
    if (previous === 0) return { direction: 'stable', percentage: 0 };
    
    const percentage = ((recent - previous) / previous) * 100;
    const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable';
    
    return { direction, percentage: Math.abs(percentage) };
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeFrameChange = (event) => {
    setTimeFrame(event.target.value);
    setSelectedPeriod(getPeriodOptions(event.target.value)[0].value);
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  // Animation effect
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const data = getCurrentData();
          return prev >= data.length - 1 ? 0 : prev + 1;
        });
      }, 1000 / animationSpeed);

      return () => clearInterval(interval);
    }
  }, [isPlaying, animationSpeed, timeFrame, selectedPeriod]);

  const renderTrendChart = () => {
    const data = getCurrentData();
    const metrics = ['transactions', 'revenue', 'volume', 'success_rate'];
    
    return (
      <ChartContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} Trends
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                />
              }
              label="Compare"
            />
            <IconButton onClick={toggleAnimation} color="primary">
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Box>
        </Box>

        {/* Chart visualization */}
        <Box sx={{ height: 300, display: 'flex', alignItems: 'end', gap: 1, p: 2, position: 'relative' }}>
          {data.map((item, index) => {
            const isActive = isPlaying ? index <= currentIndex : true;
            const opacity = isActive ? 1 : 0.3;
            
            return (
              <Tooltip
                key={index}
                title={
                  <Box>
                    <Typography variant="subtitle2">{item.displayDate}</Typography>
                    <Typography variant="body2">Transactions: {item.transactions}</Typography>
                    <Typography variant="body2">Revenue: {formatCurrency(item.revenue)}</Typography>
                    <Typography variant="body2">Success Rate: {item.success_rate}%</Typography>
                  </Box>
                }
              >
                <Box
                  sx={{
                    width: `${Math.max(100 / data.length - 2, 8)}%`,
                    height: `${(item.transactions / Math.max(...data.map(d => d.transactions))) * 250}px`,
                    backgroundColor: 'primary.main',
                    borderRadius: '4px 4px 0 0',
                    cursor: 'pointer',
                    opacity,
                    transition: 'all 0.3s ease',
                    transform: isActive && isPlaying ? 'scaleY(1.1)' : 'scaleY(1)',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      transform: 'scaleY(1.1)'
                    }
                  }}
                />
              </Tooltip>
            );
          })}
          
          {/* Animation progress indicator */}
          {isPlaying && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: `${(currentIndex / (data.length - 1)) * 100}%`,
                width: 2,
                height: '100%',
                backgroundColor: 'secondary.main',
                transition: 'left 0.3s ease'
              }}
            />
          )}
        </Box>

        {/* Time navigation */}
        <Box display="flex" justifyContent="center" alignItems="center" gap={1} mt={2}>
          <IconButton onClick={() => setCurrentIndex(Math.max(0, currentIndex - 10))}>
            <FastRewind />
          </IconButton>
          <IconButton onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}>
            <TrendingDown />
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'center' }}>
            {data[currentIndex]?.displayDate || 'Current'}
          </Typography>
          <IconButton onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 1))}>
            <TrendingUp />
          </IconButton>
          <IconButton onClick={() => setCurrentIndex(Math.min(data.length - 1, currentIndex + 10))}>
            <FastForward />
          </IconButton>
        </Box>
      </ChartContainer>
    );
  };

  const renderMetricCards = () => {
    const data = getCurrentData();
    const latestData = data[data.length - 1] || {};
    
    const metrics = [
      { key: 'transactions', label: 'Transactions', color: 'primary', icon: <BarChart /> },
      { key: 'revenue', label: 'Revenue', color: 'success', icon: <TrendingUp />, format: 'currency' },
      { key: 'success_rate', label: 'Success Rate', color: 'warning', icon: <ShowChart />, format: 'percentage' },
      { key: 'users', label: 'Active Users', color: 'error', icon: <Analytics /> }
    ];

    return (
      <Grid container spacing={2}>
        {metrics.map((metric) => {
          const trend = calculateTrend(data, metric.key);
          const value = latestData[metric.key] || 0;
          
          return (
            <Grid item xs={12} sm={6} md={3} key={metric.key}>
              <MetricCard color={metric.color}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                        {metric.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {metric.format === 'currency' 
                          ? formatCurrency(value)
                          : metric.format === 'percentage'
                          ? `${value}%`
                          : formatNumber(value)
                        }
                      </Typography>
                      <TrendIndicator trend={trend.direction}>
                        {trend.direction === 'up' ? <TrendingUp /> : 
                         trend.direction === 'down' ? <TrendingDown /> : 
                         <CompareArrows />}
                        <Typography variant="caption">
                          {trend.percentage.toFixed(1)}%
                        </Typography>
                      </TrendIndicator>
                    </Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                      {metric.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </MetricCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Frame</InputLabel>
              <Select
                value={timeFrame}
                onChange={handleTimeFrameChange}
                label="Time Frame"
              >
                {timeFrameOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.icon}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                label="Period"
              >
                {getPeriodOptions(timeFrame).map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => setLoading(!loading)}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Overview" icon={<Analytics />} iconPosition="start" />
          <Tab label="Trends" icon={<ShowChart />} iconPosition="start" />
          <Tab label="Comparison" icon={<CompareArrows />} iconPosition="start" />
        </Tabs>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box>
            {renderMetricCards()}
            <Box mt={3}>
              {renderTrendChart()}
            </Box>
          </Box>
        )}

        {/* Trends Tab */}
        {tabValue === 1 && renderTrendChart()}

        {/* Comparison Tab */}
        {tabValue === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Compare performance across different time periods and metrics.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Period-over-Period Comparison
                    </Typography>
                    {renderTrendChart()}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Metric Correlation
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="textSecondary">
                        Advanced correlation analysis visualization
                      </Typography>
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

export default TimeBasedAnalytics;
