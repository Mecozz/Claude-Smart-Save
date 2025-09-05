# Claude Smart Save - Clean Installation Structure

## 📁 Everything in ONE Folder!

After installation, your Documents folder stays clean with just ONE folder:

```
Documents/
└── Claude-Smart-Save/              # <- Only ONE folder in Documents!
    ├── Claude_AutoSave_FINAL/      # Core Smart Save files
    │   ├── claude-server-v5.js     # Main server
    │   ├── claude-desktop-MAIN.js  # Desktop app integration
    │   └── config.json             # Configuration
    │
    ├── chrome-extension/           # Browser extension files
    │   ├── manifest.json
    │   └── inject.js
    │
    ├── Conversations/              # All your saved chats
    │   ├── Projects/              # Organized by project
    │   │   ├── ProjectA/
    │   │   └── ProjectB/
    │   ├── Daily/                 # Today's conversations
    │   └── Archived/              # Older conversations
    │
    ├── Backups/                   # Automatic backups
    │   └── backup-2025-09-04/
    │
    ├── logs/                      # System logs
    │   └── smartsave.log
    │
    ├── package.json               # Dependencies
    ├── README.md                  # Documentation
    └── check-updates.js           # Update checker
```

## 🎯 Benefits of This Structure

1. **Clean Documents Folder** - Only ONE folder added
2. **Self-Contained** - Everything in one place
3. **Easy to Find** - No hunting for scattered files
4. **Easy to Remove** - Delete one folder to uninstall
5. **Easy to Backup** - Copy one folder to backup everything
6. **No Confusion** - Clear organization

## 🚀 Starting Smart Save

Since everything is in one folder:

```bash
cd ~/Documents/Claude-Smart-Save
npm start
```

## 📦 What Goes Where

| Content | Location |
|---------|----------|
| Core files | `Claude-Smart-Save/Claude_AutoSave_FINAL/` |
| Saved chats | `Claude-Smart-Save/Conversations/` |
| Backups | `Claude-Smart-Save/Backups/` |
| Logs | `Claude-Smart-Save/logs/` |
| Extension | `Claude-Smart-Save/chrome-extension/` |

## 🗑️ Clean Uninstall

To completely remove Smart Save:

```bash
# That's it! Just delete the one folder:
rm -rf ~/Documents/Claude-Smart-Save
```

No scattered files to hunt down!

## 🔄 Moving or Backing Up

To move Smart Save to another computer:

```bash
# Just copy the entire folder:
cp -r ~/Documents/Claude-Smart-Save /path/to/backup/
```

Everything stays together and organized!
