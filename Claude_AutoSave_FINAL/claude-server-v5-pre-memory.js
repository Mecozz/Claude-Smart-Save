// ============================================
// CLAUDE AUTO-SAVE SERVER
// ============================================
// Version is managed in config.json
// Files named exactly as chat titles
// Example: "Smart Save Project Planning.md"
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Auto-detect version from folder name
const VERSION = require('./version-detector.js');

// Dynamic path finding
const { findClaudeConversationsPath, ensureDirectories, getPathInfo } = require('./path-finder.js');

// Load configuration
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Add timestamp to console.log for better debugging
const originalLog = console.log;
console.log = function(...args) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    originalLog(`[${timestamp}]`, ...args);
};

// Create fs-extra compatible functions
const ensureDirSync = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const writeFileSync = fs.writeFileSync;
const readFileSync = fs.readFileSync;
const readdirSync = fs.readdirSync;
const existsSync = fs.existsSync;
const statSync = fs.statSync;
const appendFileSync = fs.appendFileSync;

const app = express();
const PORT = 3737;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Base directory for conversations - dynamically detected
const BASE_DIR = findClaudeConversationsPath(__dirname);

// Show path information on startup  
const pathInfo = getPathInfo();
console.log(`[PATHS] Claude_Conversations: ${pathInfo.basePath}`);
console.log(`[PATHS] Projects found: ${pathInfo.projectCount} projects`);
if (pathInfo.projectCount > 0) {
    console.log(`[PATHS] Project folders: ${pathInfo.projects.join(', ')}`);
}
console.log(`[PATHS] Storage type: ${pathInfo.isCloudStorage ? 'Cloud Storage' : 'Local'}`);
console.log(`[PATHS] Portable: ${pathInfo.isPortable ? 'Yes' : 'No'}`);

// Ensure directories exist
ensureDirectories();

// Active sessions
const sessions = new Map();
const chatFiles = new Map(); // Track which file each chat uses

// Memory cleanup - Clear old entries every hour to prevent memory leak
const MAX_CACHE_AGE = 60 * 60 * 1000; // 1 hour in milliseconds
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Run cleanup every 30 minutes

// Store last access time with each cached file
const chatFileAccess = new Map(); // Track last access time

// Periodic cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean old entries from chatFiles cache
    for (const [key, filePath] of chatFiles.entries()) {
        const lastAccess = chatFileAccess.get(key) || 0;
        if (now - lastAccess > MAX_CACHE_AGE) {
            chatFiles.delete(key);
            chatFileAccess.delete(key);
            cleaned++;
        }
    }
    
    // Also clean old sessions
    for (const [sessionId, session] of sessions.entries()) {
        const sessionAge = now - new Date(session.startTime).getTime();
        if (sessionAge > MAX_CACHE_AGE * 2) { // Keep sessions for 2 hours
            sessions.delete(sessionId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Memory cleanup: Removed ${cleaned} old cache entries`);
    }
}, CLEANUP_INTERVAL);

// Get or create chat file - SIMPLIFIED with chat name as filename
const getChatFile = (project, chatName) => {
    const projectDir = path.join(BASE_DIR, 'Projects', project);
    const chatKey = `${project}:${chatName}`;
    
    // Update last access time
    chatFileAccess.set(chatKey, Date.now());
    
    // Check cache first
    if (chatFiles.has(chatKey)) {
        console.log(`📄 Using cached file for: ${chatName}`);
        return chatFiles.get(chatKey);
    }
    
    // Ensure project directory exists
    if (!existsSync(projectDir)) {
        console.log(`📁 Creating new project folder: ${project}/`);
        ensureDirSync(projectDir);
    } else {
        console.log(`📁 Using existing project folder: ${project}/`);
    }
    
    // Generate safe filename - handle UTF-8 properly
    const safeChatTemp = chatName.replace(/[^a-zA-Z0-9\s\-]/g, '_').trim();
    // Properly truncate without breaking characters
    const safeChat = Array.from(safeChatTemp).slice(0, 50).join('');
    const fileName = `${safeChat}.md`;
    const filePath = path.join(projectDir, fileName);
    
    // Check if file already exists
    if (existsSync(filePath)) {
        console.log(`✅ Found existing file: ${fileName}`);
        chatFiles.set(chatKey, filePath); // Add to cache
        return filePath;
    }
    
    // Create new file with header
    console.log(`🆕 Creating new file: ${fileName}`);
    const header = `# ${chatName}

**Project:** ${project}  
**Started:** ${new Date().toLocaleString()}  
${'='.repeat(60)}

`;
    
    writeFileSync(filePath, header);
    console.log(`📄 Created: ${project}/${fileName}`);
    
    chatFiles.set(chatKey, filePath); // Add to cache
    return filePath;
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'running', 
        version: VERSION,
        feature: 'fixed-file-detection',
        activeSessions: sessions.size 
    });
});

// Continue or start project
app.post('/api/project/continue', (req, res) => {
    const { sessionId, project, chatName } = req.body;
    
    const projectDir = path.join(BASE_DIR, 'Projects', project);
    ensureDirSync(projectDir);
    
    // Register session
    sessions.set(sessionId, {
        project,
        chatName,
        startTime: new Date().toISOString()
    });
    
    // Count total words across all files in project
    let totalWords = 0;
    try {
        const files = fs.readdirSync(projectDir);
        files.forEach(file => {
            if (file.endsWith('.md')) {
                const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
                totalWords += content.split(/\s+/).filter(w => w.length > 0).length;
            }
        });
    } catch (error) {
        console.error('Error counting words:', error);
    }
    
    console.log(`✅ Session started for project: ${project}`);
    console.log(`💬 Chat: ${chatName}`);
    console.log(`📊 Project total: ${totalWords} words across all chats`);
    
    res.json({
        success: true,
        project,
        chatName,
        totalWords,
        projectFile: `${project}/`
    });
});

// Append to project
app.post('/api/project/append', (req, res) => {
    const { sessionId, project, newContent, chatName } = req.body;
    
    if (!newContent || newContent.trim().length === 0) {
        return res.json({ success: true, message: 'No content to save' });
    }
    
    try {
        // Get or create the chat file - WILL NOW FIND EXISTING
        const filePath = getChatFile(project, chatName || 'Untitled');
        
        // Append content
        fs.appendFileSync(filePath, newContent);
        
        // Count total words in project
        const projectDir = path.join(BASE_DIR, 'Projects', project);
        let totalWords = 0;
        const files = fs.readdirSync(projectDir);
        files.forEach(file => {
            if (file.endsWith('.md')) {
                const content = fs.readFileSync(path.join(projectDir, file), 'utf-8');
                totalWords += content.split(/\s+/).filter(w => w.length > 0).length;
            }
        });
        
        console.log(`💾 Appended to ${path.basename(filePath)}: +${newContent.length} chars`);
        
        res.json({
            success: true,
            savedTo: filePath,
            contentLength: newContent.length,
            totalWords
        });
        
    } catch (error) {
        console.error('Error appending:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get projects list
app.get('/api/projects', (req, res) => {
    try {
        const projectsDir = path.join(BASE_DIR, 'Projects');
        const projects = [];
        
        if (fs.existsSync(projectsDir)) {
            const dirs = fs.readdirSync(projectsDir);
            
            dirs.forEach(dir => {
                const projectPath = path.join(projectsDir, dir);
                const stat = fs.statSync(projectPath);
                
                if (stat.isDirectory()) {
                    // Count files and words
                    let fileCount = 0;
                    let wordCount = 0;
                    let chatCount = 0;
                    
                    const files = fs.readdirSync(projectPath);
                    files.forEach(file => {
                        if (file.endsWith('.md')) {
                            fileCount++;
                            chatCount++;
                            const content = fs.readFileSync(path.join(projectPath, file), 'utf-8');
                            wordCount += content.split(/\s+/).filter(w => w.length > 0).length;
                        }
                    });
                    
                    projects.push({
                        name: dir,
                        words: wordCount,
                        chats: chatCount,
                        files: fileCount,
                        modified: stat.mtime
                    });
                }
            });
        }
        
        res.json({
            projects,
            totalProjects: projects.length,
            activeSessions: sessions.size
        });
        
    } catch (error) {
        console.error('Error getting projects:', error);
        res.status(500).json({ 
            error: error.message,
            projects: [] 
        });
    }
});

// Get project path
app.get('/api/project/:name/path', (req, res) => {
    try {
        const projectName = req.params.name;
        const projectPath = path.join(BASE_DIR, 'Projects', projectName);
        
        if (fs.existsSync(projectPath)) {
            res.json({
                success: true,
                name: projectName,
                path: projectPath,
                exists: true
            });
        } else {
            res.status(404).json({
                success: false,
                name: projectName,
                path: projectPath,
                exists: false,
                error: 'Project folder not found'
            });
        }
    } catch (error) {
        console.error('Error getting project path:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Open project location in Finder/Explorer
app.post('/api/project/:name/open', (req, res) => {
    try {
        const projectName = req.params.name;
        const projectPath = path.join(BASE_DIR, 'Projects', projectName);
        
        if (fs.existsSync(projectPath)) {
            // Use the appropriate command for macOS
            const { exec } = require('child_process');
            exec(`open "${projectPath}"`, (error) => {
                if (error) {
                    console.error('Error opening folder:', error);
                    res.status(500).json({
                        success: false,
                        error: 'Failed to open folder'
                    });
                } else {
                    console.log(`[FOLDER] Opened: ${projectPath}`);
                    res.json({
                        success: true,
                        message: 'Project folder opened',
                        path: projectPath
                    });
                }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Project folder not found'
            });
        }
    } catch (error) {
        console.error('Error opening project:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Send path to Claude chat
app.post('/api/project/:name/send-to-claude', (req, res) => {
    try {
        const projectName = req.params.name;
        const projectPath = path.join(BASE_DIR, 'Projects', projectName);
        
        if (fs.existsSync(projectPath)) {
            // Create a formatted message for Claude
            const message = `Project: "${projectName}"\nPath: ${projectPath}`;
            
            console.log(`[CLAUDE] Prepared message for project: ${projectName}`);
            
            res.json({
                success: true,
                name: projectName,
                path: projectPath,
                message: message,
                formatted: `The project "${projectName}" is located at:\n\`${projectPath}\`\n\nThis is the full file system path to the project folder.`
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Project folder not found'
            });
        }
    } catch (error) {
        console.error('Error preparing Claude message:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get real statistics from actual files and data
app.get('/api/stats', (req, res) => {
    try {
        const projectsDir = path.join(BASE_DIR, 'Projects');
        const stats = {
            totalConversations: 0,
            totalWords: 0,
            totalProjects: 0,
            totalFiles: 0,
            recentFiles: 0,
            averageWordsPerFile: 0,
            largestProject: { name: '', words: 0 },
            oldestFile: null,
            newestFile: null,
            peopleCount: 0,
            bugsCount: 0,
            solutionsCount: 0,
            memoryCount: 0,
            dailyStats: {
                today: 0,
                thisWeek: 0,
                thisMonth: 0
            }
        };
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        const monthAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        if (fs.existsSync(projectsDir)) {
            const projects = fs.readdirSync(projectsDir);
            
            projects.forEach(projectName => {
                const projectPath = path.join(projectsDir, projectName);
                const stat = fs.statSync(projectPath);
                
                if (stat.isDirectory()) {
                    stats.totalProjects++;
                    let projectWords = 0;
                    let projectFiles = 0;
                    
                    try {
                        const files = fs.readdirSync(projectPath);
                        files.forEach(file => {
                            if (file.endsWith('.md')) {
                                const filePath = path.join(projectPath, file);
                                const fileStat = fs.statSync(filePath);
                                
                                projectFiles++;
                                stats.totalFiles++;
                                
                                // Check if file is recent
                                if (fileStat.mtime > today) stats.dailyStats.today++;
                                if (fileStat.mtime > weekAgo) stats.dailyStats.thisWeek++;
                                if (fileStat.mtime > monthAgo) stats.dailyStats.thisMonth++;
                                
                                // Track oldest and newest files
                                if (!stats.oldestFile || fileStat.mtime < stats.oldestFile.date) {
                                    stats.oldestFile = { name: file, project: projectName, date: fileStat.mtime };
                                }
                                if (!stats.newestFile || fileStat.mtime > stats.newestFile.date) {
                                    stats.newestFile = { name: file, project: projectName, date: fileStat.mtime };
                                }
                                
                                try {
                                    const content = fs.readFileSync(filePath, 'utf-8');
                                    const words = content.split(/\s+/).filter(w => w.length > 0).length;
                                    projectWords += words;
                                    stats.totalWords += words;
                                    
                                    // Analyze content for people, bugs, solutions
                                    const contentLower = content.toLowerCase();
                                    
                                    // Count people mentions (names with capital letters)
                                    const peopleMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
                                    const uniquePeople = new Set(peopleMatches.filter(name => 
                                        name.length > 2 && !['The', 'This', 'That', 'When', 'Where', 'What', 'How'].includes(name)
                                    ));
                                    stats.peopleCount += uniquePeople.size;
                                    
                                    // Count bug-related terms
                                    const bugTerms = ['bug', 'error', 'issue', 'problem', 'broken', 'fail', 'crash', 'exception'];
                                    bugTerms.forEach(term => {
                                        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
                                        stats.bugsCount += matches;
                                    });
                                    
                                    // Count solution-related terms
                                    const solutionTerms = ['fix', 'solve', 'solution', 'resolve', 'answer', 'working', 'success'];
                                    solutionTerms.forEach(term => {
                                        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
                                        stats.solutionsCount += matches;
                                    });
                                    
                                    // Count memory/conversation references
                                    const memoryTerms = ['remember', 'recall', 'conversation', 'discussed', 'mentioned', 'talked'];
                                    memoryTerms.forEach(term => {
                                        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
                                        stats.memoryCount += matches;
                                    });
                                    
                                } catch (readError) {
                                    console.log(`Warning: Could not read file ${filePath}`);
                                }
                            }
                        });
                        
                        stats.totalConversations += projectFiles;
                        
                        // Track largest project
                        if (projectWords > stats.largestProject.words) {
                            stats.largestProject = { name: projectName, words: projectWords };
                        }
                        
                    } catch (readDirError) {
                        console.log(`Warning: Could not read project directory ${projectPath}`);
                    }
                }
            });
        }
        
        // Calculate averages
        stats.averageWordsPerFile = stats.totalFiles > 0 ? Math.round(stats.totalWords / stats.totalFiles) : 0;
        
        // Deduplicate people count (rough estimate)
        stats.peopleCount = Math.max(1, Math.floor(stats.peopleCount / Math.max(1, stats.totalFiles)));
        
        console.log(`[STATS] Generated real statistics: ${stats.totalFiles} files, ${stats.totalWords} words, ${stats.totalProjects} projects`);
        
        res.json({
            success: true,
            ...stats,
            activeSessions: sessions.size,
            serverUptime: process.uptime(),
            lastUpdated: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error generating statistics:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Search across projects
app.post('/api/search', (req, res) => {
    const { query } = req.body;
    const results = [];
    
    try {
        const projectsDir = path.join(BASE_DIR, 'Projects');
        const projects = fs.readdirSync(projectsDir);
        
        projects.forEach(project => {
            const projectPath = path.join(projectsDir, project);
            if (fs.statSync(projectPath).isDirectory()) {
                const files = fs.readdirSync(projectPath);
                
                files.forEach(file => {
                    if (file.endsWith('.md')) {
                        const filePath = path.join(projectPath, file);
                        const content = fs.readFileSync(filePath, 'utf-8');
                        
                        if (content.toLowerCase().includes(query.toLowerCase())) {
                            // Find matching lines
                            const lines = content.split('\n');
                            const matches = lines.filter(line => 
                                line.toLowerCase().includes(query.toLowerCase())
                            );
                            
                            results.push({
                                project,
                                file,
                                matches: matches.slice(0, 5),
                                totalMatches: matches.length
                            });
                        }
                    }
                });
            }
        });
        
        res.json({
            query,
            results,
            totalMatches: results.reduce((sum, r) => sum + r.totalMatches, 0)
        });
        
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get project stats
app.get('/api/project/:name/stats', (req, res) => {
    const projectName = req.params.name;
    const projectPath = path.join(BASE_DIR, 'Projects', projectName);
    
    if (!fs.existsSync(projectPath)) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    try {
        const files = fs.readdirSync(projectPath);
        let totalWords = 0;
        let totalChars = 0;
        let chatCount = 0;
        const chats = [];
        
        files.forEach(file => {
            if (file.endsWith('.md')) {
                const filePath = path.join(projectPath, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const words = content.split(/\s+/).filter(w => w.length > 0).length;
                
                chatCount++;
                totalWords += words;
                totalChars += content.length;
                
                chats.push({
                    file,
                    words,
                    chars: content.length,
                    modified: fs.statSync(filePath).mtime
                });
            }
        });
        
        res.json({
            project: projectName,
            totalWords,
            totalChars,
            chatCount,
            chats: chats.sort((a, b) => b.modified - a.modified),
            averageWordsPerChat: Math.round(totalWords / chatCount)
        });
        
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check file sizes endpoint
app.get('/api/check-sizes', (req, res) => {
    const warnings = [];
    const errors = [];
    const FILE_SIZE_WARNING = 900000; // 900KB
    const FILE_SIZE_LIMIT = 1048576;  // 1MB
    
    try {
        const projectsDir = path.join(BASE_DIR, 'Projects');
        const projects = fs.readdirSync(projectsDir);
        
        projects.forEach(project => {
            const projectPath = path.join(projectsDir, project);
            if (fs.statSync(projectPath).isDirectory()) {
                const files = fs.readdirSync(projectPath);
                
                files.forEach(file => {
                    if (file.endsWith('.md')) {
                        const filePath = path.join(projectPath, file);
                        const stats = fs.statSync(filePath);
                        
                        if (stats.size > FILE_SIZE_LIMIT) {
                            errors.push({
                                project,
                                file,
                                size: stats.size,
                                overBy: stats.size - FILE_SIZE_LIMIT
                            });
                        } else if (stats.size > FILE_SIZE_WARNING) {
                            warnings.push({
                                project,
                                file,
                                size: stats.size,
                                percentOfLimit: Math.round(stats.size / FILE_SIZE_LIMIT * 100)
                            });
                        }
                    }
                });
            }
        });
        
        res.json({
            warnings,
            errors,
            limits: {
                warning: FILE_SIZE_WARNING,
                limit: FILE_SIZE_LIMIT
            }
        });
        
    } catch (error) {
        console.error('Size check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Serve injection script
app.get('/inject.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'claude-desktop-MAIN.js'));
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log(`║   CLAUDE AUTO-SAVE SERVER V${VERSION}              ║`);
    console.log('║   SIMPLIFIED: Chat name = File name           ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📁 Save location: ${BASE_DIR}`);
    console.log('');
    console.log(`🆕 V${VERSION} Improvements:`);
    console.log('   • Files named exactly as chats');
    console.log('   • No more date prefixes or numbers');
    console.log('   • Memory leak prevention');
    console.log('   • Safe interval management');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('─'.repeat(60));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down server...');
    console.log(`📊 Served ${sessions.size} sessions`);
    process.exit(0);
});
