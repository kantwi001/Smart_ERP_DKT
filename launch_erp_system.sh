#!/bin/bash

echo "🚀 Smart ERP System Launcher"
echo "============================"
echo ""
echo "Choose an option:"
echo "1. Start Web App (Port 3000)"
echo "2. Start Mobile App (Port 2026)"
echo "3. Build Mobile APK"
echo "4. Open iOS Project"
echo "5. Start Both (Web + Mobile)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "Starting Web App..."
        ./start_web_app.sh
        ;;
    2)
        echo "Starting Mobile App..."
        ./start_mobile_app.sh
        ;;
    3)
        echo "Building Mobile APK..."
        cd frontend && cp .env.mobile .env && npm run build:mobile && cd ..
        npx cap sync && npx cap build android
        ;;
    4)
        echo "Opening iOS Project..."
        open ios/App/App.xcworkspace
        ;;
    5)
        echo "Starting both apps..."
        ./start_web_app.sh &
        sleep 5
        ./start_mobile_app.sh &
        wait
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
