#!/usr/bin/env python3

# ============================================
# SMART SAVE MENU BAR - PYTHON VERSION
# ============================================
# Click menu bar icon to control everything
# ============================================

import rumps
import subprocess
import time
import requests
import os

class SmartSaveMenuBar(rumps.App):
    def __init__(self):
        super(SmartSaveMenuBar, self).__init__("Smart Save", icon="🔴")
        self.is_running = False
        self.check_status()
        
    def check_status(self):
        """Check if server is running"""
        try:
            response = requests.get('http://localhost:3737/api/health', timeout=1)
            self.is_running = response.status_code == 200
        except:
            self.is_running = False
        
        # Update icon
        self.icon = "🟢" if self.is_running else "🔴"
        
    @rumps.clicked("📊 Open Dashboard")
    def open_dashboard(self, _):
        subprocess.run(["open", "http://localhost:3737/dashboard"])
        
    @rumps.clicked("📁 Open Save Folder")
    def open_folder(self, _):
        folder_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations/Projects/")
        subprocess.run(["open", folder_path])
        
    @rumps.clicked("🛑 Stop Auto-Save")
    def stop_everything(self, _):
        """Stop EVERYTHING - server, Claude, dashboard, Terminal"""
        try:
            rumps.notification("Smart Save V9.0", "", "Stopping all processes...")
        except:
            pass
        
        # Kill ALL Node processes (more aggressive)
        try:
            subprocess.run(["killall", "node"], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
            subprocess.run(["pkill", "-9", "-f", "node"], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        except:
            pass
        
        # Force kill Claude Desktop
        try:
            subprocess.run(["killall", "Claude"], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
            subprocess.run(["pkill", "-9", "-f", "Claude"], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        except:
            pass
        
        # Close dashboard AND Claude tabs in Chrome
        apple_script = '''
        tell application "Google Chrome"
            set windowList to windows
            repeat with aWindow in windowList
                set tabList to tabs of aWindow
                repeat with i from (count of tabList) to 1 by -1
                    set tabURL to URL of tab i of aWindow
                    if tabURL contains "localhost" or tabURL contains "claude.ai" then
                        close tab i of aWindow
                    end if
                end repeat
            end repeat
        end tell
        '''
        try:
            subprocess.run(["osascript", "-e", apple_script], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        except:
            pass
        
        # Close Terminal windows
        apple_script_terminal = '''
        tell application "Terminal"
            set windowList to windows
            repeat with aWindow in windowList
                try
                    if (name of aWindow contains "Smart Save") or (name of aWindow contains "AUTO") then
                        close aWindow
                    end if
                end try
            end repeat
        end tell
        '''
        try:
            subprocess.run(["osascript", "-e", apple_script_terminal], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        except:
            pass
        
        time.sleep(1)
        self.check_status()
        try:
            rumps.notification("Smart Save V9.0", "", "All processes stopped!")
        except:
            pass
        
    @rumps.clicked("▶️ Start Auto-Save")
    def start_automation(self, _):
        """Start the automation"""
        try:
            rumps.notification("Smart Save V9.0", "", "Starting automation...")
        except:
            pass
        
        script_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_AutoSave_FINAL/START_FINAL_AUTOMATION.command")
        
        # Start the automation script
        try:
            subprocess.Popen(["open", "-a", "Terminal", script_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except:
            pass
        
        time.sleep(5)
        self.check_status()
        try:
            rumps.notification("Smart Save V9.0", "", "Auto-Save started!")
        except:
            pass
        
    @rumps.timer(10)
    def update_status(self, _):
        """Check status every 10 seconds"""
        self.check_status()
        
        # Update menu items
        self.menu.clear()
        
        if self.is_running:
            self.menu = [
                "🟢 Smart Save Running",
                None,  # separator
                "📊 Open Dashboard",
                "📁 Open Save Folder",
                None,
                "🛑 Stop Auto-Save",
            ]
        else:
            self.menu = [
                "🔴 Smart Save Stopped",
                None,
                "📁 Open Save Folder",
                None,
                "▶️ Start Auto-Save",
            ]

if __name__ == "__main__":
    # Check if required packages are installed
    try:
        import rumps
        import requests
    except ImportError:
        print("Installing required packages...")
        subprocess.run(["pip3", "install", "rumps", "requests"])
        print("Please run this script again!")
        exit(1)
    
    SmartSaveMenuBar().run()