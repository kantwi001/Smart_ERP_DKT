import React, { useEffect, useState, useContext } from 'react';
import api from './api';
import { AuthContext } from './AuthContext';
import { Typography, Box, Grid, Card, CardContent, CardActions, Button, CircularProgress, Alert } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Reporting = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [token]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reporting/reports/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      setError('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  // Dashboard summary data
  const totalReports = reports.length;
  const reportTypes = Array.from(new Set(reports.map(r => r.type || 'Unknown')));
  const numTypes = reportTypes.length;
  const now = new Date();
  const reportsThisMonth = reports.filter(r => {
    if (!r.date) return false;
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const typeChartData = reportTypes.map(type => ({ type, count: reports.filter(r => (r.type || 'Unknown') === type).length }));
  const recentReports = reports.slice(0, 5);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Reporting</Typography>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssessmentIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Total Reports</Typography>
                  <Typography variant="h4">{totalReports}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CategoryIcon color="info" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">Types of Reports</Typography>
                  <Typography variant="h4">{numTypes}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <DateRangeIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
                <Box>
                  <Typography variant="h6">This Month</Typography>
                  <Typography variant="h4">{reportsThisMonth}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Reports by Type</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={typeChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="type" interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1976d2" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Recent Reports</Typography>
              {recentReports.length === 0 ? (
                <Typography color="text.secondary">No recent reports.</Typography>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {recentReports.map((r, idx) => (
                    <li key={r.id || idx}>
                      <Typography variant="body2">{r.title} &mdash; {r.type} &mdash; {r.date}</Typography>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : reports.length === 0 ? (
        <Alert severity="info">No reports found.</Alert>
      ) : (
        <Grid container spacing={2}>
          {reports.map((report, idx) => (
            <Grid item xs={12} sm={6} md={4} key={report.id || idx}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <AssessmentIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
                    <Typography variant="h6">{report.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>{report.description}</Typography>
                  {report.value !== undefined && (
                    <Typography variant="h4" color="primary.main">{report.value}</Typography>
                  )}
                  {report.chart && (
                    <img src={report.chart} alt="chart" style={{ width: '100%', marginTop: 8 }} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Reporting;
