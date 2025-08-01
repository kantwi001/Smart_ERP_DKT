// TransactionService.js - Centralized transaction management for ERP modules
import api from '../api';

class TransactionService {
  constructor() {
    this.transactionListeners = new Map();
    this.pendingTransactions = new Map();
  }

  // Transaction Types and their module relationships
  static TRANSACTION_TYPES = {
    // Sales to Inventory
    SALES_ORDER_CREATED: {
      source: 'sales',
      targets: ['inventory', 'accounting', 'warehouse'],
      description: 'Sales order created - affects inventory, accounting, warehouse'
    },
    
    // Procurement to Inventory
    PURCHASE_ORDER_CREATED: {
      source: 'procurement',
      targets: ['inventory', 'accounting', 'warehouse'],
      description: 'Purchase order created - affects inventory, accounting, warehouse'
    },
    
    // Manufacturing to Inventory
    PRODUCTION_ORDER_CREATED: {
      source: 'manufacturing',
      targets: ['inventory', 'procurement', 'accounting'],
      description: 'Production order created - affects inventory, procurement, accounting'
    },
    
    // Inventory to Accounting
    INVENTORY_MOVEMENT: {
      source: 'inventory',
      targets: ['accounting', 'warehouse'],
      description: 'Inventory movement - affects accounting and warehouse'
    },
    
    // Warehouse to Inventory
    WAREHOUSE_TRANSFER: {
      source: 'warehouse',
      targets: ['inventory', 'accounting'],
      description: 'Warehouse transfer - affects inventory and accounting'
    },
    
    // HR to Accounting
    PAYROLL_PROCESSED: {
      source: 'hr',
      targets: ['accounting'],
      description: 'Payroll processed - affects accounting'
    },
    
    // POS to Sales/Inventory
    POS_SALE_COMPLETED: {
      source: 'pos',
      targets: ['sales', 'inventory', 'accounting'],
      description: 'POS sale completed - affects sales, inventory, accounting'
    },
    
    // Customer to Sales
    CUSTOMER_CREATED: {
      source: 'customers',
      targets: ['sales', 'accounting'],
      description: 'Customer created - affects sales and accounting'
    }
  };

  // Register a dashboard to listen for specific transaction types
  registerTransactionListener(moduleId, callback) {
    if (!this.transactionListeners.has(moduleId)) {
      this.transactionListeners.set(moduleId, []);
    }
    this.transactionListeners.get(moduleId).push(callback);
  }

  // Remove transaction listener
  unregisterTransactionListener(moduleId, callback) {
    if (this.transactionListeners.has(moduleId)) {
      const listeners = this.transactionListeners.get(moduleId);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Create a new transaction and notify all affected modules
  async createTransaction(transactionType, data, token) {
    const transactionConfig = TransactionService.TRANSACTION_TYPES[transactionType];
    if (!transactionConfig) {
      throw new Error(`Unknown transaction type: ${transactionType}`);
    }

    const transaction = {
      id: this.generateTransactionId(),
      type: transactionType,
      source: transactionConfig.source,
      targets: transactionConfig.targets,
      data: data,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Store pending transaction
    this.pendingTransactions.set(transaction.id, transaction);

    try {
      // Process transaction in backend
      const response = await api.post('/transactions/', {
        transaction_type: transactionType,
        source_module: transactionConfig.source,
        target_modules: transactionConfig.targets,
        transaction_data: data
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      transaction.status = 'completed';
      transaction.backendId = response.data.id;

      // Notify all affected modules
      this.notifyModules(transaction);

      return transaction;
    } catch (error) {
      transaction.status = 'failed';
      transaction.error = error.message;
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  // Notify all modules affected by a transaction
  notifyModules(transaction) {
    // Notify source module
    this.notifyModule(transaction.source, transaction);

    // Notify all target modules
    transaction.targets.forEach(targetModule => {
      this.notifyModule(targetModule, transaction);
    });
  }

  // Notify a specific module about a transaction
  notifyModule(moduleId, transaction) {
    if (this.transactionListeners.has(moduleId)) {
      const listeners = this.transactionListeners.get(moduleId);
      listeners.forEach(callback => {
        try {
          callback(transaction);
        } catch (error) {
          console.error(`Error notifying module ${moduleId}:`, error);
        }
      });
    }
  }

  // Get transaction history for a specific module
  async getModuleTransactions(moduleId, token, limit = 50) {
    try {
      const response = await api.get(`/transactions/module/${moduleId}/`, {
        params: { limit },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get transactions for module ${moduleId}:`, error);
      return [];
    }
  }

  // Get cross-module transaction analytics
  async getTransactionAnalytics(moduleId, token, period = '30d') {
    try {
      const response = await api.get(`/transactions/analytics/${moduleId}/`, {
        params: { period },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to get transaction analytics for module ${moduleId}:`, error);
      return {
        incoming_transactions: 0,
        outgoing_transactions: 0,
        total_value: 0,
        top_sources: [],
        top_targets: []
      };
    }
  }

  // Generate unique transaction ID
  generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get pending transactions
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }

  // Clear completed transactions
  clearCompletedTransactions() {
    for (const [id, transaction] of this.pendingTransactions.entries()) {
      if (transaction.status === 'completed') {
        this.pendingTransactions.delete(id);
      }
    }
  }

  // Transaction workflow helpers
  static WORKFLOWS = {
    // Sales Order Workflow
    SALES_ORDER_WORKFLOW: [
      { step: 1, action: 'CREATE_SALES_ORDER', module: 'sales' },
      { step: 2, action: 'RESERVE_INVENTORY', module: 'inventory' },
      { step: 3, action: 'CREATE_INVOICE', module: 'accounting' },
      { step: 4, action: 'PREPARE_SHIPMENT', module: 'warehouse' }
    ],

    // Purchase Order Workflow
    PURCHASE_ORDER_WORKFLOW: [
      { step: 1, action: 'CREATE_PURCHASE_ORDER', module: 'procurement' },
      { step: 2, action: 'APPROVE_PURCHASE', module: 'accounting' },
      { step: 3, action: 'RECEIVE_GOODS', module: 'warehouse' },
      { step: 4, action: 'UPDATE_INVENTORY', module: 'inventory' }
    ],

    // Manufacturing Workflow
    MANUFACTURING_WORKFLOW: [
      { step: 1, action: 'CREATE_PRODUCTION_ORDER', module: 'manufacturing' },
      { step: 2, action: 'RESERVE_MATERIALS', module: 'inventory' },
      { step: 3, action: 'START_PRODUCTION', module: 'manufacturing' },
      { step: 4, action: 'COMPLETE_PRODUCTION', module: 'inventory' }
    ]
  };

  // Execute a workflow
  async executeWorkflow(workflowType, data, token) {
    const workflow = TransactionService.WORKFLOWS[workflowType];
    if (!workflow) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    const workflowId = this.generateTransactionId();
    const results = [];

    for (const step of workflow) {
      try {
        const transaction = await this.createTransaction(
          `${step.action}_TRANSACTION`,
          { ...data, workflowId, step: step.step },
          token
        );
        results.push({ step: step.step, transaction, status: 'completed' });
      } catch (error) {
        results.push({ step: step.step, error: error.message, status: 'failed' });
        break; // Stop workflow on error
      }
    }

    return { workflowId, results };
  }
}

// Create singleton instance
const transactionService = new TransactionService();

export default transactionService;
