#!/bin/bash

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Install required dependencies for HR Reports
echo "Installing PDF generation dependencies..."
npm install jspdf jspdf-autotable

echo "Installing MUI date picker dependencies..."
npm install @mui/x-date-pickers @date-io/date-fns date-fns

echo "Dependencies installed successfully!"
echo "You can now run the frontend server with: npm start"
