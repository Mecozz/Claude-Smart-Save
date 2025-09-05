#!/bin/bash

# Quick test script for Mac mini
echo "🧪 Testing Smart Save v11.1.0-beta.1 Installation"
echo "================================================"
echo ""

# Clean up any previous test
if [ -d "Claude-Smart-Save-Test" ]; then
    echo "🧹 Cleaning up previous test..."
    rm -rf Claude-Smart-Save-Test
fi

# Clone fresh
echo "📥 Cloning repository..."
git clone https://github.com/Mecozz/Claude-Smart-Save.git Claude-Smart-Save-Test
cd Claude-Smart-Save-Test

# Checkout beta
echo "🏷️  Checking out v11.1.0-beta.1..."
git checkout v11.1.0-beta.1

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🚀 Running installer..."
npm run installer

echo ""
echo "✅ Test complete!"
