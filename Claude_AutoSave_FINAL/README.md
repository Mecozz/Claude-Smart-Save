# Smart Save - Claude Desktop App Compatible! 

## Overview
An intelligent auto-save system for **Claude Desktop App** and Claude.ai (web) that continuously saves conversations without duplicates, organizing them by project folders. Features menu bar control for easy start/stop.

🆕 **FIXED (v10.0.5)**: Now fully compatible with Claude Desktop App! Word/token counting and auto-save work perfectly.

[![Version](https://img.shields.io/badge/version-10.0.5-green)](https://github.com/Mecozz/Claude-Smart-Save/releases/latest)
[![Platform](https://img.shields.io/badge/platform-macOS-blue)](https://github.com/Mecozz/Claude-Smart-Save)
[![License](https://img.shields.io/badge/license-MIT-orange)](https://github.com/Mecozz/Claude-Smart-Save/blob/main/LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-Mecozz%2FClaude--Smart--Save-black)](https://github.com/Mecozz/Claude-Smart-Save)

## Current Status ✅
- **Claude Desktop App Support** - Fixed selector issues for desktop app
- **Accurate word/token counting** - Shows real conversation statistics  
- **Menu bar functional** - SS 🔴/🟢 indicator with full control
- **Clean installation** - Only essential files remain
- **V10.0.5 fixes applied** - Desktop app compatibility, accurate stats

## Quick Start 🚀

### Just One Command!
```bash
./START.command
```

This single command will:
1. ✅ Start the Smart Save server
2. ✅ Launch Claude Desktop App
3. ✅ Auto-inject Smart Save
4. ✅ Start memory extraction (if available)
5. ✅ Show menu bar indicator (SS icon)
6. ✅ Open the dashboard
7. ✅ Handle everything automatically!

### To Stop Everything
Press `Ctrl+C` in the Terminal window

### Manual Setup (if needed)
For Claude.ai web users or manual injection, see the detailed setup below.

## Features ✨

- **🖥️ Claude Desktop App Compatible**: Full support with accurate word/token counting
- **🌐 Claude.ai Web Support**: Works with Chrome extension
- **🟢 Menu Bar Control**: SS 🔴 (stopped) / SS 🟢 (running)
- **💾 Smart Auto-Save**: Saves every 50+ character change
- **📁 Project Organization**: Each chat saved to its own folder
- **🚫 No Duplicates**: Smart fingerprint matching prevents duplicates
- **📊 Web Dashboard**: View stats at `localhost:3737/dashboard`
- **🔄 Incremental Saves**: Only saves changes, not entire conversation
- **📈 Accurate Statistics**: Real word count, token tracking, and context window usage

## File Structure 📂

```
/Claude_AutoSave_FINAL/
├── Essential Commands (2):
│   ├── START_MENUBAR.command       # Menu bar control
│   └── START_FINAL_AUTOMATION.command  # Direct start
│
├── Core Files (5):
│   ├── menubar.py                  # Menu bar app
│   ├── claude-desktop-MAIN.js      # V9.0 client script
│   ├── claude-server-v5.js         # Server (V5.1 fixed)
│   ├── dashboard.html              # Web interface
│   └── README.md                   # This file
│
├── Dependencies:
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
└── Backup:
    └── PRODUCTION_V9.0/            # Protected backup
```

## Saved Conversations 💬

```
~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations/Projects/
├── Smart Save/
│   └── 2025-09-03_Chat_001_Smart_Save_Project_Review.md
├── General/
│   └── [Other chats organized by project]
```

## Menu Bar Functions 🎮

Click "SS 🔴" or "SS 🟢" in menu bar to access:
- **▶️ Start Auto-Save** - Starts server, Claude, dashboard
- **🛑 Stop Auto-Save** - Stops everything cleanly
- **📊 Open Dashboard** - View word counts and stats
- **📁 Open Save Folder** - Access saved conversations
- **Quit Menu Bar** - Close menu bar app only

## Console Commands 🖥️

In Chrome DevTools Console (Claude tab):
- `checkSave()` - View current status
- `saveNow()` - Force immediate save
- `changeFolder()` - Change folder for current chat
- `stopSave()` - Stop auto-save

## How It Works 🔧

1. **Chat Detection**: Reads chat name from Claude window title
2. **Smart Fingerprinting**: Creates ID from first 1000 chars
3. **50% Matching**: Prevents duplicates with similarity threshold
4. **Server Detection**: Finds existing files by name
5. **Incremental Saves**: Only appends new content

## Troubleshooting 🔨

### Menu bar shows but can't click items?
- Restart menu bar: `pkill -f menubar.py` then run `START_MENUBAR.command`

### Word count seems too high?
- Old duplicate files may exist - check and delete any abnormally large .md files

### Menu bar not appearing?
- Make sure rumps and requests are installed: `pip3 install rumps requests --user`
- Run directly: `python3 menubar.py` in the Claude_AutoSave_FINAL folder

### Need to start over?
- Delete saved conversations in Projects folder
- Clear localStorage in Console:
```javascript
localStorage.removeItem('chat_fingerprints_v7');
localStorage.removeItem('chat_folders_v7');
```

## Version History 📚

### v9.0.5 (Current)
- Fixed indicator stats to show actual saved file word counts
- Indicator now fetches real stats from server like dashboard
- No more inflated word counts in the floating indicator
- Stats now match between indicator and dashboard

### v9.0.4
- Fixed dropdown closing issue in folder selection modal
- Added event propagation stoppers to prevent interference
- Modal now pauses monitoring while open
- Improved modal stability and user experience

### v9.0.1
- Fixed menu bar icon issue (removed emoji from icon parameter)
- Menu items now properly clickable
- Removed unnecessary try/except blocks
- Clean structure with only essential files

### v9.0 
- Initial production release
- Smart fingerprinting system
- Server file detection by name
- Menu bar control added

## Technical Details 🛠️

- **Client**: JavaScript injection (claude-desktop-MAIN.js)
- **Server**: Node.js Express on port 3737
- **Menu Bar**: Python rumps application (menubar.py)
- **Storage**: iCloud Drive with local filesystem
- **Fingerprinting**: 50% similarity threshold
- **Dependencies**: Node.js, Python 3, rumps, requests

## GitHub Repository 🌐

- **Repository**: https://github.com/Mecozz/Claude-Smart-Save
- **Latest Release**: https://github.com/Mecozz/Claude-Smart-Save/releases/latest
- **Issues**: https://github.com/Mecozz/Claude-Smart-Save/issues

## Known Issues & Solutions ✅

All major issues have been resolved:
- ✅ Claude Desktop App compatibility - Fixed with correct message selectors
- ✅ Word/token counting inaccurate - Fixed selector for desktop app
- ✅ Duplicate files - Fixed with fingerprint matching
- ✅ Chat_002, Chat_003 creation - Server now finds files by name
- ✅ Menu bar not appearing - Fixed icon initialization
- ✅ Menu items not clickable - Fixed with proper MenuItem creation
- ✅ JavaScript errors - Removed problematic console operations

## Troubleshooting 🔧

### Claude Desktop App Issues
- **Indicator shows wrong word count**: Make sure you're using v10.0.5 - restart server and re-inject script
- **Not saving**: Check Developer Console for errors, ensure server is running on port 3737
- **Script injection fails**: Copy script from `http://localhost:3737/inject.js` and paste in console

### General Issues  
- **Server not starting**: Check if port 3737 is in use
- **Files not appearing**: Check `/Claude_Conversations/Projects/` folder
- **Dashboard not loading**: Visit `http://localhost:3737/dashboard`

## Author & License 📄

Developed with Claude's assistance for the Claude community.
MIT License - Free to use and modify.

---

**Status**: Production Ready  
**Version**: 10.0.5  
**Last Updated**: September 4, 2025
**Compatibility**: Claude Desktop App & Claude.ai (Web)