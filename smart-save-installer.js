#!/usr/bin/env node

/**
 * Smart Save Professional Installer
 * Version 11.1.0 - Complete Setup Wizard with Update Management
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const semver = require('semver');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const os = require('os');

class SmartSaveInstaller {
  constructor() {
    this.currentVersion = '11.1.0-beta.2';
    this.configPath = path.join(os.homedir(), '.smart-save-config.json');
    this.config = this.loadConfig();
    
    // Default paths based on OS
    const documentsPath = path.join(os.homedir(), 'Documents');
    this.defaultPaths = {
      installation: path.join(documentsPath, 'Claude-Smart-Save'),
      conversations: path.join(documentsPath, 'Claude_Conversations'),
      backups: path.join(documentsPath, 'Claude_Backups')
    };
    
    // Component definitions - ONLY REAL, WORKING TOOLS
    this.requiredComponents = [
      {
        name: 'Smart Save Core',
        description: 'Auto-saves all Claude conversations, prevents data loss',
        package: 'express cors body-parser ws',
        type: 'npm',
        required: true
      },
      {
        name: 'Chrome Extension',
        description: 'Browser integration for claude.ai',
        type: 'extension',
        required: true
      }
    ];
    
    // Updated with ONLY available tools
    this.optionalComponents = [
      {
        id: 'desktop-commander',
        name: 'Desktop Commander',
        description: '💻 Full computer control - run commands, edit files, manage processes',
        package: '@wonderwhy-er/desktop-commander',
        type: 'mcp',
        recommended: true,
        selected: true,
        available: true,
        configName: 'desktop-commander'
      },
      {
        id: 'mcp-inspector',
        name: 'MCP Inspector',
        description: '🔍 Visual testing tool for MCP servers',
        package: '@modelcontextprotocol/inspector',
        type: 'mcp',
        recommended: false,
        selected: false,
        available: true,
        configName: 'inspector'
      },
      {
        id: 'update-notifier',
        name: 'Update Notifier',
        description: '🔔 Get alerts when new Smart Save versions are available',
        type: 'feature',
        recommended: true,
        selected: true,
        available: true
      },
      {
        id: 'menubar',
        name: 'Menu Bar App',
        description: '📊 macOS system tray for monitoring (requires Python)',
        type: 'python',
        package: 'rumps requests',
        recommended: true,
        selected: true,
        available: true
      },
      // Coming Soon - shown but not selectable
      {
        id: 'github',
        name: 'GitHub Integration',
        description: '🐙 [COMING SOON] Manage repos, PRs, and issues',
        package: '@modelcontextprotocol/server-github',
        type: 'mcp',
        recommended: false,
        selected: false,
        available: false,
        configName: 'github'
      },
      {
        id: 'memory',
        name: 'Memory Server',
        description: '🧠 [COMING SOON] Knowledge graph for conversations',
        package: '@modelcontextprotocol/server-memory',
        type: 'mcp',
        recommended: false,
        selected: false,
        available: false,
        configName: 'memory'
      },
      {
        id: 'sqlite',
        name: 'SQLite Database',
        description: '🗄️ [COMING SOON] Query and manage SQLite databases',
        package: '@modelcontextprotocol/server-sqlite',
        type: 'mcp',
        recommended: false,
        selected: false,
        available: false,
        configName: 'sqlite'
      }
    ];
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      // Config doesn't exist yet
    }
    
    return {
      installPath: null,
      conversationsPath: null,
      backupsPath: null,
      checkForUpdates: true,
      updateCheckInterval: 'daily',
      lastUpdateCheck: null,
      installedVersion: null,
      installedComponents: [],
      githubRepo: 'Mecozz/Claude-Smart-Save'
    };
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  async run() {
    console.clear();
    await this.showWelcome();
    
    // Check for updates first
    const updateAvailable = await this.checkForUpdates();
    if (updateAvailable) {
      const shouldUpdate = await this.promptForUpdate(updateAvailable);
      if (shouldUpdate === 'download') {
        await this.downloadUpdate(updateAvailable);
        return;
      }
    }
    
    // Installation flow
    const action = await this.selectAction();
    
    if (action === 'new') {
      await this.newInstallation();
    } else if (action === 'update-components') {
      await this.updateComponents();
    } else if (action === 'configure') {
      await this.reconfigure();
    }
  }

  async showWelcome() {
    console.log(chalk.blue.bold(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║     🚀 CLAUDE SMART SAVE - PROFESSIONAL INSTALLER     ║
║                      Version 11.1                     ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.gray(`
This installer will:
✓ Set up Smart Save with your preferred settings
✓ Install available MCP tools and integrations  
✓ Configure automatic update notifications
✓ Create a complete Claude power-user environment

${chalk.yellow('Note: MCP (Model Context Protocol) is very new.')}
${chalk.yellow('Many tools are still in development.')}

Press Ctrl+C at any time to cancel
    `));
  }

  async selectAction() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          {
            name: '🆕 New Installation',
            value: 'new'
          },
          {
            name: '📦 Update/Add Components',
            value: 'update-components'
          },
          {
            name: '⚙️  Reconfigure Settings',
            value: 'configure'
          }
        ]
      }
    ]);
    
    return action;
  }

  async newInstallation() {
    // Step 1: Configure paths
    await this.configurePaths();
    
    // Step 2: Select components
    const components = await this.selectComponents();
    
    // Step 3: Configure updates
    await this.configureUpdates();
    
    // Step 4: Confirm and install
    const confirmed = await this.confirmInstallation(components);
    if (confirmed) {
      await this.install(components);
      await this.setupUpdateMonitor();
      await this.showSuccess();
    }
  }

  async configurePaths() {
    console.log(chalk.yellow.bold('\n📁 INSTALLATION PATHS\n'));
    console.log(chalk.gray('Default paths will be created in your Documents folder.\n'));
    
    const { customizePaths } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'customizePaths',
        message: 'Would you like to customize the installation paths?',
        default: false
      }
    ]);
    
    if (customizePaths) {
      const paths = await inquirer.prompt([
        {
          type: 'input',
          name: 'installPath',
          message: 'Installation directory:',
          default: this.defaultPaths.installation,
          validate: (input) => {
            if (!path.isAbsolute(input)) {
              return 'Please enter an absolute path (starting with /)';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'conversationsPath',
          message: 'Conversations save directory:',
          default: this.defaultPaths.conversations,
          validate: (input) => {
            if (!path.isAbsolute(input)) {
              return 'Please enter an absolute path (starting with /)';
            }
            return true;
          }
        },
        {
          type: 'input',
          name: 'backupsPath',
          message: 'Backups directory:',
          default: this.defaultPaths.backups,
          validate: (input) => {
            if (!path.isAbsolute(input)) {
              return 'Please enter an absolute path (starting with /)';
            }
            return true;
          }
        }
      ]);
      
      Object.assign(this.config, paths);
    } else {
      Object.assign(this.config, this.defaultPaths);
    }
    
    // Show selected paths
    console.log(chalk.green('\n✅ Selected paths:'));
    console.log(`   Installation: ${this.config.installPath}`);
    console.log(`   Conversations: ${this.config.conversationsPath}`);
    console.log(`   Backups: ${this.config.backupsPath}`);
    
    this.saveConfig();
  }

  async selectComponents() {
    console.log(chalk.yellow.bold('\n📦 COMPONENT SELECTION\n'));
    
    // Show required components first
    console.log(chalk.green('Required Components:'));
    this.requiredComponents.forEach(comp => {
      console.log(`  ✓ ${comp.name} - ${comp.description}`);
    });
    
    console.log(chalk.yellow('\n\nOptional Components:'));
    console.log(chalk.gray('Space to select/deselect, Enter to continue\n'));
    
    // Filter to only show available components for selection
    const availableComponents = this.optionalComponents.filter(c => c.available);
    const unavailableComponents = this.optionalComponents.filter(c => !c.available);
    
    const choices = availableComponents.map(comp => ({
      name: `${comp.name}${comp.recommended ? chalk.green(' [RECOMMENDED]') : ''}\n   ${chalk.gray(comp.description)}`,
      value: comp.id,
      checked: comp.selected,
      short: comp.name
    }));
    
    // Show coming soon items separately
    if (unavailableComponents.length > 0) {
      console.log(chalk.dim('\n📍 Coming Soon (not yet available):'));
      unavailableComponents.forEach(comp => {
        console.log(chalk.dim(`  ○ ${comp.name} - ${comp.description.replace('[COMING SOON] ', '')}`));
      });
      console.log('');
    }
    
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Select components to install:',
        choices: choices,
        pageSize: 10
      }
    ]);
    
    return selected.map(id => 
      this.optionalComponents.find(c => c.id === id)
    );
  }

  async configureUpdates() {
    console.log(chalk.yellow.bold('\n🔄 UPDATE PREFERENCES\n'));
    
    const { checkForUpdates } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'checkForUpdates',
        message: 'Would you like automatic update notifications?',
        default: true
      }
    ]);
    
    this.config.checkForUpdates = checkForUpdates;
    
    if (checkForUpdates) {
      const { interval } = await inquirer.prompt([
        {
          type: 'list',
          name: 'interval',
          message: 'How often should we check for updates?',
          choices: [
            { name: 'Every time Smart Save starts', value: 'always' },
            { name: 'Daily (recommended)', value: 'daily' },
            { name: 'Weekly', value: 'weekly' },
            { name: 'Monthly', value: 'monthly' }
          ],
          default: 'daily'
        }
      ]);
      
      this.config.updateCheckInterval = interval;
    }
    
    this.saveConfig();
  }

  async confirmInstallation(components) {
    console.log(chalk.cyan.bold('\n📋 INSTALLATION SUMMARY\n'));
    
    console.log(chalk.green('Installation Paths:'));
    console.log(`  📁 Main: ${this.config.installPath}`);
    console.log(`  💾 Conversations: ${this.config.conversationsPath}`);
    console.log(`  🔒 Backups: ${this.config.backupsPath}`);
    
    console.log(chalk.green('\nRequired Components:'));
    this.requiredComponents.forEach(comp => {
      console.log(`  ✓ ${comp.name}`);
    });
    
    if (components.length > 0) {
      console.log(chalk.yellow('\nSelected Optional Components:'));
      components.forEach(comp => {
        console.log(`  ✓ ${comp.name}`);
      });
    }
    
    if (this.config.checkForUpdates) {
      console.log(chalk.blue(`\nUpdate Checking: ${this.config.updateCheckInterval}`));
    }
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '\nProceed with installation?',
        default: true
      }
    ]);
    
    return confirm;
  }

  async install(components) {
    console.log(chalk.blue.bold('\n🔧 INSTALLING COMPONENTS\n'));
    
    // Create directories
    const spinner = ora('Creating directories...').start();
    try {
      await fs.ensureDir(this.config.installPath);
      await fs.ensureDir(this.config.conversationsPath);
      await fs.ensureDir(this.config.backupsPath);
      
      // Create project structure in conversations
      await fs.ensureDir(path.join(this.config.conversationsPath, 'Projects'));
      await fs.ensureDir(path.join(this.config.conversationsPath, 'Daily'));
      await fs.ensureDir(path.join(this.config.conversationsPath, 'Archived'));
      
      spinner.succeed('Directories created');
    } catch (error) {
      spinner.fail('Failed to create directories');
      console.error(error);
      return;
    }
    
    // Copy Smart Save files
    const copySpinner = ora('Copying Smart Save files...').start();
    try {
      const sourceDir = __dirname;
      const filesToCopy = [
        'Claude_AutoSave_FINAL',
        'chrome-extension',
        'package.json',
        'README.md'
      ];
      
      for (const file of filesToCopy) {
        const source = path.join(sourceDir, file);
        const dest = path.join(this.config.installPath, file);
        
        if (fs.existsSync(source)) {
          await fs.copy(source, dest);
        }
      }
      
      copySpinner.succeed('Smart Save files copied');
    } catch (error) {
      copySpinner.fail('Failed to copy files');
      console.error(error);
    }
    
    // Install npm dependencies
    const npmSpinner = ora('Installing npm dependencies...').start();
    try {
      await exec(`cd "${this.config.installPath}" && npm install`);
      npmSpinner.succeed('NPM dependencies installed');
    } catch (error) {
      npmSpinner.fail('Failed to install npm dependencies');
      console.log(chalk.yellow('Please run: npm install manually'));
    }
    
    // Install optional components
    for (const component of components) {
      if (component.type === 'mcp' && component.package) {
        const compSpinner = ora(`Installing ${component.name}...`).start();
        try {
          // Try global install first
          await exec(`npm install -g ${component.package}`);
          compSpinner.succeed(`${component.name} installed successfully`);
          this.config.installedComponents.push(component.id);
        } catch (error) {
          // If global fails, show instructions
          compSpinner.warn(`${component.name} requires manual installation`);
          console.log(chalk.yellow(`  Run: npm install -g ${component.package}`));
          console.log(chalk.gray(`  Error: ${error.message.split('\n')[0]}`));
        }
      } else if (component.type === 'python' && component.package) {
        const compSpinner = ora(`Installing ${component.name}...`).start();
        try {
          await exec(`pip3 install ${component.package}`);
          compSpinner.succeed(`${component.name} installed`);
          this.config.installedComponents.push(component.id);
        } catch (error) {
          compSpinner.warn(`${component.name} - manual installation needed`);
          console.log(chalk.yellow(`  Run: pip3 install ${component.package}`));
        }
      } else if (component.type === 'feature') {
        // Features don't need installation, just configuration
        this.config.installedComponents.push(component.id);
      }
    }
    
    // Update configuration
    await this.updateSmartSaveConfig();
    
    // Generate Claude Desktop config if MCP tools selected
    const mcpComponents = components.filter(c => c.type === 'mcp' && c.available);
    if (mcpComponents.length > 0) {
      await this.generateClaudeConfig(mcpComponents);
    }
    
    this.config.installedVersion = this.currentVersion;
    this.saveConfig();
  }

  async updateSmartSaveConfig() {
    // Update the Smart Save config.json with our paths
    const smartSaveConfig = {
      conversationsPath: this.config.conversationsPath,
      minChangeSize: 25,
      saveInterval: 1000,
      maxTokens: 200000,
      checkForUpdates: this.config.checkForUpdates,
      updateInterval: this.config.updateCheckInterval
    };
    
    const configPath = path.join(
      this.config.installPath, 
      'Claude_AutoSave_FINAL', 
      'config.json'
    );
    
    await fs.writeJson(configPath, smartSaveConfig, { spaces: 2 });
  }

  async generateClaudeConfig(mcpComponents) {
    console.log(chalk.blue('\n⚙️ Generating Claude Desktop Configuration\n'));
    
    const claudeConfigPath = path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Claude',
      'claude_desktop_config.json'
    );
    
    let existingConfig = {};
    try {
      if (fs.existsSync(claudeConfigPath)) {
        existingConfig = await fs.readJson(claudeConfigPath);
      }
    } catch (error) {
      // No existing config
    }
    
    const mcpServers = existingConfig.mcpServers || {};
    
    // Add our selected MCP servers with correct configuration
    mcpComponents.forEach(comp => {
      if (comp.configName && comp.package) {
        // Special handling for Desktop Commander
        if (comp.id === 'desktop-commander') {
          mcpServers[comp.configName] = {
            command: 'npx',
            args: [comp.package],
            env: {
              PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'
            }
          };
        } else {
          mcpServers[comp.configName] = {
            command: 'npx',
            args: [comp.package]
          };
        }
      }
    });
    
    const newConfig = {
      ...existingConfig,
      mcpServers
    };
    
    console.log(chalk.gray('Claude Desktop configuration:'));
    console.log(JSON.stringify(newConfig, null, 2));
    
    const { updateClaude } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateClaude',
        message: 'Update Claude Desktop config automatically?',
        default: true
      }
    ]);
    
    if (updateClaude) {
      try {
        await fs.ensureDir(path.dirname(claudeConfigPath));
        await fs.writeJson(claudeConfigPath, newConfig, { spaces: 2 });
        console.log(chalk.green('✅ Claude Desktop configured'));
        console.log(chalk.yellow('Note: Restart Claude Desktop for changes to take effect'));
      } catch (error) {
        console.log(chalk.red('Failed to update Claude config automatically'));
        console.log(chalk.yellow('Please add the above configuration manually to:'));
        console.log(chalk.gray(claudeConfigPath));
      }
    }
  }

  async checkForUpdates() {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${this.config.githubRepo}/releases/latest`,
        { timeout: 5000 }
      );
      
      const latestVersion = response.data.tag_name.replace('v', '');
      const currentVersion = this.config.installedVersion || this.currentVersion;
      
      if (semver.valid(latestVersion) && semver.valid(currentVersion)) {
        if (semver.gt(latestVersion, currentVersion)) {
          return {
            version: latestVersion,
            description: response.data.body,
            downloadUrl: response.data.zipball_url,
            releaseUrl: response.data.html_url,
            publishedAt: response.data.published_at
          };
        }
      }
      
      this.config.lastUpdateCheck = new Date().toISOString();
      this.saveConfig();
      
    } catch (error) {
      // Silently fail update check
    }
    
    return null;
  }

  async promptForUpdate(updateInfo) {
    console.log(chalk.green.bold(`\n🎉 NEW VERSION AVAILABLE: v${updateInfo.version}\n`));
    
    const releaseNotes = updateInfo.description
      ? updateInfo.description.substring(0, 500)
      : 'No release notes available';
    
    console.log(chalk.cyan('Release Notes:'));
    console.log(releaseNotes);
    
    console.log(chalk.yellow.bold('\n⚠️  IMPORTANT:'));
    console.log(chalk.yellow('The update will be downloaded to a NEW folder.'));
    console.log(chalk.yellow('Your current installation will NOT be modified.'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          {
            name: '📥 Download update to new folder (recommended)',
            value: 'download'
          },
          {
            name: '🌐 View release on GitHub',
            value: 'browser'
          },
          {
            name: '⏭️  Skip this update',
            value: 'skip'
          }
        ]
      }
    ]);
    
    if (action === 'browser') {
      await exec(`open "${updateInfo.releaseUrl}"`);
    }
    
    return action;
  }

  async downloadUpdate(updateInfo) {
    const newVersion = updateInfo.version;
    const newPath = `${this.config.installPath}-v${newVersion}`;
    
    console.log(chalk.blue(`\n📥 Downloading Smart Save v${newVersion}...\n`));
    console.log(chalk.gray(`New installation path: ${newPath}`));
    
    const spinner = ora('Downloading from GitHub...').start();
    
    try {
      // Clone the latest version
      await exec(`git clone https://github.com/${this.config.githubRepo}.git "${newPath}"`);
      
      spinner.succeed('Update downloaded successfully');
      
      // Offer to migrate data
      const { migrate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'migrate',
          message: 'Copy your conversations and settings to the new version?',
          default: true
        }
      ]);
      
      if (migrate) {
        await this.migrateData(this.config.installPath, newPath);
      }
      
      console.log(chalk.green.bold('\n✅ Update Complete!\n'));
      console.log(chalk.cyan('Next steps:'));
      console.log(`1. cd "${newPath}"`);
      console.log('2. npm install');
      console.log('3. npm start');
      
      // Update config to point to new installation
      this.config.installPath = newPath;
      this.config.installedVersion = newVersion;
      this.saveConfig();
      
    } catch (error) {
      spinner.fail('Failed to download update');
      console.error(error);
    }
  }

  async migrateData(oldPath, newPath) {
    const spinner = ora('Migrating your data...').start();
    
    try {
      // Copy conversation data
      if (fs.existsSync(this.config.conversationsPath)) {
        spinner.text = 'Copying conversations...';
        // Conversations are already in a separate location, just update config
      }
      
      // Copy config files
      const configFiles = [
        'Claude_AutoSave_FINAL/config.json',
        'Claude_AutoSave_FINAL/.processed-conversations.json',
        'Claude_AutoSave_FINAL/.memory-queue.jsonl'
      ];
      
      for (const file of configFiles) {
        const oldFile = path.join(oldPath, file);
        const newFile = path.join(newPath, file);
        
        if (fs.existsSync(oldFile)) {
          await fs.ensureDir(path.dirname(newFile));
          await fs.copy(oldFile, newFile);
        }
      }
      
      spinner.succeed('Data migrated successfully');
      
      // Offer to create backup
      const { backup } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'backup',
          message: 'Create backup of old installation?',
          default: true
        }
      ]);
      
      if (backup) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(
          this.config.backupsPath,
          `smart-save-backup-${timestamp}`
        );
        
        await fs.copy(oldPath, backupPath);
        console.log(chalk.green(`✅ Backup created: ${backupPath}`));
      }
      
    } catch (error) {
      spinner.fail('Migration encountered issues');
      console.error(error);
    }
  }

  async setupUpdateMonitor() {
    if (!this.config.checkForUpdates) return;
    
    const updateCheckerPath = path.join(
      this.config.installPath,
      'check-updates.js'
    );
    
    // Copy the update checker from source
    const sourceChecker = path.join(__dirname, 'check-updates.js');
    if (fs.existsSync(sourceChecker)) {
      await fs.copy(sourceChecker, updateCheckerPath);
    }
    
    // Update package.json to include update checking
    const packageJsonPath = path.join(this.config.installPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['check-updates'] = 'node check-updates.js';
      packageJson.scripts['prestart'] = 'node check-updates.js 2>/dev/null || true';
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  async showSuccess() {
    console.log(chalk.green.bold(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║           ✅ INSTALLATION COMPLETE!                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.cyan('\n📌 NEXT STEPS:\n'));
    console.log(`1. ${chalk.bold('cd "' + this.config.installPath + '"')}`);
    console.log(`2. ${chalk.bold('npm start')} - Start Smart Save server`);
    console.log(`3. Open ${chalk.bold('Claude Desktop')} or ${chalk.bold('claude.ai')}`);
    console.log(`4. Smart Save will activate automatically!`);
    
    const hasDesktopCommander = this.config.installedComponents.includes('desktop-commander');
    if (hasDesktopCommander) {
      console.log(chalk.yellow('\n⚠️  Note: Restart Claude Desktop to activate Desktop Commander'));
    }
    
    console.log(chalk.gray('\n📚 Documentation: https://github.com/Mecozz/Claude-Smart-Save'));
    console.log(chalk.gray('💬 Support: https://github.com/Mecozz/Claude-Smart-Save/issues'));
    
    // Show info about MCP ecosystem
    console.log(chalk.blue('\n📍 About MCP Tools:'));
    console.log(chalk.gray('The Model Context Protocol is very new.'));
    console.log(chalk.gray('Many announced tools are still in development.'));
    console.log(chalk.gray('Check back regularly for updates!'));
  }

  async updateComponents() {
    // Load existing config
    if (!this.config.installPath) {
      console.log(chalk.red('No existing installation found!'));
      console.log(chalk.yellow('Please run a new installation first.'));
      return;
    }
    
    console.log(chalk.blue('\n📦 ADD/UPDATE COMPONENTS\n'));
    
    const installed = this.config.installedComponents || [];
    const available = this.optionalComponents.filter(c => c.available && !installed.includes(c.id));
    
    if (available.length === 0) {
      console.log(chalk.yellow('All available components are already installed!'));
      console.log(chalk.gray('\nSeveral MCP tools are still in development:'));
      console.log(chalk.gray('  • GitHub Integration'));
      console.log(chalk.gray('  • Memory Server'));
      console.log(chalk.gray('  • SQLite Database'));
      return;
    }
    
    const choices = available.map(comp => ({
      name: `${comp.name}\n   ${chalk.gray(comp.description)}`,
      value: comp.id,
      short: comp.name
    }));
    
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: 'Select components to add:',
        choices: choices
      }
    ]);
    
    const components = selected.map(id => 
      this.optionalComponents.find(c => c.id === id)
    );
    
    await this.install(components);
  }

  async reconfigure() {
    console.log(chalk.blue('\n⚙️ RECONFIGURE SETTINGS\n'));
    
    const { setting } = await inquirer.prompt([
      {
        type: 'list',
        name: 'setting',
        message: 'What would you like to configure?',
        choices: [
          { name: '📁 Change installation paths', value: 'paths' },
          { name: '🔄 Update preferences', value: 'updates' },
          { name: '🔍 Check for updates now', value: 'check' },
          { name: '💻 Reinstall Desktop Commander', value: 'desktop' },
          { name: '↩️  Back', value: 'back' }
        ]
      }
    ]);
    
    switch (setting) {
      case 'paths':
        await this.configurePaths();
        break;
      case 'updates':
        await this.configureUpdates();
        break;
      case 'check':
        const update = await this.checkForUpdates();
        if (update) {
          const action = await this.promptForUpdate(update);
          if (action === 'download') {
            await this.downloadUpdate(update);
          }
        } else {
          console.log(chalk.green('✅ You have the latest version!'));
        }
        break;
      case 'desktop':
        console.log(chalk.blue('\n💻 Installing Desktop Commander...\n'));
        try {
          await exec('npm install -g @wonderwhy-er/desktop-commander');
          console.log(chalk.green('✅ Desktop Commander installed successfully!'));
          console.log(chalk.yellow('Restart Claude Desktop to activate it.'));
        } catch (error) {
          console.log(chalk.red('Installation failed. Try manually:'));
          console.log(chalk.yellow('npm install -g @wonderwhy-er/desktop-commander'));
        }
        break;
    }
  }
}

// Run installer
if (require.main === module) {
  const installer = new SmartSaveInstaller();
  installer.run().catch(error => {
    console.error(chalk.red('\n❌ Installation failed:'));
    console.error(error);
    process.exit(1);
  });
}

module.exports = SmartSaveInstaller;
