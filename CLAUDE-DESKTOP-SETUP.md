# Claude Desktop App - Quick Setup Guide

## Smart Save for Claude Desktop App

This guide will help you set up Smart Save to work with the Claude Desktop application.

## Prerequisites
- Claude Desktop App installed
- macOS (tested on this platform)
- Node.js installed

## Setup Steps

### 1. Start the Smart Save Server

Open Terminal and navigate to the Smart Save folder:
```bash
cd /Users/[your-username]/Documents/Smart-Save-V10.0.5/Claude_AutoSave_FINAL
```

Start the server:
```bash
./START.command
```

You should see:
```
✅ Server running at http://localhost:3737
📊 Dashboard: http://localhost:3737/dashboard
```

### 2. Inject Smart Save into Claude Desktop App

1. Open Claude Desktop App
2. Open Developer Tools:
   - Menu: View → Developer → Developer Tools
   - Or press: `Cmd + Option + I`
3. Click on the "Console" tab
4. Paste this code and press Enter:

```javascript
fetch('http://localhost:3737/inject.js')
    .then(response => response.text())
    .then(code => {
        eval(code);
        console.log('✅ Smart Save injected successfully!');
    })
    .catch(err => console.error('Failed to inject:', err));
```

### 3. Verify It's Working

You should see:
- An Auto-Save indicator appear in the Claude app showing:
  - Chat name
  - Project folder
  - Word count (accurate!)
  - Token count
  - Number of saves

### 4. Select a Project Folder

When you start a new conversation or switch chats:
- A popup will ask which project folder to save to
- Select from existing folders or create a new one
- Smart Save remembers your choice for each chat

## Files Are Saved To

```
/Documents/Smart-Save-V10.0.5/Claude_Conversations/Projects/[YourProjectName]/[ChatName].md
```

## Features in Desktop App

- ✅ Real-time word and token counting
- ✅ Automatic saving every 50+ character change
- ✅ Project organization
- ✅ No duplicate content
- ✅ Incremental saves (only new content)
- ✅ Dashboard at http://localhost:3737/dashboard

## Troubleshooting

### Indicator Not Showing
- Make sure server is running (check Terminal)
- Re-paste the injection code in console
- Check for errors in Developer Console

### Word Count Stuck
- You might be using an old version
- Restart the server
- Clear console and re-inject the script

### Not Saving
- Check the server log in Terminal
- Verify folder permissions
- Make sure you selected a project folder

## Auto-Start on Boot (Optional)

To have Smart Save start automatically:
1. Open System Preferences → Users & Groups
2. Click Login Items
3. Add `START.command` to the list

## Support

If you encounter issues:
1. Check `/Claude_AutoSave_FINAL/server.log`
2. Look for errors in the Developer Console
3. Verify server is running on port 3737

---

**Version**: 10.0.5  
**Last Updated**: September 4, 2025  
**Fixed**: Claude Desktop App compatibility