# Claude Smart Save v11.1.0 - Installation Guide

## 🚀 Quick Install (Recommended)

### Step 1: Download or Clone
```bash
# Option A: Clone from GitHub
git clone https://github.com/Mecozz/Claude-Smart-Save.git
cd Claude-Smart-Save

# Option B: Download ZIP from Releases
# Extract and cd into the folder
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Quick Setup
```bash
npm run setup
```
This automatically:
- ✅ Creates configuration
- ✅ Sets up folder structure
- ✅ Detects Claude Desktop
- ✅ Installs MCP tools (if Claude Desktop found)

### Step 4: Start Smart Save
```bash
npm start
```

## 📝 What to Expect

### First Run
You'll see security prompts on macOS:
1. **Terminal** - Allow accessibility access → Click "Allow"
2. **Node.js** - Allow incoming connections → Click "Allow"
3. Follow the on-screen instructions

### With Claude Desktop
1. Open Claude Desktop
2. Press `Cmd+Option+I` to open Developer Tools
3. Click **Console** tab (NOT Elements!)
4. Smart Save auto-injects

### With claude.ai (Web)
1. Load Chrome extension from `chrome-extension` folder
2. Go to claude.ai
3. Smart Save activates automatically

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Quick setup (recommended) |
| `npm run setup-advanced` | Advanced installer with options |
| `npm start` | Start with security guidance |
| `npm run inject` | Manual injection helper |
| `npm run permissions` | Check/fix macOS permissions |
| `npm run reset` | Clean reset of configuration |

## 📁 Installation Structure

Everything goes in ONE folder:
```
Documents/Claude-Smart-Save/
├── Conversations/          # Your saved chats
│   ├── Projects/
│   ├── Daily/
│   └── Archived/
├── Backups/               # Automatic backups
├── logs/                  # System logs
└── Claude_AutoSave_FINAL/ # Core files
```

## 🔧 Troubleshooting

### If Injection Fails
```bash
# Option 1: Run injection helper
npm run inject

# Option 2: Manual injection in Console
fetch('http://localhost:3737/inject-script').then(r => r.text()).then(eval);
```

### Permission Issues (macOS)
```bash
# Check and fix permissions
npm run permissions
```

### Complete Reset
```bash
# Remove everything and start fresh
npm run reset
npm run setup
```

## 🎯 Key Features

- **Auto-Save**: Every conversation saved automatically
- **Clean Install**: Everything in one folder
- **Smart Detection**: Works with Claude Desktop or claude.ai
- **MCP Support**: Desktop Commander for computer control
- **Security Aware**: Handles macOS permissions gracefully

## 📊 Dashboard

Once running, visit: http://localhost:3737/dashboard

## 🆘 Support

- GitHub Issues: https://github.com/Mecozz/Claude-Smart-Save/issues
- Documentation: https://github.com/Mecozz/Claude-Smart-Save

---

**Note**: The advanced installer (`npm run setup-advanced`) has update checking disabled by default to prevent issues with extracted versions.
