// offline.js: Utility for offline storage and sync using localForage
import localforage from 'localforage';

localforage.config({
  name: 'erp-offline',
  storeName: 'erp_data',
});

export const OFFLINE_KEYS = {
  SURVEYS: 'surveys',
  ROUTES: 'routes',
  RESPONSES_QUEUE: 'responses_queue',
  ROUTE_COMPLETIONS_QUEUE: 'route_completions_queue',
  INVENTORY_TRANSFERS_QUEUE: 'inventory_transfers_queue',
  CUSTOMERS_QUEUE: 'customers_queue',
  SALES_ORDERS_QUEUE: 'sales_orders_queue',
  PRODUCTS: 'products',
  WAREHOUSES: 'warehouses',
};

export async function saveSurveys(surveys) {
  await localforage.setItem(OFFLINE_KEYS.SURVEYS, surveys);
}
export async function getSurveys() {
  return (await localforage.getItem(OFFLINE_KEYS.SURVEYS)) || [];
}

export async function saveRoutes(routes) {
  await localforage.setItem(OFFLINE_KEYS.ROUTES, routes);
}
export async function getRoutes() {
  return (await localforage.getItem(OFFLINE_KEYS.ROUTES)) || [];
}

export async function queueSurveyResponse(response) {
  const q = (await localforage.getItem(OFFLINE_KEYS.RESPONSES_QUEUE)) || [];
  q.push(response);
  await localforage.setItem(OFFLINE_KEYS.RESPONSES_QUEUE, q);
}
export async function getQueuedResponses() {
  return (await localforage.getItem(OFFLINE_KEYS.RESPONSES_QUEUE)) || [];
}
export async function clearQueuedResponses() {
  await localforage.setItem(OFFLINE_KEYS.RESPONSES_QUEUE, []);
}

export async function queueRouteCompletion(completion) {
  const q = (await localforage.getItem(OFFLINE_KEYS.ROUTE_COMPLETIONS_QUEUE)) || [];
  q.push(completion);
  await localforage.setItem(OFFLINE_KEYS.ROUTE_COMPLETIONS_QUEUE, q);
}
export async function getQueuedRouteCompletions() {
  return (await localforage.getItem(OFFLINE_KEYS.ROUTE_COMPLETIONS_QUEUE)) || [];
}
export async function clearQueuedRouteCompletions() {
  await localforage.setItem(OFFLINE_KEYS.ROUTE_COMPLETIONS_QUEUE, []);
}

// Inventory transfers queue
export async function queueInventoryTransfer(transfer) {
  const q = (await localforage.getItem(OFFLINE_KEYS.INVENTORY_TRANSFERS_QUEUE)) || [];
  q.push(transfer);
  await localforage.setItem(OFFLINE_KEYS.INVENTORY_TRANSFERS_QUEUE, q);
}
export async function getQueuedInventoryTransfers() {
  return (await localforage.getItem(OFFLINE_KEYS.INVENTORY_TRANSFERS_QUEUE)) || [];
}
export async function clearQueuedInventoryTransfers() {
  await localforage.setItem(OFFLINE_KEYS.INVENTORY_TRANSFERS_QUEUE, []);
}

// Customers queue
export async function queueCustomer(customer) {
  const q = (await localforage.getItem(OFFLINE_KEYS.CUSTOMERS_QUEUE)) || [];
  q.push(customer);
  await localforage.setItem(OFFLINE_KEYS.CUSTOMERS_QUEUE, q);
}
export async function getQueuedCustomers() {
  return (await localforage.getItem(OFFLINE_KEYS.CUSTOMERS_QUEUE)) || [];
}
export async function clearQueuedCustomers() {
  await localforage.setItem(OFFLINE_KEYS.CUSTOMERS_QUEUE, []);
}

// Sales orders queue
export async function queueSalesOrder(order) {
  const q = (await localforage.getItem(OFFLINE_KEYS.SALES_ORDERS_QUEUE)) || [];
  q.push(order);
  await localforage.setItem(OFFLINE_KEYS.SALES_ORDERS_QUEUE, q);
}
export async function getQueuedSalesOrders() {
  return (await localforage.getItem(OFFLINE_KEYS.SALES_ORDERS_QUEUE)) || [];
}
export async function clearQueuedSalesOrders() {
  await localforage.setItem(OFFLINE_KEYS.SALES_ORDERS_QUEUE, []);
}

// Products cache
export async function saveProducts(products) {
  await localforage.setItem(OFFLINE_KEYS.PRODUCTS, products);
}
export async function getProducts() {
  return (await localforage.getItem(OFFLINE_KEYS.PRODUCTS)) || [];
}

// Warehouses cache
export async function saveWarehouses(warehouses) {
  await localforage.setItem(OFFLINE_KEYS.WAREHOUSES, warehouses);
}
export async function getWarehouses() {
  return (await localforage.getItem(OFFLINE_KEYS.WAREHOUSES)) || [];
}

// Network status detection
export function isOnline() {
  return navigator.onLine;
}

// Auto-sync when network becomes available
export function setupAutoSync(syncCallback) {
  window.addEventListener('online', () => {
    console.log('Network connection restored, triggering auto-sync...');
    if (syncCallback && typeof syncCallback === 'function') {
      syncCallback();
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost, switching to offline mode...');
  });
}

// Get sync status summary
export async function getSyncStatus() {
  const [responses, completions, transfers, customers, orders] = await Promise.all([
    getQueuedResponses(),
    getQueuedRouteCompletions(),
    getQueuedInventoryTransfers(),
    getQueuedCustomers(),
    getQueuedSalesOrders()
  ]);
  
  return {
    totalPending: responses.length + completions.length + transfers.length + customers.length + orders.length,
    surveyResponses: responses.length,
    routeCompletions: completions.length,
    inventoryTransfers: transfers.length,
    customers: customers.length,
    salesOrders: orders.length,
    isOnline: isOnline()
  };
}
