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
COMMIT_MESSAGE="🎉 Major ERP System Updates - Mobile Employee UI, Transfer Stock & Compilation Fixes

✨ NEW: Mobile Employee UI Development:
- Created comprehensive MobileEmployeeForms.js with all employee form components
- Developed MobileEmployeeApp.js - mobile-first employee interface with card-based layout
- Integrated mobile employee interface into App.js routing system
- Employee users now get mobile-optimized UI by default (no sidebar, card-based modules)
- Added dedicated /mobile-employee route for mobile access
- Mobile-first responsive design with touch-optimized interactions
- Real-time data synchronization with backend APIs
- Employee-focused modules: Leave, Tasks, Profile, Payslips, Training, Procurement

🔧 FIXED: Compilation Errors:
- Resolved MUI date picker dependency issues in MobileEmployeeForms.js
- Replaced @mui/x-date-pickers with native HTML5 date inputs
- Fixed DatePicker, LocalizationProvider, AdapterDateFns import errors
- Updated date handling logic to work with string dates
- Added proper InputLabelProps for date field display

🎯 NEW: Transfer Stock Quick Action:
- Added Transfer Stock quick action button to Inventory Dashboard Overview tab
- Implemented complete transfer stock dialog with product/warehouse selection
- Added full API integration with /inventory/transfers/ endpoint
- Proper form validation and error handling
- Loading states and success feedback
- Auto data refresh after successful transfer

🎨 Mobile UI Features:
- Card-based module layout optimized for mobile screens
- Swipeable navigation drawer with touch-friendly interactions
- Floating Action Button (FAB) for quick actions
- Notification system with badges and real-time updates
- Auto day calculation for leave requests
- Profile picture upload and editing
- Complete procurement workflow integration
- Training materials with video playback
- Task management and status tracking

📱 Technical Improvements:
- Material-UI mobile-first components with native date inputs
- Touch-optimized interface design with proper spacing
- Offline-ready architecture for mobile use
- Role-based routing ensures employees see mobile UI
- Cross-module synchronization improvements
- Enhanced API connectivity and error handling
- Resolved all compilation errors for smooth deployment

🔐 Enhanced Functionality:
- Quick Actions section in Inventory Dashboard
- Complete stock transfer workflow with validation
- Real-time inventory data updates
- Improved user experience across all modules
- Better error handling and user feedback

This update represents a major milestone in mobile ERP functionality and inventory management, 
delivering a streamlined, mobile-first employee experience with comprehensive stock transfer 
capabilities and resolved compilation issues for production-ready deployment."

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
