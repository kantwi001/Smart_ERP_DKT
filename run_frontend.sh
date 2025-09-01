#!/bin/bash

echo "🔧 Installing Dependencies and Starting Frontend"
echo "==============================================="

cd frontend

echo "📋 Installing all dependencies..."
npm install --legacy-peer-deps

echo "✅ Dependencies installed"

echo "📋 Starting React development server..."
npm start
