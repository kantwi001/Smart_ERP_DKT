// integrateAnalytics.js - Utility to integrate advanced analytics into all module dashboards
export const getAnalyticsIntegration = (moduleId, moduleData = {}) => {
  const moduleConfigs = {
    manufacturing: {
      title: 'Manufacturing Analytics',
      projects: [{
        id: 1,
        name: 'Production Line Optimization',
        type: 'manufacturing',
        manager: 'Production Manager',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        progress: 75,
        budget: 150000,
        team: ['Production Engineer', 'Quality Control', 'Maintenance Team'],
        tasks: [
          {
            id: 101,
            name: 'Equipment Setup',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-20'),
            progress: 100,
            status: 'completed',
            assignee: 'Production Engineer',
            dependencies: []
          },
          {
            id: 102,
            name: 'Process Optimization',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-02-15'),
            progress: 90,
            status: 'in-progress',
            assignee: 'Quality Control',
            dependencies: [101]
          },
          {
            id: 103,
            name: 'Quality Testing',
            startDate: new Date('2024-02-10'),
            endDate: new Date('2024-03-10'),
            progress: 60,
            status: 'in-progress',
            assignee: 'Quality Control',
            dependencies: [102]
          },
          {
            id: 104,
            name: 'Full Production Run',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-31'),
            progress: 20,
            status: 'pending',
            assignee: 'Production Manager',
            dependencies: [103]
          }
        ]
      }]
    },
    procurement: {
      title: 'Procurement Analytics',
      projects: [{
        id: 1,
        name: 'Supplier Evaluation Process',
        type: 'procurement',
        manager: 'Procurement Manager',
        status: 'in-progress',
        priority: 'medium',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        progress: 55,
        budget: 80000,
        team: ['Procurement Officer', 'Quality Assessor', 'Contract Specialist'],
        tasks: [
          {
            id: 201,
            name: 'Market Research',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-02-05'),
            progress: 100,
            status: 'completed',
            assignee: 'Procurement Officer',
            dependencies: []
          },
          {
            id: 202,
            name: 'Supplier Identification',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-20'),
            progress: 85,
            status: 'in-progress',
            assignee: 'Procurement Officer',
            dependencies: [201]
          },
          {
            id: 203,
            name: 'Quality Assessment',
            startDate: new Date('2024-02-15'),
            endDate: new Date('2024-03-15'),
            progress: 40,
            status: 'in-progress',
            assignee: 'Quality Assessor',
            dependencies: [202]
          },
          {
            id: 204,
            name: 'Contract Negotiation',
            startDate: new Date('2024-03-10'),
            endDate: new Date('2024-04-15'),
            progress: 10,
            status: 'pending',
            assignee: 'Contract Specialist',
            dependencies: [203]
          }
        ]
      }]
    },
    hr: {
      title: 'HR Analytics',
      projects: [{
        id: 1,
        name: 'Employee Development Program',
        type: 'hr',
        manager: 'HR Manager',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        progress: 45,
        budget: 60000,
        team: ['Training Coordinator', 'HR Specialist', 'Department Heads'],
        tasks: [
          {
            id: 301,
            name: 'Skills Assessment',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-20'),
            progress: 100,
            status: 'completed',
            assignee: 'HR Specialist',
            dependencies: []
          },
          {
            id: 302,
            name: 'Training Program Design',
            startDate: new Date('2024-02-15'),
            endDate: new Date('2024-03-15'),
            progress: 80,
            status: 'in-progress',
            assignee: 'Training Coordinator',
            dependencies: [301]
          },
          {
            id: 303,
            name: 'Training Delivery',
            startDate: new Date('2024-03-10'),
            endDate: new Date('2024-05-31'),
            progress: 25,
            status: 'in-progress',
            assignee: 'Department Heads',
            dependencies: [302]
          },
          {
            id: 304,
            name: 'Performance Evaluation',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-06-30'),
            progress: 0,
            status: 'pending',
            assignee: 'HR Manager',
            dependencies: [303]
          }
        ]
      }]
    },
    accounting: {
      title: 'Accounting Analytics',
      projects: [{
        id: 1,
        name: 'Financial System Upgrade',
        type: 'accounting',
        manager: 'Finance Manager',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-05-31'),
        progress: 60,
        budget: 100000,
        team: ['Accountant', 'IT Specialist', 'Auditor'],
        tasks: [
          {
            id: 401,
            name: 'System Analysis',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            progress: 100,
            status: 'completed',
            assignee: 'IT Specialist',
            dependencies: []
          },
          {
            id: 402,
            name: 'Data Migration',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-03-15'),
            progress: 85,
            status: 'in-progress',
            assignee: 'Accountant',
            dependencies: [401]
          },
          {
            id: 403,
            name: 'System Testing',
            startDate: new Date('2024-03-10'),
            endDate: new Date('2024-04-30'),
            progress: 40,
            status: 'in-progress',
            assignee: 'Auditor',
            dependencies: [402]
          },
          {
            id: 404,
            name: 'Go-Live & Training',
            startDate: new Date('2024-05-01'),
            endDate: new Date('2024-05-31'),
            progress: 0,
            status: 'pending',
            assignee: 'Finance Manager',
            dependencies: [403]
          }
        ]
      }]
    },
    pos: {
      title: 'POS Analytics',
      projects: [{
        id: 1,
        name: 'POS System Enhancement',
        type: 'pos',
        manager: 'Store Manager',
        status: 'in-progress',
        priority: 'medium',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-30'),
        progress: 50,
        budget: 40000,
        team: ['POS Technician', 'Store Staff', 'IT Support'],
        tasks: [
          {
            id: 501,
            name: 'Hardware Upgrade',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-20'),
            progress: 100,
            status: 'completed',
            assignee: 'POS Technician',
            dependencies: []
          },
          {
            id: 502,
            name: 'Software Installation',
            startDate: new Date('2024-02-15'),
            endDate: new Date('2024-03-10'),
            progress: 70,
            status: 'in-progress',
            assignee: 'IT Support',
            dependencies: [501]
          },
          {
            id: 503,
            name: 'Staff Training',
            startDate: new Date('2024-03-05'),
            endDate: new Date('2024-04-15'),
            progress: 30,
            status: 'in-progress',
            assignee: 'Store Manager',
            dependencies: [502]
          },
          {
            id: 504,
            name: 'System Go-Live',
            startDate: new Date('2024-04-20'),
            endDate: new Date('2024-04-30'),
            progress: 0,
            status: 'pending',
            assignee: 'Store Manager',
            dependencies: [503]
          }
        ]
      }]
    },
    customers: {
      title: 'Customer Analytics',
      projects: [{
        id: 1,
        name: 'Customer Experience Enhancement',
        type: 'customers',
        manager: 'Customer Success Manager',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        progress: 65,
        budget: 70000,
        team: ['Customer Service Rep', 'Marketing Specialist', 'Data Analyst'],
        tasks: [
          {
            id: 601,
            name: 'Customer Survey',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-01-31'),
            progress: 100,
            status: 'completed',
            assignee: 'Marketing Specialist',
            dependencies: []
          },
          {
            id: 602,
            name: 'Data Analysis',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-02-28'),
            progress: 90,
            status: 'in-progress',
            assignee: 'Data Analyst',
            dependencies: [601]
          },
          {
            id: 603,
            name: 'Process Improvement',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-05-31'),
            progress: 45,
            status: 'in-progress',
            assignee: 'Customer Service Rep',
            dependencies: [602]
          },
          {
            id: 604,
            name: 'Implementation & Monitoring',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-06-30'),
            progress: 0,
            status: 'pending',
            assignee: 'Customer Success Manager',
            dependencies: [603]
          }
        ]
      }]
    },
    reporting: {
      title: 'Reporting Analytics',
      projects: [{
        id: 1,
        name: 'Business Intelligence Dashboard',
        type: 'reporting',
        manager: 'Analytics Manager',
        status: 'in-progress',
        priority: 'high',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
        progress: 70,
        budget: 90000,
        team: ['Data Engineer', 'Business Analyst', 'Dashboard Developer'],
        tasks: [
          {
            id: 701,
            name: 'Data Integration',
            startDate: new Date('2024-01-15'),
            endDate: new Date('2024-02-15'),
            progress: 100,
            status: 'completed',
            assignee: 'Data Engineer',
            dependencies: []
          },
          {
            id: 702,
            name: 'Dashboard Design',
            startDate: new Date('2024-02-10'),
            endDate: new Date('2024-03-20'),
            progress: 95,
            status: 'in-progress',
            assignee: 'Dashboard Developer',
            dependencies: [701]
          },
          {
            id: 703,
            name: 'Business Logic Implementation',
            startDate: new Date('2024-03-15'),
            endDate: new Date('2024-04-30'),
            progress: 60,
            status: 'in-progress',
            assignee: 'Business Analyst',
            dependencies: [702]
          },
          {
            id: 704,
            name: 'User Training & Rollout',
            startDate: new Date('2024-05-01'),
            endDate: new Date('2024-05-15'),
            progress: 0,
            status: 'pending',
            assignee: 'Analytics Manager',
            dependencies: [703]
          }
        ]
      }]
    }
  };

  return moduleConfigs[moduleId] || {
    title: `${moduleId.charAt(0).toUpperCase() + moduleId.slice(1)} Analytics`,
    projects: []
  };
};

export const generateAnalyticsTabContent = (moduleId, moduleData = {}) => {
  const config = getAnalyticsIntegration(moduleId, moduleData);
  
  return `
    <Grid container spacing={3}>
      {/* Transaction Integration */}
      <Grid item xs={12} md={6}>
        <TransactionIntegration 
          moduleId="${moduleId}" 
          title="${config.title} Transaction Flow"
        />
      </Grid>
      
      {/* Time-Based Analytics */}
      <Grid item xs={12} md={6}>
        <TimeBasedAnalytics 
          moduleId="${moduleId}" 
          title="${config.title} Trends Analysis"
        />
      </Grid>
      
      {/* Advanced Analytics with Charts */}
      <Grid item xs={12}>
        <AdvancedAnalytics 
          moduleId="${moduleId}" 
          title="${config.title} Performance Analytics"
          data={${JSON.stringify(moduleData)}}
        />
      </Grid>
      
      {/* Gantt Chart for Module Projects */}
      <Grid item xs={12}>
        <GanttChart 
          title="${config.title} Project Timeline"
          projects={${JSON.stringify(config.projects)}}
        />
      </Grid>
    </Grid>
  `;
};
