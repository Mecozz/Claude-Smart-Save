# Version Management System

This system automatically synchronizes all version numbers throughout your Smart-Save project when you change the folder name or want to increment the version.

## 🎯 Problem Solved

Previously, version numbers were scattered across multiple files:
- `config.json` - Main version reference
- `package.json` - NPM package version  
- `VERSION.txt` - Version documentation
- `claude-server-v5.js` - Fallback version constant
- `claude-desktop-MAIN.js` - Header comment
- `menubar.py` - Header comment
- `README.md` - Multiple version references

When you wanted to release V10.0.6, you'd have to manually update 6+ files. Now you just run one command!

## 🚀 Quick Start

### Method 1: Auto-detect from folder name
```bash
# If your folder is named Smart-Save-V10.0.6, just run:
python3 sync-version.py

# Or use the shell wrapper:
./sync-version.sh
```

### Method 2: Specify version manually
```bash
# Update to version 10.0.6:
python3 sync-version.py 10.0.6

# Or with V prefix:
python3 sync-version.py V10.0.6

# Using shell wrapper:
./sync-version.sh 10.0.6
```

## 📋 What Gets Updated

The script updates these files automatically:

1. **config.json** - `"version": "10.0.6"`
2. **package.json** - `"version": "10.0.6"`  
3. **VERSION.txt** - First line becomes `10.0.6`
4. **claude-server-v5.js** - Updates fallback: `const VERSION = config.version || '10.0.6';`
5. **claude-desktop-MAIN.js** - Header: `// CLAUDE AUTO-SAVE V10.0.6 - STABLE VERSION`
6. **menubar.py** - Header: `# SMART SAVE MENU BAR V10.0.6 - STABLE`
7. **README.md** - Multiple version references throughout

## 🔄 Workflow for New Versions

1. **Plan your version**: Decide on next version (e.g., 10.0.6)

2. **Run sync script**:
   ```bash
   python3 sync-version.py 10.0.6
   ```

3. **Test everything**:
   ```bash
   ./START.command
   # Test menu bar, dashboard, saving, etc.
   ```

4. **Rename project folder**:
   ```bash
   # From: Smart-Save-V10.0.5
   # To:   Smart-Save-V10.0.6
   ```

5. **Update external references** (if any):
   - GitHub releases
   - Documentation
   - Installation guides

## 📁 Folder Naming Convention

The auto-detection feature works with these folder name patterns:
- `Smart-Save-V10.0.6` ✅ (recommended)
- `Smart-Save-v10.0.6` ✅  
- `V10.0.6` ✅
- `v10.0.6` ✅
- `10.0.6` ✅

## ✨ Features

- **Auto-detection**: Reads version from parent folder name
- **Validation**: Ensures version format is X.Y.Z
- **Safe updates**: Uses proper JSON parsing for config files
- **Regex-based**: Smart pattern matching for code comments
- **Error handling**: Reports which files couldn't be updated
- **Summary**: Shows exactly what was changed

## 🛠 Technical Details

### Files Modified:
- **JSON files**: Uses `json.load()` and `json.dump()` for safe parsing
- **Text files**: Uses regex replacements to update version strings
- **Python/JavaScript**: Updates version in comments and constants

### Regex Patterns Used:
```python
# JavaScript header comments
r'// CLAUDE AUTO-SAVE V\d+\.\d+\.\d+ - STABLE VERSION'

# Python header comments  
r'# SMART SAVE MENU BAR V\d+\.\d+\.\d+ - STABLE'

# Fallback version constants
r"const VERSION = config\.version \|\| '[^']+'"

# README badges and text
r'version-\d+\.\d+\.\d+-green'
r'\*\*V\d+\.\d+\.\d+ fixes applied\*\*'
```

## 🔍 Verification

After running the sync script, you can verify all versions match:

```bash
# Check config.json
grep version config.json

# Check package.json  
grep version package.json

# Check VERSION.txt
head -1 VERSION.txt

# Check server fallback
grep "const VERSION" claude-server-v5.js

# Check client header
head -1 claude-desktop-MAIN.js

# Check menubar header
head -4 menubar.py | tail -1
```

## 🎉 Example Output

```
🔄 Synchronizing all versions to: 10.0.6
==================================================
✅ Updated config.json
✅ Updated package.json
✅ Updated VERSION.txt
✅ Updated claude-server-v5.js fallback version
✅ Updated claude-desktop-MAIN.js header
✅ Updated menubar.py header
✅ Updated README.md
==================================================
🎉 Successfully synchronized 7 files to version 10.0.6

📁 You can now rename your project folder to: Smart-Save-V10.0.6
```

## 🚨 Important Notes

1. **Backup first**: Always have a backup before running version sync
2. **Test after**: Run your full test suite after version updates
3. **Single source of truth**: config.json is the primary version source
4. **Consistent naming**: Keep your folder names consistent with the pattern

## 🤝 Integration with Git

If using Git, a typical workflow might be:
```bash
# 1. Sync versions
python3 sync-version.py 10.0.6

# 2. Test everything
./START.command

# 3. Commit changes
git add .
git commit -m "Version bump to 10.0.6"

# 4. Tag release
git tag v10.0.6

# 5. Rename folder
mv Smart-Save-V10.0.5 Smart-Save-V10.0.6
```

This version management system ensures consistency across your entire Smart-Save project and makes releasing new versions as simple as running a single command!
