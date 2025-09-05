#!/bin/bash

# Smart Save - macOS Security Setup Helper
# This script helps users configure the necessary permissions

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║     🔐 SMART SAVE - SECURITY PERMISSIONS SETUP        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Smart Save needs certain permissions to work properly."
echo ""

# Function to open System Preferences
open_security_prefs() {
    echo "📱 Opening System Preferences..."
    open "x-apple.systempreferences:com.apple.preference.security?Privacy"
}

# Check if Terminal has accessibility access
check_accessibility() {
    echo "🔍 Checking Accessibility permissions..."
    
    # Try to use osascript to check
    if osascript -e 'tell application "System Events" to return true' &>/dev/null; then
        echo "✅ Accessibility access: GRANTED"
        return 0
    else
        echo "❌ Accessibility access: DENIED"
        echo ""
        echo "   To fix:"
        echo "   1. System Preferences > Security & Privacy > Privacy"
        echo "   2. Click 'Accessibility' in the left sidebar"
        echo "   3. Click the lock 🔒 and enter your password"
        echo "   4. Add Terminal (or iTerm) to the list"
        echo "   5. Check the checkbox ☑️"
        echo ""
        return 1
    fi
}

# Check if Node can accept connections
check_firewall() {
    echo "🔍 Checking Firewall settings..."
    
    # Check if firewall is enabled
    if sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate | grep -q "disabled"; then
        echo "✅ Firewall: DISABLED (connections allowed)"
        return 0
    else
        echo "⚠️  Firewall: ENABLED"
        echo "   Node.js will need permission to accept connections"
        echo "   Click 'Allow' when prompted"
        echo ""
        return 0
    fi
}

# Main flow
echo "Starting permission checks..."
echo ""

# Check each permission
NEED_FIX=false

if ! check_accessibility; then
    NEED_FIX=true
fi

check_firewall

if [ "$NEED_FIX" = true ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    read -p "Open System Preferences to fix permissions? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open_security_prefs
        echo ""
        echo "👉 After granting permissions:"
        echo "   1. Close System Preferences"
        echo "   2. Run: npm start"
        echo ""
    fi
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ All permissions look good!"
    echo ""
    echo "You can now run: npm start"
    echo ""
fi

# Additional instructions
echo "📝 When you run Smart Save for the first time:"
echo ""
echo "1. You may see a popup:"
echo "   'Do you want to allow incoming network connections?'"
echo "   → Click 'Allow'"
echo ""
echo "2. If using Claude Desktop:"
echo "   • Open Claude Desktop"
echo "   • Open Developer Tools (Cmd+Option+I)"
echo "   • Smart Save will auto-inject"
echo ""
echo "3. If injection fails:"
echo "   • Grant all permissions"
echo "   • Restart Smart Save"
echo "   • Try manual injection (instructions will be shown)"
echo ""

exit 0
