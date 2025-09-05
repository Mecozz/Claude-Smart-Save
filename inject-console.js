#!/usr/bin/env osascript -l JavaScript

/**
 * Smart Save Injection for Claude Desktop
 * Properly switches to Console tab and injects
 */

function run() {
    const app = Application('Claude');
    const se = Application('System Events');
    
    console.log('🚀 Starting Smart Save injection...');
    
    // Activate Claude
    app.activate();
    delay(0.5);
    
    // Open Developer Tools
    se.keystroke('i', { using: ['option down', 'command down'] });
    delay(1);
    
    // CRITICAL: Switch to Console tab!
    // Most DevTools use these shortcuts:
    // Cmd+Alt+J = Console (direct)
    // OR after DevTools is open:
    // Escape = Toggle console drawer
    // Cmd+2 = Console tab (if tabbed)
    
    console.log('📋 Switching to Console tab...');
    
    // Method 1: Try Escape to ensure console drawer is visible
    se.keyCode(53); // Escape key
    delay(0.5);
    
    // Method 2: Try to click Console tab directly
    // Press Cmd+2 (common shortcut for Console tab)
    se.keystroke('2', { using: 'command down' });
    delay(0.5);
    
    // Method 3: Use keyboard navigation
    // Tab through until we reach the console input
    // This is more reliable than coordinates
    
    // Focus the console input area
    // Ctrl+L clears console and focuses input in many DevTools
    se.keystroke('l', { using: 'control down' });
    delay(0.3);
    
    console.log('💉 Injecting Smart Save code...');
    
    // Type the injection command
    const injectionCommand = 'fetch("http://localhost:3737/inject-script").then(r => r.text()).then(eval);';
    
    // Type character by character to avoid clipboard issues
    for (let char of injectionCommand) {
        se.keystroke(char);
        delay(0.01);
    }
    
    // Press Enter to execute
    delay(0.2);
    se.keyCode(36); // Return key
    
    console.log('✅ Injection command sent!');
    console.log('');
    console.log('Look for the Smart Save indicator in Claude.');
    console.log('If it didn\'t work, try:');
    console.log('1. Click in the Console tab (not Elements!)');
    console.log('2. Click after the ">" prompt');
    console.log('3. Paste: ' + injectionCommand);
    
    return true;
}
