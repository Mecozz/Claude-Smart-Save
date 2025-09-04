# Smart Save v11.0 - Claude Auto-Save System

[![Version](https://img.shields.io/badge/version-11.0-green)](https://github.com/yourusername/smart-save-claude)
[![Platform](https://img.shields.io/badge/platform-macOS-blue)](https://github.com/yourusername/smart-save-claude)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)

## 🚀 Overview

Smart Save is an intelligent auto-save system for Claude Desktop App and claude.ai that continuously saves your conversations, organizes them by projects, and prevents data loss. Never lose a conversation again!

### ✨ Key Features

- 🤖 **Works with Claude Desktop App AND claude.ai**
- 💾 **Real-time auto-save** every 25+ characters
- 📁 **Project-based organization** - Each conversation saved to its own folder
- 🚫 **Duplicate prevention** with smart fingerprinting
- 📊 **Live statistics** - Word count, token tracking, save counter
- 🧠 **Memory extraction** - Automatically builds knowledge graph from conversations
- 📈 **Web dashboard** at localhost:3737
- 🍎 **Menu bar control** for easy start/stop

## 📋 Requirements

- macOS 11.0 or later
- Node.js 14.0 or later
- Claude Desktop App or Google Chrome (for claude.ai)
- 100MB free disk space

## 🎯 Quick Start

### Automatic Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-save-claude.git
cd smart-save-claude

# Install dependencies automatically
npm install

# Start Smart Save
npm start
```

### Manual Installation

1. **Download the latest release** from [Releases](https://github.com/yourusername/smart-save-claude/releases)
2. **Extract** to your Documents folder
3. **Install dependencies**: Open Terminal in the folder and run `npm install`
4. **Start**: Double-click `START.command` or run `npm start`

## 🖥️ Usage

### For Claude Desktop App

1. **Start Smart Save**: Run `START.command` or `npm start`
2. **Open Claude Desktop App** 
3. **Open Developer Tools**: View → Developer → Developer Tools (Cmd+Option+I)
4. **Smart Save auto-injects** and shows the indicator
5. **Select a project folder** when prompted
6. Your conversations are automatically saved!

### For claude.ai (Web)

1. **Install Chrome Extension**: 
   - Open Chrome
   - Go to chrome://extensions/
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
2. **Start Smart Save**: Run `START.command`
3. **Visit claude.ai** - Smart Save auto-injects
4. Select project folders as needed

## 📂 File Structure

```
Smart-Save-V11.0/
├── Claude_AutoSave_FINAL/     # Core server files
│   ├── claude-server-v5.js    # Main server
│   ├── claude-desktop-MAIN.js # Client script
│   ├── START.command          # Quick start script
│   └── dashboard.html         # Web dashboard
├── chrome-extension/          # Chrome extension
├── Claude_Conversations/     # Your saved conversations
│   ├── Projects/             # Organized by project
│   ├── Daily/               # Daily conversations
│   ├── Archived/            # Archived chats
│   └── Backups/             # Automatic backups
└── package.json             # Dependencies
```

## 🛠️ Configuration

### Change Save Location
Edit `Claude_AutoSave_FINAL/config.json`:
```json
{
  "conversationsPath": "./Claude_Conversations",
  "minChangeSize": 25,
  "saveInterval": 1000
}
```

### Adjust Save Frequency
- **Minimum characters**: Default 25 (decrease for more frequent saves)
- **Check interval**: Default 1000ms (1 second)

## 📊 Dashboard

Access the web dashboard at [http://localhost:3737/dashboard](http://localhost:3737/dashboard) to view:
- Total conversations and word count
- Project statistics
- Recent saves
- Memory extraction progress
- Search across all conversations

## 🔧 Troubleshooting

### Smart Save not appearing
1. Ensure server is running (check Terminal)
2. Refresh Claude Desktop/Web page
3. Check Developer Console for errors
4. Re-run the injection script

### Word count incorrect
- The app shows visible content only due to virtual scrolling
- Check actual file size in `Claude_Conversations/Projects/`
- Files are complete even if indicator shows partial count

### Server won't start
- Check if port 3737 is in use: `lsof -i:3737`
- Kill existing process: `kill -9 [PID]`
- Restart with `START.command`

## 🔐 Privacy & Security

- **All conversations stay local** - Never uploaded anywhere
- **GitHub ignores conversation files** - `.gitignore` configured
- **No telemetry or tracking**
- **Your data is yours**

## 📝 Version History

### v11.0 (Current)
- Fixed Claude Desktop App compatibility
- Improved word/token counting accuracy
- Better memory extraction
- Cleaned up codebase
- Auto-dependency installation

### v10.0.5
- Added fingerprint deduplication
- Fixed memory leaks
- Improved save reliability

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- Built with Claude's assistance for the Claude community
- Thanks to all testers and contributors

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/smart-save-claude/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/smart-save-claude/discussions)

---

**Never lose a Claude conversation again!** 🚀