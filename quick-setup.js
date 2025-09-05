#!/usr/bin/env node

/**
 * Quick Setup Script for Smart Save
 * Bypasses the installer complexity for simple setups
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function quickSetup() {
  console.log(chalk.blue.bold(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🚀 CLAUDE SMART SAVE - QUICK SETUP                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `));

  const baseDir = process.cwd();
  const configPath = path.join(baseDir, 'Claude_AutoSave_FINAL', 'config.json');
  const conversationsPath = path.join(baseDir, 'Conversations');
  
  console.log(chalk.cyan('\n📁 Setting up in: ' + baseDir));
  
  try {
    // 1. Create config file
    console.log('\n1️⃣  Creating configuration...');
    const config = {
      conversationsPath: conversationsPath,
      minChangeSize: 25,
      saveInterval: 1000,
      maxTokens: 200000,
      checkForUpdates: true,
      updateInterval: 'daily'
    };
    
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.green('   ✓ Config created'));
    
    // 2. Create directory structure
    console.log('\n2️⃣  Creating directories...');
    await fs.ensureDir(path.join(conversationsPath, 'Projects'));
    await fs.ensureDir(path.join(conversationsPath, 'Daily'));
    await fs.ensureDir(path.join(conversationsPath, 'Archived'));
    await fs.ensureDir(path.join(baseDir, 'Backups'));
    await fs.ensureDir(path.join(baseDir, 'logs'));
    console.log(chalk.green('   ✓ Directories created'));
    
    // 3. Check for Claude Desktop
    console.log('\n3️⃣  Checking for Claude Desktop...');
    const claudeExists = fs.existsSync('/Applications/Claude.app') || 
                        fs.existsSync(path.join(require('os').homedir(), 'Applications', 'Claude.app'));
    
    if (claudeExists) {
      console.log(chalk.green('   ✓ Claude Desktop found'));
      
      // 4. Optional: Install Desktop Commander
      console.log('\n4️⃣  Installing Desktop Commander (MCP tool)...');
      try {
        await execAsync('npm install -g @wonderwhy-er/desktop-commander');
        console.log(chalk.green('   ✓ Desktop Commander installed'));
        
        // Update Claude config
        const claudeConfigPath = path.join(
          require('os').homedir(),
          'Library',
          'Application Support',
          'Claude',
          'claude_desktop_config.json'
        );
        
        let claudeConfig = {};
        if (fs.existsSync(claudeConfigPath)) {
          claudeConfig = await fs.readJson(claudeConfigPath);
        }
        
        claudeConfig.mcpServers = claudeConfig.mcpServers || {};
        claudeConfig.mcpServers['desktop-commander'] = {
          command: 'npx',
          args: ['@wonderwhy-er/desktop-commander'],
          env: {
            PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'
          }
        };
        
        await fs.ensureDir(path.dirname(claudeConfigPath));
        await fs.writeJson(claudeConfigPath, claudeConfig, { spaces: 2 });
        console.log(chalk.green('   ✓ Claude Desktop configured'));
        
      } catch (error) {
        console.log(chalk.yellow('   ⚠ Desktop Commander installation failed (optional)'));
      }
    } else {
      console.log(chalk.yellow('   ⚠ Claude Desktop not found'));
      console.log(chalk.gray('     Smart Save will work with claude.ai (web)'));
    }
    
    // Success!
    console.log(chalk.green.bold(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           ✅ SETUP COMPLETE!                          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.cyan('\n📌 Next Steps:\n'));
    console.log('1. ' + chalk.bold('npm start') + ' - Start Smart Save');
    
    if (claudeExists) {
      console.log('2. Open Claude Desktop');
      console.log('3. Open Developer Tools (Cmd+Option+I)');
      console.log('4. Switch to Console tab');
      console.log('5. Smart Save will auto-inject!');
    } else {
      console.log('2. Open chrome://extensions');
      console.log('3. Enable Developer mode');
      console.log('4. Load unpacked: ' + path.join(baseDir, 'chrome-extension'));
      console.log('5. Go to claude.ai');
    }
    
    console.log(chalk.gray('\n💡 Tip: If injection fails, run: npm run inject'));
    console.log(chalk.gray('📊 Dashboard: http://localhost:3737/dashboard'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'));
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  quickSetup();
}

module.exports = quickSetup;
