// useTransactionIntegration.js - React hook for dashboard transaction integration
import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import transactionService from '../services/TransactionService';

export const useTransactionIntegration = (moduleId) => {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    incoming_transactions: 0,
    outgoing_transactions: 0,
    total_value: 0,
    top_sources: [],
    top_targets: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transaction listener callback
  const handleTransactionUpdate = useCallback((transaction) => {
    setTransactions(prev => {
      // Add new transaction or update existing one
      const existingIndex = prev.findIndex(t => t.id === transaction.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = transaction;
        return updated;
      } else {
        return [transaction, ...prev].slice(0, 50); // Keep only latest 50
      }
    });

    // Update analytics if this transaction affects our module
    if (transaction.source === moduleId || transaction.targets.includes(moduleId)) {
      loadAnalytics();
    }
  }, [moduleId]);

  // Load transaction history
  const loadTransactions = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await transactionService.getModuleTransactions(moduleId, token);
      setTransactions(data);
    } catch (err) {
      setError(`Failed to load transactions: ${err.message}`);
      console.error('Transaction loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId, token]);

  // Load analytics
  const loadAnalytics = useCallback(async () => {
    if (!token) return;
    
    try {
      const data = await transactionService.getTransactionAnalytics(moduleId, token);
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics loading error:', err);
    }
  }, [moduleId, token]);

  // Create a new transaction
  const createTransaction = useCallback(async (transactionType, data) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const transaction = await transactionService.createTransaction(transactionType, data, token);
      return transaction;
    } catch (err) {
      setError(`Failed to create transaction: ${err.message}`);
      throw err;
    }
  }, [token]);

  // Execute a workflow
  const executeWorkflow = useCallback(async (workflowType, data) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const result = await transactionService.executeWorkflow(workflowType, data, token);
      return result;
    } catch (err) {
      setError(`Failed to execute workflow: ${err.message}`);
      throw err;
    }
  }, [token]);

  // Register/unregister transaction listener
  useEffect(() => {
    if (moduleId) {
      transactionService.registerTransactionListener(moduleId, handleTransactionUpdate);
      
      // Load initial data
      loadTransactions();
      loadAnalytics();

      return () => {
        transactionService.unregisterTransactionListener(moduleId, handleTransactionUpdate);
      };
    }
  }, [moduleId]);

  // Helper functions for common transaction types
  const transactionHelpers = {
    // Sales transactions
    createSalesOrder: (orderData) => createTransaction('SALES_ORDER_CREATED', orderData),
    completePOSSale: (saleData) => createTransaction('POS_SALE_COMPLETED', saleData),
    
    // Procurement transactions
    createPurchaseOrder: (orderData) => createTransaction('PURCHASE_ORDER_CREATED', orderData),
    
    // Manufacturing transactions
    createProductionOrder: (orderData) => createTransaction('PRODUCTION_ORDER_CREATED', orderData),
    
    // Inventory transactions
    recordInventoryMovement: (movementData) => createTransaction('INVENTORY_MOVEMENT', movementData),
    
    // Warehouse transactions
    createWarehouseTransfer: (transferData) => createTransaction('WAREHOUSE_TRANSFER', transferData),
    
    // HR transactions
    processPayroll: (payrollData) => createTransaction('PAYROLL_PROCESSED', payrollData),
    
    // Customer transactions
    createCustomer: (customerData) => createTransaction('CUSTOMER_CREATED', customerData),
    
    // Workflow executions
    executeSalesWorkflow: (data) => executeWorkflow('SALES_ORDER_WORKFLOW', data),
    executePurchaseWorkflow: (data) => executeWorkflow('PURCHASE_ORDER_WORKFLOW', data),
    executeManufacturingWorkflow: (data) => executeWorkflow('MANUFACTURING_WORKFLOW', data)
  };

  return {
    // State
    transactions,
    analytics,
    loading,
    error,
    
    // Actions
    createTransaction,
    executeWorkflow,
    loadTransactions,
    loadAnalytics,
    
    // Helper functions
    ...transactionHelpers,
    
    // Utility
    clearError: () => setError(null),
    refreshData: () => {
      loadTransactions();
      loadAnalytics();
    }
  };
};

// Hook for cross-module transaction tracking
export const useCrossModuleTransactions = (modules = []) => {
  const { token } = useContext(AuthContext);
  const [crossModuleData, setCrossModuleData] = useState({});
  const [loading, setLoading] = useState(false);

  const loadCrossModuleData = useCallback(async () => {
    if (!token || modules.length === 0) return;
    
    setLoading(true);
    const data = {};
    
    try {
      await Promise.all(modules.map(async (moduleId) => {
        const [transactions, analytics] = await Promise.all([
          transactionService.getModuleTransactions(moduleId, token, 20),
          transactionService.getTransactionAnalytics(moduleId, token)
        ]);
        
        data[moduleId] = { transactions, analytics };
      }));
      
      setCrossModuleData(data);
    } catch (err) {
      console.error('Cross-module data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [modules, token]);

  useEffect(() => {
    loadCrossModuleData();
  }, [loadCrossModuleData]);

  return {
    crossModuleData,
    loading,
    refresh: loadCrossModuleData
  };
};

export default useTransactionIntegration;
