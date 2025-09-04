// Dashboard Debug Script
// Add this to the console to debug the dashboard

console.log('=== Dashboard Debug ===');

// Test API endpoints
async function testAPIs() {
    console.log('Testing API endpoints...');
    
    // Test 1: Projects API
    try {
        console.log('Testing /api/projects...');
        const response = await fetch('http://localhost:3737/api/projects');
        const data = await response.json();
        console.log('Projects API Response:', data);
        
        // Try to update the UI
        if (data.projects) {
            const totalFiles = data.projects.reduce((sum, p) => sum + (p.files || 0), 0);
            const totalWords = data.projects.reduce((sum, p) => sum + (p.words || 0), 0);
            const realProjects = data.projects.filter(p => p.files > 0).length;
            
            console.log('Setting UI values:');
            console.log('- Total Files:', totalFiles);
            console.log('- Total Projects:', realProjects);
            console.log('- Total Words:', totalWords);
            
            // Force update the UI
            const savesEl = document.getElementById('totalSaves');
            const projectsEl = document.getElementById('totalProjects');
            const wordsEl = document.getElementById('totalWords');
            const sessionsEl = document.getElementById('activeSessions');
            
            if (savesEl) {
                savesEl.textContent = totalFiles;
                console.log('✅ Updated totalSaves');
            } else {
                console.log('❌ Element totalSaves not found');
            }
            
            if (projectsEl) {
                projectsEl.textContent = realProjects;
                console.log('✅ Updated totalProjects');
            } else {
                console.log('❌ Element totalProjects not found');
            }
            
            if (wordsEl) {
                wordsEl.textContent = totalWords.toLocaleString();
                console.log('✅ Updated totalWords');
            } else {
                console.log('❌ Element totalWords not found');
            }
            
            if (sessionsEl) {
                sessionsEl.textContent = data.activeSessions || 0;
                console.log('✅ Updated activeSessions');
            } else {
                console.log('❌ Element activeSessions not found');
            }
        }
    } catch (error) {
        console.error('Projects API Error:', error);
    }
    
    // Test 2: Stats API
    try {
        console.log('\nTesting /api/stats...');
        const response = await fetch('http://localhost:3737/api/stats');
        const data = await response.json();
        console.log('Stats API Response:', data);
        
        // Update memory stats
        if (data.success) {
            document.getElementById('totalMemories').textContent = data.memoryCount;
            document.getElementById('peopleCount').textContent = data.peopleCount;
            document.getElementById('projectsCount').textContent = data.totalProjects;
            document.getElementById('bugsCount').textContent = data.bugsCount;
            document.getElementById('solutionsCount').textContent = data.solutionsCount;
            console.log('✅ Updated memory stats');
        }
    } catch (error) {
        console.error('Stats API Error:', error);
    }
    
    // Test 3: Check if functions exist
    console.log('\nChecking dashboard functions:');
    console.log('- refreshAll:', typeof refreshAll);
    console.log('- countConversations:', typeof countConversations);
    console.log('- loadMemoryStats:', typeof loadMemoryStats);
    console.log('- loadProjects:', typeof loadProjects);
    
    // Test 4: Manual refresh
    console.log('\nAttempting manual refresh...');
    if (typeof refreshAll === 'function') {
        refreshAll();
        console.log('✅ Called refreshAll()');
    } else {
        console.log('❌ refreshAll function not found');
    }
}

// Run the tests
testAPIs();
