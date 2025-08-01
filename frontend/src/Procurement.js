import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Stepper, Step, StepLabel, Stack, Grid, Card, CardContent
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const stages = [
  'Requested',
  'HOD Approval',
  'CD Approval',
  'Procurement & PO',
  'Finance Payment',
  'Finance Manager Approval'
];

const stageLabels = [
  'Requester',
  'HOD Approval/Decline',
  'CD Approval/Decline',
  'Procurement & PO',
  'Finance Payment Voucher',
  'Finance Manager Approval/Decline'
];

const Procurement = () => {
  const { token, user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ item: '', quantity: '', reason: '' });
  const [selected, setSelected] = useState(null);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [notif, setNotif] = useState('');
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customStages, setCustomStages] = useState(stageLabels);

  useEffect(() => { fetchRequests(); }, [token]);

  const fetchRequests = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/procurement/procurement/', { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch {
      setError('Failed to load procurement requests.');
      setRequests([]); // Explicitly clear requests on error
    }
    finally { setLoading(false); }
  };


  const handleOpen = () => { setForm({ item: '', quantity: '', reason: '' }); setOpen(true); };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/procurement/procurement/', form, { headers: { Authorization: `Bearer ${token}` } });
      fetchRequests(); handleClose();
    } catch { setError('Failed to submit request.'); }
  };

  // Approval/Decline/Attachment logic based on user role and request stage
  const handleAction = (type) => {
    setActionType(type);
    setActionOpen(true);
    setActionReason('');
    setAttachment(null);
  };
  const handleActionSubmit = async () => {
    try {
      // Example: call backend with actionType, reason, attachment
      // await api.post(`/procurement/${selected.id}/${actionType}/`, { reason: actionReason, attachment }, { headers: { Authorization: `Bearer ${token}` } });
      setNotif(`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} submitted.`);
      setActionOpen(false);
      fetchRequests();
      // Example: send notification to next actor (backend should handle email/in-app delivery)
      // await api.post(`/notifications/`, { to_role: nextRole(selected.stage), message: `Procurement request #${selected.id} requires your action.` }, { headers: { Authorization: `Bearer ${token}` } });
    } catch { setNotif('Action failed.'); }
  };

  const canAct = req => {
    if (!user) return false;
    if (req.stage === 1 && user.role === 'hod') return true;
    if (req.stage === 2 && user.role === 'cd') return true;
    if (req.stage === 3 && user.role === 'procurement') return true;
    if (req.stage === 4 && user.role === 'finance') return true;
    if (req.stage === 5 && user.role === 'finance_manager') return true;
    return false;
  };

  // Audit trail modal logic
  const handleAuditOpen = async (req) => {
    setAuditOpen(true);
    // Example: fetch audit trail from backend
    // const res = await api.get(`/procurement/${req.id}/audit/`, { headers: { Authorization: `Bearer ${token}` } });
    // setAuditTrail(res.data);
    setAuditTrail([
      { actor: 'Requestor', action: 'Requested', date: req.created_at, comment: req.reason },
      { actor: 'HOD', action: 'Approved', date: new Date().toISOString(), comment: 'OK' },
      // ...
    ]);
  };
  const handleAuditClose = () => setAuditOpen(false);

  // Workflow settings dialog logic
  // Workflow settings dialog logic
  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => setSettingsOpen(false);
  const handleStageChange = (idx, value) => {
    const updated = [...customStages];
    updated[idx] = value;
    setCustomStages(updated);
  };
  const handleAddStage = () => setCustomStages([...customStages, 'New Stage']);
  const handleRemoveStage = (idx) => setCustomStages(customStages.filter((_, i) => i !== idx));

  // Fetch workflow stages from backend
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await api.get('/procurement/workflow-stages/');
        setCustomStages(res.data.map(s => s.name));
      } catch {}
    };
    fetchStages();
  }, []);

  // Save workflow stages to backend
  const handleSaveStages = async () => {
    try {
      await api.post('/procurement/workflow-stages/', customStages.map((name, i) => ({ name, order: i })), { headers: { Authorization: `Bearer ${token}` } });
      setNotif('Workflow stages updated.');
      setSettingsOpen(false);
    } catch { setNotif('Failed to update workflow stages.'); }
  };

  // Print waybill for a procurement request
  const handlePrintWaybill = async (id) => {
    try {
      const res = await api.get(`/procurement/procurement/${id}/print_waybill/`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `waybill_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      setNotif('Failed to print waybill.');
    }
  };

  // Dashboard summary data
  const total = requests.length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const pending = requests.filter(r => r.status === 'pending' || r.status === 'requested').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const statusData = [
    { name: 'Approved', value: approved },
    { name: 'Pending', value: pending },
    { name: 'Rejected', value: rejected }
  ];
  const recentRequests = requests.slice(0, 5);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Procurement</Typography>
        <Button variant="contained" onClick={handleOpen}>New Procurement Request</Button>
      </Box>
      {/* Requests Table Section */}
      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
      ) : null}
      {/* The rest of the requests table and UI (show empty state if requests is empty) */}
      {/* Dashboard widgets */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Requests</Typography>
                  <Typography variant="h4">{total}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Approved</Typography>
                  <Typography variant="h4">{approved}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingActionsIcon color="warning" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="h4">{pending}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CancelIcon color="error" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Rejected</Typography>
                  <Typography variant="h4">{rejected}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Status chart and recent requests */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Requests by Status</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Requests</Typography>
              {recentRequests.length === 0 ? (
                <Typography color="text.secondary">No recent requests.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentRequests.map((r, idx) => (
                    <li key={r.id || idx}>
                      <Typography variant="body2">{r.item} &mdash; Qty: {r.quantity} &mdash; Status: {r.status}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {notif && <Alert severity="success" onClose={() => setNotif('')}>{notif}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Approver</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9}><CircularProgress /></TableCell></TableRow>
            ) : requests.length === 0 ? (
              <TableRow><TableCell colSpan={9}>No requests found.</TableCell></TableRow>
             ) : requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{req.item}</TableCell>
                  <TableCell>{req.quantity}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>{req.department_name || ''}</TableCell>
                  <TableCell>{req.status}</TableCell>
                  <TableCell>{req.approval_stage}</TableCell>
                  <TableCell>{req.approver_username || ''}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handlePrintWaybill(req.id)}
                      >
                        Print Waybill
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={!(user && req.approver === user.id)}
                        onClick={() => setConfirmAction({ type: 'approve', id: req.id })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        disabled={!(user && req.approver === user.id)}
                        onClick={() => setConfirmAction({ type: 'decline', id: req.id })}
                      >
                        Decline
                      </Button>
                      <Button size="small" onClick={() => handleViewAudit(req.id)}>Audit</Button>
                      <Button size="small" variant="outlined" color="primary" onClick={() => handlePrintWaybill(req.id)}>
                        Print Waybill
                      </Button>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={e => { e.stopPropagation(); handleAuditOpen(req); }}>Audit Trail</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Procurement Request</DialogTitle>
        <DialogContent>
          <form id="procurement-form" onSubmit={handleSubmit}>
            <TextField label="Item" name="item" value={form.item} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Quantity" name="quantity" value={form.quantity} onChange={handleChange} fullWidth margin="normal" type="number" required />
            <TextField label="Reason" name="reason" value={form.reason} onChange={handleChange} fullWidth margin="normal" />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="procurement-form" variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      {/* Details dialog for workflow actions can be added here */}
    {notif && <Alert severity="info" sx={{ mt: 2 }}>{notif}</Alert>}
    <Dialog open={actionOpen} onClose={() => setActionOpen(false)}>
      <DialogTitle>{actionType === 'approve' ? 'Approve' : actionType === 'decline' ? 'Decline' : 'Attach PO'}</DialogTitle>
      <DialogContent>
        {actionType === 'decline' && (
          <TextField label="Reason" value={actionReason} onChange={e => setActionReason(e.target.value)} fullWidth margin="normal" required />
        )}
        {actionType === 'attach' && (
          <Button variant="outlined" component="label">
            Upload Attachment
            <input type="file" hidden onChange={e => setAttachment(e.target.files[0])} />
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setActionOpen(false)}>Cancel</Button>
        <Button onClick={handleActionSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={auditOpen} onClose={handleAuditClose} maxWidth="md" fullWidth>
      <DialogTitle>Audit Trail</DialogTitle>
      <DialogContent>
        <Box mb={2} display="flex" gap={2}>
          <Button variant="outlined" onClick={async () => {
            if (!selected) return;
            const res = await api.get(`/procurement/procurement/${selected.id}/export_audit/?format=csv`, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `procurement_audit_${selected.id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}>Export CSV</Button>
          <Button variant="outlined" onClick={async () => {
            if (!selected) return;
            const res = await api.get(`/procurement/procurement/${selected.id}/export_audit/?format=pdf`, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `procurement_audit_${selected.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
          }}>Export PDF</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Comment/Attachment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditTrail.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">No audit trail found.</TableCell></TableRow>
              ) : (
                auditTrail.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell>{a.actor}</TableCell>
                    <TableCell>{a.action}</TableCell>
                    <TableCell>{a.date ? new Date(a.date).toLocaleString() : ''}</TableCell>
                    <TableCell>{a.comment || (a.attachment ? <a href={a.attachment} target="_blank" rel="noopener noreferrer">Attachment</a> : '')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAuditClose}>Close</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth>
      <DialogTitle>Customize Workflow Stages</DialogTitle>
      <DialogContent>
        {customStages.map((stage, idx) => (
          <Box key={idx} display="flex" alignItems="center" mb={1}>
            <TextField value={stage} onChange={e => handleStageChange(idx, e.target.value)} label={`Stage ${idx + 1}`} fullWidth sx={{ mr: 1 }} />
            <Button size="small" color="error" onClick={() => handleRemoveStage(idx)} disabled={customStages.length <= 2}>Remove</Button>
          </Box>
        ))}
        <Button onClick={handleAddStage} sx={{ mt: 1 }}>Add Stage</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSaveStages} variant="contained">Save</Button>
        <Button onClick={handleSettingsClose}>Close</Button>
      </DialogActions>
    </Dialog>
    {/* Details dialog for workflow actions can be added here */}
    {notif && <Alert severity="info" sx={{ mt: 2 }}>{notif}</Alert>}
    </Box>
  );
};

// Stub for setConfirmAction (replace with actual logic as needed)
const setConfirmAction = () => {};
// Stub for handleViewAudit (replace with actual logic as needed)
const handleViewAudit = () => {};

// Moved inside Procurement component to access token and setNotif
// Usage: call handlePrintWaybill(id) inside the component


export default Procurement;
