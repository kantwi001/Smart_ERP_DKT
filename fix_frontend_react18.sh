#!/bin/bash

echo "🔧 Frontend Fix: React 18 Downgrade Approach"
echo "============================================"

cd frontend

echo "📋 Step 1: Complete dependency cleanup"
rm -rf node_modules package-lock.json

echo "📋 Step 2: Downgrade to React 18.2.0 (stable)"
# Create package.json with React 18 and compatible versions
cat > package.json << 'EOF'
{
  "name": "smart-erp-software",
  "version": "0.1.0",
  "private": true,
  "homepage": "./",
  "dependencies": {
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.5",
    "@mui/icons-material": "^5.15.15",
    "@mui/lab": "^5.0.0-alpha.170",
    "@mui/material": "^5.15.15",
    "@mui/x-date-pickers": "^7.3.2",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.8",
    "date-fns": "^3.6.0",
    "leaflet": "^1.9.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.22.3",
    "react-scripts": "5.0.1",
    "recharts": "^2.12.6",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "overrides": {
    "ajv": "^8.12.0",
    "ajv-keywords": "^5.1.0"
  }
}
EOF

echo "✅ Package.json updated with React 18.2.0"

echo "📋 Step 3: Install with compatibility flags"
npm install --legacy-peer-deps --force

echo "📋 Step 4: Start React development server"
echo "Starting on port 2026..."
PORT=2026 npm start
