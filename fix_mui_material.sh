#!/bin/bash

echo "🔧 Installing @mui/material Package"
echo "==================================="

cd frontend

echo "📋 Installing @mui/material and related packages..."
npm install \
  @mui/material \
  @emotion/react \
  @emotion/styled \
  --legacy-peer-deps

echo "✅ @mui/material packages installed"

echo "📋 Starting React development server..."
npm start
