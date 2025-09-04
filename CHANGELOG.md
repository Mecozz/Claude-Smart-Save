# CHANGELOG - Smart Save v10.0.5

## Version 10.0.5 - September 4, 2025

### 🎯 Major Fix: Claude Desktop App Compatibility

#### The Problem
- Smart Save wasn't working properly with the Claude Desktop App
- Word and token counts showed incorrect values (stuck at "16 words")
- Content wasn't being captured from conversations
- The selector `main[class*="conversation"]` didn't exist in the desktop app

#### The Solution
- Changed content selector from `main[class*="conversation"]` to `[data-testid*="message"]`
- This selector works in both Claude Desktop App and claude.ai web version
- Updated the `getConversationContent()` function in `claude-desktop-MAIN.js`

#### Technical Details
```javascript
// OLD (didn't work in desktop app):
const mainContent = document.querySelector('main[class*="conversation"]');
const messages = mainContent.querySelectorAll('[data-testid*="message"], [class*="message-content"], [class*="prose"]');

// NEW (works everywhere):
const messages = document.querySelectorAll('[data-testid*="message"]');
```

### ✅ What's Fixed
- Accurate word counting in Claude Desktop App
- Accurate token estimation
- Proper conversation capture
- Auto-save now works correctly
- Statistics display correctly in the indicator

### 📝 Files Modified
- `/Claude_AutoSave_FINAL/claude-desktop-MAIN.js` - Fixed selector
- `/Claude_AutoSave_FINAL/README.md` - Updated documentation
- Server automatically serves the fixed version at `http://localhost:3737/inject.js`

### 🚀 How to Use
1. Start the server with `START.command`
2. In Claude Desktop App, open Developer Tools (Cmd+Option+I)
3. Paste the injection script from `http://localhost:3737/inject.js`
4. Smart Save indicator will appear with correct statistics

### 🔄 Backwards Compatibility
- Still works with claude.ai in Chrome browser
- Chrome extension remains unchanged
- No breaking changes to existing saved files

---

## Previous Versions

### Version 10.0.4
- Fixed memory leaks in server
- Improved interval management

### Version 10.0.3  
- Fixed dangerous interval clearing
- Better cleanup on reload

### Version 10.0.2
- Fixed UTF-8 handling
- Improved logging

### Version 10.0.1
- Initial version with fingerprint matching
- Project folder organization