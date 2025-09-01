#!/bin/bash

# Fix TypeScript Dependency Conflict Script
# Resolves react-scripts@5.0.1 compatibility issue with TypeScript 5.x

echo "🔧 Fixing TypeScript dependency conflict..."

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Step 1: Remove existing node_modules and package-lock.json
echo "📦 Cleaning existing dependencies..."
rm -rf node_modules package-lock.json

# Step 2: Update TypeScript version in package.json
echo "📝 Updating TypeScript version to 4.9.5..."
sed -i '' 's/"typescript": "\^5\.9\.2"/"typescript": "^4.9.5"/' package.json

# Step 3: Install dependencies with legacy peer deps to handle any remaining conflicts
echo "🔄 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Step 4: Verify installation
echo "✅ Verifying installation..."
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "✅ Dependencies installed successfully!"
    
    # Check TypeScript version
    echo "📋 Checking TypeScript version..."
    npx tsc --version
    
    echo ""
    echo "🎉 TypeScript dependency conflict resolved!"
    echo "📌 You can now run: npm start"
    echo ""
else
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi

# Step 5: Optional - Test build
echo "🧪 Testing build process..."
npm run build:web

if [ $? -eq 0 ]; then
    echo "✅ Build test successful!"
else
    echo "⚠️  Build test failed, but dependencies are installed. You may need to fix code issues."
fi

echo ""
echo "🏁 Frontend is ready to start!"
echo "💡 Run: npm start (for web) or npm run start:mobile (for mobile)"
