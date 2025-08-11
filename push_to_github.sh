#!/bin/bash

echo "🚀 Pushing ERP System updates to GitHub..."
echo "================================================================================"

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    echo "✅ Git repository initialized"
fi

# Check git status
echo "📋 Current git status:"
git status

# Add all changes
echo "📦 Adding all changes to staging..."
git add .

# Show what will be committed
echo "📋 Files to be committed:"
git diff --cached --name-only

# Create comprehensive commit message
COMMIT_MESSAGE="🎉 Major ERP System Updates - User Management, Sync Module, PDF Waybills & More

✨ New Features:
- Added Sync module to sidebar navigation for all user types
- Enhanced PDF waybill generation with descriptive filenames
- Comprehensive user management scripts (superuser creation, safe deletion)
- Improved role-based access control across all modules

🔧 User Management:
- Created scripts to make Collins Arku and Edmond Sekyere superusers
- Added safe user deletion scripts for antwi, rosemond, kay
- Enhanced user permission management with Django shell scripts
- Fixed virtual environment activation for Django commands

🎨 UI/UX Improvements:
- Sync module now visible in sidebar for all users (superusers, sales, HR, employees)
- Fixed navigation routing and component integration
- Enhanced mobile responsiveness across dashboards
- Improved error handling and user feedback

📄 PDF & Documentation:
- Enhanced PDF waybill filename generation with transfer details
- Professional waybill naming: Waybill_T{ID}_{FromWarehouse}_to_{ToWarehouse}_{Product}_{Date}.pdf
- Improved file organization and business documentation

🛠️ Technical Improvements:
- Fixed compilation errors in App.js (Sync component routing)
- Enhanced Django shell scripts with proper error handling
- Improved virtual environment management
- Better database integrity checks for user operations

🔐 Security & Access:
- Granular role-based access control implementation
- Enhanced user authentication and permission management
- Safe database operations with transaction handling
- Comprehensive user relationship cleanup on deletion

📱 System Integration:
- Cross-module synchronization improvements
- Enhanced offline/online data sync capabilities
- Better API connectivity and error handling
- Improved mobile app compatibility

🗃️ Database & Backend:
- Enhanced Django models and migrations
- Improved foreign key constraint handling
- Better cascade deletion for user relationships
- Optimized database queries and operations

This update represents significant improvements to user management, system integration, 
and overall ERP functionality with enhanced security and user experience."

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Check if remote origin exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote origin found"
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
    else
        echo "⚠️  Push failed, trying to set upstream..."
        git push --set-upstream origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to GitHub with upstream set!"
        else
            echo "❌ Push failed. You may need to:"
            echo "   1. Check your GitHub credentials"
            echo "   2. Verify repository permissions"
            echo "   3. Pull latest changes first: git pull origin main"
        fi
    fi
else
    echo "⚠️  No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    echo "   git push --set-upstream origin main"
fi

# Show final status
echo "📋 Final git status:"
git status

echo "================================================================================"
echo "🎉 GitHub update process complete!"
echo "📋 Recent changes have been committed and pushed to GitHub"
echo "✅ ERP System is now synchronized with remote repository"
echo "================================================================================"
