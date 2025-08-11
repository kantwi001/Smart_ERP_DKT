import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
  Snackbar
} from '@mui/material';
import ProfileEditDialog from './components/ProfileEditDialog';
import { getProfilePictureUrl, getUserInitials } from './utils/imageUtils';
import { styled } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  CalendarToday as LeaveIcon,
  Assignment as TaskIcon,
  Person as ProfileIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Notifications as NotificationIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarTodayIcon,
  Cake as CakeIcon,
  ContactPhone as ContactPhoneIcon,
  Edit as EditIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  Timeline as TimelineIcon,
  Work as WorkIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { AuthContext } from './AuthContext';
import api from './api';
import WorkflowService from './services/WorkflowService';
import ProcurementRequestDialog from './components/ProcurementRequestDialog';

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(45deg, #2196F3 30%, #1976D2 90%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  minHeight: 64,
  color: '#666',
  '&.Mui-selected': {
    color: '#2196F3',
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: 'white',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Employee data
  const [employeeData, setEmployeeData] = useState({
    profile: {},
    leaveBalance: {},
    pendingRequests: [],
    recentActivity: [],
    notifications: []
  });

  // Dialog states
  const [leaveRequestDialog, setLeaveRequestDialog] = useState(false);
  const [procurementRequestDialog, setProcurementRequestDialog] = useState(false);
  const [viewRequestsDialog, setViewRequestsDialog] = useState(false);
  const [profileEditDialog, setProfileEditDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);

  // Dashboard card detail dialogs
  const [payslipDialog, setPayslipDialog] = useState(false);
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [awardDialog, setAwardDialog] = useState(false);
  const [holidayDialog, setHolidayDialog] = useState(false);

  // State for form data
  const [leaveFormData, setLeaveFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    calculated_days: 0
  });

  const [procurementFormData, setProcurementFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimated_cost: '',
    justification: '',
    priority: 'medium',
    quantity: '1'
  });

  // Profile edit form data
  const [profileFormData, setProfileFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    hire_date: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    address: '',
    bio: ''
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Dashboard card data states
  const [dashboardCardData, setDashboardCardData] = useState({
    payslips: [],
    announcements: [],
    awards: [],
    holidays: []
  });
  const [cardDataLoading, setCardDataLoading] = useState(false);

  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [requestsTabValue, setRequestsTabValue] = useState(0);

  // Define loadEmployeeData function BEFORE useEffect to avoid initialization error
  const loadEmployeeData = async () => {
    if (!user?.id) return;
    
    console.log('🔍 loadEmployeeData called for user:', user.id, user.username);
    setLoadingProfile(true);
    setLoading(true);
    
    try {
      console.log('📝 Fetching employee data for user:', user.id);
      
      // Use Promise.allSettled for better error handling
      const [employeesRes, profileRes, leaveBalanceRes, leaveRequestsRes, procurementRequestsRes] = await Promise.allSettled([
        api.get('/hr/employees/'),
        api.get('/users/me/'),
        api.get('/hr/leave-balance/'),
        api.get('/hr/leave-requests/'),
        api.get('/procurement/requests/')
      ]);

      // Process employee record
      let employeeRecord = null;
      if (employeesRes.status === 'fulfilled') {
        const employees = employeesRes.value.data.results || employeesRes.value.data || [];
        employeeRecord = employees.find(emp => emp.user === user.id);
        
        if (employeeRecord) {
          console.log('✅ Found existing employee record:', employeeRecord);
          
          // CRITICAL FIX: Check if Employee record needs department update
          if ((!employeeRecord.department || employeeRecord.department === null) && user.department) {
            console.log('🔧 Employee record missing department, updating with user department:', user.department, user.department_name);
            
            try {
              const updatePayload = { department: user.department };
              console.log('📤 Updating employee department with payload:', updatePayload);
              
              const updateResponse = await api.patch(`/hr/employees/${employeeRecord.id}/`, updatePayload);
              console.log('✅ Employee department updated successfully:', updateResponse.data);
              
              // Update local employee record
              employeeRecord = { ...employeeRecord, department: user.department };
            } catch (updateError) {
              console.error('❌ Failed to update employee department:', updateError);
            }
          }
        } else {
          console.log('⚠️ No employee record found for user:', user.id);
        }
      }

      // Process profile data
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        console.log('✅ Profile data loaded:', profileData);
        
        setEmployeeData(prev => ({
          ...prev,
          profile: profileData,
          employee: employeeRecord,
          department: profileData.department_name || employeeRecord?.department?.name || 'Not Assigned',
          position: profileData.position || employeeRecord?.position || 'Employee'
        }));
      }

      // Process leave balance
      if (leaveBalanceRes.status === 'fulfilled') {
        const leaveBalanceData = leaveBalanceRes.value.data;
        console.log('✅ Leave balance loaded:', leaveBalanceData);
        
        setEmployeeData(prev => ({
          ...prev,
          leaveBalance: leaveBalanceData
        }));
      }

      // Process leave requests with privacy filtering
      if (leaveRequestsRes.status === 'fulfilled') {
        const allRequests = leaveRequestsRes.value.data.results || leaveRequestsRes.value.data || [];
        const userRequests = allRequests.filter(request => {
          return request.employee === user.id || 
                 (request.employee && typeof request.employee === 'object' && request.employee.user === user.id) ||
                 (request.requested_by === user.id);
        });
        
        console.log('🔒 PRIVACY FIX: Filtered leave requests for user', user.id, ':', userRequests.length, 'out of', allRequests.length);
        
        setEmployeeData(prev => ({
          ...prev,
          leaveRequests: userRequests
        }));
      }

      // Process procurement requests with privacy filtering
      if (procurementRequestsRes.status === 'fulfilled') {
        const allProcurementRequests = procurementRequestsRes.value.data.results || procurementRequestsRes.value.data || [];
        const userProcurementRequests = allProcurementRequests.filter(request => {
          return request.requested_by === user.id || request.requester === user.id;
        });
        
        console.log('🔒 PRIVACY FIX: Filtered procurement requests for user', user.id, ':', userProcurementRequests.length, 'out of', allProcurementRequests.length);
        
        setEmployeeData(prev => ({
          ...prev,
          procurementRequests: userProcurementRequests
        }));
      }

    } catch (error) {
      console.error('❌ Error loading employee data:', error);
      setEmployeeData(prev => ({
        ...prev,
        error: 'Failed to load employee data'
      }));
    } finally {
      setLoadingProfile(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEmployeeData(); // This function already loads all data including leave and procurement requests
      
      // IMMEDIATE DEBUG: Log department info as soon as component loads
      console.log('🔍 IMMEDIATE DEBUG - Component loaded with user:', user);
      console.log('🔍 IMMEDIATE DEBUG - User department fields:', {
        department: user.department,
        department_name: user.department_name
      });
      
      // Also check localStorage immediately
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('🔍 IMMEDIATE DEBUG - localStorage user:', localUser);
      console.log('🔍 IMMEDIATE DEBUG - localStorage department fields:', {
        department: localUser.department,
        department_name: localUser.department_name
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 1 && user) { // Leave Requests tab
      // loadLeaveRequests(); // No need to call this function here
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 3 && user) { // Procurement Requests tab
      // loadProcurementRequests(); // No need to call this function here
    }
  }, [activeTab]);

  useEffect(() => {
    const handleUserProfileUpdate = (event) => {
      console.log('🔄 EmployeeDashboard: User profile updated event received', event.detail);
      const updatedUser = event.detail;
      
      // Refresh employee data to reflect the updated profile
      if (updatedUser && user && updatedUser.id === user.id) {
        console.log('🔄 EmployeeDashboard: Refreshing employee data after profile update');
        setEmployeeData(prev => ({
          ...prev,
          profile: updatedUser
        }));
        
        // Also reload all employee data to ensure everything is in sync
        loadEmployeeData();
      }
    };

    // Add event listener for user profile updates
    window.addEventListener('userProfileUpdated', handleUserProfileUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('userProfileUpdated', handleUserProfileUpdate);
    };
  }, [user]);

  useEffect(() => {
    const loadDashboardCardData = async () => {
      setCardDataLoading(true);
      try {
        const [payslipsRes, announcementsRes, awardsRes, holidaysRes] = await Promise.allSettled([
          api.get('/hr/payslips/'),
          api.get('/hr/enhanced-announcements/'),
          api.get('/hr/awards/'),
          api.get('/hr/holidays/')
        ]);

        const payslips = payslipsRes.status === 'fulfilled' ? payslipsRes.value.data : [];
        const announcements = announcementsRes.status === 'fulfilled' ? announcementsRes.value.data : [];
        const awards = awardsRes.status === 'fulfilled' ? awardsRes.value.data : [];
        const holidays = holidaysRes.status === 'fulfilled' ? holidaysRes.value.data : [];

        setDashboardCardData({
          payslips,
          announcements,
          awards,
          holidays
        });
      } catch (error) {
        console.error('Error loading dashboard card data:', error);
        // Provide fallback mock data
        setDashboardCardData({
          payslips: [
            { month: 'January', year: 2022, amount: 5000, status: 'paid' },
            { month: 'February', year: 2022, amount: 5500, status: 'paid' },
            { month: 'March', year: 2022, amount: 6000, status: 'pending' }
          ],
          announcements: [
            { title: 'Company Holiday', date: '2022-12-25', category: 'Holiday' },
            { title: 'Team Meeting', date: '2022-12-15', category: 'Meeting' }
          ],
          awards: [
            { title: 'Best Employee', date: '2022-12-31', category: 'Award' }
          ],
          holidays: [
            { name: 'Christmas Day', date: '2022-12-25', type: 'Holiday' },
            { name: 'New Year\'s Day', date: '2023-01-01', type: 'Holiday' }
          ]
        });
      } finally {
        setCardDataLoading(false);
      }
    };

    loadDashboardCardData();
  }, []);

  // Function to calculate working days between two dates (excluding weekends)
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // Exclude weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };

  // Function to handle date changes and auto-calculate days
  const handleLeaveFormChange = (field, value) => {
    const updatedFormData = { ...leaveFormData, [field]: value };
    
    // Auto-calculate days when both dates are selected
    if (field === 'start_date' || field === 'end_date') {
      const calculatedDays = calculateWorkingDays(
        field === 'start_date' ? value : leaveFormData.start_date,
        field === 'end_date' ? value : leaveFormData.end_date
      );
      updatedFormData.calculated_days = calculatedDays;
    }
    
    setLeaveFormData(updatedFormData);
  };

  if (loadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  // Handle leave request submission
  const handleLeaveRequestSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});

    // Validate form
    const errors = {};
    if (!leaveFormData.leave_type) errors.leave_type = 'Leave type is required';
    if (!leaveFormData.start_date) errors.start_date = 'Start date is required';
    if (!leaveFormData.end_date) errors.end_date = 'End date is required';
    if (!leaveFormData.reason) errors.reason = 'Reason is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      console.log('🚀 Submitting leave request with data:', leaveFormData);
      const response = await api.post('/hr/leave-requests/', leaveFormData);
      console.log('✅ Leave request submitted successfully:', response.data);
      
      setSnackbar({ open: true, message: 'Leave request submitted successfully!', severity: 'success' });
      setLeaveRequestDialog(false);
      setLeaveFormData({ leave_type: '', start_date: '', end_date: '', reason: '', calculated_days: 0 });
      loadEmployeeData(); // Refresh data
    } catch (error) {
      console.error('❌ Error submitting leave request:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      let errorMessage = 'Failed to submit leave request';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        // Handle validation errors
        const backendErrors = error.response.data;
        const errorMessages = [];
        for (const [field, messages] of Object.entries(backendErrors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${messages}`);
          }
        }
        if (errorMessages.length > 0) {
          errorMessage = `Validation errors: ${errorMessages.join('; ')}`;
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to submit leave requests.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid leave request data. Please check all fields.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle procurement request submission
  const handleProcurementRequestSubmit = async () => {
    setSubmitting(true);
    setFormErrors({});

    // Validate form
    const errors = {};
    if (!procurementFormData.title) errors.title = 'Title is required';
    if (!procurementFormData.description) errors.description = 'Description is required';
    if (!procurementFormData.category) errors.category = 'Category is required';
    if (!procurementFormData.estimated_cost) errors.estimated_cost = 'Estimated cost is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      console.log('🚀 Submitting procurement request with data:', procurementFormData);
      
      // Transform form data to match backend model
      const requestData = {
        title: procurementFormData.title,
        description: procurementFormData.description,
        item: procurementFormData.title, // Use title as item name
        quantity: parseInt(procurementFormData.quantity) || 1, // Default quantity
        estimated_cost: parseFloat(procurementFormData.estimated_cost),
        urgency: procurementFormData.priority || 'medium',
        reason: procurementFormData.justification || procurementFormData.description,
        status: 'pending',
        current_stage: 'requester'
      };

      console.log('📤 Transformed request data:', requestData);

      const response = await api.post('/procurement/requests/', requestData);
      console.log('✅ Procurement request submitted successfully:', response.data);
      
      setSnackbar({ open: true, message: 'Procurement request submitted successfully and sent for approval!', severity: 'success' });
      setProcurementRequestDialog(false);
      setProcurementFormData({ 
        title: '', 
        description: '', 
        category: '', 
        estimated_cost: '', 
        justification: '', 
        priority: 'medium',
        quantity: '1'
      });
      
      // Refresh data to show the new request
      await loadEmployeeData();
      
    } catch (error) {
      console.error('❌ Error submitting procurement request:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let errorMessage = 'Failed to submit procurement request';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to submit procurement requests.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request data. Please check all fields.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Validate profile form
  const validateForm = () => {
    setFormErrors({});
    
    const errors = {};
    if (!profileFormData.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!profileFormData.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!profileFormData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }
    
    return true;
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      console.log('🔄 Starting profile update...');
      
      // Create FormData for file upload support
      const formData = new FormData();
      
      // Add all profile fields to FormData
      Object.keys(profileFormData).forEach(key => {
        if (profileFormData[key] !== null && profileFormData[key] !== '') {
          formData.append(key, profileFormData[key]);
        }
      });
      
      // Add profile picture if selected
      if (profilePictureFile) {
        console.log('📤 Adding profile picture to form data:', profilePictureFile.name);
        formData.append('profile_picture', profilePictureFile);
      }
      
      // Log FormData contents for debugging
      console.log('🔄 FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // Update user profile (including profile picture)
      const response = await api.patch('/users/me/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Profile updated successfully:', response.data);
      
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      setProfileEditDialog(false);
      
      // Reset profile picture states
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      await loadEmployeeData(); // Refresh data
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this profile.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid profile data. Please check all fields.';
      } else if (error.response?.status === 405) {
        errorMessage = 'Method not allowed. Please try again.';
      }
      
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      console.log('🔍 Loading leave requests for user:', user.id);
      const response = await api.get('/hr/leave-requests/');
      console.log('✅ Leave requests loaded:', response.data);
      
      // CRITICAL FIX: Filter requests to only show current user's requests
      const allRequests = response.data.results || response.data || [];
      const userRequests = allRequests.filter(request => {
        // Check if request belongs to current user
        return request.employee === user.id || 
               (request.employee && typeof request.employee === 'object' && request.employee.user === user.id) ||
               (request.requested_by === user.id);
      });
      
      console.log('🔒 PRIVACY FIX: Filtered requests for user', user.id, ':', userRequests.length, 'out of', allRequests.length);
      
      // Update employee data with filtered leave requests
      setEmployeeData(prev => ({
        ...prev,
        leaveRequests: userRequests
      }));
    } catch (error) {
      console.error('❌ Error loading leave requests:', error);
      setEmployeeData(prev => ({
        ...prev,
        leaveRequests: []
      }));
    }
  };

  const loadProcurementRequests = async () => {
    try {
      console.log('🔍 Loading procurement requests for user:', user.id);
      const response = await api.get('/procurement/requests/');
      console.log('✅ Procurement requests loaded:', response.data);
      
      // CRITICAL FIX: Filter requests to only show current user's requests
      const allRequests = response.data.results || response.data || [];
      const userRequests = allRequests.filter(request => {
        // Check if request belongs to current user
        return request.requested_by === user.id || 
               request.requester === user.id ||
               (request.employee === user.id);
      });
      
      console.log('🔒 PRIVACY FIX: Filtered procurement requests for user', user.id, ':', userRequests.length, 'out of', allRequests.length);
      
      // Update employee data with filtered procurement requests
      setEmployeeData(prev => ({
        ...prev,
        procurementRequests: userRequests
      }));
    } catch (error) {
      console.error('❌ Error loading procurement requests:', error);
      setEmployeeData(prev => ({
        ...prev,
        procurementRequests: []
      }));
    }
  };

  // DIALOG HANDLERS - Ensure all dialogs work properly
  const handleViewRequestsDialog = () => {
    console.log('🔍 Opening View Requests dialog');
    setViewRequestsDialog(true);
  };

  const handlePayslipDialog = () => {
    console.log('🔍 Opening Payslip dialog');
    setPayslipDialog(true);
  };

  const handleAnnouncementDialog = () => {
    console.log('🔍 Opening Announcement dialog');
    setAnnouncementDialog(true);
  };

  const handleAwardDialog = () => {
    console.log('🔍 Opening Award dialog');
    setAwardDialog(true);
  };

  const handleHolidayDialog = () => {
    console.log('🔍 Opening Holiday dialog');
    setHolidayDialog(true);
  };

  const handleProfileEditDialog = () => {
    console.log('🔍 Opening Profile Edit dialog');
    setProfileEditDialog(true);
  };

  const handleLeaveRequestDialog = () => {
    console.log('🔍 Opening Leave Request dialog');
    setLeaveRequestDialog(true);
  };

  const handleProcurementRequestDialog = () => {
    console.log('🔍 Opening Procurement Request dialog');
    setProcurementRequestDialog(true);
  };

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section - DKT Style */}
      <Card sx={{ mb: 3, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Avatar 
                src={employeeData.profile?.profile_picture_url || employeeData.profile?.profile_picture}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: '#2196F3',
                  fontSize: '2rem',
                  mr: 2
                }}
              >
                {!employeeData.profile?.profile_picture_url && !employeeData.profile?.profile_picture && 
                  getUserInitials(employeeData.profile?.first_name, employeeData.profile?.last_name, employeeData.profile?.username)
                }
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <img src="/api/placeholder/120/40" alt="Company Logo" style={{ height: '40px' }} />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                {employeeData.profile?.first_name && employeeData.profile?.last_name ? 
                  `${employeeData.profile.first_name.toUpperCase()} ${employeeData.profile.last_name.toUpperCase()}` : 
                  employeeData.profile?.username?.toUpperCase() || 'USER'} ({employeeData.profile?.username || 'USER001'})
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 0.5 }}>
                {employeeData.profile?.position?.toUpperCase() || 'EMPLOYEE'}, {employeeData.profile?.department_name || 'GENERAL'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mb: 0.5 }}>
                Last Login: {new Date().toLocaleDateString('en-GB')} - {new Date().toLocaleTimeString('en-GB', { hour12: false })}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                My Office Shift: 08:30AM To 05:30PM (General Shift)
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                startIcon={<PersonIcon />}
                sx={{ 
                  borderColor: '#ff4444', 
                  color: '#ff4444',
                  '&:hover': { bgcolor: '#ff4444', color: 'white' }
                }}
                onClick={() => setProfileEditDialog(true)}
              >
                Profile
              </Button>
              <Button 
                variant="contained" 
                sx={{ 
                  bgcolor: '#00cc88', 
                  '&:hover': { bgcolor: '#00aa77' }
                }}
              >
                Clock IN
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Enhanced Dashboard Cards Section */}
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Welcome Header */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: { xs: 2, md: 3 },
            p: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                  Welcome back, {user?.first_name || 'Employee'}! 👋
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Avatar 
                  src={getProfilePictureUrl(user?.profile_picture)} 
                  sx={{ 
                    width: { xs: 48, md: 64 }, 
                    height: { xs: 48, md: 64 },
                    border: '3px solid rgba(255,255,255,0.3)',
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}
                >
                  {getUserInitials(user?.first_name, user?.last_name)}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {user?.department?.name || 'Employee'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    ID: {user?.employee?.employee_id || `EMP-${user?.id}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Modern Dashboard Cards */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(255, 107, 107, 0.4)',
            }
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)' 
            }} />
            <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  fontSize: { xs: 32, md: 40 }, 
                  mr: 2,
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2
                }}>
                  💰
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h6', md: 'h5' }} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    {dashboardCardData.payslips.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Available
                  </Typography>
                </Box>
              </Box>
              <Typography variant={{ xs: 'body1', md: 'h6' }} sx={{ fontWeight: 'bold', mb: 1 }}>
                Payslips
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                View your salary details and download payslips
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setPayslipDialog(true)}
              >
                View Details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(78, 205, 196, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(78, 205, 196, 0.4)',
            }
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)' 
            }} />
            <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  fontSize: { xs: 32, md: 40 }, 
                  mr: 2,
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2
                }}>
                  🏆
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h6', md: 'h5' }} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    {dashboardCardData.awards.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Earned
                  </Typography>
                </Box>
              </Box>
              <Typography variant={{ xs: 'body1', md: 'h6' }} sx={{ fontWeight: 'bold', mb: 1 }}>
                Awards
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Your achievements and recognition
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setAwardDialog(true)}
              >
                View Details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
            color: '#2d3436',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(255, 234, 167, 0.4)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(255, 234, 167, 0.5)',
            }
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.3)' 
            }} />
            <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  fontSize: { xs: 32, md: 40 }, 
                  mr: 2,
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.4)',
                  borderRadius: 2
                }}>
                  📢
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h6', md: 'h5' }} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    {dashboardCardData.announcements.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Recent
                  </Typography>
                </Box>
              </Box>
              <Typography variant={{ xs: 'body1', md: 'h6' }} sx={{ fontWeight: 'bold', mb: 1 }}>
                Announcements
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Latest updates from HR team
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(45, 52, 54, 0.8)', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setAnnouncementDialog(true)}
              >
                View Details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            height: '100%',
            borderRadius: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(162, 155, 254, 0.3)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 40px rgba(162, 155, 254, 0.4)',
            }
          }}>
            <Box sx={{ 
              position: 'absolute', 
              top: -20, 
              right: -20, 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)' 
            }} />
            <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                  fontSize: { xs: 32, md: 40 }, 
                  mr: 2,
                  p: 1,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2
                }}>
                  📅
                </Box>
                <Box>
                  <Typography variant={{ xs: 'h6', md: 'h5' }} sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                    {dashboardCardData.holidays.length}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Upcoming
                  </Typography>
                </Box>
              </Box>
              <Typography variant={{ xs: 'body1', md: 'h6' }} sx={{ fontWeight: 'bold', mb: 1 }}>
                Holidays
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                Upcoming holidays and events
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={() => setHolidayDialog(true)}
              >
                View Details →
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modern Quick Actions Section */}
      <Card sx={{ 
        mb: { xs: 3, md: 4 },
        borderRadius: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid #dee2e6',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
          color: 'white',
          p: { xs: 2, md: 3 }
        }}>
          <Typography variant={{ xs: 'h6', md: 'h5' }} sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            ⚡ Quick Actions
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            Access frequently used features and submit requests
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<AddIcon />}
                sx={{ 
                  py: { xs: 1.5, md: 2 }, 
                  bgcolor: '#2196F3',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    bgcolor: '#1976d2',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  }
                }}
                onClick={() => setLeaveRequestDialog(true)}
              >
                Request Leave
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<BusinessIcon />}
                sx={{ 
                  py: { xs: 1.5, md: 2 }, 
                  bgcolor: '#ff9800',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                  '&:hover': {
                    bgcolor: '#f57c00',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
                  }
                }}
                onClick={() => setProcurementRequestDialog(true)}
              >
                Procurement Request
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<ViewIcon />}
                sx={{ 
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }
                }}
                onClick={() => setViewRequestsDialog(true)}
              >
                View Requests
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<PersonIcon />}
                sx={{ 
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }
                }}
                onClick={() => setProfileEditDialog(true)}
              >
                Update Profile
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<TaskIcon />}
                sx={{ 
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  fontWeight: 'bold',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }
                }}
              >
                My Tasks
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Enhanced Responsive Tabs */}
      <StyledTabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ 
          mb: { xs: 2, md: 3 },
          '& .MuiTabs-scrollButtons': {
            '&.Mui-disabled': { opacity: 0.3 }
          },
          '& .MuiTab-root': {
            minHeight: { xs: 48, md: 64 },
            fontSize: { xs: '0.875rem', md: '1rem' },
            fontWeight: 'bold',
            textTransform: 'none',
            '&.Mui-selected': {
              color: '#2196F3'
            }
          }
        }}
      >
        <StyledTab icon={<DashboardIcon />} label="Overview" />
        <StyledTab icon={<LeaveIcon />} label="Leave Requests" />
        <StyledTab icon={<ProfileIcon />} label="Profile" />
        <StyledTab icon={<TaskIcon />} label="Tasks" />
        <StyledTab icon={<NotificationIcon />} label="Notifications" />
      </StyledTabs>

      <TabPanel value={activeTab} index={0}>
        {/* Overview Tab - Enhanced Dashboard */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* Personal Leave Remaining Section */}
          <Grid item xs={12}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: { xs: 2, md: 3 }, 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #dee2e6'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#495057', 
                textAlign: 'center',
                fontWeight: 'bold',
                mb: { xs: 2, md: 3 }
              }}>
                📊 Personal Leave Balance
              </Typography>
              <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: { xs: 2, md: 3 }, 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                    borderRadius: 2,
                    border: '2px solid #2196F3',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Typography variant={{ xs: 'h4', md: 'h3' }} color="primary" sx={{ fontWeight: 'bold' }}>
                      {(employeeData.leaveBalance?.annual_leave || 21) - (employeeData.leaveBalance?.used_annual || 0)}
                    </Typography>
                    <Typography variant={{ xs: 'body2', md: 'body1' }} sx={{ fontWeight: 'bold' }}>Annual Leave</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {employeeData.leaveBalance?.used_annual || 0} used of {employeeData.leaveBalance?.annual_leave || 21}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: { xs: 2, md: 3 }, 
                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)', 
                    borderRadius: 2,
                    border: '2px solid #9c27b0',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Typography variant={{ xs: 'h4', md: 'h3' }} color="secondary" sx={{ fontWeight: 'bold' }}>
                      {(employeeData.leaveBalance?.sick_leave || 10) - (employeeData.leaveBalance?.used_sick || 0)}
                    </Typography>
                    <Typography variant={{ xs: 'body2', md: 'body1' }} sx={{ fontWeight: 'bold' }}>Sick Leave</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {employeeData.leaveBalance?.used_sick || 0} used of {employeeData.leaveBalance?.sick_leave || 10}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: { xs: 2, md: 3 }, 
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', 
                    borderRadius: 2,
                    border: '2px solid #4caf50',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <Typography variant={{ xs: 'h4', md: 'h3' }} sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                      {(employeeData.leaveBalance?.personal_leave || 5) - (employeeData.leaveBalance?.used_personal || 0)}
                    </Typography>
                    <Typography variant={{ xs: 'body2', md: 'body1' }} sx={{ fontWeight: 'bold' }}>Personal Leave</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {employeeData.leaveBalance?.used_personal || 0} used of {employeeData.leaveBalance?.personal_leave || 5}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Recent Activity and Pending Requests */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              height: { xs: 'auto', md: 350 },
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#2196F3', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                📈 Recent Activity
              </Typography>
              {employeeData.recentActivity && employeeData.recentActivity.length > 0 ? (
                <List dense sx={{ maxHeight: { xs: 200, md: 250 }, overflow: 'auto' }}>
                  {employeeData.recentActivity.slice(0, 5).map((activity, index) => (
                    <ListItem key={index} sx={{ 
                      borderRadius: 1, 
                      mb: 1, 
                      bgcolor: index % 2 === 0 ? '#f8f9fa' : 'transparent' 
                    }}>
                      <ListItemIcon>
                        <TimelineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity.title || 'Activity'}
                        secondary={activity.date || 'Recent'}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
                  <TimelineIcon sx={{ fontSize: { xs: 48, md: 64 }, color: '#ccc', mb: 2 }} />
                  <Typography variant={{ xs: 'body1', md: 'h6' }} color="textSecondary" gutterBottom>
                    No Recent Activity
                  </Typography>
                  <Typography variant={{ xs: 'body2', md: 'body1' }} color="textSecondary">
                    Your activity will appear here
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              height: { xs: 'auto', md: 350 },
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#ff9800', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                ⏳ Pending Requests
              </Typography>
              {employeeData.pendingRequests && employeeData.pendingRequests.length > 0 ? (
                <List dense sx={{ maxHeight: { xs: 200, md: 250 }, overflow: 'auto' }}>
                  {employeeData.pendingRequests.slice(0, 5).map((request, index) => (
                    <ListItem key={index} sx={{ 
                      borderRadius: 1, 
                      mb: 1, 
                      bgcolor: index % 2 === 0 ? '#fff3e0' : 'transparent' 
                    }}>
                      <ListItemIcon>
                        <PendingIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={request.title || 'Request'}
                        secondary={`Status: ${request.status} | ${request.start_date || new Date().toLocaleDateString()}`}
                        primaryTypographyProps={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
                  <PendingIcon sx={{ fontSize: { xs: 48, md: 64 }, color: '#ccc', mb: 2 }} />
                  <Typography variant={{ xs: 'body1', md: 'h6' }} color="textSecondary" gutterBottom>
                    No Pending Requests
                  </Typography>
                  <Typography variant={{ xs: 'body2', md: 'body1' }} color="textSecondary">
                    All caught up!
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Leave Requests Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card sx={{ 
          borderRadius: { xs: 2, md: 3 },
          border: '1px solid #e0e0e0'
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
              color: '#1976d2', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}>
              📋 My Leave Requests
            </Typography>
            {employeeData.leaveRequests && employeeData.leaveRequests.length > 0 ? (
              <TableContainer sx={{ 
                overflowX: 'auto',
                '& .MuiTable-root': {
                  minWidth: { xs: 600, md: 'auto' }
                }
              }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Dates</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Stage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employeeData.leaveRequests.map((request, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip 
                            label={request.leave_type} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {request.start_date} - {request.end_date}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold" color="primary">
                            {request.calculated_days || 0} days
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={request.status} 
                            size="small"
                            color={request.status === 'approved' ? 'success' : request.status === 'declined' ? 'error' : 'warning'}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                          {request.approval_stage}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: { xs: 3, md: 4 } }}>
                <CalendarTodayIcon sx={{ fontSize: { xs: 48, md: 64 }, color: '#ccc', mb: 2 }} />
                <Typography variant={{ xs: 'body1', md: 'h6' }} color="textSecondary" gutterBottom>
                  No Leave Requests
                </Typography>
                <Typography variant={{ xs: 'body2', md: 'body1' }} color="textSecondary">
                  Your leave requests will appear here
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Profile Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #e3f2fd',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#1976d2', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                👤 Personal Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">Full Name</Typography>
                <Typography variant={{ xs: 'body1', md: 'h6' }} gutterBottom>
                  {employeeData.user?.first_name} {employeeData.user?.last_name}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Email</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.user?.email}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Employee ID</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.employee_id || 'N/A'}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #e8f5e8',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#2e7d32', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                🏢 Work Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">Department</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.department || 'Not Assigned'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Position</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.position || 'N/A'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Hire Date</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.hire_date || 'N/A'}
                </Typography>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              p: { xs: 2, md: 3 }, 
              borderRadius: { xs: 2, md: 3 },
              border: '1px solid #fff3e0',
              bgcolor: '#f8f9fa'
            }}>
              <Typography variant={{ xs: 'h6', md: 'h6' }} gutterBottom sx={{ 
                color: '#f57c00', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                📞 Contact Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">Phone</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.phone || 'Not Provided'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Address</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.address || 'Not Provided'}
                </Typography>
                
                <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                <Typography variant={{ xs: 'body1', md: 'body1' }} gutterBottom>
                  {employeeData.emergency_contact || 'Not Provided'}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Leave Request Dialog */}
      <Dialog open={leaveRequestDialog} onClose={() => setLeaveRequestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          📅 Request Leave
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.leave_type}>
                <InputLabel>Leave Type</InputLabel>
                <Select
                  value={leaveFormData.leave_type}
                  onChange={(e) => handleLeaveFormChange('leave_type', e.target.value)}
                  label="Leave Type"
                >
                  <MenuItem value="annual">Annual Leave</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                  <MenuItem value="maternity">Maternity Leave</MenuItem>
                  <MenuItem value="paternity">Paternity Leave</MenuItem>
                </Select>
                {formErrors.leave_type && <Typography variant="caption" color="error">{formErrors.leave_type}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={leaveFormData.start_date}
                onChange={(e) => handleLeaveFormChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.start_date}
                helperText={formErrors.start_date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={leaveFormData.end_date}
                onChange={(e) => handleLeaveFormChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.end_date}
                helperText={formErrors.end_date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h6" color="primary">
                  Working Days: {leaveFormData.calculated_days}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason"
                multiline
                rows={3}
                value={leaveFormData.reason}
                onChange={(e) => handleLeaveFormChange('reason', e.target.value)}
                error={!!formErrors.reason}
                helperText={formErrors.reason}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setLeaveRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleLeaveRequestSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Procurement Request Dialog */}
      <Dialog open={procurementRequestDialog} onClose={() => setProcurementRequestDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          🛒 Request Procurement
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={procurementFormData.title}
                onChange={(e) => setProcurementFormData({ ...procurementFormData, title: e.target.value })}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={procurementFormData.category}
                  onChange={(e) => setProcurementFormData({ ...procurementFormData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="office_supplies">Office Supplies</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="services">Services</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formErrors.category && <Typography variant="caption" color="error">{formErrors.category}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimated Cost"
                type="number"
                value={procurementFormData.estimated_cost}
                onChange={(e) => setProcurementFormData({ ...procurementFormData, estimated_cost: e.target.value })}
                error={!!formErrors.estimated_cost}
                helperText={formErrors.estimated_cost}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={procurementFormData.quantity}
                onChange={(e) => setProcurementFormData({ ...procurementFormData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={procurementFormData.priority}
                  onChange={(e) => setProcurementFormData({ ...procurementFormData, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={procurementFormData.description}
                onChange={(e) => setProcurementFormData({ ...procurementFormData, description: e.target.value })}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Justification"
                multiline
                rows={2}
                value={procurementFormData.justification}
                onChange={(e) => setProcurementFormData({ ...procurementFormData, justification: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setProcurementRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleProcurementRequestSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Requests Dialog */}
      <Dialog open={viewRequestsDialog} onClose={() => setViewRequestsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          👁️ View Requests
        </DialogTitle>
        <DialogContent>
          <Tabs value={requestsTabValue} onChange={(e, newValue) => setRequestsTabValue(newValue)}>
            <Tab label="Leave Requests" />
            <Tab label="Procurement Requests" />
          </Tabs>
          
          {requestsTabValue === 0 && (
            <Box sx={{ mt: 2 }}>
              {employeeData.leaveRequests && employeeData.leaveRequests.length > 0 ? (
                <List>
                  {employeeData.leaveRequests.map((request, index) => (
                    <ListItem key={index} sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      bgcolor: '#fafafa'
                    }}>
                      <ListItemIcon>
                        📅
                      </ListItemIcon>
                      <ListItemText 
                        primary={`LR-${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Status: {request.status} | {request.start_date}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton>
                        <ViewIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No leave requests found
                </Typography>
              )}
            </Box>
          )}
          
          {requestsTabValue === 1 && (
            <Box sx={{ mt: 2 }}>
              {employeeData.procurementRequests && employeeData.procurementRequests.length > 0 ? (
                <List>
                  {employeeData.procurementRequests.map((request, index) => (
                    <ListItem key={index} sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      mb: 1,
                      bgcolor: '#fafafa'
                    }}>
                      <ListItemIcon>
                        📋
                      </ListItemIcon>
                      <ListItemText 
                        primary={`PR-${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Status: {request.status} | ${request.estimated_cost}
                            </Typography>
                          </Box>
                        }
                      />
                      <IconButton>
                        <ViewIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  No procurement requests found
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setViewRequestsDialog(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payslips Dialog */}
      <Dialog open={payslipDialog} onClose={() => setPayslipDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          💰 Payslips & Salary Information
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, color: '#333', fontWeight: 'bold' }}>
              Your Recent Payslips
            </Typography>
            <Grid container spacing={2}>
              {dashboardCardData.payslips.map((payslip, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ 
                          fontSize: 32, 
                          mr: 2,
                          p: 1,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          borderRadius: 2
                        }}>
                          💳
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {payslip.month} {payslip.year}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Monthly Salary
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            ${payslip.amount}
                          </Typography>
                          <Chip 
                            label={payslip.status} 
                            size="small"
                            sx={{ 
                              bgcolor: payslip.status === 'paid' ? '#4caf50' : '#ff9800',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        <Button 
                          variant="outlined" 
                          size="small"
                          sx={{ 
                            color: 'white', 
                            borderColor: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                          }}
                        >
                          Download
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={() => setPayslipDialog(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Announcements Dialog */}
      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Announcements</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Latest company announcements and updates.
          </Typography>
          <List>
            {dashboardCardData.announcements.map((announcement, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={announcement.title}
                  secondary={`${announcement.date} | ${announcement.category}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Awards Dialog */}
      <Dialog open={awardDialog} onClose={() => setAwardDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Awards & Recognition</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Your achievements and recognition history.
          </Typography>
          <List>
            {dashboardCardData.awards.map((award, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={award.title}
                  secondary={`${award.date} | ${award.category}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAwardDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Holidays Dialog */}
      <Dialog open={holidayDialog} onClose={() => setHolidayDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upcoming Holidays</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Company holidays and important dates.
          </Typography>
          <List>
            {dashboardCardData.holidays.map((holiday, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={holiday.name}
                  secondary={`${holiday.date} | ${holiday.type}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHolidayDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
