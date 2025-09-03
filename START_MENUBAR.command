#!/bin/bash

# ============================================
# SMART SAVE MENU BAR LAUNCHER
# ============================================
# Starts persistent menu bar control
# ============================================

clear

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   🟢 SMART SAVE MENU BAR CONTROL              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Starting Menu Bar app..."
echo ""
echo "Look for 🔴 or 🟢 in your menu bar (top-right)"
echo ""
echo "Click it to:"
echo "  • Start/Stop Auto-Save"
echo "  • Open Dashboard"
echo "  • Open Save Folder"
echo "  • Stop EVERYTHING (Claude, server, Terminal)"
echo ""
echo "This window will close in 5 seconds..."
echo "Menu bar will keep running."

# Start the menu bar app in background
osascript SmartSaveMenuBar.applescript > /dev/null 2>&1 &

sleep 5