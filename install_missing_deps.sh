#!/bin/bash

echo "🔧 Installing Missing Frontend Dependencies"
echo "=========================================="

cd frontend

echo "📋 Installing all missing packages..."
npm install \
  recharts \
  @capacitor/core \
  @capacitor/app \
  @capacitor/haptics \
  @capacitor/keyboard \
  @capacitor/status-bar \
  react-leaflet \
  leaflet \
  @mui/x-date-pickers \
  @mui/lab \
  date-fns \
  jspdf \
  jspdf-autotable \
  localforage \
  --legacy-peer-deps

echo "✅ All dependencies installed"

echo "📋 Starting React development server..."
npm start
