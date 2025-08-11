import api from '../api';

class BackendChecker {
  static async checkBackendStatus() {
    try {
      console.log('[BackendChecker] Testing backend connectivity...');
      
      // Test basic connectivity using a valid endpoint
      const response = await api.get('/users/', { timeout: 5000 });
      console.log('[BackendChecker] Backend is accessible');
      return {
        isConnected: true,
        status: 'connected',
        message: 'Backend server is running and accessible'
      };
    } catch (error) {
      console.error('[BackendChecker] Backend connectivity failed:', error);
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        return {
          isConnected: false,
          status: 'server_down',
          message: 'Backend server is not running. Please start the backend server on port 2025.',
          instructions: [
            '1. Open terminal in project directory',
            '2. Run: cd /Users/kwadwoantwi/CascadeProjects/erp-system',
            '3. Run: ./start_servers.sh',
            '4. Wait for "Django development server is running" message',
            '5. Refresh this page'
          ]
        };
      } else if (error.response?.status === 401) {
        return {
          isConnected: true,
          status: 'auth_failed',
          message: 'Authentication failed. Please log in again.',
          instructions: ['Please log out and log back in']
        };
      } else if (error.response?.status === 403) {
        return {
          isConnected: true,
          status: 'permission_denied',
          message: 'You do not have permission to access the backend.',
          instructions: ['Please contact your administrator for access']
        };
      } else if (error.response?.status === 404) {
        return {
          isConnected: true,
          status: 'endpoint_not_found',
          message: 'Backend is running but some endpoints may not be configured.',
          instructions: ['Backend server is accessible, trying alternative connectivity test']
        };
      } else {
        return {
          isConnected: false,
          status: 'unknown_error',
          message: 'Unknown backend error occurred.',
          instructions: [
            'Please try refreshing the page',
            'If the problem persists, contact support'
          ]
        };
      }
    }
  }

  static async checkModuleEndpoints() {
    const modules = [
      { name: 'Sales', endpoint: '/sales/customers/' },
      { name: 'Inventory', endpoint: '/inventory/products/' },
      { name: 'HR', endpoint: '/hr/employees/' },
      { name: 'Procurement', endpoint: '/procurement/requests/' },
      { name: 'Accounting', endpoint: '/accounting/invoices/' },
      { name: 'Manufacturing', endpoint: '/manufacturing/orders/' },
      { name: 'POS', endpoint: '/pos/transactions/' },
      { name: 'Warehouse', endpoint: '/warehouse/locations/' },
      { name: 'Reporting', endpoint: '/reporting/dashboard/revenue/' }
    ];

    const results = {};
    
    for (const module of modules) {
      try {
        await api.get(module.endpoint, { timeout: 3000 });
        results[module.name.toLowerCase()] = {
          status: 'available',
          message: `${module.name} module is working`
        };
      } catch (error) {
        results[module.name.toLowerCase()] = {
          status: 'unavailable',
          message: `${module.name} module is not available`,
          error: error.response?.status || 'Network Error'
        };
      }
    }

    return results;
  }

  static getFallbackData() {
    return {
      customers: [],
      products: [],
      employees: [],
      departments: [
        { id: 1, name: 'Sales', description: 'Sales Department' },
        { id: 2, name: 'Marketing', description: 'Marketing Department' },
        { id: 3, name: 'HR', description: 'Human Resources' },
        { id: 4, name: 'IT', description: 'Information Technology' },
        { id: 5, name: 'Finance', description: 'Finance Department' }
      ],
      orders: [],
      inventory: [],
      revenue: 0,
      stats: {
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
      }
    };
  }

  static createSystemStatusMessage(backendStatus, moduleStatus) {
    if (!backendStatus.isConnected) {
      return {
        type: 'error',
        title: 'Backend Server Not Running',
        message: backendStatus.message,
        instructions: backendStatus.instructions,
        showInstructions: true
      };
    }

    const unavailableModules = Object.entries(moduleStatus)
      .filter(([_, status]) => status.status === 'unavailable')
      .map(([name, _]) => name);

    if (unavailableModules.length === 0) {
      return {
        type: 'success',
        title: 'All Systems Operational',
        message: 'All modules are working correctly',
        showInstructions: false
      };
    } else if (unavailableModules.length < 3) {
      return {
        type: 'warning',
        title: 'Some Modules Unavailable',
        message: `${unavailableModules.join(', ')} modules are not responding`,
        instructions: ['Some features may be limited', 'Try refreshing the page'],
        showInstructions: true
      };
    } else {
      return {
        type: 'error',
        title: 'Multiple System Issues',
        message: 'Most modules are not responding',
        instructions: [
          'Backend server may need to be restarted',
          'Please contact your system administrator'
        ],
        showInstructions: true
      };
    }
  }
}

export default BackendChecker;
