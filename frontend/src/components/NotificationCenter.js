import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  PhoneAndroid as PushIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import NotificationService from '../services/NotificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalReason, setApprovalReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notificationsData, approvalsData, statsData] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getPendingApprovals(),
        NotificationService.getNotificationStats()
      ]);
      
      setNotifications(notificationsData);
      setPendingApprovals(approvalsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransfer = async (transferId) => {
    try {
      const details = await NotificationService.getTransferApprovalDetails(transferId);
      setSelectedTransfer(details);
    } catch (error) {
      console.error('Failed to fetch transfer details:', error);
    }
  };

  const handleApprovalAction = (action, transferId) => {
    setApprovalAction(action);
    setSelectedTransfer({ transfer: { id: transferId } });
    setApprovalDialog(true);
    setApprovalNotes('');
    setApprovalReason('');
  };

  const submitApproval = async () => {
    if (!selectedTransfer?.transfer?.id) return;

    setProcessing(true);
    try {
      let result;
      if (approvalAction === 'approve') {
        result = await NotificationService.approveTransfer(
          selectedTransfer.transfer.id,
          approvalNotes
        );
      } else {
        result = await NotificationService.rejectTransfer(
          selectedTransfer.transfer.id,
          approvalReason
        );
      }

      if (result.success) {
        alert(result.message);
        setApprovalDialog(false);
        fetchData(); // Refresh data
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
      alert('Failed to process approval. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      fetchData();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getChannelIcon = (channelType) => {
    switch (channelType) {
      case 'email': return <EmailIcon />;
      case 'sms': return <SmsIcon />;
      case 'push': return <PushIcon />;
      default: return <NotificationsIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'sent': return 'info';
      case 'delivered': return 'success';
      case 'failed': return 'error';
      case 'read': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Total Notifications
            </Typography>
            <Typography variant="h4">{stats.total_notifications || 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="warning.main">
              Unread
            </Typography>
            <Typography variant="h4">{stats.unread_notifications || 0}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" color="error.main">
              Pending Approvals
            </Typography>
            <Typography variant="h4">{stats.pending_approvals || 0}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ApproveIcon sx={{ mr: 1, color: 'warning.main' }} />
              Pending Transfer Approvals
            </Typography>
            <List>
              {pendingApprovals.map((approval) => (
                <ListItem key={approval.id} divider>
                  <ListItemText
                    primary={`Transfer #${approval.transfer}`}
                    secondary={`Requested: ${new Date(approval.requested_at).toLocaleString()}`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewTransfer(approval.transfer)}
                      title="View Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleApprovalAction('approve', approval.transfer)}
                      title="Approve"
                    >
                      <ApproveIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleApprovalAction('reject', approval.transfer)}
                      title="Reject"
                    >
                      <RejectIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Notifications</Typography>
            {stats.unread_notifications > 0 && (
              <Button onClick={markAllAsRead} size="small">
                Mark All as Read
              </Button>
            )}
          </Box>
          
          {notifications.length === 0 ? (
            <Alert severity="info">No notifications found.</Alert>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem key={notification.id} divider>
                  <ListItemIcon>
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={notification.status === 'read'}
                    >
                      {getChannelIcon(notification.channel?.channel_type)}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.subject || notification.notification_type}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.created_at).toLocaleString()} via {notification.channel?.name}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={notification.status}
                    color={getStatusColor(notification.status)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
        </DialogTitle>
        <DialogContent>
          {approvalAction === 'approve' ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approval Notes (Optional)"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              required
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={submitApproval}
            variant="contained"
            color={approvalAction === 'approve' ? 'success' : 'error'}
            disabled={processing || (approvalAction === 'reject' && !approvalReason.trim())}
          >
            {processing ? <CircularProgress size={20} /> : 
             (approvalAction === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Details Dialog */}
      <Dialog 
        open={!!selectedTransfer && !approvalDialog} 
        onClose={() => setSelectedTransfer(null)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Transfer Details</DialogTitle>
        <DialogContent>
          {selectedTransfer && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Transfer #{selectedTransfer.transfer?.id}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Typography><strong>Product:</strong> {selectedTransfer.transfer?.product_name}</Typography>
                <Typography><strong>Quantity:</strong> {selectedTransfer.transfer?.quantity}</Typography>
                <Typography><strong>From:</strong> {selectedTransfer.transfer?.from_location}</Typography>
                <Typography><strong>To:</strong> {selectedTransfer.transfer?.to_location}</Typography>
                <Typography><strong>Status:</strong> {selectedTransfer.transfer?.status}</Typography>
                <Typography><strong>Requested:</strong> {new Date(selectedTransfer.transfer?.created_at).toLocaleString()}</Typography>
              </Box>
              {selectedTransfer.can_approve && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ApproveIcon />}
                    onClick={() => handleApprovalAction('approve', selectedTransfer.transfer.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<RejectIcon />}
                    onClick={() => handleApprovalAction('reject', selectedTransfer.transfer.id)}
                  >
                    Reject
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTransfer(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationCenter;
