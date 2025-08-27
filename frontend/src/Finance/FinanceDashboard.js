import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl, InputLabel,
  Select, Divider, Alert, CircularProgress, LinearProgress, Snackbar,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  AccountBalance, TrendingUp, TrendingDown, Assessment,
  Add, Edit, Delete, Visibility, Receipt, CreditCard,
  AttachMoney, Business, AccountBalanceWallet, PieChart,
  BarChart, ShowChart, FileDownload, Print, Refresh,
  RefreshIcon, AttachMoneyIcon, BusinessIcon, MonetizationOn,
  CheckCircle, Cancel, Inventory, Warehouse, LocalShipping
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { getGlobalTransactionHistory, getCustomerBalance, getReceivablesSummary, sharedCustomers, getGlobalPaymentHistory, updatePaymentStatus, getStockSummary, getStockByWarehouse, getStockMovements } from '../sharedData';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [chartOfAccounts, setChartOfAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [fixedAssets, setFixedAssets] = useState([]);
  const [expenseReports, setExpenseReports] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [trialBalance, setTrialBalance] = useState([]);
  const [financialRatios, setFinancialRatios] = useState({});

  // Dialog states
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openJournalDialog, setOpenJournalDialog] = useState(false);
  const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
  const [openAssetDialog, setOpenAssetDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [customerBalanceDialog, setCustomerBalanceDialog] = useState(false);
  const [receivableSummaryDialog, setReceivableSummaryDialog] = useState(false);
  const [receivableDetailsDialog, setReceivableDetailsDialog] = useState(false);
  const [pendingPaymentsDialog, setPendingPaymentsDialog] = useState(false);

  // Form states
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [accountForm, setAccountForm] = useState({
    account_code: '',
    account_name: '',
    account_type: '',
    account_subtype: '',
    parent_account: '',
    currency: 1
  });
  const [customerSearch, setCustomerSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [customersData, setCustomersData] = useState([]);
  const [agingData, setAgingData] = useState([]);
  const [invoicesData, setInvoicesData] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Stock Management states
  const [stockSummary, setStockSummary] = useState({});
  const [warehouseStockData, setWarehouseStockData] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [stockSearchTerm, setStockSearchTerm] = useState('');

  // Dialog states for quick actions
  const [journalEntryDialog, setJournalEntryDialog] = useState(false);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [customerBalanceDetailsDialog, setCustomerBalanceDetailsDialog] = useState(false);
  const [receivableSummaryDetailsDialog, setReceivableSummaryDetailsDialog] = useState(false);
  const [receivableDetailsViewDialog, setReceivableDetailsViewDialog] = useState(false);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedInvoiceDetails, setSelectedInvoiceDetails] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    customer_id: '',
    amount: '',
    payment_method: 'cash',
    cheque_photo: null,
    notes: ''
  });

  // Form states
  const [journalEntryForm, setJournalEntryForm] = useState({
    description: '',
    reference_number: '',
    entries: [
      { account: '', entry_type: 'DEBIT', amount: '', description: '' },
      { account: '', entry_type: 'CREDIT', amount: '', description: '' }
    ]
  });

  const [budgetForm, setBudgetForm] = useState({
    budget_name: '',
    budget_type: 'OPERATIONAL',
    fiscal_year: new Date().getFullYear(),
    description: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customer_name: '',
    amount: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    loadFinanceData();
    
    // Listen for transaction updates
    const handleTransactionUpdate = (event) => {
      loadFinanceData();
    };
    
    // Listen for credit sales created
    const handleCreditSaleCreated = (event) => {
      console.log('Credit sale created, refreshing Finance data:', event.detail);
      loadFinanceData();
    };
    
    // Listen for stock updates
    const handleStockUpdate = (event) => {
      loadStockData();
    };
    
    window.addEventListener('transactionHistoryUpdated', handleTransactionUpdate);
    window.addEventListener('creditSaleCreated', handleCreditSaleCreated);
    window.addEventListener('stockUpdated', handleStockUpdate);
    
    return () => {
      window.removeEventListener('transactionHistoryUpdated', handleTransactionUpdate);
      window.removeEventListener('creditSaleCreated', handleCreditSaleCreated);
      window.removeEventListener('stockUpdated', handleStockUpdate);
    };
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Load real sales orders from backend API
      const salesOrdersResponse = await api.get('/sales/sales-orders/');
      const salesOrders = salesOrdersResponse.data;
      
      // Load real payments from backend API
      const paymentsResponse = await api.get('/sales/payments/');
      const payments = paymentsResponse.data;
      
      // Load real customers from backend API
      const customersResponse = await api.get('/sales/customers/');
      const customers = customersResponse.data;
      
      console.log('Loaded backend data:', { salesOrders, payments, customers });
      
      // Calculate customer balances from actual sales orders
      const updatedCustomersData = customers.map(customer => {
        const customerOrders = salesOrders.filter(order => order.customer === customer.id);
        const totalBalance = customerOrders.reduce((sum, order) => {
          return sum + (parseFloat(order.balance_due) || 0);
        }, 0);
        
        const overdueOrders = customerOrders.filter(order => {
          if (!order.due_date || order.payment_status === 'paid') return false;
          return new Date(order.due_date) < new Date();
        });
        
        const overdueAmount = overdueOrders.reduce((sum, order) => {
          return sum + (parseFloat(order.balance_due) || 0);
        }, 0);
        
        return {
          id: customer.id,
          name: customer.name,
          totalBalance: totalBalance,
          overdueAmount: overdueAmount,
          status: overdueAmount > 0 ? 'Has Overdue' : (totalBalance > 0 ? 'Outstanding' : 'Current'),
          transactionCount: customerOrders.length
        };
      });
      
      setCustomersData(updatedCustomersData);
      
      // Update invoices data from actual sales orders
      const updatedInvoicesData = salesOrders
        .filter(order => order.payment_method === 'credit' || order.payment_status !== 'paid')
        .map(order => {
          const daysOverdue = order.due_date ? 
            Math.ceil((new Date() - new Date(order.due_date)) / (1000 * 60 * 60 * 24)) : null;
          
          return {
            id: order.order_number,
            customer: order.customer_name,
            amount: parseFloat(order.total),
            dueDate: order.due_date,
            daysOverdue: daysOverdue > 0 ? daysOverdue : null,
            status: order.payment_status === 'paid' ? 'Paid' : 
                   (daysOverdue > 0 ? 'Overdue' : 
                   (daysOverdue > -7 ? 'Due Soon' : 'Current'))
          };
        });
      
      setInvoicesData(updatedInvoicesData);
      
      // Calculate aging data from actual sales orders
      const creditOrders = salesOrders.filter(order => 
        order.payment_method === 'credit' && order.payment_status !== 'paid'
      );
      
      const currentOrders = creditOrders.filter(order => {
        if (!order.due_date) return true;
        const daysUntilDue = Math.ceil((new Date(order.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0;
      });
      
      const aging31_60 = creditOrders.filter(order => {
        if (!order.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(order.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue >= 1 && daysOverdue <= 30;
      });
      
      const aging61_90 = creditOrders.filter(order => {
        if (!order.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(order.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue >= 31 && daysOverdue <= 60;
      });
      
      const overdue90Plus = creditOrders.filter(order => {
        if (!order.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(order.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue > 60;
      });
      
      const totalAmount = creditOrders.reduce((acc, order) => acc + parseFloat(order.total), 0);
      
      setAgingData([
        { 
          period: 'Current (Not Due)', 
          amount: currentOrders.reduce((acc, order) => acc + parseFloat(order.total), 0), 
          invoiceCount: currentOrders.length, 
          percentage: totalAmount > 0 ? (currentOrders.reduce((acc, order) => acc + parseFloat(order.total), 0) / totalAmount * 100) : 0
        },
        { 
          period: '1-30 days overdue', 
          amount: aging31_60.reduce((acc, order) => acc + parseFloat(order.total), 0), 
          invoiceCount: aging31_60.length, 
          percentage: totalAmount > 0 ? (aging31_60.reduce((acc, order) => acc + parseFloat(order.total), 0) / totalAmount * 100) : 0
        },
        { 
          period: '31-60 days overdue', 
          amount: aging61_90.reduce((acc, order) => acc + parseFloat(order.total), 0), 
          invoiceCount: aging61_90.length, 
          percentage: totalAmount > 0 ? (aging61_90.reduce((acc, order) => acc + parseFloat(order.total), 0) / totalAmount * 100) : 0
        },
        { 
          period: '60+ days overdue', 
          amount: overdue90Plus.reduce((acc, order) => acc + parseFloat(order.total), 0), 
          invoiceCount: overdue90Plus.length, 
          percentage: totalAmount > 0 ? (overdue90Plus.reduce((acc, order) => acc + parseFloat(order.total), 0) / totalAmount * 100) : 0
        }
      ]);
      
      // Load pending payments for approval from backend
      const pendingPaymentsData = payments.filter(p => p.status === 'pending');
      setPendingPayments(pendingPaymentsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading finance data from backend:', error);
      
      // Fallback to shared data if backend fails
      const transactions = getGlobalTransactionHistory();
      const receivablesSummary = getReceivablesSummary();
      
      // Get all customers from both shared sources
      const allCustomers = [...sharedCustomers, ...JSON.parse(localStorage.getItem('sharedCustomers') || '[]')];
      const uniqueCustomers = allCustomers.filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      );
      
      // Update customer data with real balances
      const updatedCustomersData = uniqueCustomers.map(customer => {
        const balance = getCustomerBalance(customer.id);
        return {
          id: customer.id,
          name: customer.name,
          totalBalance: balance.totalBalance,
          overdueAmount: balance.overdueAmount,
          status: balance.overdueAmount > 0 ? 'Has Overdue' : 'Current',
          transactionCount: balance.transactionCount
        };
      });
      
      setCustomersData(updatedCustomersData);
      
      // Update invoices data from all credit transactions (including from receivables summary)
      const allCreditTransactions = receivablesSummary.allTransactions || [];
      const updatedInvoicesData = allCreditTransactions.map(transaction => {
        const daysOverdue = transaction.due_date ? 
          Math.ceil((new Date() - new Date(transaction.due_date)) / (1000 * 60 * 60 * 24)) : null;
        
        return {
          id: transaction.reference || transaction.reference_number || transaction.id,
          customer: transaction.customer_name,
          amount: transaction.amount,
          dueDate: transaction.due_date,
          daysOverdue: daysOverdue > 0 ? daysOverdue : null,
          status: transaction.status === 'completed' ? 'Paid' : 
                 (daysOverdue > 0 ? 'Overdue' : 
                 (daysOverdue > -7 ? 'Due Soon' : 'Current'))
        };
      });
      
      setInvoicesData(updatedInvoicesData);
      
      // Update aging data using all credit transactions
      const currentTransactions = allCreditTransactions.filter(t => {
        if (!t.due_date) return true;
        const daysUntilDue = Math.ceil((new Date(t.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= 30;
      });
      
      const aging31_60 = allCreditTransactions.filter(t => {
        if (!t.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue >= -60 && daysOverdue < -30;
      });
      
      const aging61_90 = allCreditTransactions.filter(t => {
        if (!t.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue >= -90 && daysOverdue < -60;
      });
      
      const overdue = allCreditTransactions.filter(t => {
        if (!t.due_date) return false;
        const daysOverdue = Math.ceil((new Date() - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
        return daysOverdue > 0;
      });
      
      const totalAmount = allCreditTransactions.reduce((acc, t) => acc + t.amount, 0);
      
      setAgingData([
        { 
          period: 'Current (0-30 days)', 
          amount: currentTransactions.reduce((acc, t) => acc + t.amount, 0), 
          invoiceCount: currentTransactions.length, 
          percentage: totalAmount > 0 ? (currentTransactions.reduce((acc, t) => acc + t.amount, 0) / totalAmount * 100) : 0
        },
        { 
          period: '31-60 days', 
          amount: aging31_60.reduce((acc, t) => acc + t.amount, 0), 
          invoiceCount: aging31_60.length, 
          percentage: totalAmount > 0 ? (aging31_60.reduce((acc, t) => acc + t.amount, 0) / totalAmount * 100) : 0
        },
        { 
          period: '61-90 days', 
          amount: aging61_90.reduce((acc, t) => acc + t.amount, 0), 
          invoiceCount: aging61_90.length, 
          percentage: totalAmount > 0 ? (aging61_90.reduce((acc, t) => acc + t.amount, 0) / totalAmount * 100) : 0
        },
        { 
          period: '90+ days (Overdue)', 
          amount: overdue.reduce((acc, t) => acc + t.amount, 0), 
          invoiceCount: overdue.length, 
          percentage: totalAmount > 0 ? (overdue.reduce((acc, t) => acc + t.amount, 0) / totalAmount * 100) : 0
        }
      ]);
      
      // Load pending payments for approval
      const payments = getGlobalPaymentHistory();
      const pendingPaymentsData = payments.filter(p => p.status === 'pending_approval');
      setPendingPayments(pendingPaymentsData);
      
      setLoading(false);
    }
  };

  const loadStockData = () => {
    try {
      // Load stock summary data
      const summary = getStockSummary();
      setStockSummary(summary.products || []);
      
      // Load warehouse stock data
      const warehouseData = summary.warehouses || [];
      const detailedWarehouseData = warehouseData.map(warehouse => {
        const stockByWarehouse = getStockByWarehouse(warehouse.id);
        return {
          ...warehouse,
          items: stockByWarehouse || []
        };
      });
      setWarehouseStockData(detailedWarehouseData);
      
      // Load stock movements
      const movements = getStockMovements();
      setStockMovements(movements || []);
      
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Load data based on active tab
    switch (newValue) {
      case 1: // Chart of Accounts
        loadFinanceData();
        break;
      case 2: // Journal Entries
        loadFinanceData();
        break;
      case 3: // Budgets
        loadFinanceData();
        break;
      case 4: // Fixed Assets
        loadFinanceData();
        break;
      case 5: // Expense Reports
        loadFinanceData();
        break;
      case 8: // Stock Management
        loadStockData();
        break;
      default:
        break;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'approved': return 'success';
      case 'posted': return 'success';
      case 'draft': return 'warning';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      case 'disposed': return 'error';
      default: return 'default';
    }
  };

  // Payment approval handler
  const handlePaymentApproval = async (paymentId, action) => {
    try {
      setLoading(true);
      
      // Update payment status via API
      const response = await api.patch(`/sales/payments/${paymentId}/`, {
        status: action === 'approved' ? 'approved' : 'rejected',
        approved_date: action === 'approved' ? new Date().toISOString().split('T')[0] : null,
        notes: action === 'approved' ? 'Approved by Finance' : 'Rejected by Finance'
      });
      
      console.log('Payment approval response:', response.data);
      
      // If approved, update the sales order payment status
      if (action === 'approved') {
        const payment = pendingPayments.find(p => p.id === paymentId);
        if (payment && payment.sales_order) {
          // Get updated sales order to check if fully paid
          const salesOrderResponse = await api.get(`/sales/sales-orders/${payment.sales_order}/`);
          const salesOrder = salesOrderResponse.data;
          
          // Recalculate balance after this payment approval
          const approvedPaymentsResponse = await api.get(`/sales/payments/?sales_order=${payment.sales_order}&status=approved`);
          const approvedPayments = approvedPaymentsResponse.data;
          const totalApprovedPayments = approvedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0) + parseFloat(payment.amount);
          
          const remainingBalance = parseFloat(salesOrder.total) - totalApprovedPayments;
          const newPaymentStatus = remainingBalance <= 0.01 ? 'paid' : 'partial';
          
          await api.patch(`/sales/sales-orders/${payment.sales_order}/`, {
            payment_status: newPaymentStatus
          });
          
          console.log(`Sales order ${salesOrder.order_number} payment status updated to: ${newPaymentStatus}`);
          console.log(`Total: ${salesOrder.total}, Approved Payments: ${totalApprovedPayments}, Remaining: ${remainingBalance}`);
          
          // Emit event for Sales module to refresh
          window.dispatchEvent(new CustomEvent('paymentApproved', {
            detail: {
              salesOrderId: payment.sales_order,
              paymentId: paymentId,
              paymentStatus: newPaymentStatus,
              orderNumber: salesOrder.order_number,
              totalApproved: totalApprovedPayments,
              remainingBalance: remainingBalance
            }
          }));
          
          // Also emit event for Finance module to refresh all data
          window.dispatchEvent(new CustomEvent('financeDataUpdate', {
            detail: {
              type: 'paymentApproval',
              salesOrderId: payment.sales_order,
              paymentId: paymentId
            }
          }));
        }
      }
      
      // Refresh finance data
      await loadFinanceData();
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Payment ${action === 'approved' ? 'approved' : 'rejected'} successfully`,
        severity: 'success'
      });
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${action} payment: ${error.response?.data?.detail || error.message}`,
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      await api.post('/accounting/chart-of-accounts/', accountForm);
      setSnackbar({
        open: true,
        message: 'Account created successfully!',
        severity: 'success'
      });
      setOpenAccountDialog(false);
      setAccountForm({
        account_code: '',
        account_name: '',
        account_type: '',
        account_subtype: '',
        parent_account: '',
        currency: 1
      });
      loadFinanceData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create account',
        severity: 'error'
      });
    }
  };

  const handleCreateJournalEntry = async () => {
    try {
      const batchData = {
        description: journalEntryForm.description,
        reference_number: journalEntryForm.reference_number,
        entries: journalEntryForm.entries.filter(entry => entry.account && entry.amount)
      };

      await api.post('/accounting/journal-batches/', batchData);
      setSnackbar({
        open: true,
        message: 'Journal entry created successfully!',
        severity: 'success'
      });
      setJournalEntryDialog(false);
      setJournalEntryForm({
        description: '',
        reference_number: '',
        entries: [
          { account: '', entry_type: 'DEBIT', amount: '', description: '' },
          { account: '', entry_type: 'CREDIT', amount: '', description: '' }
        ]
      });
      loadFinanceData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create journal entry',
        severity: 'error'
      });
    }
  };

  const handleCreateBudget = async () => {
    try {
      await api.post('/accounting/budgets/', budgetForm);
      setSnackbar({
        open: true,
        message: 'Budget created successfully!',
        severity: 'success'
      });
      setBudgetDialog(false);
      setBudgetForm({
        budget_name: '',
        budget_type: 'OPERATIONAL',
        fiscal_year: new Date().getFullYear(),
        description: ''
      });
      loadFinanceData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create budget',
        severity: 'error'
      });
    }
  };

  const handleCreateExpenseReport = async () => {
    try {
      const expenseData = {
        report_number: `EXP-${Date.now()}`,
        report_date: expenseForm.expense_date,
        description: expenseForm.description,
        items: [{
          expense_date: expenseForm.expense_date,
          category: expenseForm.category,
          amount: parseFloat(expenseForm.amount),
          description: expenseForm.description
        }]
      };

      await api.post('/accounting/expense-reports/', expenseData);
      setSnackbar({
        open: true,
        message: 'Expense report created successfully!',
        severity: 'success'
      });
      setExpenseDialog(false);
      setExpenseForm({
        description: '',
        amount: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      loadFinanceData();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create expense report',
        severity: 'error'
      });
    }
  };

  const handleCreateInvoice = () => {
    // Navigate to invoice creation or open invoice management
    setSnackbar({
      open: true,
      message: 'Opening invoice management...',
      severity: 'info'
    });
    setInvoiceDialog(false);
  };

  // Dashboard Overview Component
  const DashboardOverview = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalanceWallet color="primary" />
              <Typography variant="h6" ml={1}>Cash Position</Typography>
            </Box>
            <Typography variant="h4" color="primary">
              {formatCurrency(dashboardData.cash_position || 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Available Cash & Bank
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingUp color="success" />
              <Typography variant="h6" ml={1}>Monthly Revenue</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {formatCurrency(dashboardData.monthly_revenue || 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Current Month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TrendingDown color="error" />
              <Typography variant="h6" ml={1}>Monthly Expenses</Typography>
            </Box>
            <Typography variant="h4" color="error.main">
              {formatCurrency(dashboardData.monthly_expenses || 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Current Month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <MonetizationOn color="info" />
              <Typography variant="h6" ml={1}>Net Income</Typography>
            </Box>
            <Typography 
              variant="h4" 
              color={dashboardData.net_income >= 0 ? "success.main" : "error.main"}
            >
              {formatCurrency(dashboardData.net_income || 0)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Current Month
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Financial Ratios */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Financial Ratios</Typography>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Current Ratio</Typography>
                <Typography variant="h6">{financialRatios.current_ratio || 0}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Working Capital</Typography>
                <Typography variant="h6">
                  {formatCurrency(financialRatios.working_capital || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Active Budgets</Typography>
                <Typography variant="h6">{dashboardData.active_budgets || 0}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Accounts Summary */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Account Balances</Typography>
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Accounts Receivable</Typography>
                <Typography variant="h6">
                  {formatCurrency(dashboardData.accounts_receivable || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Accounts Payable</Typography>
                <Typography variant="h6">
                  {formatCurrency(dashboardData.accounts_payable || 0)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography>Net Position</Typography>
                <Typography 
                  variant="h6"
                  color={(dashboardData.accounts_receivable - dashboardData.accounts_payable) >= 0 ? "success.main" : "error.main"}
                >
                  {formatCurrency((dashboardData.accounts_receivable || 0) - (dashboardData.accounts_payable || 0))}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Trial Balance Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Trial Balance Summary</Typography>
              <Button 
                startIcon={<FileDownload />}
                onClick={() => window.open('/accounting/chart-of-accounts/trial-balance/', '_blank')}
              >
                Export
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Account Code</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Credit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trialBalance.slice(0, 10).map((account, index) => (
                    <TableRow key={index}>
                      <TableCell>{account.account_code}</TableCell>
                      <TableCell>{account.account_name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={account.account_type} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {trialBalance.length > 10 && (
              <Box mt={2} textAlign="center">
                <Button onClick={() => setActiveTab(1)}>
                  View All Accounts ({trialBalance.length})
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Chart of Accounts Component
  const ChartOfAccountsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Chart of Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAccountDialog(true)}
        >
          Add Account
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Account Code</TableCell>
                  <TableCell>Account Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Subtype</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartOfAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>{account.account_code}</TableCell>
                    <TableCell>{account.account_name}</TableCell>
                    <TableCell>
                      <Chip label={account.account_type} size="small" />
                    </TableCell>
                    <TableCell>{account.account_subtype}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(account.current_balance || 0)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={account.is_active ? 'Active' : 'Inactive'}
                        color={account.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => {
                        setSelectedAccount(account);
                        setOpenAccountDialog(true);
                      }}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const AddAccountDialog = () => (
    <Dialog open={openAccountDialog} onClose={() => setOpenAccountDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>{selectedAccount ? 'Edit Account' : 'Add Account'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Account Code"
            value={accountForm.account_code}
            onChange={(e) => setAccountForm({...accountForm, account_code: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Account Name"
            value={accountForm.account_name}
            onChange={(e) => setAccountForm({...accountForm, account_name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Account Type"
            value={accountForm.account_type}
            onChange={(e) => setAccountForm({...accountForm, account_type: e.target.value})}
            sx={{ mb: 2 }}
          >
            <MenuItem value="ASSET">Asset</MenuItem>
            <MenuItem value="LIABILITY">Liability</MenuItem>
            <MenuItem value="EQUITY">Equity</MenuItem>
            <MenuItem value="REVENUE">Revenue</MenuItem>
            <MenuItem value="EXPENSE">Expense</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Account Subtype"
            value={accountForm.account_subtype}
            onChange={(e) => setAccountForm({...accountForm, account_subtype: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Parent Account"
            value={accountForm.parent_account}
            onChange={(e) => setAccountForm({...accountForm, parent_account: e.target.value})}
            sx={{ mb: 2 }}
          >
            {chartOfAccounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.account_code} - {account.account_name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Currency"
            value={accountForm.currency}
            onChange={(e) => setAccountForm({...accountForm, currency: e.target.value})}
            sx={{ mb: 2 }}
          >
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenAccountDialog(false)}>Cancel</Button>
        <Button variant="contained" onClick={handleCreateAccount}>
          {selectedAccount ? 'Update Account' : 'Add Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const QuickActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 12,
    padding: '12px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
    },
  }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Finance Management System
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Dashboard" />
            <Tab label="Chart of Accounts" />
            <Tab label="Journal Entries" />
            <Tab label="Budgets" />
            <Tab label="Fixed Assets" />
            <Tab label="Expense Reports" />
            <Tab label="Financial Reports" />
            <Tab label="Multi-Currency" />
            <Tab label="Stock Management" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Quick Actions Section */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setJournalEntryDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                      >
                        Create Journal Entry
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<TrendingUp />}
                        onClick={() => setBudgetDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
                          }
                        }}
                      >
                        Create Budget
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<Receipt />}
                        onClick={() => setExpenseDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #f57c00 30%, #ffb74d 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #ef6c00 30%, #f57c00 90%)',
                          }
                        }}
                      >
                        Add Expense
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<CreditCard />}
                        onClick={() => setInvoiceDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #7b1fa2 30%, #ab47bc 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #6a1b9a 30%, #7b1fa2 90%)',
                          }
                        }}
                      >
                        Create Invoice
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<AccountBalance />}
                        onClick={() => setCustomerBalanceDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                      >
                        Customer Balance
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<Assessment />}
                        onClick={() => setReceivableSummaryDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #f57c00 30%, #ff9800 90%)',
                          }
                        }}
                      >
                        Receivable Summary
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<Visibility />}
                        onClick={() => setReceivableDetailsDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #8e24aa 30%, #9c27b0 90%)',
                          }
                        }}
                      >
                        Receivable Details
                      </QuickActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <QuickActionButton
                        fullWidth
                        variant="contained"
                        startIcon={<AttachMoney />}
                        onClick={() => setPendingPaymentsDialog(true)}
                        sx={{
                          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #3e8e41 30%, #4CAF50 90%)',
                          }
                        }}
                      >
                        Pending Payments
                      </QuickActionButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <DashboardOverview />
          </Grid>
        )}
        {activeTab === 1 && <ChartOfAccountsTab />}
        {activeTab === 2 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Journal Entries</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setJournalEntryDialog(true)}
              >
                Create Entry
              </Button>
            </Box>

            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Debit</TableCell>
                        <TableCell align="right">Credit</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {journalEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.reference_number}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>{entry.account_name}</TableCell>
                          <TableCell align="right">
                            {entry.entry_type === 'DEBIT' ? formatCurrency(entry.amount) : '-'}
                          </TableCell>
                          <TableCell align="right">
                            {entry.entry_type === 'CREDIT' ? formatCurrency(entry.amount) : '-'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
        {activeTab === 3 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Budget Management</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setBudgetDialog(true)}
              >
                Create Budget
              </Button>
            </Box>

            <Grid container spacing={3}>
              {budgets.map((budget) => (
                <Grid item xs={12} md={6} key={budget.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">{budget.budget_name}</Typography>
                        <Chip 
                          label={budget.budget_type} 
                          color={budget.budget_type === 'OPERATIONAL' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Fiscal Year: {budget.fiscal_year}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        {budget.description}
                      </Typography>
                      <Box mt={2}>
                        <Typography variant="body2">Budget Utilization</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min((budget.actual_amount / budget.budgeted_amount) * 100, 100)}
                          sx={{ mt: 1, mb: 1 }}
                        />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption">
                            Actual: {formatCurrency(budget.actual_amount || 0)}
                          </Typography>
                          <Typography variant="caption">
                            Budget: {formatCurrency(budget.budgeted_amount || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        {activeTab === 4 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Fixed Assets</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
              >
                Add Asset
              </Button>
            </Box>

            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Purchase Date</TableCell>
                        <TableCell align="right">Cost</TableCell>
                        <TableCell align="right">Depreciation</TableCell>
                        <TableCell align="right">Book Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fixedAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell>{asset.asset_name}</TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{new Date(asset.purchase_date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">{formatCurrency(asset.purchase_cost)}</TableCell>
                          <TableCell align="right">{formatCurrency(asset.accumulated_depreciation || 0)}</TableCell>
                          <TableCell align="right">{formatCurrency(asset.book_value || asset.purchase_cost)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={asset.status || 'Active'} 
                              color={asset.status === 'Active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
        {activeTab === 5 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Expense Reports</Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setExpenseDialog(true)}
              >
                Create Report
              </Button>
            </Box>

            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Report Number</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenseReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.report_number}</TableCell>
                          <TableCell>{new Date(report.report_date).toLocaleDateString()}</TableCell>
                          <TableCell>{report.description}</TableCell>
                          <TableCell align="right">{formatCurrency(report.total_amount || 0)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={report.status || 'Draft'} 
                              color={report.status === 'Approved' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        )}
        {activeTab === 6 && (
          <Box>
            <Typography variant="h5" gutterBottom>Financial Reports</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Income Statement</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Profit & Loss report for the current period
                    </Typography>
                    <Button variant="outlined" fullWidth startIcon={<FileDownload />}>
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Balance Sheet</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Assets, liabilities, and equity summary
                    </Typography>
                    <Button variant="outlined" fullWidth startIcon={<FileDownload />}>
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Cash Flow</Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Cash flow statement for the period
                    </Typography>
                    <Button variant="outlined" fullWidth startIcon={<FileDownload />}>
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        {activeTab === 7 && (
          <Box>
            <Typography variant="h5" gutterBottom>Multi-Currency Management</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Exchange Rates</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Currency</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell align="right">Rate (USD)</TableCell>
                            <TableCell>Last Updated</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>US Dollar</TableCell>
                            <TableCell>USD</TableCell>
                            <TableCell align="right">1.0000</TableCell>
                            <TableCell>Base Currency</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Sierra Leone Leone</TableCell>
                            <TableCell>SLL</TableCell>
                            <TableCell align="right">20,000.00</TableCell>
                            <TableCell>Today</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Liberian Dollar</TableCell>
                            <TableCell>LRD</TableCell>
                            <TableCell align="right">185.00</TableCell>
                            <TableCell>Today</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Currency Converter</Typography>
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        select
                        fullWidth
                        label="From Currency"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="USD">USD - US Dollar</MenuItem>
                        <MenuItem value="SLL">SLL - Sierra Leone Leone</MenuItem>
                        <MenuItem value="LRD">LRD - Liberian Dollar</MenuItem>
                      </TextField>
                      <TextField
                        select
                        fullWidth
                        label="To Currency"
                        sx={{ mb: 2 }}
                      >
                        <MenuItem value="USD">USD - US Dollar</MenuItem>
                        <MenuItem value="SLL">SLL - Sierra Leone Leone</MenuItem>
                        <MenuItem value="LRD">LRD - Liberian Dollar</MenuItem>
                      </TextField>
                      <Button variant="contained" fullWidth>
                        Convert
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
        {activeTab === 8 && (
          <Box>
            <Typography variant="h5" gutterBottom>Stock Management</Typography>
            
            {/* Stock Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Inventory color="primary" />
                      <Typography variant="h6" ml={1}>Total Products</Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {stockSummary.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Products
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Warehouse color="info" />
                      <Typography variant="h6" ml={1}>Total Warehouses</Typography>
                    </Box>
                    <Typography variant="h4" color="info.main">
                      {warehouseStockData.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Warehouses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocalShipping color="success" />
                      <Typography variant="h6" ml={1}>Stock Movements</Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      {stockMovements.length || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Recent Movements
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AttachMoney color="warning" />
                      <Typography variant="h6" ml={1}>Total Stock Value</Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main">
                      {formatCurrency(stockSummary.reduce((total, item) => total + (item.total_value || 0), 0))}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Value
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Stock Summary by Product</Typography>
                      <Button
                        startIcon={<FileDownload />}
                        size="small"
                        onClick={() => {
                          setSnackbar({
                            open: true,
                            message: 'Stock summary export initiated',
                            severity: 'info'
                          });
                        }}
                      >
                        Export
                      </Button>
                    </Box>
                    <TextField
                      fullWidth
                      label="Search Products"
                      value={stockSearchTerm}
                      onChange={(e) => setStockSearchTerm(e.target.value)}
                      sx={{ mb: 2 }}
                      size="small"
                    />
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total Value</TableCell>
                            <TableCell align="center">Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stockSummary
                            .filter(item => 
                              !stockSearchTerm || 
                              item.name?.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
                              item.sku?.toLowerCase().includes(stockSearchTerm.toLowerCase())
                            )
                            .map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    SKU: {item.sku}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">{item.quantity || 0}</TableCell>
                              <TableCell align="right">{formatCurrency(item.unit_price || 0)}</TableCell>
                              <TableCell align="right">{formatCurrency(item.total_value || 0)}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={item.quantity > 10 ? 'In Stock' : item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                                  color={item.quantity > 10 ? 'success' : item.quantity > 0 ? 'warning' : 'error'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Stock by Warehouse</Typography>
                    <TextField
                      fullWidth
                      label="Select Warehouse"
                      select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      sx={{ mb: 2 }}
                      size="small"
                    >
                      <MenuItem value="all">All Warehouses</MenuItem>
                      {warehouseStockData.map((warehouse) => (
                        <MenuItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    
                    <TableContainer sx={{ maxHeight: 400 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Warehouse</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {warehouseStockData
                            .filter(warehouse => selectedWarehouse === 'all' || warehouse.id === selectedWarehouse)
                            .flatMap(warehouse => 
                              (warehouse.items || []).map(item => ({
                                ...item,
                                warehouse_name: warehouse.name,
                                warehouse_id: warehouse.id
                              }))
                            )
                            .filter(item => 
                              !stockSearchTerm || 
                              item.name?.toLowerCase().includes(stockSearchTerm.toLowerCase())
                            )
                            .map((item, index) => (
                            <TableRow key={`${item.warehouse_id}-${item.id}-${index}`} hover>
                              <TableCell>
                                <Typography variant="body2">{item.name}</Typography>
                              </TableCell>
                              <TableCell>
                                <Chip label={item.warehouse_name} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell align="right">{item.quantity || 0}</TableCell>
                              <TableCell align="right">{formatCurrency(item.total_value || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">Recent Stock Movements</Typography>
                      <Button
                        startIcon={<Refresh />}
                        size="small"
                        onClick={loadStockData}
                      >
                        Refresh
                      </Button>
                    </Box>
                    <TableContainer sx={{ maxHeight: 300 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Movement Type</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total Value</TableCell>
                            <TableCell>Warehouse</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stockMovements.slice(0, 50).map((movement) => (
                            <TableRow key={movement.id} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(movement.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(movement.date).toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{movement.product_name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  SKU: {movement.product_sku}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={movement.movement_type || 'Stock Update'}
                                  size="small"
                                  color={movement.movement_type === 'addition' ? 'success' : 'info'}
                                />
                              </TableCell>
                              <TableCell align="right">{movement.quantity}</TableCell>
                              <TableCell align="right">{formatCurrency(movement.unit_price || 0)}</TableCell>
                              <TableCell align="right">{formatCurrency(movement.total_value || 0)}</TableCell>
                              <TableCell>
                                <Chip label={movement.warehouse_name} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption">
                                  {movement.notes || '-'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {stockMovements.length === 0 && (
                      <Box textAlign="center" py={3}>
                        <Typography color="textSecondary">
                          No stock movements recorded yet
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Journal Entry Dialog */}
        <Dialog open={journalEntryDialog} onClose={() => setJournalEntryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={journalEntryForm.description}
                onChange={(e) => setJournalEntryForm({...journalEntryForm, description: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Reference Number"
                value={journalEntryForm.reference_number}
                onChange={(e) => setJournalEntryForm({...journalEntryForm, reference_number: e.target.value})}
                sx={{ mb: 3 }}
              />
              
              <Typography variant="h6" sx={{ mb: 2 }}>Journal Entries</Typography>
              {journalEntryForm.entries.map((entry, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        select
                        fullWidth
                        label="Account"
                        value={entry.account}
                        onChange={(e) => {
                          const newEntries = [...journalEntryForm.entries];
                          newEntries[index].account = e.target.value;
                          setJournalEntryForm({...journalEntryForm, entries: newEntries});
                        }}
                      >
                        {chartOfAccounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        select
                        fullWidth
                        label="Type"
                        value={entry.entry_type}
                        onChange={(e) => {
                          const newEntries = [...journalEntryForm.entries];
                          newEntries[index].entry_type = e.target.value;
                          setJournalEntryForm({...journalEntryForm, entries: newEntries});
                        }}
                      >
                        <MenuItem value="DEBIT">Debit</MenuItem>
                        <MenuItem value="CREDIT">Credit</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={entry.amount}
                        onChange={(e) => {
                          const newEntries = [...journalEntryForm.entries];
                          newEntries[index].amount = e.target.value;
                          setJournalEntryForm({...journalEntryForm, entries: newEntries});
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={entry.description}
                        onChange={(e) => {
                          const newEntries = [...journalEntryForm.entries];
                          newEntries[index].description = e.target.value;
                          setJournalEntryForm({...journalEntryForm, entries: newEntries});
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setJournalEntryDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateJournalEntry} variant="contained">Create Entry</Button>
          </DialogActions>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Budget</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Budget Name"
                value={budgetForm.budget_name}
                onChange={(e) => setBudgetForm({...budgetForm, budget_name: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Budget Type"
                value={budgetForm.budget_type}
                onChange={(e) => setBudgetForm({...budgetForm, budget_type: e.target.value})}
                sx={{ mb: 2 }}
              >
                <MenuItem value="OPERATIONAL">Operational</MenuItem>
                <MenuItem value="CAPITAL">Capital</MenuItem>
                <MenuItem value="PROJECT">Project</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Fiscal Year"
                type="number"
                value={budgetForm.fiscal_year}
                onChange={(e) => setBudgetForm({...budgetForm, fiscal_year: parseInt(e.target.value)})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={budgetForm.description}
                onChange={(e) => setBudgetForm({...budgetForm, description: e.target.value})}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBudget} variant="contained">Create Budget</Button>
          </DialogActions>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={expenseDialog} onClose={() => setExpenseDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Category"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                sx={{ mb: 2 }}
              >
                <MenuItem value="1">Travel</MenuItem>
                <MenuItem value="2">Office Supplies</MenuItem>
                <MenuItem value="3">Meals</MenuItem>
                <MenuItem value="4">Transportation</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Expense Date"
                type="date"
                value={expenseForm.expense_date}
                onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpenseDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateExpenseReport} variant="contained">Add Expense</Button>
          </DialogActions>
        </Dialog>

        {/* Invoice Dialog */}
        <Dialog open={invoiceDialog} onClose={() => setInvoiceDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Customer Name"
                value={invoiceForm.customer_name}
                onChange={(e) => setInvoiceForm({...invoiceForm, customer_name: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} variant="contained">Create Invoice</Button>
          </DialogActions>
        </Dialog>

        <AddAccountDialog />

        {/* Customer Balance Dialog */}
        <Dialog open={customerBalanceDialog} onClose={() => setCustomerBalanceDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Customer Balance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Customer Search"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer Name</TableCell>
                      <TableCell>Total Balance</TableCell>
                      <TableCell>Overdue Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customersData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{formatCurrency(customer.totalBalance)}</TableCell>
                        <TableCell>{formatCurrency(customer.overdueAmount)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={customer.status} 
                            color={customer.status === 'Has Overdue' ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerBalanceDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setCustomerBalanceDialog(false);
              setCustomerBalanceDetailsDialog(true);
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Customer Balance Details Dialog */}
        <Dialog open={customerBalanceDetailsDialog} onClose={() => setCustomerBalanceDetailsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Customer Balance Details</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Customer Balance Summary</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction Date</TableCell>
                      <TableCell>Transaction Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customersData.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.transaction_date}</TableCell>
                        <TableCell>{customer.transaction_type}</TableCell>
                        <TableCell>{formatCurrency(customer.amount)}</TableCell>
                        <TableCell>{formatCurrency(customer.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomerBalanceDetailsDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setCustomerBalanceDetailsDialog(false);
              setSnackbar({
                open: true,
                message: 'Customer balance details loaded successfully!',
                severity: 'success'
              });
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Receivables Summary Dialog */}
        <Dialog open={receivableSummaryDialog} onClose={() => setReceivableSummaryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Receivables Summary</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {agingData.map((period, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{period.period}</Typography>
                      <Typography variant="h4" color="primary">
                        {formatCurrency(period.amount)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {period.invoiceCount} invoices ({period.percentage.toFixed(1)}%)
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceivableSummaryDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setReceivableSummaryDialog(false);
              setReceivableSummaryDetailsDialog(true);
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Receivable Summary Details Dialog */}
        <Dialog open={receivableSummaryDetailsDialog} onClose={() => setReceivableSummaryDetailsDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Receivable Summary Details</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Receivable Summary Details</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Days Overdue</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoicesData.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.daysOverdue || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={invoice.status} 
                            color={invoice.status === 'Overdue' ? 'error' : 
                                  invoice.status === 'Due Soon' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceivableSummaryDetailsDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setReceivableSummaryDetailsDialog(false);
              setSnackbar({
                open: true,
                message: 'Receivable summary details loaded successfully!',
                severity: 'success'
              });
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Receivables Details Dialog */}
        <Dialog open={receivableDetailsDialog} onClose={() => setReceivableDetailsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Receivables Details</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoicesData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>{invoice.daysOverdue || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={invoice.status} 
                          color={invoice.status === 'Overdue' ? 'error' : 
                                invoice.status === 'Due Soon' ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceivableDetailsDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setReceivableDetailsDialog(false);
              setReceivableDetailsViewDialog(true);
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Receivable Details View Dialog */}
        <Dialog open={receivableDetailsViewDialog} onClose={() => setReceivableDetailsViewDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Receivable Details View</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Receivable Details View</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Days Overdue</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoicesData.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.id}</TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>{invoice.daysOverdue || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={invoice.status} 
                            color={invoice.status === 'Overdue' ? 'error' : 
                                  invoice.status === 'Due Soon' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReceivableDetailsViewDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => {
              setReceivableDetailsViewDialog(false);
              setSnackbar({
                open: true,
                message: 'Receivable details view loaded successfully!',
                severity: 'success'
              });
            }}>View Details</Button>
          </DialogActions>
        </Dialog>

        {/* Pending Payments Dialog */}
        <Dialog open={pendingPaymentsDialog} onClose={() => setPendingPaymentsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Pending Payments for Approval</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {pendingPayments.length === 0 ? (
                <Typography color="textSecondary" align="center" py={3}>
                  No pending payments for approval
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sales Order</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Payment Method</TableCell>
                        <TableCell>Submitted Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.sales_order_number || payment.sales_order}</TableCell>
                          <TableCell>{payment.customer_name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.payment_method?.charAt(0).toUpperCase() + payment.payment_method?.slice(1) || 'N/A'} 
                              size="small" 
                              color={payment.payment_method === 'cheque' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{payment.reference || 'N/A'}</TableCell>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handlePaymentApproval(payment.id, 'approved')}
                                disabled={loading}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                onClick={() => handlePaymentApproval(payment.id, 'rejected')}
                                disabled={loading}
                              >
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPendingPaymentsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({...snackbar, open: false})}
        >
          <Alert
            onClose={() => setSnackbar({...snackbar, open: false})}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default FinanceDashboard;
