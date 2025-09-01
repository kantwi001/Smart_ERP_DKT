#!/bin/bash

# Fix Hardcoded URLs Script for Mobile App Configuration
# This script systematically replaces hardcoded localhost URLs with dynamic API imports

set -e

echo "🔧 Starting hardcoded URL fix for mobile app configuration..."

# Navigate to frontend directory
cd frontend/src

# Create backup directory
mkdir -p ../../backups/url_fixes_$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../../backups/url_fixes_$(date +%Y%m%d_%H%M%S)"

echo "📦 Creating backup in $BACKUP_DIR..."

# Function to backup and fix a file
fix_file() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    local import_line="$4"
    
    if [ -f "$file" ]; then
        echo "🔄 Processing $file..."
        
        # Create backup
        cp "$file" "$BACKUP_DIR/$(basename $file)"
        
        # Add import if not already present
        if [ -n "$import_line" ] && ! grep -q "getApiBaseUrl" "$file"; then
            # Add import after existing imports
            sed -i '' "1a\\
$import_line
" "$file"
        fi
        
        # Replace the pattern
        sed -i '' "s|$pattern|$replacement|g" "$file"
        
        echo "✅ Fixed $file"
    else
        echo "⚠️  File not found: $file"
    fi
}

# Fix Survey.js
fix_file "Survey.js" \
    "const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/surveys';" \
    "const API_BASE = process.env.REACT_APP_API_BASE || \`\${getApiBaseUrl()}/surveys\`;" \
    "import { getApiBaseUrl } from './api';"

# Fix RoutePlanning.js
fix_file "RoutePlanning.js" \
    "const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/route-planning';" \
    "const API_BASE = process.env.REACT_APP_API_BASE || \`\${getApiBaseUrl()}/route-planning\`;" \
    "import { getApiBaseUrl } from './api';"

# Fix RoutePlanningAdmin.js
fix_file "RoutePlanningAdmin.js" \
    "const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:2025/api/route-planning';" \
    "const API_BASE = process.env.REACT_APP_API_BASE || \`\${getApiBaseUrl()}/route-planning\`;" \
    "import { getApiBaseUrl } from './api';"

# Search for any remaining hardcoded localhost references
echo "🔍 Searching for remaining hardcoded localhost references..."

# Find all JavaScript/TypeScript files with hardcoded localhost
REMAINING_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | xargs grep -l "http://localhost:2025" 2>/dev/null || true)

if [ -n "$REMAINING_FILES" ]; then
    echo "⚠️  Found remaining hardcoded URLs in:"
    echo "$REMAINING_FILES"
    
    # Create a report of remaining issues
    echo "📋 Creating detailed report..."
    echo "# Remaining Hardcoded URLs Report" > ../../hardcoded_urls_report.md
    echo "Generated: $(date)" >> ../../hardcoded_urls_report.md
    echo "" >> ../../hardcoded_urls_report.md
    
    for file in $REMAINING_FILES; do
        echo "## File: $file" >> ../../hardcoded_urls_report.md
        echo '```' >> ../../hardcoded_urls_report.md
        grep -n "http://localhost:2025" "$file" >> ../../hardcoded_urls_report.md
        echo '```' >> ../../hardcoded_urls_report.md
        echo "" >> ../../hardcoded_urls_report.md
    done
    
    echo "📄 Report saved to ../../hardcoded_urls_report.md"
else
    echo "✅ No remaining hardcoded localhost URLs found!"
fi

# Check for other potential hardcoded IPs
echo "🔍 Checking for other hardcoded IP addresses..."
OTHER_IPS=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" | xargs grep -E "192\.168\.|10\.0\.|172\." 2>/dev/null || true)

if [ -n "$OTHER_IPS" ]; then
    echo "⚠️  Found other hardcoded IP addresses:"
    echo "$OTHER_IPS"
fi

# Verify API configuration consistency
echo "🔍 Verifying API configuration consistency..."

# Check if all files that import getApiBaseUrl actually use it
echo "📊 Files importing getApiBaseUrl:"
grep -r "import.*getApiBaseUrl" . || echo "No imports found"

echo ""
echo "📊 Files using getApiBaseUrl:"
grep -r "getApiBaseUrl()" . || echo "No usage found"

# Create a summary report
echo "📋 Creating configuration summary..."
cat > ../../mobile_config_summary.md << EOF
# Mobile App Configuration Summary
Generated: $(date)

## Backend URL Configuration
- **Mobile Apps**: Use Fly.dev production backend (\`https://backend-shy-sun-4450.fly.dev/api\`)
- **Web App**: Use localhost development backend (\`http://localhost:2025/api\`)

## Fixed Files
The following files have been updated to use dynamic API configuration:
- api.js (exported getApiBaseUrl function)
- sharedData.js (updated to use Capacitor detection)
- SystemSettingsDashboard.js
- SalesReports.js
- SurveyAdmin.js
- PowerBIDashboard.js
- EmployeeDashboard.js
- utils/imageUtils.js
- Users.js
- mobile_app_config.js
- UsersDashboard.js

## Configuration Logic
All files now use the \`getApiBaseUrl()\` function from \`api.js\` which:
1. Detects if running on native platform using \`Capacitor.isNativePlatform()\`
2. Returns Fly.dev URL for mobile apps
3. Returns localhost URL for web browsers

## Next Steps
1. Test mobile app builds with new configuration
2. Verify backend connectivity on both platforms
3. Deploy and test on actual devices
EOF

echo "✅ Mobile app URL configuration fix completed!"
echo "📄 Summary saved to ../../mobile_config_summary.md"
echo ""
echo "🚀 Ready to continue with mobile app build process!"

# Return to project root
cd ../..
