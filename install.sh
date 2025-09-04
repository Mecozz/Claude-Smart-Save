#!/bin/bash

# Smart Save v11.0 - Installation Script
echo "╔═══════════════════════════════════════════════╗"
echo "║     SMART SAVE v11.0 - INSTALLATION          ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Install npm dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p Claude_Conversations/Projects
mkdir -p Claude_Conversations/Daily
mkdir -p Claude_Conversations/Archived
mkdir -p Claude_Conversations/Backups

# Create .gitkeep files to preserve structure
touch Claude_Conversations/.gitkeep
touch Claude_Conversations/Projects/.gitkeep
touch Claude_Conversations/Daily/.gitkeep
touch Claude_Conversations/Archived/.gitkeep
touch Claude_Conversations/Backups/.gitkeep

# Make command files executable
echo ""
echo "🔧 Setting permissions..."
chmod +x Claude_AutoSave_FINAL/*.command

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║     ✅ INSTALLATION COMPLETE!                ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "To start Smart Save:"
echo "  1. Run: ./Claude_AutoSave_FINAL/START.command"
echo "  2. Or: npm start"
echo ""
echo "Dashboard will be available at:"
echo "  http://localhost:3737/dashboard"
echo ""