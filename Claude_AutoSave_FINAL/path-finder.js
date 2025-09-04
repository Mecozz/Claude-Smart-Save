// ============================================
// DYNAMIC PATH FINDER UTILITY
// ============================================
// Automatically finds Claude_Conversations folder wherever the project is located
// Works from Documents, Desktop, iCloud, or any other location

const fs = require('fs');
const path = require('path');

class SmartSavePathFinder {
    constructor() {
        this.basePath = null;
        this.projectsPath = null;
    }
    
    /**
     * Find the Claude_Conversations directory relative to the current script location
     * @param {string} startDir - Starting directory (usually __dirname)
     * @returns {string} Path to Claude_Conversations directory
     */
    findClaudeConversationsPath(startDir = __dirname) {
        if (this.basePath) return this.basePath; // Use cached result
        
        console.log(`[PATH-FINDER] Starting search from: ${startDir}`);
        
        // Define potential locations relative to the script
        const possiblePaths = [
            // Most common: Same level as Claude_AutoSave_FINAL
            path.join(startDir, '..', 'Claude_Conversations'),
            
            // In parent Smart-Save folder
            path.join(startDir, '..', '..', 'Claude_Conversations'),
            
            // Same directory as script (rare)
            path.join(startDir, 'Claude_Conversations'),
            
            // In a nested Smart Save folder
            path.join(startDir, '..', 'Smart Save', 'Claude_Conversations'),
            path.join(startDir, '..', '..', 'Smart Save', 'Claude_Conversations'),
            
            // Original iCloud location (fallback)
            path.join(process.env.HOME, 'Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations'),
            
            // Alternative iCloud structure
            path.join(process.env.HOME, 'Library/CloudStorage/iCloud Drive/Smart Save/Claude_Conversations'),
            
            // Google Drive or other cloud storage
            path.join(process.env.HOME, 'Library/CloudStorage/GoogleDrive-*/*/Smart Save/Claude_Conversations'),
            
            // Local user Documents
            path.join(process.env.HOME, 'Documents/Smart Save/Claude_Conversations'),
            path.join(process.env.HOME, 'Documents/Claude_Conversations')
        ];
        
        // Test each path
        for (const testPath of possiblePaths) {
            try {
                const resolvedPath = path.resolve(testPath);
                if (fs.existsSync(resolvedPath)) {
                    const projectsPath = path.join(resolvedPath, 'Projects');
                    
                    // Verify it has the expected structure
                    if (fs.existsSync(projectsPath)) {
                        console.log(`[PATH-FINDER] ✅ Found Claude_Conversations at: ${resolvedPath}`);
                        console.log(`[PATH-FINDER] ✅ Projects folder confirmed at: ${projectsPath}`);
                        
                        this.basePath = resolvedPath;
                        this.projectsPath = projectsPath;
                        return resolvedPath;
                    } else {
                        console.log(`[PATH-FINDER] ❌ Found directory but no Projects folder: ${resolvedPath}`);
                    }
                }
            } catch (error) {
                // Skip paths that can't be resolved
                continue;
            }
        }
        
        // If nothing found, create default location relative to script
        const defaultPath = path.resolve(startDir, '..', 'Claude_Conversations');
        console.log(`[PATH-FINDER] 🔧 No existing Claude_Conversations found, will create at: ${defaultPath}`);
        
        this.basePath = defaultPath;
        this.projectsPath = path.join(defaultPath, 'Projects');
        
        return defaultPath;
    }
    
    /**
     * Get the Projects directory path
     * @returns {string} Path to Projects directory
     */
    getProjectsPath() {
        if (!this.basePath) {
            this.findClaudeConversationsPath();
        }
        return this.projectsPath;
    }
    
    /**
     * Get information about the current setup
     * @returns {object} Setup information
     */
    getPathInfo() {
        const basePath = this.findClaudeConversationsPath();
        const projectsPath = this.getProjectsPath();
        
        // Count projects if folder exists
        let projectCount = 0;
        let projects = [];
        
        try {
            if (fs.existsSync(projectsPath)) {
                const items = fs.readdirSync(projectsPath);
                projects = items.filter(item => {
                    const itemPath = path.join(projectsPath, item);
                    return fs.statSync(itemPath).isDirectory() && !item.startsWith('.');
                });
                projectCount = projects.length;
            }
        } catch (error) {
            console.log(`[PATH-FINDER] Warning: Could not read projects: ${error.message}`);
        }
        
        return {
            basePath,
            projectsPath,
            projectCount,
            projects,
            isPortable: !basePath.includes('iCloud'),
            isCloudStorage: basePath.includes('iCloud') || basePath.includes('CloudStorage'),
            relativeTo: path.relative(process.cwd(), basePath)
        };
    }
    
    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const basePath = this.findClaudeConversationsPath();
        const projectsPath = this.getProjectsPath();
        
        // Create directories if they don't exist
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
            console.log(`[PATH-FINDER] 📁 Created Claude_Conversations directory`);
        }
        
        if (!fs.existsSync(projectsPath)) {
            fs.mkdirSync(projectsPath, { recursive: true });
            console.log(`[PATH-FINDER] 📁 Created Projects directory`);
        }
    }
}

// Export singleton instance
const pathFinder = new SmartSavePathFinder();

module.exports = {
    findClaudeConversationsPath: (startDir) => pathFinder.findClaudeConversationsPath(startDir),
    getProjectsPath: () => pathFinder.getProjectsPath(),
    getPathInfo: () => pathFinder.getPathInfo(),
    ensureDirectories: () => pathFinder.ensureDirectories(),
    pathFinder
};
