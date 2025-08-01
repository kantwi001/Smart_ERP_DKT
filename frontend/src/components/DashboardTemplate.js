import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import SummaryCard from './SummaryCard';
import DateFilter from './DateFilter';
import LineChart from './LineChart';
import PieChart from './PieChart';

// Example props: title, summaryCards, lineChart, pieCharts, filters, children
const DashboardTemplate = ({
  title,
  summaryCards = [],
  lineChart = null,
  pieCharts = [],
  periods = [],
  initialPeriod = '',
  children,
  onFilterChange
}) => {
  const [period, setPeriod] = useState(initialPeriod || (periods[0]?.value || ''));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notify parent on filter change
  React.useEffect(() => {
    if (onFilterChange) onFilterChange({ period, startDate, endDate });
    // eslint-disable-next-line
  }, [period, startDate, endDate]);

  return (
    <Box>
      <Box mb={2} display="flex" flexWrap="wrap" alignItems="center" gap={2}>
        <DateFilter
          period={period}
          setPeriod={setPeriod}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          periods={periods}
        />
        {children}
      </Box>
      <Grid container spacing={2} mb={2}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <SummaryCard {...card} />
          </Grid>
        ))}
      </Grid>
      {lineChart && <Box mb={2}><LineChart {...lineChart} /></Box>}
      <Grid container spacing={2}>
        {pieCharts.map((pie, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <PieChart {...pie} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardTemplate;
