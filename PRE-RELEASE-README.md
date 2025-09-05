# Smart Save v11.1.0-beta.1 Pre-Release

## ⚠️ BETA VERSION - TESTING NEEDED

This is a **pre-release version** for testing the new professional installer and update system. 

**Please help test and report any issues!**

## 🧪 What's New in This Beta

### Professional Installer (`npm run setup`)
- ✨ Interactive component selection with descriptions
- 📦 Required vs optional components
- 📁 Customizable installation paths
- 🔄 Automatic update checking system
- 💾 Safe update downloads (never overwrites)

## 🎯 Testing Instructions

### For Fresh Install Testing

```bash
# 1. Clone the beta
git clone https://github.com/Mecozz/Claude-Smart-Save.git
cd Claude-Smart-Save

# 2. Checkout the beta tag
git checkout v11.1.0-beta.1

# 3. Run the new installer
npm run setup
```

### For Update Testing

If you have v11.0.0 installed:
```bash
# The installer should detect your existing installation
npm run setup
# Choose: 📦 Update/Add Components
```

## 📋 Please Test These Features

### Critical Tests
- [ ] Does `npm run setup` launch successfully?
- [ ] Can you select/deselect optional components?
- [ ] Do installation paths work correctly?
- [ ] Does it install selected MCP tools?
- [ ] Does update checking work?

### Component Tests
- [ ] Memory Server installation
- [ ] GitHub integration
- [ ] Desktop Commander
- [ ] Update notifications

### Path Customization
- [ ] Custom installation directory
- [ ] Custom conversation storage
- [ ] Backup directory creation

## 🐛 How to Report Issues

Please report any bugs or feedback:
1. [Create an issue](https://github.com/Mecozz/Claude-Smart-Save/issues)
2. Include:
   - Your OS version
   - Node.js version (`node -v`)
   - Error messages
   - Steps to reproduce

## ⏰ Beta Period

- **Start**: Today
- **End**: 48-72 hours
- **Full Release**: v11.1.0 after testing

## 🔧 Known Issues

- None yet - you tell us!

## 💡 Quick Rollback

If something goes wrong:
```bash
# Go back to stable v11.0.0
git checkout v11.0.0
npm install
npm start
```

## 🙏 Thanks for Testing!

Your feedback helps make Smart Save better for everyone.

---

**Note**: This is a pre-release. Use v11.0.0 for production use.
