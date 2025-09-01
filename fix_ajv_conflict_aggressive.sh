#!/bin/bash

echo "🔧 Aggressive AJV Dependency Fix"
echo "================================"

cd frontend

echo "📋 Step 1: Force remove conflicting packages"
npm uninstall ajv ajv-keywords schema-utils 2>/dev/null

echo "📋 Step 2: Install specific compatible versions"
npm install ajv@8.12.0 ajv-keywords@5.1.0 --save-dev --legacy-peer-deps

echo "📋 Step 3: Update package.json with comprehensive overrides"
# Create a more comprehensive package.json with deeper overrides
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.overrides = {
  'ajv': '^8.12.0',
  'ajv-keywords': '^5.1.0',
  'schema-utils': {
    'ajv': '^8.12.0',
    'ajv-keywords': '^5.1.0'
  },
  'fork-ts-checker-webpack-plugin': {
    'schema-utils': {
      'ajv': '^8.12.0',
      'ajv-keywords': '^5.1.0'
    }
  }
};

pkg.resolutions = {
  'ajv': '^8.12.0',
  'ajv-keywords': '^5.1.0'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Package.json updated with comprehensive overrides');
"

echo "📋 Step 4: Clean reinstall"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force

echo "📋 Step 5: Test React start"
echo "Starting React development server..."
PORT=2026 npm start
