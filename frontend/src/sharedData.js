// Shared data source for warehouses, products, and customers across all modules
// This ensures consistency between Inventory, Sales, and other modules

// Dynamic API base URL detection for mobile compatibility
const getApiBaseUrl = () => {
  // Check if running in mobile app (Capacitor)
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    // For mobile apps, use the computer's IP address
    return 'http://10.0.2.2:2025'; // Android emulator
  }
  // For web browsers, use localhost
  return 'http://localhost:2025';
};

const API_BASE_URL = getApiBaseUrl();

// Global transaction storage with localStorage persistence
export let sharedTransactions = JSON.parse(localStorage.getItem('sharedTransactions') || '[]');

// Global transaction history state for cross-module integration
let globalTransactionHistory = JSON.parse(localStorage.getItem('globalTransactionHistory') || '[]');

// Global payment history for workflow management
let globalPaymentHistory = JSON.parse(localStorage.getItem('globalPaymentHistory') || '[]');

// Global products state with immediate sample data
let globalProducts = JSON.parse(localStorage.getItem('globalProducts') || '[]');
if (globalProducts.length === 0) {
  globalProducts = [
    {
      id: 1,
      name: 'Smartphone',
      sku: 'SP001',
      unit_price: 299.99,
      stock_quantity: 50,
      warehouse_id: 1,
      reorder_level: 10,
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Laptop Computer', 
      sku: 'LP002',
      unit_price: 899.99,
      stock_quantity: 25,
      warehouse_id: 1,
      reorder_level: 5,
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'Coffee Beans',
      sku: 'CB003',
      unit_price: 12.99,
      stock_quantity: 100,
      warehouse_id: 2,
      reorder_level: 20,
      category: 'Food & Beverage'
    }
  ];
  localStorage.setItem('globalProducts', JSON.stringify(globalProducts));
}

// Global customers state with immediate sample data
export let sharedCustomers = JSON.parse(localStorage.getItem('sharedCustomers') || '[]');
if (sharedCustomers.length === 0) {
  sharedCustomers = [
    {
      id: 11,
      name: 'Eddy Clinic',
      email: 'edmundsekyere@gmail.com',
      phone: '0505154709',
      location: 'Dworwulu',
      customer_type: 'wholesaler',
      gps_coordinates: 'Available',
      address: 'Dworwulu, Accra',
      contact_person: 'Edmund Sekyere'
    },
    {
      id: 12,
      name: 'Emmanuel Hospital',
      email: 'edmondsekyere@gmail.com', 
      phone: '0245015626',
      location: 'Achimota',
      customer_type: 'distributor',
      gps_coordinates: 'Not Available',
      address: 'Achimota, Accra',
      contact_person: 'Emmanuel Brown'
    }
  ];
  localStorage.setItem('sharedCustomers', JSON.stringify(sharedCustomers));
}

// Global warehouses state with immediate sample data
let globalWarehouses = JSON.parse(localStorage.getItem('globalWarehouses') || '[]');
if (globalWarehouses.length === 0) {
  globalWarehouses = [
    {
      id: 1,
      name: 'Main Warehouse',
      location: 'Central Location',
      capacity: 1000
    },
    {
      id: 2,
      name: 'North Distribution Center',
      location: 'North Region',
      capacity: 500
    },
    {
      id: 3,
      name: 'South Storage Facility',
      location: 'South Region',
      capacity: 750
    },
    {
      id: 4,
      name: 'West Depot',
      location: 'West Region',
      capacity: 600
    }
  ];
  localStorage.setItem('globalWarehouses', JSON.stringify(globalWarehouses));
}

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
  try {
    const response = await fetch('http://localhost:2025/api/inventory/products/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const products = await response.data || await response.json();
    
    // Fetch prices for each product and merge the data
    const productsWithPrices = await Promise.all(
      products.map(async (product) => {
        try {
          // Fetch prices for this product
          const priceResponse = await fetch(`http://localhost:2025/api/inventory/product-prices/?product=${product.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          let price = 0;
          let prices = [];
          
          if (priceResponse.ok) {
            prices = await priceResponse.json();
            // Get USD price if available, otherwise first available price
            const usdPrice = prices.find(p => p.currency === 'USD');
            price = usdPrice ? parseFloat(usdPrice.price) : (prices.length > 0 ? parseFloat(prices[0].price) : 0);
          }
          
          // Fetch category name if needed
          let categoryName = product.category;
          if (typeof product.category === 'number') {
            try {
              const categoryResponse = await fetch(`http://localhost:2025/api/inventory/categories/${product.category}/`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              if (categoryResponse.ok) {
                const categoryData = await categoryResponse.json();
                categoryName = categoryData.name;
              }
            } catch (categoryError) {
              console.warn('Failed to fetch category name:', categoryError);
            }
          }
          
          return {
            ...product,
            price: price,
            prices: prices,
            category_name: categoryName,
            // Calculate profit margin if cost is available
            profit_margin: product.cost && price ? ((price - product.cost) / price * 100) : 0,
            // Determine stock status
            status: product.quantity === 0 ? 'out_of_stock' : 
                   product.quantity <= (product.min_stock || 0) ? 'low_stock' : 'active'
          };
        } catch (error) {
          console.warn(`Failed to fetch price for product ${product.id}:`, error);
          return {
            ...product,
            price: 0,
            prices: [],
            category_name: typeof product.category === 'string' ? product.category : 'Unknown',
            profit_margin: 0,
            status: product.quantity === 0 ? 'out_of_stock' : 
                   product.quantity <= (product.min_stock || 0) ? 'low_stock' : 'active'
          };
        }
      })
    );
    
    console.log('Products loaded with prices:', productsWithPrices);
    return productsWithPrices;
  } catch (error) {
    console.error('Failed to load products from API:', error);
    
    // Fallback to sample data
    return [
      {
        id: 1,
        name: 'Sample Product 1',
        sku: 'SAMPLE-001',
        description: 'Sample product for testing',
        category: 'Electronics',
        category_name: 'Electronics',
        price: 100.00,
        cost: 60.00,
        quantity: 50,
        min_stock: 10,
        max_stock: 100,
        status: 'active',
        profit_margin: 40.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prices: [{ currency: 'USD', price: 100.00 }]
      },
      {
        id: 2,
        name: 'Sample Product 2',
        sku: 'SAMPLE-002',
        description: 'Another sample product',
        category: 'Office Supplies',
        category_name: 'Office Supplies',
        price: 25.00,
        cost: 15.00,
        quantity: 5,
        min_stock: 10,
        max_stock: 50,
        status: 'low_stock',
        profit_margin: 40.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        prices: [{ currency: 'USD', price: 25.00 }]
      }
    ];
  }
};

export const getGlobalProducts = () => {
  return [...globalProducts];
};

export const updateGlobalProduct = (productId, updates) => {
  const index = globalProducts.findIndex(p => p.id === productId);
  if (index !== -1) {
    globalProducts[index] = { ...globalProducts[index], ...updates };
    saveProductsToStorage();
  }
};

// Customer management functions
export const loadCustomersWithFallback = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sales/customers/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const customers = await response.json();
      sharedCustomers.length = 0;
      sharedCustomers.push(...customers);
      saveCustomersToStorage();
      console.log(`Loaded ${customers.length} customers from backend`);
      return customers;
    } else {
      console.warn(`Customers API returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to load customers from backend:', error);
  }
  
  // Always ensure we have customers data
  console.log(`Using ${sharedCustomers.length} cached/sample customers`);
  return [...sharedCustomers];
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
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const warehouses = await response.json();
      globalWarehouses.length = 0;
      globalWarehouses.push(...warehouses);
      saveWarehousesToStorage();
      console.log(`Loaded ${warehouses.length} warehouses from backend`);
      return warehouses;
    } else {
      console.warn(`Warehouses API returned ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.warn('Failed to load warehouses from backend:', error);
  }
  
  // Always ensure we have warehouses data
  console.log(`Using ${globalWarehouses.length} cached/sample warehouses`);
  return [...globalWarehouses];
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
