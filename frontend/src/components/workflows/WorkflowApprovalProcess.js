import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
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
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  PlayArrow as StartIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Forward as DelegateIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import WorkflowService from '../../services/WorkflowService';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkflowApprovalProcess = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [instances, setInstances] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dialog states
  const [templateDialog, setTemplateDialog] = useState({ open: false, template: null });
  const [stepDialog, setStepDialog] = useState({ open: false, step: null, templateId: null });
  const [actionDialog, setActionDialog] = useState({ open: false, instance: null });
  const [viewDialog, setViewDialog] = useState({ open: false, instance: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, instancesData, tasksData, statsData] = await Promise.all([
        WorkflowService.getWorkflowTemplates(),
        WorkflowService.getWorkflowInstances(),
        WorkflowService.getMyTasks(),
        WorkflowService.getWorkflowStats()
      ]);
      
      setTemplates(templatesData);
      setInstances(instancesData);
      setMyTasks(tasksData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load workflow data');
      console.error('Error loading workflow data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Template Management
  const handleCreateTemplate = () => {
    setTemplateDialog({ open: true, template: null });
  };

  const handleEditTemplate = (template) => {
    setTemplateDialog({ open: true, template });
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this workflow template?')) {
      try {
        await WorkflowService.deleteWorkflowTemplate(templateId);
        loadData();
      } catch (err) {
        setError('Failed to delete template');
      }
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      await WorkflowService.duplicateWorkflowTemplate(templateId);
      loadData();
    } catch (err) {
      setError('Failed to duplicate template');
    }
  };

  // Workflow Actions
  const handleTakeAction = (instance) => {
    setActionDialog({ open: true, instance });
  };

  const handleViewInstance = (instance) => {
    setViewDialog({ open: true, instance });
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="primary">
              Active Templates
            </Typography>
            <Typography variant="h3">
              {stats.total_templates || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              Active Workflows
            </Typography>
            <Typography variant="h3">
              {stats.active_instances || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="error.main">
              Pending Approvals
            </Typography>
            <Typography variant="h3">
              {stats.pending_approvals || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" color="success.main">
              Completed This Month
            </Typography>
            <Typography variant="h3">
              {stats.completed_this_month || 0}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* My Pending Tasks */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Pending Tasks
            </Typography>
            {myTasks.length === 0 ? (
              <Typography color="textSecondary">
                No pending tasks
              </Typography>
            ) : (
              <List>
                {myTasks.map((task) => (
                  <ListItem key={task.id}>
                    <ListItemText
                      primary={`${task.workflow_instance.template_details.name} - ${task.workflow_instance.instance_id}`}
                      secondary={`Step: ${task.step_details.name} | Due: ${new Date(task.due_date).toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleTakeAction(task.workflow_instance)}
                      >
                        Review
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTemplatesTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Workflow Templates</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Chip
                    label={template.workflow_type.replace('_', ' ').toUpperCase()}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {template.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={template.is_active ? 'Active' : 'Inactive'}
                    color={template.is_active ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {template.is_default && (
                    <Chip
                      label="Default"
                      color="info"
                      size="small"
                    />
                  )}
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {template.steps?.length || 0} steps
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleEditTemplate(template)}
                  title="Edit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDuplicateTemplate(template.id)}
                  title="Duplicate"
                >
                  <DuplicateIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteTemplate(template.id)}
                  title="Delete"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderInstancesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Workflow Instances
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Instance ID</TableCell>
              <TableCell>Template</TableCell>
              <TableCell>Requester</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Step</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instances.map((instance) => (
              <TableRow key={instance.id}>
                <TableCell>{instance.instance_id}</TableCell>
                <TableCell>{instance.template_details?.name}</TableCell>
                <TableCell>{instance.requester_details?.username}</TableCell>
                <TableCell>
                  <Chip
                    label={instance.status.toUpperCase()}
                    color={
                      instance.status === 'approved' ? 'success' :
                      instance.status === 'rejected' ? 'error' :
                      instance.status === 'in_progress' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{instance.current_step_details?.name || 'Completed'}</TableCell>
                <TableCell>{new Date(instance.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewInstance(instance)}
                    title="View Details"
                  >
                    <ViewIcon />
                  </IconButton>
                  {instance.status === 'in_progress' && (
                    <IconButton
                      size="small"
                      onClick={() => handleTakeAction(instance)}
                      title="Take Action"
                      color="primary"
                    >
                      <StartIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading workflow data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Workflow Approval Process
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Overview" />
          <Tab label="Templates" />
          <Tab label="Active Workflows" />
          <Tab label="Settings" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          {renderOverviewTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {renderTemplatesTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {renderInstancesTab()}
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Workflow System Settings
          </Typography>
          <Typography color="textSecondary">
            Global workflow configuration settings will be available here.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Template Dialog */}
      <TemplateDialog
        open={templateDialog.open}
        template={templateDialog.template}
        onClose={() => setTemplateDialog({ open: false, template: null })}
        onSave={loadData}
      />

      {/* Action Dialog */}
      <ActionDialog
        open={actionDialog.open}
        instance={actionDialog.instance}
        onClose={() => setActionDialog({ open: false, instance: null })}
        onSave={loadData}
      />

      {/* View Dialog */}
      <ViewDialog
        open={viewDialog.open}
        instance={viewDialog.instance}
        onClose={() => setViewDialog({ open: false, instance: null })}
      />
    </Box>
  );
};

// Template Dialog Component
const TemplateDialog = ({ open, template, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    workflow_type: '',
    description: '',
    is_active: true,
    is_default: false,
    auto_approve_threshold: '',
    require_manager_approval: true,
    require_finance_approval: false,
    require_hr_approval: false,
    require_it_approval: false,
    escalation_days: 3
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        workflow_type: template.workflow_type || '',
        description: template.description || '',
        is_active: template.is_active || true,
        is_default: template.is_default || false,
        auto_approve_threshold: template.auto_approve_threshold || '',
        require_manager_approval: template.require_manager_approval || true,
        require_finance_approval: template.require_finance_approval || false,
        require_hr_approval: template.require_hr_approval || false,
        require_it_approval: template.require_it_approval || false,
        escalation_days: template.escalation_days || 3
      });
    } else {
      setFormData({
        name: '',
        workflow_type: '',
        description: '',
        is_active: true,
        is_default: false,
        auto_approve_threshold: '',
        require_manager_approval: true,
        require_finance_approval: false,
        require_hr_approval: false,
        require_it_approval: false,
        escalation_days: 3
      });
    }
  }, [template]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (template) {
        await WorkflowService.updateWorkflowTemplate(template.id, formData);
      } else {
        await WorkflowService.createWorkflowTemplate(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {template ? 'Edit Workflow Template' : 'Create Workflow Template'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Workflow Type</InputLabel>
              <Select
                value={formData.workflow_type}
                onChange={(e) => setFormData({ ...formData, workflow_type: e.target.value })}
              >
                {WorkflowService.getWorkflowTypeOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Auto Approve Threshold"
              value={formData.auto_approve_threshold}
              onChange={(e) => setFormData({ ...formData, auto_approve_threshold: e.target.value })}
              helperText="Amount below which requests are auto-approved"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Escalation Days"
              value={formData.escalation_days}
              onChange={(e) => setFormData({ ...formData, escalation_days: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Approval Requirements
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.require_manager_approval}
                  onChange={(e) => setFormData({ ...formData, require_manager_approval: e.target.checked })}
                />
              }
              label="Require Manager Approval"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.require_finance_approval}
                  onChange={(e) => setFormData({ ...formData, require_finance_approval: e.target.checked })}
                />
              }
              label="Require Finance Approval"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.require_hr_approval}
                  onChange={(e) => setFormData({ ...formData, require_hr_approval: e.target.checked })}
                />
              }
              label="Require HR Approval"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.require_it_approval}
                  onChange={(e) => setFormData({ ...formData, require_it_approval: e.target.checked })}
                />
              }
              label="Require IT Approval"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
              }
              label="Default Template"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Action Dialog Component
const ActionDialog = ({ open, instance, onClose, onSave }) => {
  const [action, setAction] = useState('');
  const [comments, setComments] = useState('');
  const [delegatedTo, setDelegatedTo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await WorkflowService.takeWorkflowAction(instance.id, {
        action,
        comments,
        delegated_to: action === 'delegated' ? delegatedTo : null
      });
      onSave();
      onClose();
    } catch (err) {
      console.error('Error taking action:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Take Action on Workflow</DialogTitle>
      <DialogContent>
        {instance && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {instance.template_details?.name} - {instance.instance_id}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Current Step: {instance.current_step_details?.name}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                {WorkflowService.getActionOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              sx={{ mt: 2 }}
            />

            {action === 'delegated' && (
              <TextField
                fullWidth
                label="Delegate To (User ID)"
                value={delegatedTo}
                onChange={(e) => setDelegatedTo(e.target.value)}
                sx={{ mt: 2 }}
                helperText="Enter the user ID to delegate this approval to"
              />
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !action}
        >
          {loading ? 'Processing...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// View Dialog Component
const ViewDialog = ({ open, instance, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Workflow Details</DialogTitle>
      <DialogContent>
        {instance && (
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Instance ID</Typography>
                <Typography variant="body2">{instance.instance_id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Template</Typography>
                <Typography variant="body2">{instance.template_details?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Requester</Typography>
                <Typography variant="body2">{instance.requester_details?.username}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={instance.status.toUpperCase()}
                  color={
                    instance.status === 'approved' ? 'success' :
                    instance.status === 'rejected' ? 'error' :
                    instance.status === 'in_progress' ? 'warning' : 'default'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Current Step</Typography>
                <Typography variant="body2">
                  {instance.current_step_details?.name || 'Completed'}
                </Typography>
              </Grid>
              {instance.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2">{instance.notes}</Typography>
                </Grid>
              )}
            </Grid>

            {instance.approvals && instance.approvals.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Approval History
                </Typography>
                <List>
                  {instance.approvals.map((approval) => (
                    <ListItem key={approval.id}>
                      <ListItemText
                        primary={`${approval.step_details?.name} - ${approval.approver_details?.username}`}
                        secondary={`${approval.action.toUpperCase()} | ${approval.comments || 'No comments'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkflowApprovalProcess;
