#!/bin/bash

# Quick Dashboard Tester
# This script tests if the dashboard can load projects properly

echo "🔍 Testing Smart-Save Dashboard Projects Loading..."
echo "================================================"

# Check if server is running
echo "1. Checking if server is running on port 3737..."
if curl -s http://localhost:3737/api/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running - starting it..."
    echo "   Please run: ./START.command"
    exit 1
fi

# Test projects API
echo ""
echo "2. Testing /api/projects endpoint..."
PROJECTS_RESPONSE=$(curl -s http://localhost:3737/api/projects)
echo "Raw API Response:"
echo "$PROJECTS_RESPONSE" | python3 -m json.tool

# Count projects
PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
projects = data.get('projects', data if isinstance(data, list) else [])
print(len(projects))
")

echo ""
echo "3. Results:"
echo "   Projects found: $PROJECT_COUNT"

if [ "$PROJECT_COUNT" -gt "0" ]; then
    echo "   ✅ Projects API is working correctly"
    echo ""
    echo "4. Opening dashboard in browser..."
    echo "   Dashboard URL: http://localhost:3737/dashboard"
    
    # Try to open in browser
    if command -v open > /dev/null; then
        open http://localhost:3737/dashboard
        echo "   ✅ Dashboard opened in browser"
    else
        echo "   🌐 Please manually open: http://localhost:3737/dashboard"
    fi
    
    echo ""
    echo "💡 If you still don't see projects in the dashboard:"
    echo "   1. Open browser's Developer Tools (F12)"
    echo "   2. Check the Console tab for any errors"
    echo "   3. Look for the debug logs: 'Projects data:' and 'Projects loaded successfully:'"
    echo ""
    echo "📊 Expected to see:"
    echo "$PROJECTS_RESPONSE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
projects = data.get('projects', [])
for p in projects:
    print(f'   • {p[\"name\"]}: {p.get(\"files\", p.get(\"chats\", 0))} files, {p.get(\"words\", p.get(\"totalWords\", 0)):,} words')
    "
    
else
    echo "   ❌ No projects found - check your Projects folder:"
    echo "   ~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations/Projects/"
fi

echo ""
echo "================================================"
