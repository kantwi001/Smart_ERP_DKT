import React from 'react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { Box, Typography } from '@mui/material';

const CustomLineChart = ({ data, lines, areas, xKey = 'date', height = 260, title }) => (
  <Box width="100%" height={height + 40}>
    {title && <Typography variant="subtitle1" mb={1}>{title}</Typography>}
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {areas && areas.map(area => (
          <Area key={area.dataKey} {...area} />
        ))}
        {lines && lines.map(line => (
          <Line key={line.dataKey} {...line} />
        ))}
      </ReLineChart>
    </ResponsiveContainer>
  </Box>
);

export default CustomLineChart;
