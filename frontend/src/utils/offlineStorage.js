// Offline Storage Utility for ERP Mobile Apps
// Handles offline transaction storage and sync management

class OfflineStorage {
  constructor() {
    this.storageKeys = {
      transactions: 'pendingTransactions',
      customers: 'pendingCustomers',
      products: 'pendingProducts',
      salesOrders: 'pendingSalesOrders',
      stockMovements: 'pendingStockMovements',
      syncQueue: 'syncQueue'
    };
  }

  // Add transaction to offline storage
  addTransaction(transaction) {
    const transactions = this.getStoredData(this.storageKeys.transactions);
    const newTransaction = {
      ...transaction,
      id: this.generateOfflineId(),
      offline_created: true,
      created_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    transactions.push(newTransaction);
    this.saveData(this.storageKeys.transactions, transactions);
    this.notifyOfflineDataAdded();
    
    return newTransaction;
  }

  // Add customer to offline storage
  addCustomer(customer) {
    const customers = this.getStoredData(this.storageKeys.customers);
    const newCustomer = {
      ...customer,
      id: this.generateOfflineId(),
      offline_created: true,
      created_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    customers.push(newCustomer);
    this.saveData(this.storageKeys.customers, customers);
    this.notifyOfflineDataAdded();
    
    return newCustomer;
  }

  // Add product to offline storage
  addProduct(product) {
    const products = this.getStoredData(this.storageKeys.products);
    const newProduct = {
      ...product,
      id: this.generateOfflineId(),
      offline_created: true,
      created_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    products.push(newProduct);
    this.saveData(this.storageKeys.products, products);
    this.notifyOfflineDataAdded();
    
    return newProduct;
  }

  // Add sales order to offline storage
  addSalesOrder(salesOrder) {
    const salesOrders = this.getStoredData(this.storageKeys.salesOrders);
    const newSalesOrder = {
      ...salesOrder,
      id: this.generateOfflineId(),
      reference_number: `SO-OFFLINE-${Date.now()}`,
      offline_created: true,
      created_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    salesOrders.push(newSalesOrder);
    this.saveData(this.storageKeys.salesOrders, salesOrders);
    this.notifyOfflineDataAdded();
    
    return newSalesOrder;
  }

  // Add stock movement to offline storage
  addStockMovement(movement) {
    const movements = this.getStoredData(this.storageKeys.stockMovements);
    const newMovement = {
      ...movement,
      id: this.generateOfflineId(),
      offline_created: true,
      created_at: new Date().toISOString(),
      sync_status: 'pending'
    };
    
    movements.push(newMovement);
    this.saveData(this.storageKeys.stockMovements, movements);
    this.notifyOfflineDataAdded();
    
    return newMovement;
  }

  // Get all pending data for sync
  getAllPendingData() {
    return {
      transactions: this.getStoredData(this.storageKeys.transactions),
      customers: this.getStoredData(this.storageKeys.customers),
      products: this.getStoredData(this.storageKeys.products),
      salesOrders: this.getStoredData(this.storageKeys.salesOrders),
      stockMovements: this.getStoredData(this.storageKeys.stockMovements)
    };
  }

  // Get pending count for all data types
  getPendingCount() {
    const data = this.getAllPendingData();
    return Object.values(data).reduce((total, items) => total + items.length, 0);
  }

  // Clear all synced data
  clearSyncedData() {
    Object.values(this.storageKeys).forEach(key => {
      if (key !== 'syncQueue') {
        localStorage.removeItem(key);
      }
    });
    this.notifyDataSynced();
  }

  // Mark specific items as synced
  markAsSynced(type, ids) {
    const data = this.getStoredData(this.storageKeys[type]);
    const remaining = data.filter(item => !ids.includes(item.id));
    this.saveData(this.storageKeys[type], remaining);
  }

  // Get stored data with fallback
  getStoredData(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error(`Error parsing stored data for ${key}:`, error);
      return [];
    }
  }

  // Save data to localStorage
  saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for ${key}:`, error);
    }
  }

  // Generate offline ID
  generateOfflineId() {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Notify that offline data was added
  notifyOfflineDataAdded() {
    window.dispatchEvent(new CustomEvent('offlineDataAdded', {
      detail: { timestamp: new Date(), count: this.getPendingCount() }
    }));
  }

  // Notify that data was synced
  notifyDataSynced() {
    window.dispatchEvent(new CustomEvent('dataSynced', {
      detail: { timestamp: new Date() }
    }));
  }

  // Check if device is offline
  isOffline() {
    return !navigator.onLine;
  }

  // Get offline status message
  getOfflineMessage() {
    const count = this.getPendingCount();
    if (count === 0) {
      return 'Working offline - no pending data';
    }
    return `Working offline - ${count} items pending sync`;
  }

  // Export data for debugging
  exportOfflineData() {
    const data = this.getAllPendingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offline_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import data (for testing)
  importOfflineData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      Object.keys(data).forEach(type => {
        if (this.storageKeys[type]) {
          this.saveData(this.storageKeys[type], data[type]);
        }
      });
      this.notifyOfflineDataAdded();
      return true;
    } catch (error) {
      console.error('Error importing offline data:', error);
      return false;
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
