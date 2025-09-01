#!/bin/bash

echo "🔍 Checking Frontend Server Status"
echo "=================================="

# Check if frontend process is still running
echo "📋 Frontend Process Status:"
if ps -p 57556 > /dev/null 2>&1; then
    echo "✅ Frontend process (PID: 57556) is running"
    echo "Process details:"
    ps -p 57556 -o pid,ppid,cmd
else
    echo "❌ Frontend process (PID: 57556) is not running"
fi

echo ""
echo "📋 Checking port 2026:"
lsof -i :2026 || echo "No process on port 2026"

echo ""
echo "📋 Testing frontend connectivity:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:2026 || echo "Connection failed"

echo ""
echo "📋 Checking if React is starting properly:"
cd frontend
echo "Current directory: $(pwd)"
echo "Checking package.json scripts..."
grep -A 5 '"scripts"' package.json

echo ""
echo "📋 Manual frontend start test:"
echo "Starting React manually to see errors..."
timeout 10s npm start 2>&1 | head -20
