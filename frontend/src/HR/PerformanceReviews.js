import React, { useState, useEffect } from 'react';
import api from '../api';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, CircularProgress } from '@mui/material';

const PerformanceReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchReviews = () => {
    api.get('/hr/performance-reviews/').then(res => setReviews(res.data));
  };

  useEffect(() => {
    fetchReviews();
  }, [refresh]);

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      await api.post(`/hr/performance-reviews/${id}/approve/`);
      setSnackbar({ open: true, message: 'Review approved or escalated.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to approve.', severity: 'error' });
    } finally {
      setActionLoading(null);
      fetchReviews();
    }
  };
  const handleDecline = async (id) => {
    setActionLoading(id + '-decline');
    try {
      await api.post(`/hr/performance-reviews/${id}/decline/`);
      setSnackbar({ open: true, message: 'Review declined.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to decline.', severity: 'error' });
    } finally {
      setActionLoading(null);
      fetchReviews();
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'approve') await handleApprove(confirmAction.id);
    if (confirmAction.type === 'decline') await handleDecline(confirmAction.id);
    setConfirmAction(null);
  };

  const handleViewAudit = async (id) => {
    setAuditOpen(true);
    setAuditLoading(true);
    try {
      const res = await api.get(`/hr/performance-reviews/${id}/audit/`);
      setAuditData(res.data);
    } catch {
      setAuditData([]);
    } finally {
      setAuditLoading(false);
    }
  };

  // Use real user/role context
  const { user } = React.useContext(require('../AuthContext').AuthContext);

  return (
    <Box>
      <Typography variant="h6" mb={2}>Performance Reviews</Typography>
      <Paper sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Reviewer</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length === 0 && (
              <TableRow><TableCell colSpan={6}>No reviews found.</TableCell></TableRow>
            )}
            {reviews.map(review => {
              const isApprover = user && review.reviewer === user.id;
              return (
                <TableRow key={review.id}>
                  <TableCell>{review.employee_name || ''}</TableCell>
                  <TableCell>{review.period}</TableCell>
                  <TableCell>{review.status}</TableCell>
                  <TableCell>{review.approval_stage}</TableCell>
                  <TableCell>{review.reviewer_username || ''}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        disabled={!isApprover || actionLoading === review.id + '-approve'}
                        onClick={() => handleApprove(review.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        disabled={!isApprover || actionLoading === review.id + '-decline'}
                        onClick={() => handleDecline(review.id)}
                      >
                        Decline
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default PerformanceReviews;
