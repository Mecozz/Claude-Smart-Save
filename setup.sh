#!/bin/bash

# Smart Save Professional Setup Script
# This script guides users through the installation process

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║     🚀 CLAUDE SMART SAVE v11.0 - SETUP WIZARD        ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "⚠️  Node.js version $NODE_VERSION is installed"
    echo "   Version 14.0.0 or higher is recommended"
    echo ""
fi

echo "✅ Prerequisites check passed"
echo ""

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if this is first run
if [ ! -f "$HOME/.smart-save-config.json" ]; then
    echo "🆕 First time setup detected"
    echo ""
    echo "This wizard will help you:"
    echo "  • Choose installation paths"
    echo "  • Select optional MCP tools and integrations"
    echo "  • Configure automatic updates"
    echo "  • Set up Claude Desktop with your selected tools"
    echo ""
    read -p "Press Enter to continue..."
    echo ""
fi

# Run the installer
node smart-save-installer.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "To start Smart Save, run:"
    echo "  npm start"
    echo ""
else
    echo ""
    echo "❌ Setup encountered an issue"
    echo "Please check the error messages above"
    echo ""
fi
