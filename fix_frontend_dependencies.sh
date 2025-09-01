#!/bin/bash

echo "🔧 Fixing Frontend AJV Dependency Conflict"
echo "=========================================="

cd frontend

echo "📋 Step 1: Adding package.json overrides for AJV conflict"
# Add overrides to package.json to fix AJV dependency issues
cat > temp_package.json << 'EOF'
{
  "name": "smart-erp-software",
  "version": "0.1.0",
  "private": true,
  "homepage": "./",
  "dependencies": {
    "@capacitor/android": "^6.1.2",
    "@capacitor/app": "^6.0.1",
    "@capacitor/core": "^6.1.2",
    "@capacitor/haptics": "^6.0.1",
    "@capacitor/ios": "^6.1.2",
    "@capacitor/keyboard": "^6.0.2",
    "@capacitor/status-bar": "^6.0.1",
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
  "devDependencies": {
    "@capacitor/cli": "^6.1.2",
    "typescript": "^4.9.5"
  },
  "overrides": {
    "ajv": "^8.12.0",
    "ajv-keywords": "^5.1.0"
  }
}
EOF

# Replace package.json with fixed version
mv temp_package.json package.json

echo "✅ Package.json updated with AJV overrides"

echo ""
echo "📋 Step 2: Clean install with dependency fixes"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force

echo ""
echo "📋 Step 3: Testing React start"
echo "Starting React server..."
npm start
