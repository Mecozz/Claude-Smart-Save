// ============================================
// PATH FINDER - PORTABLE VERSION
// ============================================
// Always saves relative to where Smart-Save lives
// Move the folder anywhere - it just works!
// ============================================

const fs = require('fs');
const path = require('path');

// Find Claude_Conversations folder relative to where we are
function findClaudeConversationsPath(startDir) {
    // ALWAYS use relative path to the project folder
    // Never use iCloud or system-specific paths
    let currentDir = startDir || __dirname;
    
    // Look for Claude_Conversations in current structure
    // Should be at ../Claude_Conversations from Claude_AutoSave_FINAL
    const relativePath = path.join(currentDir, '..', 'Claude_Conversations');
    
    // Create if doesn't exist
    if (!fs.existsSync(relativePath)) {
        console.log(`📁 Creating conversations folder at: ${relativePath}`);
        fs.mkdirSync(relativePath, { recursive: true });
        fs.mkdirSync(path.join(relativePath, 'Projects'), { recursive: true });
        fs.mkdirSync(path.join(relativePath, 'Projects', 'General'), { recursive: true });
    } else {
        console.log(`📁 Using conversations folder at: ${relativePath}`);
    }
    
    return relativePath;
}

// Ensure all directories exist
function ensureDirectories() {
    const baseDir = findClaudeConversationsPath();
    const dirs = [
        path.join(baseDir, 'Projects'),
        path.join(baseDir, 'Projects', 'General')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        }
    });
}

// Get path info for debugging
function getPathInfo() {
    const baseDir = findClaudeConversationsPath();
    const projectsDir = path.join(baseDir, 'Projects');
    
    let projects = [];
    if (fs.existsSync(projectsDir)) {
        projects = fs.readdirSync(projectsDir)
            .filter(f => fs.statSync(path.join(projectsDir, f)).isDirectory());
    }
    
    return {
        basePath: baseDir,
        projectsPath: projectsDir,
        projects: projects,
        projectCount: projects.length,
        isPortable: true,  // Always portable now!
        currentLocation: __dirname.includes('iCloud') ? 'iCloud' : 'Local'
    };
}

module.exports = {
    findClaudeConversationsPath,
    ensureDirectories,
    getPathInfo
};
