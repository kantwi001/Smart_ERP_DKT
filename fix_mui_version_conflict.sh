#!/bin/bash

echo "🔧 Fixing @mui/x-date-pickers Version Conflict"
echo "=============================================="

cd frontend

echo "📋 Removing incompatible @mui/x-date-pickers..."
npm uninstall @mui/x-date-pickers

echo "📋 Installing compatible version..."
npm install @mui/x-date-pickers@5.0.20 --legacy-peer-deps

echo "📋 Installing missing @mui/material if needed..."
npm install @mui/material@5.14.20 @emotion/react @emotion/styled --legacy-peer-deps

echo "✅ Compatible versions installed"

echo "📋 Starting React development server..."
npm start
