#!/bin/bash

echo "🔧 Clean Install and Fix Frontend"
echo "================================"

cd frontend

echo "📋 Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "📋 Adding environment variable to disable source maps..."
echo "GENERATE_SOURCEMAP=false" >> .env

echo "📋 Installing dependencies with clean slate..."
npm install --legacy-peer-deps

echo "✅ Clean installation complete"

echo "📋 Starting React development server..."
npm start
