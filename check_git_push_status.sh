#!/bin/bash

echo "🔍 Checking Git Push Status"
echo "=========================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Current Git Status:"
git status

echo ""
echo "2️⃣ Last Commit:"
git log --oneline -1

echo ""
echo "3️⃣ Branch Status:"
git status -sb

echo ""
echo "4️⃣ Checking if local is ahead of remote:"
git fetch --dry-run 2>&1
FETCH_STATUS=$?

if [ $FETCH_STATUS -eq 0 ]; then
    echo "✅ Successfully connected to remote repository"
else
    echo "⚠️  Could not connect to remote repository"
fi

echo ""
echo "5️⃣ Comparing local vs remote:"
git log --oneline origin/main..HEAD

if [ $? -eq 0 ] && [ -z "$(git log --oneline origin/main..HEAD)" ]; then
    echo "✅ All changes have been pushed to GitHub!"
    echo "🎉 Your repository is up to date"
else
    echo "⚠️  You have unpushed commits"
    echo "📤 Run './push_to_github.sh' to push changes"
fi
