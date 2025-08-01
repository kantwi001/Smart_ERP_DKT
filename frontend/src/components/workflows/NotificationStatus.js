import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Tooltip,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as InAppIcon,
  PhoneIphone as PushIcon,
  CheckCircle as DeliveredIcon,
  Error as FailedIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import WorkflowService from '../../services/WorkflowService';

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  ...(status === 'delivered' && {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32'
  }),
  ...(status === 'failed' && {
    backgroundColor: '#ffebee',
    color: '#c62828'
  }),
  ...(status === 'pending' && {
    backgroundColor: '#fff3e0',
    color: '#ef6c00'
  })
}));

const ChannelIcon = ({ channel, delivered }) => {
  const iconProps = {
    fontSize: 'small',
    color: delivered ? 'success' : 'error'
  };

  switch (channel) {
    case 'email':
      return <EmailIcon {...iconProps} />;
    case 'sms':
      return <SmsIcon {...iconProps} />;
    case 'in_app':
      return <InAppIcon {...iconProps} />;
    case 'push':
      return <PushIcon {...iconProps} />;
    default:
      return <InAppIcon {...iconProps} />;
  }
};

const NotificationStatus = ({ workflowInstanceId, compact = false }) => {
  const [notificationStatus, setNotificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    if (workflowInstanceId) {
      fetchNotificationStatus();
    }
  }, [workflowInstanceId]);

  const fetchNotificationStatus = async () => {
    try {
      setLoading(true);
      const response = await WorkflowService.getNotificationStatus(workflowInstanceId);
      setNotificationStatus(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch notification status:', err);
      setError('Failed to load notification status');
    } finally {
      setLoading(false);
    }
  };

  const getChannelStats = () => {
    if (!notificationStatus) return {};
    
    const stats = {};
    Object.entries(notificationStatus.by_channel).forEach(([channel, data]) => {
      stats[channel] = {
        total: data.total,
        delivered: data.delivered,
        failed: data.failed,
        rate: data.total > 0 ? Math.round((data.delivered / data.total) * 100) : 0
      };
    });
    return stats;
  };

  const getStageStats = () => {
    if (!notificationStatus) return {};
    return notificationStatus.by_stage;
  };

  const getOverallStats = () => {
    if (!notificationStatus) return { total: 0, delivered: 0, failed: 0, rate: 0 };
    
    const { total_notifications, delivered_notifications, failed_notifications } = notificationStatus;
    return {
      total: total_notifications,
      delivered: delivered_notifications,
      failed: failed_notifications,
      rate: total_notifications > 0 ? Math.round((delivered_notifications / total_notifications) * 100) : 0
    };
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Loading notification status...
        </Typography>
        <LinearProgress sx={{ mt: 1 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        <IconButton onClick={fetchNotificationStatus} size="small">
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  if (!notificationStatus) {
    return (
      <Typography variant="body2" color="text.secondary">
        No notification data available
      </Typography>
    );
  }

  const overallStats = getOverallStats();
  const channelStats = getChannelStats();
  const stageStats = getStageStats();

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`${overallStats.delivered}/${overallStats.total} notifications delivered`}>
          <Badge badgeContent={overallStats.failed} color="error">
            <Chip
              icon={<InAppIcon />}
              label={`${overallStats.rate}%`}
              size="small"
              color={overallStats.rate >= 80 ? 'success' : overallStats.rate >= 60 ? 'warning' : 'error'}
            />
          </Badge>
        </Tooltip>
        <IconButton size="small" onClick={() => setDetailsOpen(true)}>
          <ViewIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <>
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" />
              Notification Status
            </Typography>
            <IconButton onClick={fetchNotificationStatus} size="small">
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Overall Statistics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {overallStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Sent
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {overallStats.delivered}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Delivered
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {overallStats.failed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Failed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {overallStats.rate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Channel Statistics */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Delivery by Channel
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {Object.entries(channelStats).map(([channel, stats]) => (
              <Grid item xs={6} sm={3} key={channel}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}
                >
                  <ChannelIcon channel={channel} delivered={stats.rate >= 80} />
                  <Typography variant="body2" sx={{ mt: 1, textTransform: 'capitalize' }}>
                    {channel}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {stats.rate}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.delivered}/{stats.total}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Stage Statistics */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Notifications by Stage
          </Typography>
          <List dense>
            {Object.entries(stageStats).map(([stage, stats]) => (
              <ListItem key={stage} divider>
                <ListItemIcon>
                  {stats.failed > 0 ? (
                    <FailedIcon color="error" />
                  ) : stats.delivered === stats.total ? (
                    <DeliveredIcon color="success" />
                  ) : (
                    <PendingIcon color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  secondary={`${stats.delivered}/${stats.total} delivered`}
                />
                <ListItemSecondaryAction>
                  <StatusChip
                    label={`${Math.round((stats.delivered / stats.total) * 100)}%`}
                    size="small"
                    status={stats.failed > 0 ? 'failed' : stats.delivered === stats.total ? 'delivered' : 'pending'}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {/* Recent Timeline */}
          {notificationStatus.timeline && notificationStatus.timeline.length > 0 && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Recent Notifications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Channel</TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notificationStatus.timeline.slice(0, 10).map((notification, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(notification.sent_at).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {notification.stage.replace(/_/g, ' ')}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <ChannelIcon channel={notification.channel} delivered={notification.delivered} />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {notification.recipient}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={notification.delivered ? 'Delivered' : 'Failed'}
                              size="small"
                              status={notification.delivered ? 'delivered' : 'failed'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}
        </CardContent>
      </StyledCard>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detailed Notification Status</DialogTitle>
        <DialogContent>
          <NotificationStatus workflowInstanceId={workflowInstanceId} compact={false} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationStatus;
