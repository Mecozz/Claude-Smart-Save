#!/bin/bash

# ============================================
# CLAUDE AUTO-SAVE V4 - COMPLETE AUTOMATION
# ============================================
# Final version with auto-minimize and dashboard
# ============================================

clear

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   CLAUDE AUTO-SAVE - MAIN VERSION (V4.3)    ║"
echo "║   ✅ FIXED: No edit markers, no duplicates   ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# Kill any existing processes
echo "🔄 Cleaning up..."
pkill -f Claude 2>/dev/null
lsof -ti:3737 | xargs kill -9 2>/dev/null
sleep 1

# Start server
echo "🚀 Starting save server V5..."
node claude-server-v5.js &
SERVER_PID=$!
echo "✅ Server running (PID: $SERVER_PID)"

sleep 2

# Start Claude in debug mode
echo "🖥️  Starting Claude Desktop..."
/Applications/Claude.app/Contents/MacOS/Claude --remote-debugging-port=9222 &
CLAUDE_PID=$!
echo "✅ Claude running (PID: $CLAUDE_PID)"

sleep 3

# Open Chrome inspect page
echo "🌐 Opening Chrome DevTools..."
open -a 'Google Chrome' 'chrome://inspect/#devices'

echo "⏳ Waiting for page to load..."
sleep 6

# Read the script file content
SCRIPT_CONTENT=$(cat "claude-desktop-MAIN.js")

# Copy to clipboard
echo "$SCRIPT_CONTENT" | pbcopy

echo "🤖 Auto-clicking inspect fallback and injecting..."

osascript << 'EOF'
tell application "Google Chrome"
    activate
end tell

tell application "System Events"
    tell process "Google Chrome"
        delay 2
        
        -- Step 1: Find and click "inspect fallback"
        keystroke "f" using {command down}
        delay 0.5
        
        keystroke "inspect fallback"
        delay 0.5
        
        key code 53 -- Escape
        delay 0.5
        
        keystroke return -- Click the highlighted link
        
        display notification "Opened DevTools" with title "✅ Step 1"
        
        -- Step 2: Wait for DevTools to open
        delay 4
        
        -- Step 3: Switch to Console tab
        keystroke "`" using {command down, option down}
        delay 1
        
        -- Step 4: Clear console
        keystroke "k" using {command down}
        delay 0.5
        
        -- Step 5: Paste the script (already in clipboard)
        keystroke "v" using {command down}
        delay 1
        keystroke return
        
        delay 3
        
        display notification "Auto-Save is now active! Dashboard opening..." with title "✅ Success!" subtitle "Select your project when prompted"
        
        -- Step 6: Close the DevTools tab
        keystroke "w" using {command down}
        delay 0.5
        
        -- Close the inspect page tab too
        keystroke "w" using {command down}
        delay 0.5
    end tell
end tell

-- Don't minimize Claude - just leave it ready to use
-- tell application "System Events"
--     tell process "Claude"
--         try
--             set visible to false
--         end try
--     end tell
-- end tell

-- Minimize Terminal
tell application "System Events"
    tell process "Terminal"
        try
            keystroke "m" using {command down}
        end try
    end tell
end tell

-- Open the dashboard in Chrome
tell application "Google Chrome"
    open location "http://localhost:3737/dashboard"
    activate
end tell
EOF

echo ""
echo "════════════════════════════════════════════════"
echo "✅ COMPLETE AUTOMATION SUCCESS!"
echo "════════════════════════════════════════════════"
echo ""
echo "📌 Auto-Save is running in the background!"
echo ""
echo "🎯 Dashboard is now open in Chrome"
echo "🖥️  Claude is minimized to dock (click to open)"
echo ""
echo "Press Ctrl+C here to stop everything"
echo ""

# Cleanup handler
trap 'echo ""; echo "Shutting down..."; kill $SERVER_PID $CLAUDE_PID 2>/dev/null; exit' INT

# Keep running
while true; do
    sleep 60
done