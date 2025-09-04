#!/usr/bin/env python3

# ============================================
# SMART SAVE MENU BAR V10.0.5 - STABLE
# ============================================
# Fixes:
# - Auto-restart server on crash
# - Better Safari tab closing
# - Configuration support
# - Server health monitoring
# - V10.0.1: Better version tracking
# - V10.0.4: Safe process management with PID tracking
# ============================================

import rumps
import subprocess
import time
import requests
import os
import json
import threading
import signal

class SmartSaveMenuBar(rumps.App):
    def __init__(self):
        super(SmartSaveMenuBar, self).__init__("Smart Save")
        
        # PID file for tracking our processes
        self.pid_file = os.path.expanduser("~/.smart_save_server.pid")
        
        # Auto-detect version from folder name
        self.version = self.detect_version()
        print(f"[MENUBAR] Detected version: {self.version}")
        
        # Load configuration
        self.config = self.load_config()
        
        self.is_running = False
        self.server_process = None
        self.health_check_timer = None
        
        # Create menu items as instance variables
        self.menu_dashboard = rumps.MenuItem("📊 Open Dashboard", callback=self.open_dashboard)
        self.menu_folder = rumps.MenuItem("📁 Open Save Folder", callback=self.open_folder)
        self.menu_stop = rumps.MenuItem("🛑 Stop Auto-Save", callback=self.stop_everything)
        self.menu_start = rumps.MenuItem("▶️ Start Auto-Save", callback=self.start_automation)
        self.menu_restart = rumps.MenuItem("🔄 Restart Server", callback=self.restart_server)
        self.menu_check_sizes = rumps.MenuItem("📏 Check File Sizes", callback=self.check_file_sizes)
        self.menu_about = rumps.MenuItem(f"ℹ️ About (v{self.version})", callback=self.show_about)
        self.menu_quit = rumps.MenuItem("Quit Menu Bar", callback=self.quit_app)
        
        self.check_status()
        self.update_menu()
        
        # Start health monitoring
        self.start_health_monitor()
        
    def save_pid(self, pid):
        """Save process PID to file"""
        with open(self.pid_file, 'w') as f:
            f.write(str(pid))
        print(f"💾 Saved PID {pid} to {self.pid_file}")
    
    def load_pid(self):
        """Load saved PID from file"""
        if os.path.exists(self.pid_file):
            try:
                with open(self.pid_file, 'r') as f:
                    return int(f.read().strip())
            except:
                return None
        return None
    
    def remove_pid_file(self):
        """Remove PID file"""
        if os.path.exists(self.pid_file):
            os.remove(self.pid_file)
            print(f"🗑️ Removed PID file")
    
    def kill_by_pid(self, pid):
        """Kill process by specific PID"""
        try:
            os.kill(pid, signal.SIGTERM)
            print(f"✅ Killed process {pid}")
            return True
        except ProcessLookupError:
            print(f"⚠️ Process {pid} not found")
            return False
        except Exception as e:
            print(f"❌ Error killing process {pid}: {e}")
            return False
    
    def detect_version(self):
        """Auto-detect version from folder name"""
        try:
            import re
            
            # Get current script directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Go up directories to find version pattern
            for _ in range(5):  # Safety limit
                folder_name = os.path.basename(current_dir)
                
                # Match patterns like Smart-Save-V10.0.5, V10.0.5, etc.
                version_match = re.search(r'[Vv]?(\d+\.\d+\.\d+)', folder_name)
                if version_match:
                    detected = version_match.group(1)
                    print(f"[VERSION] Auto-detected from folder '{folder_name}': {detected}")
                    return detected
                
                # Move up one directory
                parent_dir = os.path.dirname(current_dir)
                if parent_dir == current_dir:  # Reached root
                    break
                current_dir = parent_dir
            
            # Fallback: try config.json
            try:
                config_path = os.path.join(os.path.dirname(__file__), 'config.json')
                if os.path.exists(config_path):
                    with open(config_path, 'r') as f:
                        config = json.load(f)
                        if 'version' in config:
                            print(f"[VERSION] Using config.json: {config['version']}")
                            return config['version']
            except:
                pass
            
            # Last resort
            fallback = '10.0.5'
            print(f"[VERSION] Using fallback: {fallback}")
            return fallback
            
        except Exception as e:
            print(f"[VERSION] Error detecting version: {e}")
            return '10.0.5'
    
    def load_config(self):
        """Load configuration from file"""
        config_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_AutoSave_FINAL/config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {
            "version": self.version,
            "server": {"port": 3737},
            "features": {"autoRestart": True}
        }
    
    def check_status(self):
        """Check if server is running"""
        try:
            response = requests.get(f'http://localhost:{self.config["server"]["port"]}/api/health', timeout=1)
            self.is_running = response.status_code == 200
            if self.is_running:
                data = response.json()
                self.server_version = data.get('version', 'unknown')
        except:
            self.is_running = False
            self.server_version = None
        
        # Update title to show status
        self.title = "SS 🟢" if self.is_running else "SS 🔴"
        
    def update_menu(self):
        """Update menu based on status"""
        self.menu.clear()
        
        if self.is_running:
            status_text = f"🟢 Smart Save Running (v{self.server_version or self.version})"
            self.menu = [
                status_text,
                None,
                self.menu_dashboard,
                self.menu_folder,
                self.menu_check_sizes,
                None,
                self.menu_restart,
                self.menu_stop,
                None,
                self.menu_about,
                None,
                self.menu_quit
            ]
        else:
            self.menu = [
                "🔴 Smart Save Stopped",
                None,
                self.menu_folder,
                None,
                self.menu_start,
                None,
                self.menu_about,
                None,
                self.menu_quit
            ]
    
    def start_health_monitor(self):
        """Monitor server health and auto-restart if needed"""
        def monitor():
            while True:
                time.sleep(30)  # Check every 30 seconds
                if self.is_running:
                    old_status = self.is_running
                    self.check_status()
                    
                    # If server crashed and auto-restart is enabled
                    if not self.is_running and old_status and self.config.get("features", {}).get("autoRestart", True):
                        rumps.notification("Smart Save", "", "Server crashed, restarting...")
                        self.restart_server(None)
        
        if self.config.get("features", {}).get("autoRestart", True):
            self.health_thread = threading.Thread(target=monitor, daemon=True)
            self.health_thread.start()
    
    def open_dashboard(self, sender):
        """Open dashboard in Safari"""
        port = self.config["server"]["port"]
        subprocess.run(["open", "-a", "Safari", f"http://localhost:{port}/dashboard"])
        
    def open_folder(self, sender):
        """Open save folder"""
        folder_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations/Projects/")
        subprocess.run(["open", folder_path])
    
    def check_file_sizes(self, sender):
        """Check for files approaching size limit"""
        try:
            port = self.config["server"]["port"]
            response = requests.get(f'http://localhost:{port}/api/check-sizes', timeout=5)
            if response.ok:
                data = response.json()
                warnings = data.get('warnings', [])
                errors = data.get('errors', [])
                
                message = f"Files over 900KB: {len(warnings)}\nFiles over 1MB: {len(errors)}"
                
                if errors:
                    message += "\n\n⚠️ Some files exceed the 1MB limit!"
                
                rumps.notification("File Size Check", "", message)
            else:
                rumps.notification("Error", "", "Could not check file sizes")
        except:
            rumps.notification("Error", "", "Server not responding")
    
    def show_about(self, sender):
        """Show about dialog"""
        rumps.notification(
            f"Smart Save v{self.version}",
            "Intelligent Auto-Save for Claude",
            "Created by Darren Couturier\nhttps://github.com/Mecozz/Claude-Smart-Save"
        )
    
    def restart_server(self, sender):
        """Restart the server"""
        self.stop_server_only()
        time.sleep(2)
        self.start_server_only()
        
        if self.is_running:
            rumps.notification("Smart Save", "", "Server restarted successfully!")
    
    def stop_server_only(self):
        """Stop only the server process using PID tracking"""
        # First try to kill by saved PID
        saved_pid = self.load_pid()
        if saved_pid:
            if self.kill_by_pid(saved_pid):
                self.remove_pid_file()
        
        # If we have a process handle, terminate it
        if self.server_process:
            try:
                self.server_process.terminate()
                self.server_process.wait(timeout=5)
                self.server_process = None
            except:
                pass
        
        # As last resort, kill specific Smart Save process only
        subprocess.run(["pkill", "-f", "claude-server-v5.js"], stderr=subprocess.DEVNULL)
        
        time.sleep(1)
        self.check_status()
    
    def start_server_only(self):
        """Start only the server"""
        server_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_AutoSave_FINAL/claude-server-v5.js")
        
        # Start server in background
        self.server_process = subprocess.Popen(
            ["node", server_path],
            cwd=os.path.dirname(server_path),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        # Save the PID
        self.save_pid(self.server_process.pid)
        
        time.sleep(3)
        self.check_status()
        self.update_menu()
        
    def stop_everything(self, sender):
        """Stop Smart Save processes only - not ALL Node processes"""
        rumps.notification(f"Smart Save v{self.version}", "", "Stopping Smart Save...")
        
        # Stop our server using PID tracking
        self.stop_server_only()
        
        # Kill the Terminal running START.command
        subprocess.run(["pkill", "-f", "START.command"], stderr=subprocess.DEVNULL)
        
        # Close Terminal windows running Smart Save
        apple_script_terminal = '''
        tell application "Terminal"
            set windowList to windows
            repeat with aWindow in windowList
                try
                    if name of aWindow contains "Smart Save" or name of aWindow contains "START.command" then
                        close aWindow
                    end if
                end try
            end repeat
        end tell
        '''
        subprocess.run(["osascript", "-e", apple_script_terminal], stderr=subprocess.DEVNULL)
        
        # Close dashboard tabs in Chrome (Smart Save specific)
        apple_script_chrome = '''
        tell application "Google Chrome"
            if (count of windows) > 0 then
                set windowList to windows
                repeat with aWindow in windowList
                    set tabList to tabs of aWindow
                    repeat with i from (count of tabList) to 1 by -1
                        try
                            set tabURL to URL of tab i of aWindow
                            if tabURL contains "localhost:3737" then
                                close tab i of aWindow
                            end if
                        end try
                    end repeat
                end repeat
            end if
        end tell
        '''
        subprocess.run(["osascript", "-e", apple_script_chrome], stderr=subprocess.DEVNULL)
        
        # Close dashboard in Safari too
        apple_script_safari = '''
        tell application "Safari"
            if (count of windows) > 0 then
                repeat with aWindow in windows
                    set tabList to tabs of aWindow
                    repeat with i from (count of tabList) to 1 by -1
                        try
                            set tabURL to URL of tab i of aWindow
                            if tabURL contains "localhost:3737" then
                                close tab i of aWindow
                            end if
                        end try
                    end repeat
                end repeat
            end if
        end tell
        '''
        subprocess.run(["osascript", "-e", apple_script_safari], stderr=subprocess.DEVNULL)
        
        time.sleep(1)
        self.check_status()
        self.update_menu()
        rumps.notification(f"Smart Save v{self.version}", "", "Smart Save stopped!")
        
    def start_automation(self, sender):
        """Start the automation"""
        rumps.notification(f"Smart Save v{self.version}", "", "Starting automation...")
        script_path = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_AutoSave_FINAL/START.command")
        
        if os.path.exists(script_path):
            subprocess.Popen(["open", "-a", "Terminal", script_path])
        else:
            # Fallback to just starting the server
            self.start_server_only()
        
        time.sleep(5)
        self.check_status()
        self.update_menu()
        rumps.notification(f"Smart Save v{self.version}", "", "Auto-Save started!")
    
    def quit_app(self, sender):
        # Clean up PID file on quit
        self.remove_pid_file()
        rumps.quit_application()
        
    @rumps.timer(10)
    def update_status(self, _):
        """Check status every 10 seconds"""
        old_status = self.is_running
        self.check_status()
        if old_status != self.is_running:
            self.update_menu()

if __name__ == "__main__":
    app = SmartSaveMenuBar()
    app.run()
