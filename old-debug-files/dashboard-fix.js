// === DASHBOARD FIX SCRIPT ===
// Copy and paste this entire script into the browser console while on the dashboard page

console.clear();
console.log('%c=== Dashboard Fix Script ===', 'color: #4CAF50; font-size: 16px; font-weight: bold');

// Force load all data
async function fixDashboard() {
    console.log('🔧 Fixing dashboard data...\n');
    
    // 1. Load Projects and Stats
    try {
        console.log('📊 Loading projects...');
        const projectsResponse = await fetch('http://localhost:3737/api/projects');
        const projectsData = await projectsResponse.json();
        
        // Calculate totals
        let totalFiles = 0;
        let totalWords = 0;
        let realProjects = 0;
        
        projectsData.projects.forEach(p => {
            if (p.files > 0) {
                totalFiles += p.files;
                totalWords += p.words;
                realProjects++;
            }
        });
        
        // Update top stats
        document.getElementById('totalSaves').textContent = totalFiles;
        document.getElementById('totalProjects').textContent = realProjects;
        document.getElementById('totalWords').textContent = totalWords.toLocaleString();
        document.getElementById('activeSessions').textContent = projectsData.activeSessions || 0;
        
        console.log(`✅ Updated: ${totalFiles} files, ${realProjects} projects, ${totalWords.toLocaleString()} words`);
        
        // Update projects list
        const realProjectsList = projectsData.projects
            .filter(p => !p.name.startsWith('TestProject') && p.files > 0)
            .sort((a, b) => b.words - a.words);
        
        const projectsHtml = realProjectsList.map(project => `
            <div class="project-item" data-project-name="${project.name}" 
                 style="background: #0f3460; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 10px; cursor: pointer;">
                <div class="project-name" style="color: white; font-weight: bold; margin-bottom: 5px;">${project.name}</div>
                <div class="project-stats" style="color: #a8b2d1; font-size: 0.9em;">${project.files} files • ${project.words.toLocaleString()} words</div>
            </div>
        `).join('');
        
        document.getElementById('projectsList').innerHTML = projectsHtml;
        console.log(`✅ Loaded ${realProjectsList.length} projects`);
        
    } catch (error) {
        console.error('❌ Error loading projects:', error);
    }
    
    // 2. Load Memory Stats
    try {
        console.log('\n📊 Loading memory statistics...');
        const statsResponse = await fetch('http://localhost:3737/api/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            // Update memory extraction stats
            document.getElementById('totalMemories').textContent = statsData.memoryCount.toLocaleString();
            document.getElementById('peopleCount').textContent = statsData.peopleCount;
            document.getElementById('projectsCount').textContent = statsData.totalProjects;
            document.getElementById('bugsCount').textContent = statsData.bugsCount.toLocaleString();
            document.getElementById('solutionsCount').textContent = statsData.solutionsCount.toLocaleString();
            
            // Update daily stats
            document.getElementById('extractionsToday').textContent = statsData.dailyStats.today;
            document.getElementById('extractionsWeek').textContent = statsData.dailyStats.thisWeek;
            document.getElementById('extractionsMonth').textContent = statsData.dailyStats.thisMonth;
            
            console.log(`✅ Memory stats updated: ${statsData.memoryCount} memories, ${statsData.peopleCount} people`);
            
            // Update extraction history
            const extractionHistory = document.getElementById('recentExtractions');
            if (extractionHistory) {
                extractionHistory.innerHTML = `
                    <div style="color: #4CAF50; padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 4px; margin-bottom: 5px;">
                        📊 Analysis Complete: ${statsData.totalFiles} files scanned
                    </div>
                    <div style="color: #2196F3; padding: 10px; background: rgba(33, 150, 243, 0.1); border-radius: 4px; margin-bottom: 5px;">
                        📈 Total: ${statsData.totalWords.toLocaleString()} words analyzed
                    </div>
                    <div style="color: #FF9800; padding: 10px; background: rgba(255, 152, 0, 0.1); border-radius: 4px; margin-bottom: 5px;">
                        🏆 Largest: ${statsData.largestProject.name} (${statsData.largestProject.words.toLocaleString()} words)
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
    }
    
    // 3. Fix the auto-refresh timer
    console.log('\n⏱️ Fixing auto-refresh timer...');
    
    // Clear any existing intervals
    for (let i = 1; i < 99999; i++) {
        if (window['timerInterval_' + i]) {
            clearInterval(window['timerInterval_' + i]);
        }
    }
    
    // Create new timer
    let currentTimer = 30;
    const refreshInterval = 30;
    
    window.dashboardTimer = setInterval(() => {
        currentTimer--;
        if (currentTimer <= 0) {
            console.log('🔄 Auto-refreshing...');
            fixDashboard(); // Recursive call
            currentTimer = refreshInterval;
        }
        const timerEl = document.getElementById('refreshTimer');
        if (timerEl) {
            timerEl.textContent = currentTimer;
        }
    }, 1000);
    
    console.log('✅ Timer fixed and running');
    
    console.log('\n%c✨ Dashboard fixed successfully!', 'color: #4CAF50; font-size: 14px; font-weight: bold');
}

// Run the fix
fixDashboard();

// Add manual refresh button
if (!document.getElementById('manualRefreshBtn')) {
    const refreshBtn = document.createElement('button');
    refreshBtn.id = 'manualRefreshBtn';
    refreshBtn.textContent = '🔄 Manual Refresh';
    refreshBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    `;
    refreshBtn.onclick = fixDashboard;
    document.body.appendChild(refreshBtn);
    console.log('✅ Added manual refresh button (bottom-right corner)');
}

console.log('\n📝 Dashboard will auto-refresh every 30 seconds');
console.log('💡 Click the manual refresh button to force update anytime');
