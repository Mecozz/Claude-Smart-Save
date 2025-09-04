// This script will inject the Smart Save script into the actual Claude webpage
// Run this in the Chrome DevTools console that's connected to Claude Desktop

// First, get the webContents
const { webContents } = require('electron');
const contents = webContents.getAllWebContents();

// Find the main window (should be the first one)
const mainWindow = contents.find(wc => wc.getURL().includes('claude.ai'));

if (mainWindow) {
    console.log('Found Claude window:', mainWindow.getURL());
    
    // Read the script file
    const fs = require('fs');
    const path = require('path');
    const scriptPath = path.join(__dirname, 'claude-desktop-MAIN.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Inject into the actual webpage
    mainWindow.executeJavaScript(scriptContent)
        .then(() => {
            console.log('✅ Smart Save script injected successfully!');
        })
        .catch(err => {
            console.error('❌ Failed to inject:', err);
        });
} else {
    console.error('❌ Could not find Claude window');
    console.log('Available windows:', contents.map(wc => wc.getURL()));
}
