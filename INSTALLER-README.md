# Smart Save v11.0 - Professional Installation Guide

## 🚀 Quick Start (New Users)

```bash
# 1. Clone or download the repository
git clone https://github.com/Mecozz/Claude-Smart-Save.git
cd Claude-Smart-Save

# 2. Run the setup wizard
./setup.sh
# OR
npm run setup
```

That's it! The installer will guide you through everything.

## 📦 Professional Installer Features

### Intelligent Component Selection
The installer presents components in categories:

**✅ Required Components** (automatically installed)
- Smart Save Core - Auto-saves all conversations
- Chrome Extension - For claude.ai support
- Local Server - Handles file operations

**🎯 Optional Components** (you choose)
- 🧠 **Memory Server** [RECOMMENDED] - Knowledge graph for conversations
- 🐙 **GitHub Integration** [RECOMMENDED] - Manage repos directly in Claude  
- 💻 **Desktop Commander** [RECOMMENDED] - Control your computer
- 🗄️ **SQLite Database** - Database management
- 🌐 **Puppeteer** - Web automation
- 🔔 **Update Notifier** [RECOMMENDED] - Get alerts for new versions
- 📊 **Menu Bar App** - macOS system tray monitoring

### Customizable Installation Paths
- **Default**: Everything goes in your Documents folder
- **Custom**: Choose exactly where to install:
  - Installation directory
  - Conversations storage
  - Backup location

### Smart Update System
- **Never overwrites your installation** - Updates download to new folders
- **Automatic checking** - Daily, weekly, or monthly
- **Non-intrusive notifications** - Small alerts when updates available
- **Safe migration** - Copy your data to new versions
- **Backup creation** - Keep your old setup just in case

## 🔄 Update Management

### How Updates Work

1. **Notification**: When an update is available, you'll see:
   ```
   🎉 Smart Save v11.1.0 is available! (Current: v11.0.0)
   Run 'npm run update' to see what's new
   ```

2. **Safe Download**: Updates download to a NEW folder:
   - Current: `~/Documents/Claude-Smart-Save`
   - Update: `~/Documents/Claude-Smart-Save-v11.1.0`

3. **Your Choice**: 
   - Download to new folder (recommended)
   - View release notes on GitHub
   - Skip the update

4. **Data Migration**: Optionally copy your conversations and settings

### Manual Update Check
```bash
npm run update
```

### Disable Update Checks
Run the installer and choose "Reconfigure Settings":
```bash
npm run setup
# Select: ⚙️ Reconfigure Settings
# Select: 🔄 Update preferences
# Choose: Don't check for updates
```

## 🛠️ Installation Options

### Method 1: Interactive Wizard (Recommended)
```bash
npm run setup
```
- User-friendly prompts
- Visual feedback
- Automatic configuration

### Method 2: Quick Install with Defaults
```bash
# Skip all prompts, use defaults
npm install
npm start
```

### Method 3: Custom Configuration
```bash
node smart-save-installer.js
# Choose: 🆕 New Installation
# Then customize everything
```

## 📁 File Structure After Installation

```
Documents/
├── Claude-Smart-Save/          # Main installation
│   ├── Claude_AutoSave_FINAL/  # Core files
│   ├── chrome-extension/       # Browser extension
│   ├── check-updates.js        # Update checker
│   └── package.json           # Dependencies
│
├── Claude_Conversations/       # Your saved chats
│   ├── Projects/              # Organized by project
│   ├── Daily/                 # Today's conversations
│   └── Archived/              # Older conversations
│
└── Claude_Backups/            # Backup storage
    └── smart-save-backup-*/   # Timestamped backups
```

## 🔧 Configuration File

The installer creates `~/.smart-save-config.json`:

```json
{
  "installPath": "/Users/you/Documents/Claude-Smart-Save",
  "conversationsPath": "/Users/you/Documents/Claude_Conversations",
  "backupsPath": "/Users/you/Documents/Claude_Backups",
  "checkForUpdates": true,
  "updateCheckInterval": "daily",
  "installedVersion": "11.0.0",
  "installedComponents": ["memory", "github", "desktop-commander"],
  "githubRepo": "Mecozz/Claude-Smart-Save"
}
```

## 🎯 Common Scenarios

### "I want everything in one place"
Use the default installation - everything goes in Documents

### "I want conversations on my external drive"
Choose custom paths during installation:
- Conversations: `/Volumes/MyDrive/Claude`

### "I modified the code and don't want updates"
Disable update checking in the installer settings

### "I want to try the beta version"
```bash
git clone -b beta https://github.com/Mecozz/Claude-Smart-Save.git
```

## 🆘 Troubleshooting

### Installer won't run
```bash
# Make sure you have Node.js
node --version  # Should be 14.0.0 or higher

# Install dependencies
npm install
```

### MCP tools not working in Claude
1. Restart Claude Desktop after installation
2. Check the config file:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

### Updates not being detected
```bash
# Manual check
npm run update

# Reset update settings
rm ~/.smart-save-config.json
npm run setup
```

## 📝 Advanced Usage

### Add Components Later
```bash
npm run setup
# Choose: 📦 Update/Add Components
```

### Change Installation Paths
```bash
npm run setup
# Choose: ⚙️ Reconfigure Settings
# Choose: 📁 Change installation paths
```

### Migrate to New Computer
1. Copy `~/.smart-save-config.json` to new computer
2. Copy your `Claude_Conversations` folder
3. Run `npm run setup` on new computer

## 🔐 Security

- **No auto-execution**: Installer asks before making changes
- **Local only**: No data sent to external servers
- **Backup creation**: Old versions preserved
- **Path validation**: Prevents installation in system directories
- **Update verification**: Downloads only from official GitHub repo

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Mecozz/Claude-Smart-Save/issues)
- **Updates**: Watch the repo for release notifications
- **Discussions**: [GitHub Discussions](https://github.com/Mecozz/Claude-Smart-Save/discussions)

---

Made with ❤️ for the Claude community
