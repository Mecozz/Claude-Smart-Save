#!/bin/bash

echo "🔧 Injecting Smart Save extension into Claude.ai..."

# Read the extension JavaScript
SCRIPT_PATH="$(dirname "$0")/claude-desktop-MAIN.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: claude-desktop-MAIN.js not found!"
    exit 1
fi

# Use AppleScript to inject the extension
osascript <<EOF
tell application "Google Chrome"
    set found to false
    
    -- Find Claude.ai tab
    repeat with w in windows
        repeat with t in tabs of w
            if URL of t contains "claude.ai" then
                set active tab index of w to index of t
                set found to true
                exit repeat
            end if
        end repeat
        if found then exit repeat
    end repeat
    
    if not found then
        -- Open Claude.ai if not found
        tell window 1
            set newTab to make new tab with properties {URL:"https://claude.ai"}
            