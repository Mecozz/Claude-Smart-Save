#!/bin/bash

# ============================================
# SMART SAVE V10.0 - COMPLETE STOP SCRIPT
# ============================================
# Stops everything and closes all windows
# ============================================

clear

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🛑 STOPPING SMART SAVE V10.0                        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "Stopping all processes and closing windows..."
echo ""

# Kill server
echo "🛑 Stopping server..."
lsof -ti:3737 | xargs kill -9 2>/dev/null

# Kill menu bar
echo "🛑 Stopping menu bar..."
pkill -f menubar.py 2>/dev/null

# Kill auto-memory watcher
echo "🛑 Stopping auto-memory extraction..."
pkill -f auto-memory-watcher.js 2>/dev/null

# Kill Claude
echo "🛑 Stopping Claude..."
pkill -f Claude 2>/dev/null

# Close Chrome windows (DevTools and inspect page)
echo "🛑 Closing Chrome windows..."
osascript <<'EOF'
tell application "Google Chrome"
    set windowList to windows
    repeat with w in windowList
        set windowName to name of w
        -- Close DevTools and inspect windows
        if windowName contains "DevTools" or windowName contains "inspect" or windowName contains "chrome://inspect" then
            close w
        end if
    end repeat
end tell
EOF

# Close Safari dashboard
echo "🛑 Closing Safari dashboard..."
osascript <<'EOF'
tell application "Safari"
    set windowList to windows
    repeat with w in windowList
        set windowURL to URL of current tab of w
        -- Close localhost:3737 tabs
        if windowURL contains "localhost:3737" then
            close w
        end if
    end repeat
end tell
EOF

# Close this Terminal window
echo ""
echo "✅ All Smart Save processes stopped!"
echo "✅ All windows closed!"
echo ""
echo "This window will close in 3 seconds..."
sleep 3

osascript -e 'tell application "Terminal" to close first window' &
exit 0
