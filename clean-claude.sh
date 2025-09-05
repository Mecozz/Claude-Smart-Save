#!/bin/bash

# Complete Claude Desktop Cleanup Script
# This removes ALL Claude Desktop files for a clean reinstall

echo "🧹 Complete Claude Desktop Cleanup"
echo "=================================="
echo ""
echo "This will remove:"
echo "  • Claude app (if in Applications)"
echo "  • All configuration files"
echo "  • All cache files"
echo "  • All preferences"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo "📦 Removing Claude Desktop app..."
rm -rf /Applications/Claude.app
rm -rf ~/Applications/Claude.app

echo "🗑️  Emptying trash..."
osascript -e 'tell application "Finder" to empty trash' 2>/dev/null || true

echo "📁 Removing configuration files..."
rm -rf ~/Library/Application\ Support/Claude/

echo "⚙️  Removing preferences..."
rm -f ~/Library/Preferences/com.anthropic.claude.plist
rm -f ~/Library/Preferences/com.anthropic.claude.*.plist

echo "🗄️  Removing caches..."
rm -rf ~/Library/Caches/com.anthropic.claude/
rm -rf ~/Library/Caches/Claude/

echo "💾 Removing saved state..."
rm -rf ~/Library/Saved\ Application\ State/com.anthropic.claude.savedState/

echo "🔍 Removing any remaining files..."
find ~/Library -name "*claude*" -type f -delete 2>/dev/null || true
find ~/Library -name "*Claude*" -type d -exec rm -rf {} + 2>/dev/null || true

echo ""
echo "✅ Claude Desktop completely removed!"
echo ""
echo "You can now reinstall Claude Desktop fresh."
echo "Download from: https://claude.ai/download"
