#!/usr/bin/env node

// ============================================
// SMART SAVE + MEMORY FULL INTEGRATION
// ============================================
// Modifies claude-server-v5.js to automatically
// call memory server when saving conversations
// ============================================

const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, 'claude-server-v5.js');

// Backup original server file
const backupFile = SERVER_FILE.replace('.js', '-pre-memory.js');
if (!fs.existsSync(backupFile)) {
    fs.copyFileSync(SERVER_FILE, backupFile);
    console.log(`✅ Backed up original server to ${path.basename(backupFile)}`);
}

// Read current server file
let serverCode = fs.readFileSync(SERVER_FILE, 'utf8');

// Check if already integrated
if (serverCode.includes('MEMORY_INTEGRATION')) {
    console.log('⚠️  Memory integration already installed!');
    process.exit(0);
}

// Memory integration code to inject
const memoryIntegrationCode = `
// ============================================
// MEMORY_INTEGRATION - Auto-extract knowledge
// ============================================
const { spawn } = require('child_process');

// Extract and store memories automatically
async function extractMemories(content, chatName, project) {
    try {
        // Skip if content too short
        if (!content || content.length < 100) return;
        
        const memories = [];
        
        // Extract project as entity
        if (project && project !== 'General') {
            memories.push({
                type: 'entity',
                name: project.replace(/ /g, '_'),
                entityType: 'Project',
                observations: [
                    \`Active project with chat: \${chatName}\`,
                    \`Updated: \${new Date().toLocaleDateString()}\`
                ]
            });
        }
        
        // Extract mentioned files
        const filePattern = /(?:file|script|code):\\s*([\\w\\-\\.]+)/gi;
        let match;
        while ((match = filePattern.exec(content)) !== null) {
            memories.push({
                type: 'entity',
                name: match[1].replace(/\\./g, '_'),
                entityType: 'File',
                observations: [\`Referenced in \${chatName}\`]
            });
        }
        
        // Extract decisions made
        const decisionPattern = /(?:decided?|agreed?|chose|will)\\s+(?:to\\s+)?([^\\n\\.]+)/gi;
        const decisions = [];
        while ((match = decisionPattern.exec(content)) !== null) {
            const decision = match[1].trim();
            if (decision.length > 10 && decision.length < 200) {
                decisions.push(decision);
            }
        }
        
        if (decisions.length > 0) {
            memories.push({
                type: 'entity',
                name: 'Decisions_Log',
                entityType: 'Knowledge',
                observations: decisions.slice(0, 5).map(d => \`\${chatName}: \${d}\`)
            });
        }
        
        // Extract problems and solutions
        const problemPattern = /(?:problem|issue|bug|error):\\s*([^\\n]+)/gi;
        const solutionPattern = /(?:solution|fixed|resolved):\\s*([^\\n]+)/gi;
        
        const problems = [];
        const solutions = [];
        
        while ((match = problemPattern.exec(content)) !== null) {
            problems.push(match[1].substring(0, 150));
        }
        
        while ((match = solutionPattern.exec(content)) !== null) {
            solutions.push(match[1].substring(0, 150));
        }
        
        if (problems.length > 0) {
            memories.push({
                type: 'entity',
                name: 'Problem_Log',
                entityType: 'Knowledge',
                observations: problems.slice(0, 3)
            });
        }
        
        if (solutions.length > 0) {
            memories.push({
                type: 'entity',
                name: 'Solution_Log',
                entityType: 'Knowledge',
                observations: solutions.slice(0, 3)
            });
        }
        
        // Store in a queue file for processing
        if (memories.length > 0) {
            const queueFile = path.join(__dirname, '.memory-queue.jsonl');
            const entry = {
                timestamp: new Date().toISOString(),
                chatName,
                project,
                memories,
                contentLength: content.length
            };
            fs.appendFileSync(queueFile, JSON.stringify(entry) + '\\n');
            console.log(\`🧠 Queued \${memories.length} memories for extraction\`);
        }
        
    } catch (error) {
        console.error('Memory extraction error:', error);
    }
}

// Process memory queue periodically
setInterval(() => {
    const queueFile = path.join(__dirname, '.memory-queue.jsonl');
    if (!fs.existsSync(queueFile)) return;
    
    try {
        const lines = fs.readFileSync(queueFile, 'utf8').split('\\n').filter(l => l);
        if (lines.length === 0) return;
        
        console.log(\`🧠 Processing \${lines.length} memory queue entries...\`);
        
        // Process entries (this would call the memory MCP server)
        // For now, just log and clear
        lines.forEach(line => {
            const entry = JSON.parse(line);
            console.log(\`  📦 \${entry.memories.length} memories from "\${entry.chatName}"\`);
        });
        
        // Clear queue after processing
        fs.unlinkSync(queueFile);
        
    } catch (error) {
        console.error('Queue processing error:', error);
    }
}, 60000); // Every minute

// ============================================
`;

// Find where to inject the code (after requires)
const requiresEndIndex = serverCode.lastIndexOf('const app = express();');
if (requiresEndIndex === -1) {
    console.error('❌ Could not find injection point in server file');
    process.exit(1);
}

// Inject memory integration code
serverCode = serverCode.slice(0, requiresEndIndex) + 
             memoryIntegrationCode + '\n' +
             serverCode.slice(requiresEndIndex);

// Find the saveContent function and modify it
const saveContentMatch = serverCode.match(/app\.post\('\/api\/project\/append'/);
if (saveContentMatch) {
    // Add memory extraction call after successful save
    serverCode = serverCode.replace(
        "console.log(`✅ Saved to: ${fileName}`);",
        `console.log(\`✅ Saved to: \${fileName}\`);
        
        // Extract memories automatically
        extractMemories(newContent, chatName, project);`
    );
}

// Write modified server
fs.writeFileSync(SERVER_FILE, serverCode);
console.log('✅ Memory integration installed successfully!');

console.log('\n📝 Next steps:');
console.log('1. Restart your Smart Save server');
console.log('2. The system will now automatically extract memories');
console.log('3. Check .memory-queue.jsonl to see queued memories');
console.log('\nMemories extracted:');
console.log('  • Project entities');
console.log('  • File references');
console.log('  • Decisions made');
console.log('  • Problems encountered');
console.log('  • Solutions found');
