// TransactionIntegration.js - Cross-module transaction integration widget
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  SwapHoriz,
  AccountBalance,
  Inventory,
  ShoppingCart,
  Factory,
  People,
  PointOfSale,
  Assessment,
  Refresh,
  Visibility,
  Timeline,
  Analytics
} from '@mui/icons-material';
import { useTransactionIntegration } from '../hooks/useTransactionIntegration';

const moduleIcons = {
  sales: <TrendingUp />,
  inventory: <Inventory />,
  procurement: <ShoppingCart />,
  manufacturing: <Factory />,
  accounting: <AccountBalance />,
  hr: <People />,
  pos: <PointOfSale />,
  warehouse: <SwapHoriz />,
  customers: <People />,
  reporting: <Assessment />
};

const moduleColors = {
  sales: '#4caf50',
  inventory: '#2196f3',
  procurement: '#ff9800',
  manufacturing: '#9c27b0',
  accounting: '#f44336',
  hr: '#00bcd4',
  pos: '#795548',
  warehouse: '#607d8b',
  customers: '#8bc34a',
  reporting: '#3f51b5'
};

const TransactionIntegration = ({ moduleId, title = "Transaction Integration" }) => {
  const {
    transactions,
    analytics,
    loading,
    error,
    refreshData,
    clearError
  } = useTransactionIntegration(moduleId);

  const [tabValue, setTabValue] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const getTransactionIcon = (type) => {
    if (type.includes('SALES')) return <TrendingUp color="success" />;
    if (type.includes('PURCHASE')) return <ShoppingCart color="warning" />;
    if (type.includes('PRODUCTION')) return <Factory color="secondary" />;
    if (type.includes('INVENTORY')) return <Inventory color="primary" />;
    if (type.includes('WAREHOUSE')) return <SwapHoriz color="info" />;
    if (type.includes('PAYROLL')) return <People color="info" />;
    if (type.includes('POS')) return <PointOfSale color="action" />;
    return <Timeline color="action" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={clearError}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Tooltip title="Refresh transaction data">
            <IconButton onClick={refreshData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Recent Transactions" />
          <Tab label="Analytics" />
          <Tab label="Module Connections" />
        </Tabs>

        {/* Recent Transactions Tab */}
        {tabValue === 0 && (
          <Box>
            {transactions.length === 0 ? (
              <Typography color="textSecondary" align="center" py={3}>
                No recent transactions
              </Typography>
            ) : (
              <List dense>
                {transactions.slice(0, 10).map((transaction, index) => (
                  <ListItem
                    key={transaction.id || index}
                    button
                    onClick={() => handleTransactionClick(transaction)}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getTransactionIcon(transaction.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.type?.replace(/_/g, ' ') || 'Transaction'}
                          </Typography>
                          <Chip
                            label={transaction.status || 'pending'}
                            size="small"
                            color={getStatusColor(transaction.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {formatDateTime(transaction.timestamp)}
                          </Typography>
                          {transaction.data?.amount && (
                            <Typography variant="caption" display="block">
                              Amount: {formatCurrency(transaction.data.amount)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      {transaction.targets?.map((target, idx) => (
                        <Tooltip key={idx} title={`Affects ${target}`}>
                          <Chip
                            icon={moduleIcons[target]}
                            label={target}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: moduleColors[target],
                              color: moduleColors[target]
                            }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingDown color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="primary">
                    {analytics.incoming_transactions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Incoming Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp color="success.main" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="success.main">
                    {analytics.outgoing_transactions}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Outgoing Transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <AccountBalance color="warning.main" sx={{ fontSize: 40 }} />
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(analytics.total_value)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Transaction Value
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Module Connections Tab */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Top Source Modules
            </Typography>
            <Box mb={2}>
              {analytics.top_sources?.length > 0 ? (
                analytics.top_sources.map((source, index) => (
                  <Chip
                    key={index}
                    icon={moduleIcons[source.module]}
                    label={`${source.module} (${source.count})`}
                    sx={{
                      m: 0.5,
                      backgroundColor: moduleColors[source.module] + '20',
                      borderColor: moduleColors[source.module]
                    }}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No source connections
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Top Target Modules
            </Typography>
            <Box>
              {analytics.top_targets?.length > 0 ? (
                analytics.top_targets.map((target, index) => (
                  <Chip
                    key={index}
                    icon={moduleIcons[target.module]}
                    label={`${target.module} (${target.count})`}
                    sx={{
                      m: 0.5,
                      backgroundColor: moduleColors[target.module] + '20',
                      borderColor: moduleColors[target.module]
                    }}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No target connections
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Transaction Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogContent>
            {selectedTransaction && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Transaction ID</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Type</Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedTransaction.type?.replace(/_/g, ' ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Source Module</Typography>
                    <Chip
                      icon={moduleIcons[selectedTransaction.source]}
                      label={selectedTransaction.source}
                      sx={{
                        backgroundColor: moduleColors[selectedTransaction.source] + '20',
                        borderColor: moduleColors[selectedTransaction.source]
                      }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Status</Typography>
                    <Chip
                      label={selectedTransaction.status}
                      color={getStatusColor(selectedTransaction.status)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Target Modules</Typography>
                    <Box mt={1}>
                      {selectedTransaction.targets?.map((target, idx) => (
                        <Chip
                          key={idx}
                          icon={moduleIcons[target]}
                          label={target}
                          sx={{
                            m: 0.5,
                            backgroundColor: moduleColors[target] + '20',
                            borderColor: moduleColors[target]
                          }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Transaction Data</Typography>
                    <Box
                      component="pre"
                      sx={{
                        backgroundColor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem'
                      }}
                    >
                      {JSON.stringify(selectedTransaction.data, null, 2)}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TransactionIntegration;
