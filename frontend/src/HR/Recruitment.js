import React, { useEffect, useState } from 'react';
import api from '../api';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  WorkOutline as WorkOutlineIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import OnboardingDashboard from './OnboardingDashboard';

const Recruitment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Job posting dialog state
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    department: '',
    requirements: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, applicationsRes] = await Promise.all([
        api.get('/hr/job-postings/'),
        api.get('/hr/applications/')
      ]);
      setJobs(jobsRes.data.results || jobsRes.data);
      setApplications(applicationsRes.data.results || applicationsRes.data);
    } catch (err) {
      setError('Failed to load recruitment data');
      console.error('Error loading recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      await api.post('/hr/job-postings/', jobForm);
      setSuccess('Job posting created successfully');
      setJobDialogOpen(false);
      setJobForm({
        title: '',
        description: '',
        department: '',
        requirements: '',
        is_active: true
      });
      loadData();
    } catch (err) {
      setError('Failed to create job posting');
      console.error('Error creating job posting:', err);
    }
  };

  const getApplicationStatus = (status) => {
    const statusColors = {
      'pending': 'warning',
      'reviewed': 'info',
      'accepted': 'success',
      'rejected': 'error'
    };
    return statusColors[status] || 'default';
  };

  const JobPostingsTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Job Postings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setJobDialogOpen(true)}
        >
          Create Job Posting
        </Button>
      </Box>
      
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Posted Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No job postings found.
                </TableCell>
              </TableRow>
            )}
            {jobs.map(job => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{new Date(job.posted_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={job.is_active ? 'Active' : 'Inactive'}
                    color={job.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {applications.filter(app => app.job === job.id).length}
                </TableCell>
                <TableCell>
                  <Tooltip title="View Applications">
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Job">
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  const ApplicationsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Applications</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No applications found.
                </TableCell>
              </TableRow>
            )}
            {applications.map(application => (
              <TableRow key={application.id}>
                <TableCell>{application.applicant_name || 'N/A'}</TableCell>
                <TableCell>{application.job_title || 'N/A'}</TableCell>
                <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={application.status.toUpperCase()}
                    color={getApplicationStatus(application.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Review Application">
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        <WorkOutlineIcon sx={{ mr: 1 }} />
        Recruitment & Onboarding
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Job Postings" icon={<WorkOutlineIcon />} />
            <Tab label="Applications" icon={<PersonAddIcon />} />
            <Tab label="Onboarding" icon={<AssignmentIcon />} />
          </Tabs>

          <Box mt={3}>
            {activeTab === 0 && <JobPostingsTab />}
            {activeTab === 1 && <ApplicationsTab />}
            {activeTab === 2 && <OnboardingDashboard />}
          </Box>
        </CardContent>
      </Card>

      {/* Create Job Posting Dialog */}
      <Dialog open={jobDialogOpen} onClose={() => setJobDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Job Posting</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobForm.title}
                onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={jobForm.department}
                  onChange={(e) => setJobForm({...jobForm, department: e.target.value})}
                >
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="SALES">Sales</MenuItem>
                  <MenuItem value="FINANCE">Finance</MenuItem>
                  <MenuItem value="OPERATIONS">Operations</MenuItem>
                  <MenuItem value="PROGRAMS">Programs</MenuItem>
                  <MenuItem value="LOGISTICS/PROCUREMENT/SUPPLY CHAIN">Logistics/Procurement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={jobForm.is_active}
                  onChange={(e) => setJobForm({...jobForm, is_active: e.target.value})}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                multiline
                rows={4}
                value={jobForm.description}
                onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                multiline
                rows={3}
                value={jobForm.requirements}
                onChange={(e) => setJobForm({...jobForm, requirements: e.target.value})}
                placeholder="List job requirements and qualifications..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateJob} variant="contained">Create Job Posting</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Recruitment;
