# Smart Save v11.0 - Claude Auto-Save System

[![Version](https://img.shields.io/badge/version-11.0-brightgreen)](https://github.com/Mecozz/Claude-Smart-Save)
[![Platform](https://img.shields.io/badge/platform-macOS-blue)](https://github.com/Mecozz/Claude-Smart-Save)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![Status](https://img.shields.io/badge/status-active-success)](https://github.com/Mecozz/Claude-Smart-Save)

## 🚀 Never Lose a Claude Conversation Again!

Smart Save is an intelligent auto-save system that continuously saves your Claude conversations, preventing data loss from refreshes, crashes, or accidental closes. Works with both Claude Desktop App and claude.ai.

### ✨ Key Features

- 🤖 **Dual Support** - Works with Claude Desktop App AND claude.ai  
- 💾 **Real-time Auto-save** - Saves every 25 characters typed
- 📁 **Smart Organization** - Automatic project-based folder structure
- 📊 **Live Statistics** - Track words, tokens (up to 200k), and saves
- 🧠 **Memory Extraction** - Builds knowledge graph from conversations
- 🚫 **Duplicate Prevention** - Smart fingerprinting avoids redundant saves
- 📈 **Web Dashboard** - Beautiful interface at localhost:3737
- 🍎 **Menu Bar Control** - Easy start/stop from macOS menu bar
- 🔒 **Privacy First** - All data stays local on your machine

## 📋 Requirements

- macOS 11.0 or later
- Node.js 14.0 or later  
- Claude Desktop App or Google Chrome (for claude.ai)
- 100MB free disk space

## 🎯 Quick Start

### Installation (30 seconds)

```bash
# Clone the repository
git clone https://github.com/Mecozz/Claude-Smart-Save.git
cd Claude-Smart-Save

# Install dependencies
npm install

# Start Smart Save
npm start
```

That's it! Smart Save is now running.

## 🖥️ Usage Instructions

### For Claude Desktop App

1. **Start Smart Save** - Run `npm start` or double-click `START.command`
2. **Open Claude Desktop App**
3. **Open Developer Tools** - View → Developer → Developer Tools (Cmd+Option+I)
4. **Auto-injection happens** - You'll see the Smart Save indicator
5. **Choose a project folder** when prompted
6. All conversations auto-save from now on!

### For claude.ai (Web Browser)

1. **Install Chrome Extension**:
   - Open Chrome → Settings → Extensions
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `chrome-extension` folder
2. **Start Smart Save** - Run `npm start`
3. **Visit claude.ai** - Smart Save auto-activates
4. Select project folders as needed

## 📂 How Your Conversations Are Organized

```
Claude_Conversations/
├── Projects/           # Your project folders
│   ├── ProjectName/    # Each project gets its own folder
│   │   └── Chat.md    # Conversations saved as markdown
├── Daily/             # Today's conversations
├── Archived/          # Older conversations
└── Backups/           # Automatic backups
```

## 📊 Web Dashboard

Access the beautiful dashboard at [http://localhost:3737/dashboard](http://localhost:3737/dashboard)

<img width="1512" alt="Dashboard Screenshot" src="https://github.com/user-attachments/assets/dashboard-preview.png">

### Dashboard Features:
- Total word count across all conversations
- Project statistics and organization
- Recent saves with timestamps
- Memory extraction progress
- Search across all conversations
- Export capabilities

## 🛠️ Configuration

### Change Save Location
Edit `Claude_AutoSave_FINAL/config.json`:
```json
{
  "conversationsPath": "./Claude_Conversations",
  "minChangeSize": 25,
  "saveInterval": 1000,
  "maxTokens": 200000
}
```

### Adjust Auto-save Sensitivity
- **Minimum characters**: Default 25 (lower = more frequent saves)
- **Check interval**: Default 1000ms (1 second)
- **Token limit**: Default 200,000 (Claude's context window)

## 🔧 Troubleshooting

<details>
<summary><b>Smart Save indicator not appearing?</b></summary>

1. Ensure server is running (check Terminal for "Server running at port 3737")
2. Refresh Claude Desktop/browser page
3. Check Developer Console for errors
4. Try manual injection:
   ```bash
   ./Claude_AutoSave_FINAL/inject-extension.command
   ```
</details>

<details>
<summary><b>Word count seems incorrect?</b></summary>

- Claude Desktop uses virtual scrolling (only shows visible portion)
- Check actual file sizes in `Claude_Conversations/Projects/`
- Files are complete even if indicator shows partial count
</details>

<details>
<summary><b>Server won't start?</b></summary>

1. Check if port 3737 is in use:
   ```bash
   lsof -i:3737
   ```
2. Kill existing process:
   ```bash
   kill -9 [PID]
   ```
3. Restart Smart Save
</details>

## 🚀 Advanced Features

### Memory Extraction
Smart Save automatically builds a knowledge graph from your conversations:
- Extracts people, concepts, and relationships
- Creates searchable memory database
- Access via dashboard or API

### API Access
```javascript
// Get conversation statistics
fetch('http://localhost:3737/api/stats')

// Search conversations
fetch('http://localhost:3737/api/search?q=your+query')

// Get project data
fetch('http://localhost:3737/api/project/ProjectName/stats')
```

## 🔐 Privacy & Security

- **100% Local** - No data ever leaves your machine
- **No Analytics** - Zero tracking or telemetry
- **No Cloud** - Everything stays on your computer
- **Open Source** - Audit the code yourself
- **Git Ignored** - Conversations excluded from repository

## 📝 Version History

### v11.0 (Current - Released Sept 2025)
- Complete rewrite for performance
- Real-time token tracking up to 200k
- Auto-dependency installation
- Enhanced memory extraction
- Improved project detection
- Better error handling

### Previous Versions
- v10.0.5 - Memory leak fixes
- v9.3.0 - Desktop app support
- v9.0 - Initial public release

See [CHANGELOG.md](CHANGELOG.md) for full history

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)  
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Credits

- Built with Claude's assistance for the Claude community
- Special thanks to all contributors and testers
- Inspired by the need to never lose valuable AI conversations

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/Mecozz/Claude-Smart-Save/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Mecozz/Claude-Smart-Save/discussions)
- **Updates**: Watch this repository for updates

---

<p align="center">
  <b>Never lose a Claude conversation again!</b><br>
  Made with ❤️ for the Claude community
</p>

<p align="center">
  <a href="https://github.com/Mecozz/Claude-Smart-Save/stargazers">⭐ Star this project if it helps you!</a>
</p>