#!/bin/bash

echo "🔧 Fixing @mui/lab Version Conflict"
echo "==================================="

cd frontend

echo "📋 Removing incompatible @mui/lab..."
npm uninstall @mui/lab

echo "📋 Installing compatible @mui/lab version..."
npm install @mui/lab@5.0.0-alpha.170 --legacy-peer-deps --force

echo "📋 Installing all required packages with compatible versions..."
npm install \
  @capacitor/app@5.0.7 \
  @capacitor/haptics@5.0.7 \
  @capacitor/keyboard@5.0.8 \
  @capacitor/status-bar@5.0.7 \
  recharts@2.8.0 \
  react-leaflet@4.2.1 \
  leaflet@1.9.4 \
  @mui/material@5.14.20 \
  @emotion/react@11.11.1 \
  @emotion/styled@11.11.0 \
  @mui/x-date-pickers@5.0.20 \
  @date-io/date-fns@2.17.0 \
  date-fns@2.30.0 \
  jspdf@2.5.1 \
  jspdf-autotable@3.5.31 \
  localforage@1.10.0 \
  --legacy-peer-deps --force

echo "✅ All dependencies installed with compatible versions"

echo "📋 Starting React development server..."
npm start
