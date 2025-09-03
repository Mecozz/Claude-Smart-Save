#!/bin/bash

# ============================================
# SMART SAVE V9.0 - ONE-CLICK INSTALLER
# ============================================
# Checks requirements and installs everything
# ============================================

set -e  # Exit on any error

clear

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   SMART SAVE V9.0 - AUTOMATED SETUP                   ║"
echo "║   Auto-save system for Claude Desktop                 ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check function
check_requirement() {
    if eval "$2" &>/dev/null; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1"
        return 1
    fi
}

echo "═══════════════════════════════════════════════"
echo "CHECKING SYSTEM REQUIREMENTS"
echo "═══════════════════════════════════════════════"
echo ""

MISSING_DEPS=false

# 1. Check macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${GREEN}✅${NC} macOS detected"
else
    echo -e "${RED}❌${NC} This installer is for macOS only"
    exit 1
fi

# 2. Check Claude Desktop
if [ -d "/Applications/Claude.app" ]; then
    echo -e "${GREEN}✅${NC} Claude Desktop installed"
else
    echo -e "${YELLOW}⚠️${NC}  Claude Desktop not found"
    echo "   Download from: https://claude.ai/download"
    MISSING_DEPS=true
fi

# 3. Check Google Chrome
if [ -d "/Applications/Google Chrome.app" ]; then
    echo -e "${GREEN}✅${NC} Google Chrome installed"
else
    echo -e "${YELLOW}⚠️${NC}  Google Chrome not found"
    echo "   Download from: https://www.google.com/chrome/"
    MISSING_DEPS=true
fi

# 4. Check Node.js
if command -v node &>/dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅${NC} Node.js installed ($NODE_VERSION)"
else
    echo -e "${RED}❌${NC} Node.js not installed"
    echo -e "${YELLOW}   Installing Node.js via Homebrew...${NC}"
    
    # Check for Homebrew
    if ! command -v brew &>/dev/null; then
        echo "   Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install node
    echo -e "${GREEN}✅${NC} Node.js installed"
fi

# 5. Check Python 3
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅${NC} Python 3 installed ($PYTHON_VERSION)"
else
    echo -e "${RED}❌${NC} Python 3 not installed"
    echo -e "${YELLOW}   Installing Python 3...${NC}"
    brew install python3
    echo -e "${GREEN}✅${NC} Python 3 installed"
fi

# 6. Check pip3
if command -v pip3 &>/dev/null; then
    echo -e "${GREEN}✅${NC} pip3 installed"
else
    echo -e "${YELLOW}⚠️${NC}  pip3 not found, installing..."
    python3 -m ensurepip --upgrade
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "INSTALLING SMART SAVE"
echo "═══════════════════════════════════════════════"
echo ""

# Get the directory where script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Install Node dependencies
echo "📦 Installing Node packages..."
npm install express cors body-parser --save

# Install Python packages for menu bar
echo ""
echo "📦 Installing Python packages for menu bar..."
pip3 install rumps requests pyobjc --quiet --user

# Make all scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x *.command
chmod +x *.py

# Create save directory structure
echo ""
echo "📁 Creating save directories..."
SAVE_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations"
mkdir -p "$SAVE_DIR/Projects/General"
echo "   Save location: $SAVE_DIR"

echo ""
echo "═══════════════════════════════════════════════"
echo -e "${GREEN}✅ INSTALLATION COMPLETE!${NC}"
echo "═══════════════════════════════════════════════"
echo ""
echo "Smart Save V9.0 is ready to use!"
echo ""
echo "HOW TO USE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. START THE MENU BAR CONTROL:"
echo "   Double-click: START_MENUBAR.command"
echo "   (or run: ./START_MENUBAR.command)"
echo ""
echo "2. LOOK FOR THE ICON IN YOUR MENU BAR:"
echo "   🔴 = Stopped"
echo "   🟢 = Running"
echo ""
echo "3. CLICK THE ICON TO:"
echo "   ▶️  Start Auto-Save"
echo "   🛑 Stop Auto-Save"
echo "   📊 Open Dashboard"
echo "   📁 Open Save Folder"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Would you like to start Smart Save now? (y/n)"
read -n 1 -r START_NOW
echo ""

if [[ $START_NOW =~ ^[Yy]$ ]]; then
    echo "Starting Smart Save menu bar..."
    ./START_MENUBAR.command &
    echo ""
    echo -e "${GREEN}✅ Smart Save menu bar started!${NC}"
    echo "Look for 🔴 in your menu bar (top-right)"
    echo "Click it and select 'Start Auto-Save'"
else
    echo "To start later, run: ./START_MENUBAR.command"
fi

echo ""
echo "Press any key to close..."
read -n 1