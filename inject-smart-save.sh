#!/bin/bash

# Smart Save Console Injection Script
# Ensures we're in the Console tab, not Elements

echo "╔════════════════════════════════════════════════════════╗"
echo "║     🚀 SMART SAVE - CONSOLE INJECTION                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "This script will:"
echo "1. Open Claude Desktop"
echo "2. Open Developer Tools"
echo "3. Switch to Console tab (not Elements!)"
echo "4. Inject Smart Save"
echo ""

# Check if server is running
echo "🔍 Checking if Smart Save server is running..."
if curl -s http://localhost:3737/health > /dev/null 2>&1; then
    echo "✅ Server is running"
else
    echo "❌ Server not running! Start it first with: npm start"
    exit 1
fi

echo ""
echo "📱 Opening Claude Desktop..."

# Use AppleScript to control Claude
osascript <<'EOF'
tell application "Claude"
    activate
end tell

delay 1

tell application "System Events"
    tell process "Claude"
        set frontmost to true
        
        -- Open Developer Tools
        keystroke "i" using {option down, command down}
        delay 2
        
        -- CRITICAL: Switch from Elements to Console tab
        -- Method 1: Keyboard shortcut to Console
        keystroke "]" using {command down}  -- Next tab
        delay 0.5
        keystroke "]" using {command down}  -- Console is usually 2nd tab
        delay 0.5
        
        -- Method 2: Direct Console shortcut (some versions)
        key code 53  -- Escape to show console drawer
        delay 0.5
        
        -- Method 3: Click Console tab if visible
        -- This requires accessibility permissions
        try
            click menu item "Console" of menu "View" of menu bar 1
        end try
        delay 0.5
        
        -- Focus the console input area
        -- Click at bottom of window where console input usually is
        keystroke "l" using {control down}  -- Clear and focus console
        delay 0.5
        
        -- Type the injection command
        set injectionCmd to "fetch('http://localhost:3737/inject-script').then(r => r.text()).then(eval);"
        keystroke injectionCmd
        delay 0.5
        
        -- Press Enter to execute
        key code 36  -- Return key
    end tell
end tell

delay 2

-- Check if injection worked by looking for the indicator
tell application "Claude"
    activate
end tell

display notification "Check Claude for the Smart Save indicator" with title "Smart Save" subtitle "Injection Complete"
EOF

echo ""
echo "✅ Injection command sent!"
echo ""
echo "⚠️  IMPORTANT: Check Claude for the Smart Save indicator"
echo ""
echo "If you DON'T see the Smart Save indicator:"
echo ""
echo "1. Make sure Developer Tools is open (Cmd+Option+I)"
echo "2. Click the 'Console' tab (NOT Elements!)"
echo "3. Click in the console input area (at the bottom, after '>')"
echo "4. Paste this command:"
echo ""
echo "   fetch('http://localhost:3737/inject-script').then(r => r.text()).then(eval);"
echo ""
echo "5. Press Enter"
echo ""
echo "The Console tab looks like this:"
echo "   [Elements] [Console] [Sources] [Network]"
echo "              ^^^^^^^^"
echo "           Click here!"
echo ""

exit 0
