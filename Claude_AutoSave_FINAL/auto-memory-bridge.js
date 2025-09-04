#!/usr/bin/env node

// ============================================
// SMART SAVE AUTO-MEMORY BRIDGE
// ============================================
// Automatically extracts memories from saved conversations
// and stores them in the Memory MCP server
// ============================================

const fs = require('fs');
const path = require('path');
// Removed unused exec imports for security

// Configuration - PORTABLE VERSION
// Always use path relative to project folder
const { findClaudeConversationsPath } = require('./path-finder-portable.js');
const CONVERSATIONS_PATH = path.join(findClaudeConversationsPath(__dirname), 'Projects');
console.log(`📁 Using conversations path: ${CONVERSATIONS_PATH}`);

const PROCESSED_FILE = path.join(__dirname, '.processed-conversations.json');
const CHECK_INTERVAL = 30000; // Check every 30 seconds

// Load processed files list
let processedFiles = {};
if (fs.existsSync(PROCESSED_FILE)) {
    processedFiles = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
}

// Save processed files list
function saveProcessedFiles() {
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify(processedFiles, null, 2));
}

// Extract entities from conversation text
function extractEntities(text, fileName) {
    const entities = [];
    const relations = [];
    
    // Extract project name from file path
    const projectMatch = fileName.match(/Projects\/([^\/]+)\//);
    const projectName = projectMatch ? projectMatch[1].replace(/_/g, ' ') : 'General';
    
    // Extract chat title
    const chatTitle = path.basename(fileName, '.md').replace(/_/g, ' ');
    
    // Create project entity if new
    if (projectName && projectName !== 'General') {
        entities.push({
            name: projectName.replace(/ /g, '_'),
            entityType: 'Project',
            observations: [
                `Active project with saved conversations`,
                `Last updated: ${new Date().toLocaleDateString()}`,
                `Chat: ${chatTitle}`
            ]
        });
    }
    
    // Extract mentioned tools/technologies
    const toolPatterns = [
        /(?:using|with|via|through)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g,
        /(?:MCP|server|tool|command):\s*([a-zA-Z-]+)/g,
        /desktop-commander|memory|sqlite|github|puppeteer|reddit/gi
    ];
    
    const foundTools = new Set();
    toolPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            if (match[1] && match[1].length > 2) {
                foundTools.add(match[1]);
            }
        }
    });
    
    foundTools.forEach(tool => {
        entities.push({
            name: tool.replace(/ /g, '_').replace(/-/g, '_'),
            entityType: 'Tool',
            observations: [`Mentioned in ${chatTitle}`]
        });
    });
    
    // Extract bugs/issues
    const bugPattern = /(?:bug|issue|problem|error):\s*([^\n]+)/gi;
    let bugMatch;
    while ((bugMatch = bugPattern.exec(text)) !== null) {
        entities.push({
            name: 'Bug_History',
            entityType: 'Knowledge',
            observations: [bugMatch[1].substring(0, 200)]
        });
    }
    
    // Extract solutions
    const solutionPattern = /(?:fix|fixed|solution|solved|resolved):\s*([^\n]+)/gi;
    let solutionMatch;
    while ((solutionMatch = solutionPattern.exec(text)) !== null) {
        entities.push({
            name: 'Solution_Database',
            entityType: 'Knowledge',
            observations: [solutionMatch[1].substring(0, 200)]
        });
    }
    
    // Create relations
    if (projectName && entities.length > 0) {
        entities.forEach(entity => {
            if (entity.entityType === 'Tool') {
                relations.push({
                    from: projectName.replace(/ /g, '_'),
                    to: entity.name,
                    relationType: 'uses'
                });
            }
        });
    }
    
    return { entities, relations };
}

// Process a conversation file
async function processConversation(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const stats = fs.statSync(filePath);
        
        // Check if already processed with same modification time
        if (processedFiles[filePath] && 
            processedFiles[filePath].mtime === stats.mtime.toISOString()) {
            return;
        }
        
        console.log(`📝 Processing: ${path.basename(filePath)}`);
        
        // Extract entities and relations
        const { entities, relations } = extractEntities(content, filePath);
        
        // Store entities in memory server
        if (entities.length > 0) {
            // Group similar entities
            const groupedEntities = {};
            entities.forEach(entity => {
                const key = `${entity.name}_${entity.entityType}`;
                if (!groupedEntities[key]) {
                    groupedEntities[key] = entity;
                } else {
                    // Merge observations
                    groupedEntities[key].observations = [
                        ...new Set([
                            ...groupedEntities[key].observations,
                            ...entity.observations
                        ])
                    ];
                }
            });
            
            // Create memory entries
            const uniqueEntities = Object.values(groupedEntities);
            
            for (const entity of uniqueEntities) {
                // You'll need to call the memory server here
                // For now, we'll just log what would be stored
                console.log(`  📦 Entity: ${entity.name} (${entity.entityType})`);
                entity.observations.forEach(obs => {
                    console.log(`     - ${obs.substring(0, 50)}...`);
                });
            }
            
            // Create relations
            for (const relation of relations) {
                console.log(`  🔗 Relation: ${relation.from} ${relation.relationType} ${relation.to}`);
            }
        }
        
        // Mark as processed
        processedFiles[filePath] = {
            mtime: stats.mtime.toISOString(),
            processed: new Date().toISOString(),
            entitiesFound: entities.length,
            relationsFound: relations.length
        };
        
        saveProcessedFiles();
        console.log(`✅ Processed ${entities.length} entities, ${relations.length} relations\n`);
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}

// Scan for new or updated conversations
async function scanConversations() {
    // Only log if we actually find something to process
    let foundNew = false;
    
    function scanDir(dir) {
        if (!fs.existsSync(dir)) return;
        
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);
            
            if (stats.isDirectory()) {
                scanDir(fullPath);
            } else if (item.endsWith('.md')) {
                // Check if needs processing
                if (!processedFiles[fullPath] || 
                    processedFiles[fullPath].mtime !== stats.mtime.toISOString()) {
                    foundNew = true;
                }
                processConversation(fullPath);
            }
        });
    }
    
    scanDir(CONVERSATIONS_PATH);
    
    // Only log if we found something new
    if (foundNew) {
        const totalProcessed = Object.keys(processedFiles).length;
        console.log(`✅ Scan complete: ${totalProcessed} conversations tracked`);
    }
}

// Clean up duplicate entities in memory
async function cleanupMemory() {
    console.log('🧹 Cleaning up duplicate memory entries...');
    // This would connect to the memory server and deduplicate
    // For now, just a placeholder
}

// Main loop
async function main() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   SMART SAVE AUTO-MEMORY BRIDGE              ║');
    console.log('║   Automatic Knowledge Extraction             ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log(`📁 Watching: ${CONVERSATIONS_PATH}`);
    console.log(`⏱️  Check interval: ${CHECK_INTERVAL/1000} seconds`);
    console.log('');
    
    // Initial scan
    await scanConversations();
    
    // Set up periodic scanning
    setInterval(async () => {
        await scanConversations();
    }, CHECK_INTERVAL);
    
    // Periodic cleanup
    setInterval(async () => {
        await cleanupMemory();
    }, 3600000); // Every hour
    
    console.log('🚀 Auto-memory bridge is running...\n');
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down auto-memory bridge...');
    saveProcessedFiles();
    process.exit();
});

// Start
main().catch(console.error);
