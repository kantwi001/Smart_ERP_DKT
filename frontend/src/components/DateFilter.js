import React from 'react';
import { Box, MenuItem, Select, TextField } from '@mui/material';

const DateFilter = ({ period, setPeriod, startDate, setStartDate, endDate, setEndDate, periods = [] }) => (
  <Box display="flex" alignItems="center" gap={2}>
    <Select
      value={period}
      onChange={e => setPeriod(e.target.value)}
      size="small"
      sx={{ minWidth: 120 }}
    >
      {periods.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
      ))}
    </Select>
    <TextField
      type="date"
      label="From"
      size="small"
      value={startDate}
      onChange={e => setStartDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      type="date"
      label="To"
      size="small"
      value={endDate}
      onChange={e => setEndDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
    />
  </Box>
);

export default DateFilter;
