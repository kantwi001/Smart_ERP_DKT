import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SummaryCard = ({ title, value, icon, color = 'primary', hint }) => (
  <Card sx={{ minWidth: 160, borderRadius: 2, boxShadow: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        {icon && <Box color={color}>{icon}</Box>}
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}
            {hint && <span style={{ marginLeft: 6, fontSize: 14, color: '#bbb' }}>?</span>}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default SummaryCard;
