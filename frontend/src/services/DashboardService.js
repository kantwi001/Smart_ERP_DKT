import api from '../api';

class DashboardService {
  // Fetch data from all modules for dashboard summary
  static async getAllModulesSummary() {
    try {
      console.log('[DashboardService] Starting modules summary fetch...');
      
      // Test API connectivity first
      try {
        await api.get('/auth/user/');
        console.log('[DashboardService] API connectivity confirmed');
      } catch (connectError) {
        console.warn('[DashboardService] API connectivity failed, using fallback data:', connectError);
        return this.getFallbackModulesSummary();
      }

      const [
        inventoryData,
        salesData,
        hrData,
        procurementData,
        manufacturingData,
        posData,
        accountingData,
        customersData,
        warehouseData,
        trainingData,
        reportingData
      ] = await Promise.allSettled([
        this.getInventorySummary(),
        this.getSalesSummary(),
        this.getHRSummary(),
        this.getProcurementSummary(),
        this.getManufacturingSummary(),
        this.getPOSSummary(),
        this.getAccountingSummary(),
        this.getCustomersSummary(),
        this.getWarehouseSummary(),
        this.getTrainingSummary(),
        this.getReportingSummary()
      ]);

      console.log('[DashboardService] Module fetch results:', {
        inventory: inventoryData.status,
        sales: salesData.status,
        hr: hrData.status,
        procurement: procurementData.status,
        manufacturing: manufacturingData.status,
        pos: posData.status,
        accounting: accountingData.status,
        customers: customersData.status,
        warehouse: warehouseData.status,
        training: trainingData.status,
        reporting: reportingData.status
      });

      const result = {
        inventory: inventoryData.status === 'fulfilled' ? inventoryData.value : this.getFallbackInventory(),
        sales: salesData.status === 'fulfilled' ? salesData.value : this.getFallbackSales(),
        hr: hrData.status === 'fulfilled' ? hrData.value : this.getFallbackHR(),
        procurement: procurementData.status === 'fulfilled' ? procurementData.value : this.getFallbackProcurement(),
        manufacturing: manufacturingData.status === 'fulfilled' ? manufacturingData.value : this.getFallbackManufacturing(),
        pos: posData.status === 'fulfilled' ? posData.value : this.getFallbackPOS(),
        accounting: accountingData.status === 'fulfilled' ? accountingData.value : this.getFallbackAccounting(),
        customers: customersData.status === 'fulfilled' ? customersData.value : this.getFallbackCustomers(),
        warehouse: warehouseData.status === 'fulfilled' ? warehouseData.value : this.getFallbackWarehouse(),
        training: trainingData.status === 'fulfilled' ? trainingData.value : this.getFallbackTraining(),
        reporting: reportingData.status === 'fulfilled' ? reportingData.value : this.getFallbackReporting()
      };

      console.log('[DashboardService] Modules summary completed successfully');
      return result;
    } catch (error) {
      console.error('[DashboardService] Error fetching modules summary:', error);
      return this.getFallbackModulesSummary();
    }
  }

  // Fallback data methods
  static getFallbackModulesSummary() {
    return {
      inventory: this.getFallbackInventory(),
      sales: this.getFallbackSales(),
      hr: this.getFallbackHR(),
      procurement: this.getFallbackProcurement(),
      manufacturing: this.getFallbackManufacturing(),
      pos: this.getFallbackPOS(),
      accounting: this.getFallbackAccounting(),
      customers: this.getFallbackCustomers(),
      warehouse: this.getFallbackWarehouse(),
      training: this.getFallbackTraining(),
      reporting: this.getFallbackReporting()
    };
  }

  static getFallbackInventory() {
    return {
      totalProducts: 0,
      lowStockProducts: 0,
      pendingTransfers: 0,
      recentMovements: [],
      totalValue: 0,
      status: 'No data available'
    };
  }

  static getFallbackSales() {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      monthlyRevenue: 0,
      recentOrders: [],
      status: 'No data available'
    };
  }

  static getFallbackHR() {
    return {
      totalEmployees: 0,
      pendingLeave: 0,
      upcomingTraining: 0,
      recentActivity: [],
      status: 'No data available'
    };
  }

  static getFallbackProcurement() {
    return {
      totalRequests: 0,
      pendingRequests: 0,
      totalValue: 0,
      recentRequests: [],
      status: 'No data available'
    };
  }

  static getFallbackManufacturing() {
    return {
      totalOrders: 0,
      inProgress: 0,
      completed: 0,
      recentOrders: [],
      status: 'No data available'
    };
  }

  static getFallbackPOS() {
    return {
      totalTransactions: 0,
      dailyRevenue: 0,
      recentTransactions: [],
      status: 'No data available'
    };
  }

  static getFallbackAccounting() {
    return {
      totalInvoices: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      recentTransactions: [],
      status: 'No data available'
    };
  }

  static getFallbackCustomers() {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      recentCustomers: [],
      status: 'No data available'
    };
  }

  static getFallbackWarehouse() {
    return {
      totalLocations: 0,
      totalItems: 0,
      recentMovements: [],
      status: 'No data available'
    };
  }

  static getFallbackTraining() {
    return {
      totalSessions: 0,
      upcomingSessions: 0,
      recentSessions: [],
      status: 'No data available'
    };
  }

  static getFallbackReporting() {
    return {
      totalReports: 0,
      scheduledReports: 0,
      recentReports: [],
      status: 'No data available'
    };
  }

  // Inventory Module Summary
  static async getInventorySummary() {
    try {
      const [productsRes, transfersRes, stockRes] = await Promise.allSettled([
        api.get('/inventory/products/'),
        api.get('/inventory/transfers/'),
        api.get('/inventory/stock-movements/')
      ]);

      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];
      const transfers = transfersRes.status === 'fulfilled' ? transfersRes.value.data : [];
      const stockMovements = stockRes.status === 'fulfilled' ? stockRes.value.data : [];

      return {
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock_quantity < 10).length,
        pendingTransfers: transfers.filter(t => t.status === 'pending').length,
        recentMovements: stockMovements.slice(0, 5),
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0)
      };
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      return null;
    }
  }

  // Sales Module Summary
  static async getSalesSummary() {
    try {
      const [ordersRes, customersRes, revenueRes] = await Promise.allSettled([
        api.get('/sales/orders/'),
        api.get('/sales/customers/'),
        api.get('/reporting/dashboard/revenue/')
      ]);

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const customers = customersRes.status === 'fulfilled' ? customersRes.value.data : [];
      const revenue = revenueRes.status === 'fulfilled' ? revenueRes.value.data : {};

      return {
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalCustomers: customers.length,
        monthlyRevenue: revenue.revenue || 0,
        recentOrders: orders.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      return null;
    }
  }

  // HR Module Summary
  static async getHRSummary() {
    try {
      const [employeesRes, leaveRes, trainingRes, attendanceRes] = await Promise.allSettled([
        api.get('/hr/employees/'),
        api.get('/hr/leave-requests/'),
        api.get('/hr/training-sessions/'),
        api.get('/hr/attendance/')
      ]);

      const employees = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];
      const leaveRequests = leaveRes.status === 'fulfilled' ? leaveRes.value.data : [];
      const trainingSessions = trainingRes.status === 'fulfilled' ? trainingRes.value.data : [];
      const attendance = attendanceRes.status === 'fulfilled' ? attendanceRes.value.data : [];

      return {
        totalEmployees: employees.length,
        pendingLeaveRequests: leaveRequests.filter(l => l.status === 'pending').length,
        upcomingTraining: trainingSessions.filter(t => new Date(t.date) > new Date()).length,
        todayAttendance: attendance.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length
      };
    } catch (error) {
      console.error('Error fetching HR summary:', error);
      return null;
    }
  }

  // Procurement Module Summary
  static async getProcurementSummary() {
    try {
      const [requestsRes, ordersRes, suppliersRes] = await Promise.allSettled([
        api.get('/procurement/requests/'),
        api.get('/procurement/orders/'),
        api.get('/procurement/suppliers/')
      ]);

      const requests = requestsRes.status === 'fulfilled' ? requestsRes.value.data : [];
      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const suppliers = suppliersRes.status === 'fulfilled' ? suppliersRes.value.data : [];

      return {
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'pending').length,
        totalOrders: orders.length,
        activeSuppliers: suppliers.length
      };
    } catch (error) {
      console.error('Error fetching procurement summary:', error);
      return null;
    }
  }

  // Manufacturing Module Summary
  static async getManufacturingSummary() {
    try {
      const [ordersRes, bomRes, workstationsRes] = await Promise.allSettled([
        api.get('/manufacturing/orders/'),
        api.get('/manufacturing/bom/'),
        api.get('/manufacturing/workstations/')
      ]);

      const orders = ordersRes.status === 'fulfilled' ? ordersRes.value.data : [];
      const boms = bomRes.status === 'fulfilled' ? bomRes.value.data : [];
      const workstations = workstationsRes.status === 'fulfilled' ? workstationsRes.value.data : [];

      return {
        totalOrders: orders.length,
        inProgressOrders: orders.filter(o => o.status === 'in_progress').length,
        totalBOMs: boms.length,
        activeWorkstations: workstations.length
      };
    } catch (error) {
      console.error('Error fetching manufacturing summary:', error);
      return null;
    }
  }

  // POS Module Summary
  static async getPOSSummary() {
    try {
      const [transactionsRes, productsRes] = await Promise.allSettled([
        api.get('/pos/transactions/'),
        api.get('/pos/products/')
      ]);

      const transactions = transactionsRes.status === 'fulfilled' ? transactionsRes.value.data : [];
      const products = productsRes.status === 'fulfilled' ? productsRes.value.data : [];

      const todayTransactions = transactions.filter(t => 
        new Date(t.created_at).toDateString() === new Date().toDateString()
      );

      return {
        totalTransactions: transactions.length,
        todayTransactions: todayTransactions.length,
        todayRevenue: todayTransactions.reduce((sum, t) => sum + parseFloat(t.total_amount || 0), 0),
        availableProducts: products.length
      };
    } catch (error) {
      console.error('Error fetching POS summary:', error);
      return null;
    }
  }

  // Accounting Module Summary
  static async getAccountingSummary() {
    try {
      const [accountsRes, transactionsRes, invoicesRes] = await Promise.allSettled([
        api.get('/accounting/accounts/'),
        api.get('/accounting/transactions/'),
        api.get('/accounting/invoices/')
      ]);

      const accounts = accountsRes.status === 'fulfilled' ? accountsRes.value.data : [];
      const transactions = transactionsRes.status === 'fulfilled' ? transactionsRes.value.data : [];
      const invoices = invoicesRes.status === 'fulfilled' ? invoicesRes.value.data : [];

      return {
        totalAccounts: accounts.length,
        totalTransactions: transactions.length,
        pendingInvoices: invoices.filter(i => i.status === 'pending').length,
        totalBalance: accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching accounting summary:', error);
      return null;
    }
  }

  // Customers Module Summary
  static async getCustomersSummary() {
    try {
      const customersRes = await api.get('/sales/customers/');
      const customers = customersRes.data || [];

      return {
        totalCustomers: customers.length,
        newCustomers: customers.filter(c => {
          const createdDate = new Date(c.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate > thirtyDaysAgo;
        }).length,
        activeCustomers: customers.filter(c => c.is_active).length,
        customerTypes: customers.reduce((acc, c) => {
          acc[c.customer_type] = (acc[c.customer_type] || 0) + 1;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error fetching customers summary:', error);
      return null;
    }
  }

  // Warehouse Module Summary
  static async getWarehouseSummary() {
    try {
      const [warehousesRes, transfersRes] = await Promise.allSettled([
        api.get('/warehouse/'),
        api.get('/warehouse/transfers/')
      ]);

      const warehouses = warehousesRes.status === 'fulfilled' ? warehousesRes.value.data : [];
      const transfers = transfersRes.status === 'fulfilled' ? transfersRes.value.data : [];

      return {
        totalWarehouses: warehouses.length,
        pendingTransfers: transfers.filter(t => t.status === 'pending').length,
        completedTransfers: transfers.filter(t => t.status === 'completed').length,
        totalCapacity: warehouses.reduce((sum, w) => sum + (w.capacity || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching warehouse summary:', error);
      return null;
    }
  }

  // Training Module Summary
  static async getTrainingSummary() {
    try {
      const [materialsRes, videosRes, sessionsRes, progressRes] = await Promise.allSettled([
        api.get('/hr/training-materials/'),
        api.get('/hr/training-videos/'),
        api.get('/hr/training-sessions/'),
        api.get('/hr/training-progress/')
      ]);

      const materials = materialsRes.status === 'fulfilled' ? materialsRes.value.data : [];
      const videos = videosRes.status === 'fulfilled' ? videosRes.value.data : [];
      const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data : [];
      const progress = progressRes.status === 'fulfilled' ? progressRes.value.data : [];

      return {
        totalMaterials: materials.length,
        totalVideos: videos.length,
        upcomingSessions: sessions.filter(s => new Date(s.date) > new Date()).length,
        completedTraining: progress.filter(p => p.status === 'completed').length
      };
    } catch (error) {
      console.error('Error fetching training summary:', error);
      return null;
    }
  }

  // Reporting Module Summary
  static async getReportingSummary() {
    try {
      const [revenueRes, transactionsRes] = await Promise.allSettled([
        api.get('/reporting/dashboard/revenue/'),
        api.get('/reporting/dashboard/transactions-per-staff/')
      ]);

      const revenue = revenueRes.status === 'fulfilled' ? revenueRes.value.data : {};
      const transactions = transactionsRes.status === 'fulfilled' ? transactionsRes.value.data : {};

      return {
        totalRevenue: revenue.revenue || 0,
        monthlyGrowth: revenue.growth || 0,
        totalTransactions: transactions.total_transactions || 0,
        averageTransactionValue: transactions.average_value || 0
      };
    } catch (error) {
      console.error('Error fetching reporting summary:', error);
      return null;
    }
  }

  // Get module icons and colors
  static getModuleConfig() {
    return {
      inventory: {
        name: 'Inventory',
        icon: 'Inventory',
        color: '#2196F3',
        bgColor: '#E3F2FD'
      },
      sales: {
        name: 'Sales',
        icon: 'TrendingUp',
        color: '#4CAF50',
        bgColor: '#E8F5E8'
      },
      hr: {
        name: 'Human Resources',
        icon: 'People',
        color: '#FF9800',
        bgColor: '#FFF3E0'
      },
      procurement: {
        name: 'Procurement',
        icon: 'ShoppingCart',
        color: '#9C27B0',
        bgColor: '#F3E5F5'
      },
      manufacturing: {
        name: 'Manufacturing',
        icon: 'Precision',
        color: '#607D8B',
        bgColor: '#ECEFF1'
      },
      pos: {
        name: 'Point of Sale',
        icon: 'Store',
        color: '#E91E63',
        bgColor: '#FCE4EC'
      },
      accounting: {
        name: 'Accounting',
        icon: 'AccountBalance',
        color: '#795548',
        bgColor: '#EFEBE9'
      },
      customers: {
        name: 'Customers',
        icon: 'Group',
        color: '#00BCD4',
        bgColor: '#E0F2F1'
      },
      warehouse: {
        name: 'Warehouse',
        icon: 'Warehouse',
        color: '#FF5722',
        bgColor: '#FBE9E7'
      },
      training: {
        name: 'Training',
        icon: 'School',
        color: '#3F51B5',
        bgColor: '#E8EAF6'
      },
      reporting: {
        name: 'Reporting',
        icon: 'Assessment',
        color: '#009688',
        bgColor: '#E0F2F1'
      }
    };
  }
}

export default DashboardService;
