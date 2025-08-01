// GanttChart.js - Comprehensive Gantt chart for project management and workflow visualization
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Avatar,
  Divider,
  Alert
} from '@mui/material';
import {
  Timeline,
  PlayArrow,
  Pause,
  Edit,
  Delete,
  Add,
  MoreVert,
  Person,
  CalendarToday,
  Flag,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  TrendingUp,
  Assignment,
  Group,
  Business
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GanttContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'auto',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
  position: 'sticky',
  top: 0,
  zIndex: 2,
}));

const ProjectRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const TaskBar = styled(Box)(({ theme, status, progress }) => ({
  height: 20,
  borderRadius: 10,
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 
    status === 'completed' ? '#4caf50' :
    status === 'in-progress' ? '#2196f3' :
    status === 'delayed' ? '#f44336' :
    status === 'pending' ? '#ff9800' : '#9e9e9e',
  '&:hover': {
    transform: 'scaleY(1.2)',
    boxShadow: theme.shadows[2],
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${progress}%`,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 'inherit',
  }
}));

const GanttChart = ({ 
  projects = [], 
  onProjectUpdate,
  onTaskUpdate,
  viewMode = 'months',
  title = "Project Timeline"
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [timelineStart, setTimelineStart] = useState(new Date());
  const [timelineEnd, setTimelineEnd] = useState(new Date());
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sample project data with comprehensive ERP workflows
  const sampleProjects = useMemo(() => [
    {
      id: 1,
      name: 'Sales Order Processing',
      type: 'sales',
      manager: 'John Smith',
      status: 'in-progress',
      priority: 'high',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      progress: 75,
      budget: 50000,
      team: ['Alice Johnson', 'Bob Wilson', 'Carol Brown'],
      tasks: [
        {
          id: 101,
          name: 'Lead Generation',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-30'),
          progress: 100,
          status: 'completed',
          assignee: 'Alice Johnson',
          dependencies: []
        },
        {
          id: 102,
          name: 'Proposal Creation',
          startDate: new Date('2024-01-25'),
          endDate: new Date('2024-02-10'),
          progress: 100,
          status: 'completed',
          assignee: 'Bob Wilson',
          dependencies: [101]
        },
        {
          id: 103,
          name: 'Contract Negotiation',
          startDate: new Date('2024-02-05'),
          endDate: new Date('2024-02-25'),
          progress: 90,
          status: 'in-progress',
          assignee: 'Carol Brown',
          dependencies: [102]
        },
        {
          id: 104,
          name: 'Order Fulfillment',
          startDate: new Date('2024-02-20'),
          endDate: new Date('2024-03-10'),
          progress: 40,
          status: 'in-progress',
          assignee: 'Alice Johnson',
          dependencies: [103]
        },
        {
          id: 105,
          name: 'Delivery & Invoicing',
          startDate: new Date('2024-03-05'),
          endDate: new Date('2024-03-15'),
          progress: 10,
          status: 'pending',
          assignee: 'Bob Wilson',
          dependencies: [104]
        }
      ]
    },
    {
      id: 2,
      name: 'Manufacturing Process',
      type: 'manufacturing',
      manager: 'Sarah Davis',
      status: 'in-progress',
      priority: 'medium',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      progress: 60,
      budget: 120000,
      team: ['Mike Chen', 'Lisa Wang', 'Tom Rodriguez'],
      tasks: [
        {
          id: 201,
          name: 'Material Procurement',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-15'),
          progress: 100,
          status: 'completed',
          assignee: 'Mike Chen',
          dependencies: []
        },
        {
          id: 202,
          name: 'Production Planning',
          startDate: new Date('2024-02-10'),
          endDate: new Date('2024-02-20'),
          progress: 100,
          status: 'completed',
          assignee: 'Lisa Wang',
          dependencies: [201]
        },
        {
          id: 203,
          name: 'Manufacturing Setup',
          startDate: new Date('2024-02-18'),
          endDate: new Date('2024-03-05'),
          progress: 85,
          status: 'in-progress',
          assignee: 'Tom Rodriguez',
          dependencies: [202]
        },
        {
          id: 204,
          name: 'Production Run',
          startDate: new Date('2024-03-01'),
          endDate: new Date('2024-04-15'),
          progress: 45,
          status: 'in-progress',
          assignee: 'Mike Chen',
          dependencies: [203]
        },
        {
          id: 205,
          name: 'Quality Control',
          startDate: new Date('2024-04-10'),
          endDate: new Date('2024-04-25'),
          progress: 0,
          status: 'pending',
          assignee: 'Lisa Wang',
          dependencies: [204]
        },
        {
          id: 206,
          name: 'Packaging & Shipping',
          startDate: new Date('2024-04-20'),
          endDate: new Date('2024-04-30'),
          progress: 0,
          status: 'pending',
          assignee: 'Tom Rodriguez',
          dependencies: [205]
        }
      ]
    },
    {
      id: 3,
      name: 'HR Recruitment Campaign',
      type: 'hr',
      manager: 'Emily Johnson',
      status: 'completed',
      priority: 'low',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-02-28'),
      progress: 100,
      budget: 25000,
      team: ['David Lee', 'Jennifer Kim'],
      tasks: [
        {
          id: 301,
          name: 'Job Posting',
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-15'),
          progress: 100,
          status: 'completed',
          assignee: 'David Lee',
          dependencies: []
        },
        {
          id: 302,
          name: 'Resume Screening',
          startDate: new Date('2024-01-16'),
          endDate: new Date('2024-01-30'),
          progress: 100,
          status: 'completed',
          assignee: 'Jennifer Kim',
          dependencies: [301]
        },
        {
          id: 303,
          name: 'Initial Interviews',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-15'),
          progress: 100,
          status: 'completed',
          assignee: 'Emily Johnson',
          dependencies: [302]
        },
        {
          id: 304,
          name: 'Final Interviews',
          startDate: new Date('2024-02-16'),
          endDate: new Date('2024-02-25'),
          progress: 100,
          status: 'completed',
          assignee: 'David Lee',
          dependencies: [303]
        },
        {
          id: 305,
          name: 'Onboarding',
          startDate: new Date('2024-02-26'),
          endDate: new Date('2024-02-28'),
          progress: 100,
          status: 'completed',
          assignee: 'Jennifer Kim',
          dependencies: [304]
        }
      ]
    }
  ], []);

  const activeProjects = projects.length > 0 ? projects : sampleProjects;

  // Calculate timeline boundaries
  useEffect(() => {
    if (activeProjects.length > 0) {
      const allDates = activeProjects.flatMap(project => [
        project.startDate,
        project.endDate,
        ...project.tasks.flatMap(task => [task.startDate, task.endDate])
      ]);
      
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));
      
      // Add padding
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
      
      setTimelineStart(minDate);
      setTimelineEnd(maxDate);
    }
  }, [activeProjects]);

  // Generate timeline columns based on view mode
  const generateTimelineColumns = () => {
    const columns = [];
    const current = new Date(timelineStart);
    const end = new Date(timelineEnd);
    
    while (current <= end) {
      columns.push(new Date(current));
      
      switch (viewMode) {
        case 'days':
          current.setDate(current.getDate() + 1);
          break;
        case 'weeks':
          current.setDate(current.getDate() + 7);
          break;
        case 'months':
          current.setMonth(current.getMonth() + 1);
          break;
        default:
          current.setDate(current.getDate() + 1);
      }
    }
    
    return columns;
  };

  const timelineColumns = generateTimelineColumns();

  const formatColumnHeader = (date) => {
    switch (viewMode) {
      case 'days':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weeks':
        return `Week ${getWeekNumber(date)}`;
      case 'months':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const calculateTaskPosition = (task) => {
    const totalDays = (timelineEnd - timelineStart) / (1000 * 60 * 60 * 24);
    const taskStart = (task.startDate - timelineStart) / (1000 * 60 * 60 * 24);
    const taskDuration = (task.endDate - task.startDate) / (1000 * 60 * 60 * 24);
    
    return {
      left: `${(taskStart / totalDays) * 100}%`,
      width: `${(taskDuration / totalDays) * 100}%`
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'in-progress':
        return <PlayArrow color="primary" />;
      case 'delayed':
        return <Warning color="error" />;
      case 'pending':
        return <Schedule color="warning" />;
      default:
        return <Assignment />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const handleContextMenu = (event, project) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      project
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
    handleCloseContextMenu();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>View</InputLabel>
              <Select value={viewMode} label="View">
                <MenuItem value="days">Days</MenuItem>
                <MenuItem value="weeks">Weeks</MenuItem>
                <MenuItem value="months">Months</MenuItem>
              </Select>
            </FormControl>
            <Button startIcon={<Add />} variant="outlined" size="small">
              Add Project
            </Button>
          </Box>
        </Box>

        <GanttContainer sx={{ height: 600 }}>
          {/* Timeline Header */}
          <TimelineHeader>
            <Box sx={{ width: 300, p: 1, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Projects & Tasks
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flex: 1, overflowX: 'auto' }}>
              {timelineColumns.map((date, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: 80 * zoomLevel,
                    p: 1,
                    borderRight: 1,
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption">
                    {formatColumnHeader(date)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </TimelineHeader>

          {/* Project Rows */}
          {activeProjects.map((project) => (
            <Box key={project.id}>
              {/* Project Header Row */}
              <ProjectRow onContextMenu={(e) => handleContextMenu(e, project)}>
                <Box sx={{ width: 300, p: 2, borderRight: 1, borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: getPriorityColor(project.priority) }}>
                      <Business sx={{ fontSize: 14 }} />
                    </Avatar>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {project.name}
                    </Typography>
                    {getStatusIcon(project.status)}
                  </Box>
                  <Box display="flex" gap={1} mb={1}>
                    <Chip
                      label={project.type}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={project.priority}
                      size="small"
                      sx={{ bgcolor: getPriorityColor(project.priority), color: 'white' }}
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    Manager: {project.manager}
                  </Typography>
                </Box>
                <Box sx={{ position: 'relative', flex: 1, p: 1 }}>
                  <TaskBar
                    status={project.status}
                    progress={project.progress}
                    sx={{
                      ...calculateTaskPosition(project),
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <Tooltip title={`${project.progress}% complete`}>
                      <Box sx={{ width: '100%', height: '100%' }} />
                    </Tooltip>
                  </TaskBar>
                </Box>
              </ProjectRow>

              {/* Task Rows */}
              {project.tasks.map((task) => (
                <ProjectRow key={task.id}>
                  <Box sx={{ width: 300, p: 1, pl: 4, borderRight: 1, borderColor: 'divider' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 20, height: 20 }}>
                        <Person sx={{ fontSize: 12 }} />
                      </Avatar>
                      <Typography variant="body2">
                        {task.name}
                      </Typography>
                      {getStatusIcon(task.status)}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {task.assignee}
                    </Typography>
                  </Box>
                  <Box sx={{ position: 'relative', flex: 1, p: 1 }}>
                    <TaskBar
                      status={task.status}
                      progress={task.progress}
                      sx={{
                        ...calculateTaskPosition(task),
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: 16
                      }}
                    >
                      <Tooltip 
                        title={
                          <Box>
                            <Typography variant="subtitle2">{task.name}</Typography>
                            <Typography variant="body2">Progress: {task.progress}%</Typography>
                            <Typography variant="body2">Assignee: {task.assignee}</Typography>
                            <Typography variant="body2">
                              {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      >
                        <Box sx={{ width: '100%', height: '100%' }} />
                      </Tooltip>
                    </TaskBar>
                  </Box>
                </ProjectRow>
              ))}
              <Divider />
            </Box>
          ))}
        </GanttContainer>

        {/* Context Menu */}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => handleEditProject(contextMenu?.project)}>
            <Edit sx={{ mr: 1 }} />
            Edit Project
          </MenuItem>
          <MenuItem onClick={handleCloseContextMenu}>
            <Delete sx={{ mr: 1 }} />
            Delete Project
          </MenuItem>
        </Menu>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            {selectedProject && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    defaultValue={selectedProject.name}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Manager"
                    defaultValue={selectedProject.manager}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select defaultValue={selectedProject.status}>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in-progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="delayed">Delayed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select defaultValue={selectedProject.priority}>
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Budget"
                    type="number"
                    defaultValue={selectedProject.budget}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
