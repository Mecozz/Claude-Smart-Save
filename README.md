# Smart Save V9.0 🚀

An intelligent auto-save system for Claude Desktop that continuously saves your conversations without duplicates, organizing them by project folders.

![Status](https://img.shields.io/badge/version-9.0-green)
![Platform](https://img.shields.io/badge/platform-macOS-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## Features ✨

- **🟢 Menu Bar Control**: Start/stop everything from a simple menu bar icon
- **💾 Smart Auto-Save**: Saves every 50+ character change automatically
- **📁 Project Organization**: Each chat saved to its own folder
- **🚫 No Duplicates**: Smart fingerprinting prevents duplicate saves
- **📊 Web Dashboard**: View all projects and stats at `localhost:3737`
- **🔄 Incremental Saves**: Only saves changes, not entire conversation repeatedly
- **📈 Token Tracking**: Shows remaining context window

## One-Click Installation 🎯

1. **Download this repository**
2. **Double-click `INSTALL.command`**
3. **Follow the prompts**

That's it! The installer will:
- Check all requirements
- Install missing dependencies
- Set up Smart Save
- Start the menu bar control

## Requirements ✅

The installer automatically checks and installs:
- macOS (required)
- Claude Desktop app
- Google Chrome
- Node.js
- Python 3
- Required packages (express, cors, rumps, etc.)

## How to Use 🎮

### After installation:
1. Look for **🔴** or **🟢** in your menu bar (top-right)
2. Click it to see options:
   - **▶️ Start Auto-Save** - Begins monitoring Claude
   - **🛑 Stop Auto-Save** - Stops everything cleanly
   - **📊 Open Dashboard** - View stats and projects
   - **📁 Open Save Folder** - Access your saved conversations

### First time using:
- When you open a chat in Claude, a popup asks which folder to save to
- Choose existing folder or create new one
- Smart Save remembers this mapping forever

## File Structure 📂

```
Smart-Save-V9/
├── INSTALL.command          # One-click installer
├── START_MENUBAR.command    # Manual menu bar start
├── menubar.py              # Menu bar control app
├── claude-desktop-MAIN.js  # Client-side script
├── claude-server-v5.js     # Server backend
├── dashboard.html          # Web interface
└── package.json           # Node dependencies
```

## Saved Conversations 💬

Conversations are saved to:
```
~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations/Projects/
├── Project_Name/
│   └── 2025-01-15_Chat_001_Chat_Name.md
├── General/
│   └── 2025-01-15_Chat_001_Random_Topic.md
```

## How It Works 🔧

1. **Chat Detection**: Reads chat name from Claude window
2. **Smart Fingerprinting**: Creates unique ID from first 1000 chars
3. **Incremental Saves**: Only appends new content
4. **No Duplicates**: 50% similarity matching prevents duplicates

## Console Commands 🖥️

Open Chrome DevTools Console in Claude and use:

| Command | Description |
|---------|-------------|
| `checkSave()` | View current status |
| `saveNow()` | Force immediate save |
| `changeFolder()` | Change folder for current chat |
| `stopSave()` | Stop auto-save |

## Troubleshooting 🔨

### Menu bar icon not appearing?
Run `START_MENUBAR.command` manually

### Auto-save not working?
1. Click menu bar icon
2. Select "Stop Auto-Save"
3. Select "Start Auto-Save"

### Need to reinstall?
Just run `INSTALL.command` again

## Technical Details 🛠️

- **Client**: JavaScript injection into Claude Desktop
- **Server**: Node.js Express server on port 3737
- **Menu Bar**: Python rumps application
- **Storage**: Local filesystem with iCloud sync support

## License 📄

MIT License - Feel free to use and modify!

## Author 👤

Developed with Claude's assistance for the Claude community.

---

**Questions?** Open an issue on GitHub!
**Love it?** Give it a ⭐!