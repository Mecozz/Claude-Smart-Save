// ============================================
// CLAUDE AUTO-SAVE SERVER V5.1 - FIXED
// ============================================
// Supports V7.0's simplified chat files
// FIXED: Properly finds existing files by name
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Base directory for conversations
const BASE_DIR = path.join(
    process.env.HOME,
    'Library/Mobile Documents/com~apple~CloudDocs/Smart Save/Claude_Conversations'
);

// Ensure base directory exists
ensureDirSync(BASE_DIR);
ensureDirSync(path.join(BASE_DIR, 'Projects'));

// Active sessions
const sessions = new Map();
const chatFiles = new Map(); // Track which file each chat uses

// Get or create chat file - FIXED to find existing files by name
const getChatFile = (project, chatName) => {
    const projectDir = path.join(BASE_DIR, 'Projects', project);
    
    // Ensure project directory exists
    if (!existsSync(projectDir)) {
        console.log(`📁 Creating new project folder: ${project}/`);
        ensureDirSync(projectDir);
    } else {
        console.log(`📁 Using existing project folder: ${project}/`);
    }
    
    // Generate safe filename
    const safeChat = chatName.replace(/[^a-zA-Z0-9\s\-]/g, '_').substring(0, 50);
    
    // Check if we already have a file for this chat in memory
    const chatKey = `${project}:${chatName}`;
    if (chatFiles.has(chatKey)) {
        console.log(`📄 Using cached file for chat: ${chatName}`);
        return chatFiles.get(chatKey);
    }
    
    // CRITICAL FIX: Look for existing file with this chat name
    const existingFiles = readdirSync(projectDir);
    console.log(`🔍 Searching for existing file for: "${safeChat}"`);
    
    // Find any file that contains the chat name
    const matchingFile = existingFiles.find(file => {
        // Check if filename contains the chat name (accounting for slight variations)
        const normalizedFile = file.toLowerCase();
        const normalizedChat = safeChat.toLowerCase();
        return file.endsWith('.md') && normalizedFile.includes(normalizedChat);
    });
    
    if (matchingFile) {
        const filePath = path.join(projectDir, matchingFile);
        chatFiles.set(chatKey, filePath);
        console.log(`✅ FOUND existing file for "${chatName}": ${matchingFile}`);
        return filePath;
    }
    
    // No existing file found - create new one
    console.log(`🆕 No existing file found for "${safeChat}" - creating new`);
    const date = new Date().toISOString().split('T')[0];
    let chatNumber = 1;
    
    // Find next available number for today
    const todayFiles = existingFiles.filter(f => f.startsWith(date) && f.endsWith('.md'));
    const numbersUsed = todayFiles.map(f => {
        const match = f.match(/Chat_(\d{3})/);
        return match ? parseInt(match[1]) : 0;
    });
    
    if (numbersUsed.length > 0) {
        chatNumber = Math.max(...numbersUsed) + 1;
    }
    
    const fileName = `${date}_Chat_${String(chatNumber).padStart(3, '0')}_${safeChat}.md`;
    const filePath = path.join(projectDir, fileName);
    chatFiles.set(chatKey, filePath);
    
    // Create file with header
    const header = `# Chat: ${chatName}
Project: ${project}
Date: ${new Date().toLocaleString()}
${'='.repeat(60)}

`;
    
    writeFileSync(filePath, header);
    console.log(`📄 Created NEW chat file: ${fileName}`);
    
    return filePath;
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'running', 
        version: '5.1',
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
    console.log('║   CLAUDE AUTO-SAVE SERVER V5.1               ║');
    console.log('║   FIXED: Proper file detection by name        ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📁 Save location: ${BASE_DIR}`);
    console.log('');
    console.log('🆕 V5.1 Fixes:');
    console.log('   • Finds existing files by chat name');
    console.log('   • No more duplicate files');
    console.log('   • Persistent across server restarts');
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
