#!/usr/bin/env python3
"""
Smart-Save Version Synchronizer
Automatically updates all version numbers to match the project folder name
Usage: python3 sync-version.py [new_version]
If no version provided, extracts from parent folder name (e.g., Smart-Save-V10.0.6)
"""

import os
import re
import json
import sys
from pathlib import Path

def extract_version_from_folder():
    """Extract version from parent folder name like Smart-Save-V10.0.5"""
    current_dir = Path(__file__).parent.parent
    folder_name = current_dir.name
    
    # Match patterns like Smart-Save-V10.0.5, V10.0.5, or 10.0.5
    version_match = re.search(r'[Vv]?(\d+\.\d+\.\d+)', folder_name)
    if version_match:
        return version_match.group(1)
    
    print(f"❌ Could not extract version from folder name: {folder_name}")
    print("   Expected format: Smart-Save-V10.0.5")
    return None

def update_json_file(file_path, version):
    """Update version in JSON files (config.json, package.json)"""
    if not os.path.exists(file_path):
        return False
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data['version'] = version
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False

def update_file_content(file_path, replacements):
    """Update version strings in text files using regex replacements"""
    if not os.path.exists(file_path):
        return False, []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes = []
        
        for pattern, replacement in replacements:
            matches = re.findall(pattern, content)
            if matches:
                content = re.sub(pattern, replacement, content)
                changes.extend(matches)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes
        
        return False, []
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False, []

def sync_all_versions(new_version):
    """Synchronize all version references to the new version"""
    script_dir = Path(__file__).parent
    
    print(f"🔄 Synchronizing all versions to: {new_version}")
    print("=" * 50)
    
    changes_made = 0
    
    # 1. Update config.json
    config_path = script_dir / 'config.json'
    if update_json_file(config_path, new_version):
        print(f"✅ Updated config.json")
        changes_made += 1
    
    # 2. Update package.json  
    package_path = script_dir / 'package.json'
    if update_json_file(package_path, new_version):
        print(f"✅ Updated package.json")
        changes_made += 1
    
    # 3. Update VERSION.txt
    version_txt = script_dir / 'VERSION.txt'
    if version_txt.exists():
        try:
            with open(version_txt, 'r') as f:
                content = f.read()
            
            # Update the version number on the first line
            lines = content.split('\n')
            if lines:
                lines[0] = new_version
                
            with open(version_txt, 'w') as f:
                f.write('\n'.join(lines))
            
            print(f"✅ Updated VERSION.txt")
            changes_made += 1
        except Exception as e:
            print(f"❌ Error updating VERSION.txt: {e}")
    
    # 4. Update claude-server-v5.js (VERSION constant fallback)
    server_path = script_dir / 'claude-server-v5.js'
    replacements = [
        (r"const VERSION = config\.version \|\| '[^']+';", 
         f"const VERSION = config.version || '{new_version}';")
    ]
    updated, changes = update_file_content(server_path, replacements)
    if updated:
        print(f"✅ Updated claude-server-v5.js fallback version")
        changes_made += 1
    
    # 5. Update claude-desktop-MAIN.js header comment
    client_path = script_dir / 'claude-desktop-MAIN.js'
    replacements = [
        (r'// CLAUDE AUTO-SAVE V\d+\.\d+\.\d+ - STABLE VERSION', 
         f'// CLAUDE AUTO-SAVE V{new_version} - STABLE VERSION')
    ]
    updated, changes = update_file_content(client_path, replacements)
    if updated:
        print(f"✅ Updated claude-desktop-MAIN.js header")
        changes_made += 1
    
    # 6. Update menubar.py header comment
    menubar_path = script_dir / 'menubar.py'
    replacements = [
        (r'# SMART SAVE MENU BAR V\d+\.\d+\.\d+ - STABLE',
         f'# SMART SAVE MENU BAR V{new_version} - STABLE')
    ]
    updated, changes = update_file_content(menubar_path, replacements)
    if updated:
        print(f"✅ Updated menubar.py header")
        changes_made += 1
    
    # 7. Update README.md if it exists
    readme_path = script_dir / 'README.md'
    if readme_path.exists():
        replacements = [
            (r'# Smart Save V\d+\.\d+\.\d+ - Production Release',
             f'# Smart Save V{new_version} - Production Release'),
            (r'version-\d+\.\d+\.\d+-green',
             f'version-{new_version}-green'),
            (r'\*\*V\d+\.\d+\.\d+ fixes applied\*\*',
             f'**V{new_version} fixes applied**')
        ]
        updated, changes = update_file_content(readme_path, replacements)
        if updated:
            print(f"✅ Updated README.md")
            changes_made += 1
    
    print("=" * 50)
    if changes_made > 0:
        print(f"🎉 Successfully synchronized {changes_made} files to version {new_version}")
        print(f"\n📁 You can now rename your project folder to: Smart-Save-V{new_version}")
    else:
        print("ℹ️  No changes needed - all versions already synchronized")
    
    return changes_made > 0

def main():
    if len(sys.argv) > 1:
        new_version = sys.argv[1]
        # Remove 'V' or 'v' prefix if present
        new_version = re.sub(r'^[Vv]', '', new_version)
    else:
        new_version = extract_version_from_folder()
    
    if not new_version:
        print("\n💡 Usage examples:")
        print("   python3 sync-version.py 10.0.6")
        print("   python3 sync-version.py V10.0.7") 
        print("   python3 sync-version.py (auto-detect from folder)")
        sys.exit(1)
    
    # Validate version format
    if not re.match(r'^\d+\.\d+\.\d+$', new_version):
        print(f"❌ Invalid version format: {new_version}")
        print("   Expected format: 10.0.5")
        sys.exit(1)
    
    sync_all_versions(new_version)

if __name__ == "__main__":
    main()
