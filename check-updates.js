#!/usr/bin/env node

/**
 * Smart Save Update Checker
 * Silently checks for updates when Smart Save starts
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Quick silent check - no dependencies on external packages initially
const configPath = path.join(os.homedir(), '.smart-save-config.json');

// Create default config if it doesn't exist
if (!fs.existsSync(configPath)) {
  const defaultConfig = {
    checkForUpdates: true,
    updateCheckInterval: 'daily',
    lastUpdateCheck: null,
    installedVersion: '11.0.0',
    githubRepo: 'Mecozz/Claude-Smart-Save'
  };
  fs.writeJsonSync(configPath, defaultConfig);
}

// Only run if we have axios installed and updates are enabled
try {
  const config = fs.readJsonSync(configPath);
  
  if (!config.checkForUpdates) {
    process.exit(0);
  }
  
  // Check if we should run based on interval
  const shouldCheck = () => {
    if (config.updateCheckInterval === 'always') return true;
    if (!config.lastUpdateCheck) return true;
    
    const lastCheck = new Date(config.lastUpdateCheck);
    const now = new Date();
    const hoursSince = (now - lastCheck) / (1000 * 60 * 60);
    
    switch (config.updateCheckInterval) {
      case 'daily': return hoursSince >= 24;
      case 'weekly': return hoursSince >= 168;
      case 'monthly': return hoursSince >= 720;
      default: return false;
    }
  };
  
  if (shouldCheck()) {
    // Try to load axios and check
    try {
      const axios = require('axios');
      
      axios.get(`https://api.github.com/repos/${config.githubRepo}/releases/latest`, {
        timeout: 3000
      }).then(response => {
        const latestVersion = response.data.tag_name.replace('v', '');
        
        // Simple version comparison
        if (latestVersion > config.installedVersion) {
          console.log(`\n🎉 Smart Save v${latestVersion} is available! (Current: v${config.installedVersion})`);
          console.log(`   Run 'npm run update' to see what's new\n`);
        }
        
        // Update last check time
        config.lastUpdateCheck = new Date().toISOString();
        fs.writeJsonSync(configPath, config);
      }).catch(() => {
        // Silent fail - don't interrupt the user
      });
      
    } catch (e) {
      // Axios not installed yet, skip check
    }
  }
  
} catch (error) {
  // Silent fail
}

// Exit quickly to not delay Smart Save startup
setTimeout(() => process.exit(0), 5000);
