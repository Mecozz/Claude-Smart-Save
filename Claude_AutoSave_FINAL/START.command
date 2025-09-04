#!/bin/bash

# ============================================
# SMART SAVE V10.0.5 - UNIFIED START
# ============================================
# One command to start everything!
# ============================================

clear

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║          🚀 SMART SAVE V10.0.5                       ║"
echo "║          Claude Desktop App Compatible                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# PID tracking directory
PID_DIR="$HOME/.smart_save_pids"
mkdir -p "$PID_DIR"

# Clean up any old processes
echo "🧹 Cleaning up old processes..."

# Kill old processes if they exist
if [ -f "$PID_DIR/server.pid" ]; then
    OLD_PID=$(cat "$PID_DIR/server.pid")
    kill "$OLD_PID" 2>/dev/null
    rm "$PID_DIR/server.pid"
fi

if [ -f "$PID_DIR/menubar.pid" ]; then
    OLD_PID=$(cat "$PID_DIR/menubar.pid")
    kill "$OLD_PID" 2>/dev/null
    rm "$PID_DIR/menubar.pid"
fi

if [ -f "$PID_DIR/memory.pid" ]; then
    OLD_PID=$(cat "$PID_DIR/memory.pid")
    kill "$OLD_PID" 2>/dev/null
    rm "$PID_DIR/memory.pid"
fi

# Kill anything on port 3737
lsof -ti:3737 | xargs kill -9 2>/dev/null

# Kill specific processes
pkill -f "claude-server-v5.js" 2>/dev/null
pkill -f "menubar.py.*Smart Save" 2>/dev/null
pkill -f "auto-memory-bridge.js" 2>/dev/null

sleep 1

# Start the save server
echo "🚀 Starting Smart Save server..."
node claude-server-v5.js &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_DIR/server.pid"
echo "   ✅ Server running (PID: $SERVER_PID)"

sleep 2

# Start memory bridge if it exists
if [ -f "auto-memory-bridge.js" ]; then
    echo "🧠 Starting memory extraction..."
    node auto-memory-bridge.js &
    MEMORY_PID=$!
    echo "$MEMORY_PID" > "$PID_DIR/memory.pid"
    echo "   ✅ Memory bridge running (PID: $MEMORY_PID)"
    sleep 1
fi

# Start menu bar
echo "📊 Starting menu bar indicator..."
python3 menubar.py &
MENUBAR_PID=$!
echo "$MENUBAR_PID" > "$PID_DIR/menubar.pid"
echo "   ✅ Menu bar running (PID: $MENUBAR_PID)"

sleep 1

# Start Claude Desktop
echo "🖥️  Starting Claude Desktop App..."
/Applications/Claude.app/Contents/MacOS/Claude --remote-debugging-port=9222 &
CLAUDE_PID=$!
echo "$CLAUDE_PID" > "$PID_DIR/claude.pid"
echo "   ✅ Claude running (PID: $CLAUDE_PID)"

sleep 3

# Open Chrome DevTools
echo "🌐 Opening Chrome DevTools..."
open -a 'Google Chrome' 'chrome://inspect/#devices'

sleep 6

# Copy injection script to clipboard
SCRIPT_CONTENT=$(cat "claude-desktop-MAIN.js")
echo "$SCRIPT_CONTENT" | pbcopy

echo "🤖 Auto-injecting Smart Save..."

# Auto-click and inject
osascript << 'EOF'
tell application "Google Chrome"
    activate
end tell

tell application "System Events"
    tell process "Google Chrome"
        delay 2
        
        -- Search for inspect link
        keystroke "f" using {command down}
        delay 0.5
        keystroke "inspect fallback"
        delay 0.5
        key code 53 -- Escape
        delay 0.5
        keystroke return
        
        -- Wait for DevTools
        delay 4
        
        -- Go to Console
        keystroke "`" using {command down, option down}
        delay 1
        
        -- Clear and paste
        keystroke "k" using {command down}
        delay 0.5
        keystroke "v" using {command down}
        delay 1
        keystroke return
        
        delay 3
        
        display notification "Smart Save is ready!" with title "✅ Success!" subtitle "Auto-save active"
        
        -- Close DevTools
        delay 1
        keystroke "w" using {command down}
        delay 0.5
        keystroke "w" using {command down}
    end tell
end tell

-- Open dashboard
tell application "Safari"
    delay 1
    open location "http://localhost:3737/dashboard"
    activate
end tell

-- Minimize Terminal
tell application "System Events"
    tell process "Terminal"
        try
            keystroke "m" using {command down}
        end try
    end tell
end tell
EOF

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ SMART SAVE IS RUNNING!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📍 Server: http://localhost:3737"
echo "📊 Dashboard: http://localhost:3737/dashboard"
echo "🟢 Menu Bar: Look for 'SS' icon"
echo "💾 Auto-Save: Active in Claude"

if [ ! -z "$MEMORY_PID" ]; then
    echo "🧠 Memory: Extracting knowledge"
fi

echo ""
echo "📁 Saves to: Claude_Conversations/Projects/"
echo ""
echo "To stop: Press Ctrl+C"
echo ""

# Save all PIDs
echo "$SERVER_PID" > "$PID_DIR/all.pids"
[ ! -z "$MEMORY_PID" ] && echo "$MEMORY_PID" >> "$PID_DIR/all.pids"
echo "$MENUBAR_PID" >> "$PID_DIR/all.pids"
echo "$CLAUDE_PID" >> "$PID_DIR/all.pids"

# Cleanup handler
cleanup() {
    echo ""
    echo "Shutting down Smart Save..."
    
    if [ -f "$PID_DIR/all.pids" ]; then
        while read pid; do
            kill "$pid" 2>/dev/null
        done < "$PID_DIR/all.pids"
        rm "$PID_DIR/all.pids"
    fi
    
    rm -f "$PID_DIR"/*.pid
    echo "✅ Smart Save stopped"
    exit
}

trap cleanup INT

# Keep running and monitor
while true; do
    sleep 30
    
    # Restart server if it crashes
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "⚠️  Server crashed, restarting..."
        node claude-server-v5.js &
        SERVER_PID=$!
        echo "$SERVER_PID" > "$PID_DIR/server.pid"
    fi
    
    # Restart memory if it exists and crashes
    if [ ! -z "$MEMORY_PID" ] && ! kill -0 $MEMORY_PID 2>/dev/null; then
        echo "⚠️  Memory bridge crashed, restarting..."
        node auto-memory-bridge.js &
        MEMORY_PID=$!
        echo "$MEMORY_PID" > "$PID_DIR/memory.pid"
    fi
    
    # Restart menu bar if it crashes
    if ! kill -0 $MENUBAR_PID 2>/dev/null; then
        echo "⚠️  Menu bar crashed, restarting..."
        python3 menubar.py &
        MENUBAR_PID=$!
        echo "$MENUBAR_PID" > "$PID_DIR/menubar.pid"
    fi
done
