// Shared data source for warehouses, products, and customers across all modules
// This ensures consistency between Inventory, Sales, and other modules
import { Capacitor } from '@capacitor/core';

console.log('🔄 sharedData.js module loading...');

// Dynamic API base URL detection for mobile compatibility - consistent with api.js
const getApiBaseUrl = () => {
  // Mobile apps always use Fly.dev production backend
  if (Capacitor.isNativePlatform()) {
    return 'https://backend-shy-sun-4450.fly.dev/api';
  }
  
  // Web app uses localhost for development
  return 'http://localhost:2025/api';
};

const API_BASE_URL = getApiBaseUrl();

export { API_BASE_URL };

// Global transaction storage with localStorage persistence
export let sharedTransactions = JSON.parse(localStorage.getItem('sharedTransactions') || '[]');

// Global transaction history state for cross-module integration
let globalTransactionHistory = JSON.parse(localStorage.getItem('globalTransactionHistory') || '[]');

// Global payment history for workflow management
let globalPaymentHistory = JSON.parse(localStorage.getItem('globalPaymentHistory') || '[]');

// Global products state - NO SAMPLE DATA, only real PostgreSQL data
let globalProducts = JSON.parse(localStorage.getItem('globalProducts') || '[]');

// Global customers state - NO SAMPLE DATA, only real PostgreSQL data
export let sharedCustomers = JSON.parse(localStorage.getItem('sharedCustomers') || '[]');

// Global warehouses state - NO SAMPLE DATA, only real PostgreSQL data
let globalWarehouses = JSON.parse(localStorage.getItem('globalWarehouses') || '[]');

// Global transfer history
let globalTransferHistory = JSON.parse(localStorage.getItem('globalTransferHistory') || '[]');

// Function to save data to localStorage
const saveTransactionsToStorage = () => {
  localStorage.setItem('sharedTransactions', JSON.stringify(sharedTransactions));
};

const saveProductsToStorage = () => {
  localStorage.setItem('globalProducts', JSON.stringify(globalProducts));
};

const saveCustomersToStorage = () => {
  localStorage.setItem('sharedCustomers', JSON.stringify(sharedCustomers));
};

const saveWarehousesToStorage = () => {
  localStorage.setItem('globalWarehouses', JSON.stringify(globalWarehouses));
};

const saveTransferHistoryToStorage = () => {
  localStorage.setItem('globalTransferHistory', JSON.stringify(globalTransferHistory));
};

const savePaymentHistoryToStorage = () => {
  localStorage.setItem('globalPaymentHistory', JSON.stringify(globalPaymentHistory));
};

// Function to load transactions from backend API
export const loadTransactionsFromBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const backendTransactions = await response.json();
      // Merge backend transactions with local ones
      const mergedTransactions = [...backendTransactions, ...sharedTransactions.filter(local => 
        !backendTransactions.some(backend => backend.reference_number === local.reference_number)
      )];
      sharedTransactions.length = 0;
      sharedTransactions.push(...mergedTransactions);
      saveTransactionsToStorage();
      console.log(`Loaded ${backendTransactions.length} transactions from backend`);
      return mergedTransactions;
    } else {
      console.warn(`Backend API returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to load transactions from backend:', error);
  }
  return sharedTransactions;
};

// Product management functions - centralized for webapp and mobile apps
export const loadProductsWithFallback = async (token) => {
  console.log('loadProductsWithFallback function called with token:', token ? 'Token exists' : 'No token');
  try {
    const authToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Using token for products:', authToken ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/inventory/products/`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Products API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    console.log(`✅ Loaded ${products.length} products from backend`);
    console.log('Sample product:', products[0]);
    
    // Cache the products
    globalProducts.length = 0;
    globalProducts.push(...products);
    localStorage.setItem('globalProducts', JSON.stringify(products));
    return products;
  } catch (error) {
    console.error('❌ Error loading products:', error);
    return [];
  }
};

export const getGlobalProducts = () => {
  return [...globalProducts];
};

// Enhanced product update function with cross-module synchronization
export const updateGlobalProduct = (updatedProduct) => {
  try {
    // Update global products array
    const productIndex = globalProducts.findIndex(p => p.id === updatedProduct.id);
    if (productIndex !== -1) {
      globalProducts[productIndex] = { ...globalProducts[productIndex], ...updatedProduct };
    } else {
      globalProducts.push(updatedProduct);
    }
    
    // Save to localStorage
    saveProductsToStorage();
    
    // Update window global state
    if (window.globalProducts) {
      window.globalProducts = [...globalProducts];
    }
    
    // Dispatch event for all modules to sync
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { 
        products: [...globalProducts], 
        updatedProduct,
        source: 'product_edit',
        action: 'update'
      } 
    }));
    
    // Also dispatch specific product update event
    window.dispatchEvent(new CustomEvent('productUpdated', { 
      detail: { 
        product: updatedProduct,
        source: 'shared_data'
      } 
    }));
    
    return true;
  } catch (error) {
    console.error('Error updating global product:', error);
    return false;
  }
};

// Enhanced product creation function
export const createGlobalProduct = (newProduct) => {
  try {
    // Generate new ID if not provided
    if (!newProduct.id) {
      const maxId = Math.max(0, ...globalProducts.map(p => p.id || 0));
      newProduct.id = maxId + 1;
    }
    
    // Add to global products
    globalProducts.push(newProduct);
    
    // Save to localStorage
    saveProductsToStorage();
    
    // Update window global state
    if (window.globalProducts) {
      window.globalProducts = [...globalProducts];
    }
    
    // Dispatch events for all modules
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { 
        products: [...globalProducts], 
        newProduct,
        source: 'product_create',
        action: 'create'
      } 
    }));
    
    window.dispatchEvent(new CustomEvent('productCreated', { 
      detail: { 
        product: newProduct,
        source: 'shared_data'
      } 
    }));
    
    return newProduct;
  } catch (error) {
    console.error('Error creating global product:', error);
    return null;
  }
};

// Enhanced product deletion function
export const deleteGlobalProduct = (productId) => {
  try {
    const productIndex = globalProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return false;
    }
    
    const deletedProduct = globalProducts[productIndex];
    globalProducts.splice(productIndex, 1);
    
    // Save to localStorage
    saveProductsToStorage();
    
    // Update window global state
    if (window.globalProducts) {
      window.globalProducts = [...globalProducts];
    }
    
    // Dispatch events for all modules
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { 
        products: [...globalProducts], 
        deletedProduct,
        source: 'product_delete',
        action: 'delete'
      } 
    }));
    
    window.dispatchEvent(new CustomEvent('productDeleted', { 
      detail: { 
        product: deletedProduct,
        source: 'shared_data'
      } 
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting global product:', error);
    return false;
  }
};

// Update warehouse stock with cross-module sync
export const updateWarehouseStock = (warehouseId, productId, newQuantity, notes = '') => {
  try {
    // Find and update the product in the specific warehouse
    const productIndex = globalProducts.findIndex(p => 
      p.id === productId && p.warehouse_id === warehouseId
    );
    
    if (productIndex !== -1) {
      const oldQuantity = globalProducts[productIndex].quantity || 0;
      globalProducts[productIndex].quantity = newQuantity;
      globalProducts[productIndex].last_updated = new Date().toISOString();
      
      // Create stock movement record
      const stockMovement = {
        id: Date.now(),
        product_id: productId,
        product_name: globalProducts[productIndex].name,
        product_sku: globalProducts[productIndex].sku,
        warehouse_id: warehouseId,
        warehouse_name: globalProducts[productIndex].warehouse_name,
        movement_type: 'adjustment',
        quantity_change: newQuantity - oldQuantity,
        previous_stock: oldQuantity,
        new_stock: newQuantity,
        notes: notes,
        created_at: new Date().toISOString(),
        created_by: 'System'
      };
      
      // Add to transfer history
      addTransferToHistory(stockMovement);
      
      // Save to localStorage
      saveProductsToStorage();
      
      // Update window global state
      if (window.globalProducts) {
        window.globalProducts = [...globalProducts];
      }
      
      // Dispatch events for all modules
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { 
          products: [...globalProducts], 
          source: 'stock_update',
          action: 'stock_adjustment'
        } 
      }));
      
      window.dispatchEvent(new CustomEvent('stockMovementAdded', { 
        detail: { 
          movement: stockMovement,
          source: 'shared_data'
        } 
      }));
      
      return stockMovement;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating warehouse stock:', error);
    return null;
  }
};

// Customer management functions
export const loadCustomersWithFallback = async () => {
  console.log('loadCustomersWithFallback function called');
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log('Token for customers:', token ? 'Token exists' : 'No token');
    
    const response = await fetch(`${API_BASE_URL}/sales/customers/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Customers API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const customers = await response.json();
    console.log(`✅ Loaded ${customers.length} customers from backend`);
    console.log('Sample customer:', customers[0]);
    
    // Cache the customers
    sharedCustomers.length = 0;
    sharedCustomers.push(...customers);
    localStorage.setItem('sharedCustomers', JSON.stringify(customers));
    return customers;
  } catch (error) {
    console.error('❌ Error loading customers:', error);
    return [];
  }
};

export const addCustomer = (customer) => {
  // Don't generate a new ID if the customer already has one from the backend
  const newCustomer = {
    ...customer,
    id: customer.id || Math.max(...sharedCustomers.map(c => c.id), 0) + 1,
  };
  
  // Check if customer already exists to avoid duplicates
  const existingIndex = sharedCustomers.findIndex(c => c.id === newCustomer.id || c.email === newCustomer.email);
  if (existingIndex >= 0) {
    // Update existing customer
    sharedCustomers[existingIndex] = newCustomer;
  } else {
    // Add new customer
    sharedCustomers.push(newCustomer);
  }
  
  saveCustomersToStorage();
  console.log(`Added/updated customer in shared data: ${newCustomer.name} (ID: ${newCustomer.id})`);
  return newCustomer;
};

// Warehouse management functions
export const loadWarehousesWithFallback = async () => {
  console.log('loadWarehousesWithFallback function called');
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const warehouses = await response.json();
    console.log(`Loaded ${warehouses.length} warehouses from backend`);
    
    // Cache the warehouses
    globalWarehouses = warehouses;
    return warehouses;
  } catch (error) {
    console.error('Error loading warehouses:', error);
    return [];
  }
};

// Test function to verify module loading
export const testWarehouseFunction = () => {
  console.log('testWarehouseFunction is working - module loaded correctly');
  return 'test-success';
};

// Transfer management functions
export const getGlobalTransferHistory = () => {
  return [...globalTransferHistory];
};

export const addTransferToHistory = (transfer) => {
  const newTransfer = {
    ...transfer,
    id: Math.max(...globalTransferHistory.map(t => t.id), 0) + 1,
    created_at: new Date().toISOString(),
  };
  globalTransferHistory.unshift(newTransfer);
  saveTransferHistoryToStorage();
  return newTransfer;
};

// Payment management functions
export const getGlobalPaymentHistory = () => {
  return [...globalPaymentHistory];
};

export const addPayment = (payment) => {
  const newPayment = {
    ...payment,
    id: Math.max(...globalPaymentHistory.map(p => p.id), 0) + 1,
    created_at: new Date().toISOString(),
  };
  globalPaymentHistory.unshift(newPayment);
  savePaymentHistoryToStorage();
  return newPayment;
};

export const updatePaymentStatus = (paymentId, status, approvedBy = null) => {
  const payment = globalPaymentHistory.find(p => p.id === paymentId);
  if (payment) {
    payment.status = status;
    if (approvedBy) {
      payment.approved_by = approvedBy;
      payment.approved_date = new Date().toISOString().split('T')[0];
    }
    savePaymentHistoryToStorage();
  }
};

// Finance functions
export const getReceivablesSummary = () => {
  const creditTransactions = sharedTransactions.filter(t => 
    t.payment_method === 'credit' && t.status === 'pending'
  );
  
  return {
    total_outstanding: creditTransactions.reduce((sum, t) => sum + t.amount, 0),
    count: creditTransactions.length,
    overdue_count: creditTransactions.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length
  };
};

export const getCustomerBalance = (customerId) => {
  const customerTransactions = sharedTransactions.filter(t => 
    t.customer_id === customerId && t.payment_method === 'credit'
  );
  
  return customerTransactions.reduce((balance, t) => {
    return balance + (t.status === 'pending' ? t.amount : 0);
  }, 0);
};

// Stock management functions
export const getStockSummary = () => {
  const products = getGlobalProducts();
  return products.map(product => ({
    ...product,
    total_stock: product.stock_quantity || 0,
    status: (product.stock_quantity || 0) < (product.reorder_level || 10) ? 'low' : 'good'
  }));
};

export const getStockByWarehouse = () => {
  const warehouses = globalWarehouses;
  const products = getGlobalProducts();
  
  return warehouses.map(warehouse => ({
    ...warehouse,
    products: products.filter(p => p.warehouse_id === warehouse.id),
    total_products: products.filter(p => p.warehouse_id === warehouse.id).length,
    total_value: products
      .filter(p => p.warehouse_id === warehouse.id)
      .reduce((sum, p) => sum + ((p.stock_quantity || 0) * (p.unit_price || 0)), 0)
  }));
};

export const getStockMovements = () => {
  return globalTransferHistory.slice(0, 100); // Return recent movements
};

// Function to create a sales order transaction with Finance integration
export const createSalesOrderTransaction = async (salesOrderData) => {
  try {
    // Generate unique transaction ID and reference number
    const existingIds = sharedTransactions.map(t => t.id).filter(id => typeof id === 'number');
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    const referenceNumber = `SO-${new Date().getFullYear()}-${String(newId).padStart(4, '0')}`;
    
    const newTransaction = {
      id: newId,
      reference_number: referenceNumber,
      transaction_id: referenceNumber,
      transaction_type: 'SALES_ORDER_CREATED',
      source_module: 'sales',
      target_modules: ['accounting', 'inventory'],
      type: 'SALES_ORDER',
      customer_id: salesOrderData.customer_id,
      customer_name: salesOrderData.customer_name,
      products: salesOrderData.products,
      amount: salesOrderData.amount,
      subtotal: salesOrderData.subtotal,
      discount: salesOrderData.discount || 0,
      discount_amount: salesOrderData.discount_amount || 0,
      payment_method: salesOrderData.payment_method,
      payment_terms: salesOrderData.payment_terms,
      status: salesOrderData.payment_method === 'credit' ? 'pending' : 'completed',
      notes: salesOrderData.notes || '',
      created_at: new Date().toISOString(),
      created_by: 'sales_user',
      location: 'main_store',
      transaction_data: {
        customer: {
          id: salesOrderData.customer_id,
          name: salesOrderData.customer_name
        },
        products: salesOrderData.products,
        payment: {
          method: salesOrderData.payment_method,
          terms: salesOrderData.payment_terms
        }
      }
    };
    
    // Try to sync with backend first
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });
      
      if (response.ok) {
        const backendTransaction = await response.json();
        // Use backend response data
        sharedTransactions.push(backendTransaction);
        console.log('Transaction synced to backend:', backendTransaction.transaction_id);
      } else {
        throw new Error('Backend sync failed');
      }
    } catch (syncError) {
      console.warn('Failed to sync transaction to backend, storing locally:', syncError);
      // Fallback to local storage
      sharedTransactions.push(newTransaction);
    }
    
    saveTransactionsToStorage();
    
    // Also add to global transaction history for Quick Actions Transaction tab
    const globalTransaction = {
      id: newTransaction.id,
      type: 'sale',
      reference: newTransaction.reference_number,
      customer_id: newTransaction.customer_id,
      customer_name: newTransaction.customer_name,
      amount: newTransaction.amount,
      payment_method: newTransaction.payment_method,
      payment_terms: newTransaction.payment_terms,
      status: newTransaction.status,
      date: newTransaction.created_at.split('T')[0],
      due_date: newTransaction.payment_method === 'credit' && newTransaction.payment_terms ? 
        new Date(new Date(newTransaction.created_at).getTime() + (newTransaction.payment_terms * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : null,
      products: newTransaction.products,
      created_by: newTransaction.created_by,
      notes: newTransaction.notes
    };
    
    globalTransactionHistory.unshift(globalTransaction);
    
    // For credit sales, integrate with Finance workflow
    if (salesOrderData.payment_method === 'credit') {
      // Create receivable entry
      const receivableEntry = {
        transaction_id: newTransaction.id,
        customer_id: salesOrderData.customer_id,
        customer_name: salesOrderData.customer_name,
        amount: salesOrderData.amount,
        due_date: salesOrderData.payment_terms ? 
          new Date(new Date().getTime() + (salesOrderData.payment_terms * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] :
          new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Create payment entry for Finance approval workflow
      const paymentEntry = {
        id: Math.max(...globalPaymentHistory.map(p => p.id), 0) + 1,
        transaction_id: newTransaction.id,
        invoice_reference: referenceNumber,
        customer_id: salesOrderData.customer_id,
        customer_name: salesOrderData.customer_name,
        amount: salesOrderData.amount,
        payment_method: salesOrderData.payment_method,
        status: 'pending_approval',
        submitted_date: new Date().toISOString().split('T')[0],
        approved_date: null,
        approved_by: null,
        notes: `Credit sale order ${referenceNumber} pending approval`,
        payment_terms: salesOrderData.payment_terms
      };
      
      // Add to payment history for Finance approval
      globalPaymentHistory.unshift(paymentEntry);
      
      // Dispatch Finance workflow event
      window.dispatchEvent(new CustomEvent('creditSaleCreated', { 
        detail: {
          transaction: newTransaction,
          receivable: receivableEntry,
          payment: paymentEntry
        }
      }));
      
      console.log('Credit sale created and sent to Finance workflow:', receivableEntry);
    }
    
    // Dispatch general transaction event
    window.dispatchEvent(new CustomEvent('transactionCreated', { 
      detail: newTransaction 
    }));
    
    // Dispatch event for Quick Actions Transaction tab
    window.dispatchEvent(new CustomEvent('transactionHistoryUpdated', { 
      detail: globalTransaction 
    }));
    
    console.log('Sales order transaction created successfully:', newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('Error creating sales order transaction:', error);
    throw new Error(`Failed to create sales order transaction: ${error.message}`);
  }
};

// Function to get all transactions
export const getTransactions = () => {
  return sharedTransactions;
};

// Function to get global transaction history
export const getGlobalTransactionHistory = () => {
  return [...globalTransactionHistory];
};

// Function to force refresh all data - call this to ensure data is loaded
export const forceRefreshAllData = async () => {
  console.log('🔄 Force refreshing all ERP data...');
  
  try {
    const [customers, products, warehouses] = await Promise.all([
      loadCustomersWithFallback(),
      loadProductsWithFallback(localStorage.getItem('token')),
      loadWarehousesWithFallback()
    ]);
    
    console.log(`✅ Data refresh complete: ${customers.length} customers, ${products.length} products, ${warehouses.length} warehouses`);
    
    // Dispatch events to notify components
    window.dispatchEvent(new CustomEvent('dataRefreshed', { 
      detail: { customers, products, warehouses }
    }));
    
    return { customers, products, warehouses };
  } catch (error) {
    console.error('❌ Error refreshing data:', error);
    throw error;
  }
};

// Function to get all data immediately (synchronous)
export const getAllDataSync = () => {
  return {
    customers: [...sharedCustomers],
    products: [...globalProducts],
    warehouses: [...globalWarehouses]
  };
};

// Load warehouses with their stock data for proper synchronization
export const loadWarehousesWithStock = async (token) => {
  try {
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (!token) {
      console.warn('No authentication token found');
      return { warehouses: [], products: [] };
    }

    // Load warehouses
    const warehouseResponse = await fetch(`${API_BASE_URL}/warehouse/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!warehouseResponse.ok) {
      throw new Error(`HTTP error! status: ${warehouseResponse.status}`);
    }

    const warehousesData = await warehouseResponse.json();
    
    // Load warehouse stock data
    const stockResponse = await fetch(`${API_BASE_URL}/warehouse/stock/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let warehouseStocks = [];
    if (stockResponse.ok) {
      const stockData = await stockResponse.json();
      warehouseStocks = stockData;
    }

    // Load all products
    const productsResponse = await fetch(`${API_BASE_URL}/inventory/products/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    let allProducts = [];
    if (productsResponse.ok) {
      allProducts = await productsResponse.json();
    }

    // Create warehouse-specific product data
    const warehousesWithStock = warehousesData.map(warehouse => {
      const warehouseStockItems = warehouseStocks.filter(stock => stock.warehouse === warehouse.id);
      
      // Create products with warehouse-specific quantities
      const warehouseProducts = warehouseStockItems.map(stockItem => {
        const baseProduct = allProducts.find(p => p.id === stockItem.product);
        if (!baseProduct) return null;
        
        return {
          ...baseProduct,
          warehouse_id: warehouse.id,
          warehouse_name: warehouse.name,
          quantity: stockItem.quantity, // Use warehouse-specific quantity
          reserved_quantity: stockItem.reserved_quantity || 0,
          available_quantity: Math.max(0, stockItem.quantity - (stockItem.reserved_quantity || 0)),
          min_stock: stockItem.min_stock_level || baseProduct.min_stock || 10,
          max_stock: stockItem.max_stock_level || baseProduct.max_stock,
          is_low_stock: stockItem.quantity <= (stockItem.min_stock_level || 10),
          is_out_of_stock: stockItem.quantity === 0,
          stock_location: stockItem.location,
          last_updated: stockItem.last_updated
        };
      }).filter(Boolean);

      return {
        ...warehouse,
        stock_items: warehouseStockItems,
        products: warehouseProducts,
        total_products: warehouseProducts.length,
        total_stock: warehouseProducts.reduce((sum, item) => sum + (item.quantity || 0), 0),
        low_stock_items: warehouseProducts.filter(item => item.is_low_stock).length,
        out_of_stock_items: warehouseProducts.filter(item => item.is_out_of_stock).length,
        stock_value: warehouseProducts.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || item.cost || 0)), 0)
      };
    });

    // Create unified product list with warehouse information
    const unifiedProducts = [];
    warehousesWithStock.forEach(warehouse => {
      warehouse.products.forEach(product => {
        unifiedProducts.push(product);
      });
    });

    return {
      warehouses: warehousesWithStock,
      products: unifiedProducts
    };

  } catch (error) {
    console.error('Error loading warehouses with stock:', error);
    return { warehouses: [], products: [] };
  }
};

// Update existing loadProductsWithFallback to use warehouse-specific data
export const loadProductsWithWarehouseStock = async (token) => {
  try {
    const { products } = await loadWarehousesWithStock(token);
    
    // Update global products state
    if (window.globalProducts) {
      window.globalProducts = products;
    }
    
    // Dispatch event for other modules to update
    window.dispatchEvent(new CustomEvent('productsUpdated', { 
      detail: { products, source: 'warehouse_stock' } 
    }));
    
    return products;
  } catch (error) {
    console.error('Error loading products with warehouse stock:', error);
    return loadProductsWithFallback(token); // Fallback to original method
  }
};

// Verify all exports are defined
console.log('✅ sharedData.js exports verified:', {
  loadWarehousesWithFallback: typeof loadWarehousesWithFallback,
  loadProductsWithFallback: typeof loadProductsWithFallback,
  loadCustomersWithFallback: typeof loadCustomersWithFallback,
  testWarehouseFunction: typeof testWarehouseFunction
});
