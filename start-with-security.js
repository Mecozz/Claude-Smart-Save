#!/usr/bin/env node

/**
 * Smart Save Startup Script with Security Handling
 * Handles macOS security prompts and ensures successful injection
 */

const chalk = require('chalk');
const ora = require('ora');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(chalk.blue.bold(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║          🚀 STARTING CLAUDE SMART SAVE                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
`));

// Check if this is first run
const configPath = path.join(__dirname, 'Claude_AutoSave_FINAL', '.first-run-complete');
const isFirstRun = !fs.existsSync(configPath);

if (isFirstRun) {
  console.log(chalk.yellow.bold('\n⚠️  FIRST TIME SETUP - IMPORTANT!\n'));
  console.log(chalk.cyan('macOS Security Prompts:'));
  console.log('You may see security prompts for:');
  console.log('  1. ' + chalk.bold('Terminal/iTerm') + ' - Allow accessibility access');
  console.log('  2. ' + chalk.bold('Node.js') + ' - Allow incoming connections');
  console.log('  3. ' + chalk.bold('Screen Recording') + ' - May be needed for injection');
  
  console.log(chalk.yellow('\n👉 IMPORTANT: Click "Allow" or "OK" for all prompts!'));
  console.log(chalk.gray('If you miss a prompt, the injection won\'t work.\n'));
  
  console.log(chalk.blue('Setup Steps:'));
  console.log('1. Start the server (happening now...)');
  console.log('2. ' + chalk.bold('HANDLE ALL SECURITY PROMPTS'));
  console.log('3. Open Claude Desktop');
  console.log('4. Open Developer Tools (Cmd+Option+I)');
  console.log('5. Smart Save will auto-inject\n');
  
  // Add a delay to let user read
  console.log(chalk.gray('Starting in 5 seconds...\n'));
  
  setTimeout(() => {
    startServer();
  }, 5000);
} else {
  startServer();
}

function startServer() {
  console.log(chalk.blue('📡 Starting Smart Save server...\n'));
  
  // Start the main server
  const serverProcess = exec('node Claude_AutoSave_FINAL/claude-server-v5.js', {
    cwd: __dirname
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(data.toString());
    
    // Check for successful server start
    if (data.includes('Server running at port 3737')) {
      if (isFirstRun) {
        showPostStartInstructions();
        
        // Mark first run as complete
        fs.writeFileSync(configPath, new Date().toISOString());
      }
    }
    
    // Check for injection success
    if (data.includes('Extension injected successfully')) {
      console.log(chalk.green.bold('\n✅ Smart Save is now active!\n'));
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(chalk.red(data.toString()));
  });
  
  serverProcess.on('error', (error) => {
    console.error(chalk.red.bold('\n❌ Failed to start server:'));
    console.error(error);
    showTroubleshooting();
  });
}

function showPostStartInstructions() {
  console.log(chalk.green.bold('\n✅ Server is running!\n'));
  console.log(chalk.cyan('Next Steps:'));
  console.log('1. ' + chalk.bold('Open Claude Desktop'));
  console.log('2. ' + chalk.bold('Open Developer Tools') + ' (Cmd+Option+I)');
  console.log('3. ' + chalk.bold('Look for the Smart Save indicator'));
  
  console.log(chalk.yellow('\n⚠️  If Smart Save doesn\'t appear:'));
  console.log('1. Check System Preferences > Security & Privacy');
  console.log('2. Grant permissions to Terminal/Node.js');
  console.log('3. Restart this script\n');
  
  console.log(chalk.gray('Monitoring for injection...\n'));
  
  // Set up a timeout to check for injection
  setTimeout(() => {
    checkInjectionStatus();
  }, 30000); // Check after 30 seconds
}

function checkInjectionStatus() {
  // Check if injection happened by looking at logs
  const logFile = path.join(__dirname, 'logs', 'smartsave.log');
  
  if (fs.existsSync(logFile)) {
    const logs = fs.readFileSync(logFile, 'utf8');
    if (!logs.includes('Extension injected successfully')) {
      console.log(chalk.yellow.bold('\n⚠️  Smart Save hasn\'t injected yet!\n'));
      showManualInjectionInstructions();
    }
  } else {
    showManualInjectionInstructions();
  }
}

function showManualInjectionInstructions() {
  console.log(chalk.red.bold('📝 Manual Injection Required:\n'));
  console.log('It seems the auto-injection didn\'t work. This usually means:');
  console.log('  • Security permissions were denied');
  console.log('  • Claude Desktop isn\'t open');
  console.log('  • Developer Tools aren\'t open\n');
  
  console.log(chalk.cyan('To fix:'));
  console.log('1. ' + chalk.bold('Grant permissions:'));
  console.log('   System Preferences > Security & Privacy > Privacy');
  console.log('   • Accessibility: Add Terminal/iTerm');
  console.log('   • Screen Recording: Add Terminal (if asked)');
  console.log('');
  console.log('2. ' + chalk.bold('Restart everything:'));
  console.log('   • Close Claude Desktop');
  console.log('   • Stop this script (Ctrl+C)');
  console.log('   • Run: npm start');
  console.log('   • Open Claude Desktop');
  console.log('   • Open Developer Tools (Cmd+Option+I)');
  console.log('');
  console.log('3. ' + chalk.bold('Or try manual injection:'));
  console.log('   In Claude\'s Developer Console, paste:');
  console.log(chalk.gray('   fetch("http://localhost:3737/inject-script")'));
  console.log(chalk.gray('     .then(r => r.text())'));
  console.log(chalk.gray('     .then(eval);\n'));
}

function showTroubleshooting() {
  console.log(chalk.yellow.bold('\n🔧 Troubleshooting:\n'));
  console.log('1. ' + chalk.bold('Check if port 3737 is in use:'));
  console.log('   lsof -i:3737');
  console.log('   kill -9 [PID] (if something is using it)');
  console.log('');
  console.log('2. ' + chalk.bold('Grant Terminal permissions:'));
  console.log('   System Preferences > Security & Privacy');
  console.log('');
  console.log('3. ' + chalk.bold('Try manual start:'));
  console.log('   cd Claude_AutoSave_FINAL');
  console.log('   node claude-server-v5.js');
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Shutting down Smart Save...'));
  process.exit();
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red.bold('\n❌ Unexpected error:'));
  console.error(error);
  showTroubleshooting();
});
