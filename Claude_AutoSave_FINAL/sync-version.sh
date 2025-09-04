#!/bin/bash

# Smart-Save Version Synchronizer (Shell wrapper)
# Automatically updates all version numbers to match desired version
# Usage: ./sync-version.sh [new_version]

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Python script exists
if [ ! -f "$SCRIPT_DIR/sync-version.py" ]; then
    echo "❌ Error: sync-version.py not found in $SCRIPT_DIR"
    exit 1
fi

# Pass all arguments to the Python script
python3 "$SCRIPT_DIR/sync-version.py" "$@"

# Check if the Python script succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Test your changes: ./START.command"
    echo "   2. If everything works, rename your folder to match the new version"
    echo "   3. Update any external documentation or references"
else
    echo "❌ Version synchronization failed"
    exit 1
fi
