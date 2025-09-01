#!/bin/bash

echo "📤 Pushing ERP System Changes to GitHub"
echo "======================================"

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Check git status
echo "1️⃣ Checking git status..."
git status

# Add all changes
echo ""
echo "2️⃣ Adding all changes..."
git add .

# Check what will be committed
echo ""
echo "3️⃣ Changes to be committed:"
git diff --cached --name-only

# Create commit message with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="feat: Complete PostgreSQL migration and Android connectivity fixes

- Fixed PostgreSQL connection and database setup
- Resolved Android app backend connectivity issues
- Created comprehensive diagnostic and setup scripts
- Updated API configuration for cross-platform compatibility
- Fixed mobile app authentication and data synchronization
- Enhanced backend startup scripts with proper database validation

Scripts added/updated:
- setup_postgres_database.sh
- start_backend_with_postgres.sh
- check_postgres_connection.py
- diagnose_android_connectivity.sh
- fix_android_backend_connectivity.sh
- test_android_login.sh
- fix_psycopg2_install.sh

Updated: $TIMESTAMP"

echo ""
echo "4️⃣ Committing changes..."
git commit -m "$COMMIT_MSG"

# Push to remote repository
echo ""
echo "5️⃣ Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully pushed to GitHub!"
    echo "📊 Changes include:"
    echo "   ✅ PostgreSQL database setup and migration"
    echo "   ✅ Android app connectivity fixes"
    echo "   ✅ Backend authentication improvements"
    echo "   ✅ Comprehensive diagnostic scripts"
    echo "   ✅ Database connection validation"
else
    echo ""
    echo "❌ Push failed. Possible issues:"
    echo "   - Check internet connection"
    echo "   - Verify GitHub credentials"
    echo "   - Check if remote repository exists"
    echo ""
    echo "🔧 Try manual push:"
    echo "   git push origin main"
fi
