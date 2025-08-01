import React from 'react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

const COLORS = ['#43a047', '#1976d2', '#fb8c00', '#e53935', '#8e24aa', '#00bcd4', '#fdd835', '#6d4c41'];

const CustomPieChart = ({ data, dataKey = 'value', nameKey = 'name', height = 180, title }) => (
  <Box width="100%" height={height + 40}>
    {title && <Typography variant="subtitle1" mb={1}>{title}</Typography>}
    <ResponsiveContainer width="100%" height={height}>
      <RePieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={height / 2 - 10}
          fill="#8884d8"
          label
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </RePieChart>
    </ResponsiveContainer>
  </Box>
);

export default CustomPieChart;
