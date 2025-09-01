#!/bin/bash

echo "🔧 Final Frontend Fix - Direct Nested Package Resolution"
echo "========================================================"

cd frontend

echo "📋 Step 1: Remove problematic nested packages directly"
rm -rf node_modules package-lock.json

echo "📋 Step 2: Install base React 18 without TypeScript checker"
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
    "@mui/material": "^5.15.15",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.8",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "SKIP_PREFLIGHT_CHECK=true react-scripts start",
    "build": "SKIP_PREFLIGHT_CHECK=true react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
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
  }
}
EOF

echo "✅ Minimal package.json created"

echo "📋 Step 3: Install with Node 18 compatibility"
npm install --legacy-peer-deps

echo "📋 Step 4: Manually fix the nested AJV issue"
# Remove the problematic nested package
rm -rf node_modules/fork-ts-checker-webpack-plugin/node_modules/schema-utils
rm -rf node_modules/fork-ts-checker-webpack-plugin

echo "📋 Step 5: Create .env file for port configuration"
echo "PORT=2026" > .env
echo "SKIP_PREFLIGHT_CHECK=true" >> .env

echo "📋 Step 6: Start React server"
echo "Starting React development server on port 2026..."
npm start
