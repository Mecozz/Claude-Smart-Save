// ============================================
// CLAUDE AUTO-SAVE V7.0 - SIMPLIFIED CHAT TRACKING
// ============================================
// Features:
// - Uses Claude's actual chat names as IDs
// - Simple folder selection per chat
// - Smart fingerprinting prevents duplicates
// - No complex "project" tracking needed
// ============================================

// Clear any existing intervals
for(let i = 1; i < 99999; i++) clearInterval(i);
window.onbeforeunload = null;

// Clear old broken systems
localStorage.removeItem('folder_mappings_v62');
localStorage.removeItem('chat_fingerprints_v62');
localStorage.removeItem('fingerprints_v63');
localStorage.removeItem('project_folders_v63');
console.log('🧹 Starting fresh with V7.0 simplified system');

(() => {
    // Configuration
    const SERVER_URL = 'http://localhost:3737';
    const SESSION_ID = `desktop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const UPDATE_INTERVAL = 1000;
    const MIN_CHANGE_SIZE = 50;
    const MAX_SAVE_SIZE = 500000;
    const FINGERPRINT_LENGTH = 1000;  // Use first 1000 chars as unique ID
    
    // State Management - SIMPLE!
    let currentChatName = '';
    let currentFolder = null;
    let sessionActive = false;
    let saveTimer = null;
    let lastSaveTime = Date.now();
    let indicatorMinimized = false;
    let isShowingModal = false;
    
    // Simple tracking maps
    let chatFolders = {};      // Chat name -> Folder name
    let chatFingerprints = {};  // Chat name -> FIRST 1000 chars (immutable)
    let chatLastContent = {};   // Chat name -> Last 1000 chars (for finding position)
    let lastSeenContent = '';
    
    let stats = { 
        words: 0,
        messages: 0,
        saves: 0,
        tokens: 0,
        duplicatesPrevented: 0,
        chatsTracked: 0
    };
    
    // Load saved mappings
    const loadData = () => {
        const folders = localStorage.getItem('chat_folders_v7');
        if (folders) {
            try {
                chatFolders = JSON.parse(folders);
                console.log(`📚 Loaded ${Object.keys(chatFolders).length} chat->folder mappings`);
            } catch (e) {
                chatFolders = {};
            }
        }
        
        const fingerprints = localStorage.getItem('chat_fingerprints_v7');
        if (fingerprints) {
            try {
                chatFingerprints = JSON.parse(fingerprints);
                console.log(`🔍 Loaded ${Object.keys(chatFingerprints).length} chat fingerprints`);
                // Log first 100 chars of each fingerprint for debugging
                Object.entries(chatFingerprints).forEach(([chat, fp]) => {
                    console.log(`  ${chat}: "${fp.substring(0, 100)}..."`);
                });
            } catch (e) {
                chatFingerprints = {};
            }
        } else {
            console.log('⚠️ No fingerprints found in localStorage');
            chatFingerprints = {};
        }
        
        const lastContent = localStorage.getItem('chat_last_content_v7');
        if (lastContent) {
            try {
                chatLastContent = JSON.parse(lastContent);
                console.log(`📄 Loaded ${Object.keys(chatLastContent).length} last content positions`);
            } catch (e) {
                chatLastContent = {};
            }
        }
    };
    
    // Save mappings
    const saveData = () => {
        localStorage.setItem('chat_folders_v7', JSON.stringify(chatFolders));
        localStorage.setItem('chat_fingerprints_v7', JSON.stringify(chatFingerprints));
        localStorage.setItem('chat_last_content_v7', JSON.stringify(chatLastContent));
    };
    
    // Get chat name from Claude UI
    const getChatName = () => {
        // First try document title (most reliable)
        if (document.title && document.title !== 'Claude' && document.title !== 'Claude.ai') {
            // Remove " - Claude" suffix if present
            return document.title.replace(' - Claude', '').trim();
        }
        
        // Fallback to first message
        const firstMsg = document.querySelector('[class*="message"]');
        if (firstMsg) {
            const text = firstMsg.innerText || firstMsg.textContent;
            if (text && text.length > 10) {
                return text.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '_').trim();
            }
        }
        
        return '';  // Return empty string for untitled
    };
    
    // Get conversation content
    const getConversationContent = () => {
        const selectors = [
            'main[class*="conversation"]',
            'div[class*="conversation-container"]',
            'div[class*="chat-messages"]',
            'main:not(aside):not(nav)'
        ];
        
        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                const text = container.innerText || '';
                if (!text.includes('New chat\nChats\nProjects') && text.length > 50) {
                    return text;
                }
            }
        }
        
        return document.body.innerText || '';
    };
    
    // Get content to save (using START of conversation as fingerprint)
    const getContentToSave = (fullContent, chatName) => {
        const fingerprint = chatFingerprints[chatName];
        
        if (!fingerprint) {
            // First time seeing this chat - save the BEGINNING as fingerprint
            console.log(`🆕 First save for: "${chatName}"`);
            stats.chatsTracked++;
            return { content: fullContent, isNew: true };
        }
        
        // Find the actual conversation start (skip sidebar which changes)
        const conversationMarkers = [
            chatName + '\nDC\n',  // Chat name followed by DC
            'Human:',              // First human message
            'Assistant:'           // First assistant message
        ];
        
        let actualStart = 0;
        for (const marker of conversationMarkers) {
            const markerIndex = fullContent.indexOf(marker);
            if (markerIndex !== -1 && markerIndex < 3000) {
                actualStart = markerIndex;
                break;
            }
        }
        
        // Get the actual conversation content (skip sidebar)
        const actualContent = fullContent.substring(actualStart);
        const actualFingerprint = actualContent.substring(0, Math.min(FINGERPRINT_LENGTH, actualContent.length));
        
        // Calculate similarity between fingerprints
        const getSimilarity = (str1, str2) => {
            const minLen = Math.min(str1.length, str2.length);
            let matches = 0;
            
            // Check how many characters match
            for (let i = 0; i < minLen; i++) {
                if (str1[i] === str2[i]) matches++;
            }
            
            // Also check if one contains a significant portion of the other
            const checkLen = Math.min(500, minLen);
            const portion1 = str1.substring(0, checkLen);
            const portion2 = str2.substring(0, checkLen);
            
            if (str1.includes(portion2) || str2.includes(portion1)) {
                matches = Math.max(matches, checkLen * 0.8);
            }
            
            return matches / minLen;
        };
        
        const similarity = getSimilarity(actualFingerprint, fingerprint);
        console.log(`📊 Fingerprint similarity: ${Math.round(similarity * 100)}%`);
        
        // If similarity is > 50%, it's the same conversation
        if (similarity > 0.5) {
            console.log(`✅ Same conversation detected (${Math.round(similarity * 100)}% match)`);
            
            // Find where we left off using last saved content
            const lastSaved = chatLastContent[chatName];
            if (lastSaved) {
                const lastPosition = fullContent.lastIndexOf(lastSaved);
                if (lastPosition !== -1) {
                    const newContent = fullContent.substring(lastPosition + lastSaved.length);
                    if (newContent.length < MIN_CHANGE_SIZE) {
                        stats.duplicatesPrevented++;
                        console.log(`⏭️ No new content to save`);
                        return { content: '', isNew: false };
                    }
                    console.log(`📝 Appending ${newContent.length} new chars`);
                    chatLastContent[chatName] = fullContent.substring(Math.max(0, fullContent.length - 1000));
                    return { content: newContent, isNew: false };
                }
            }
            
            // Fallback - couldn't find last position, but we know it's same conversation
            console.log(`📝 Same conversation but couldn't find position - using safe fallback`);
            // Try to find a safe point to continue from
            const safeMarkers = ['Assistant:', 'Human:', '\n\n'];
            let safePosition = Math.max(0, fullContent.length - 10000); // Last 10k chars
            
            for (const marker of safeMarkers) {
                const pos = fullContent.lastIndexOf(marker, fullContent.length - 1000);
                if (pos > safePosition) {
                    safePosition = pos;
                }
            }
            
            const safeContent = fullContent.substring(safePosition);
            chatLastContent[chatName] = fullContent.substring(Math.max(0, fullContent.length - 1000));
            return { content: safeContent, isNew: false };
        }
        
        // Less than 50% match - different conversation
        console.log(`⚠️ Different conversation (<50% match) for "${chatName}" - full capture`);
        return { content: fullContent, isNew: true };
    };
    
    // Update fingerprint after save (stores BEGINNING of actual conversation)
    const updateFingerprint = (fullContent, chatName) => {
        // Store the FIRST 1000 chars of actual conversation as fingerprint
        if (!chatFingerprints[chatName]) {
            // Find where the actual conversation starts
            const conversationMarkers = [
                chatName + '\nDC\n',
                'Human:',
                'I\'m working on'
            ];
            
            let actualStart = 0;
            for (const marker of conversationMarkers) {
                const markerIndex = fullContent.indexOf(marker);
                if (markerIndex !== -1 && markerIndex < 2000) {
                    actualStart = markerIndex;
                    break;
                }
            }
            
            const actualContent = fullContent.substring(actualStart);
            chatFingerprints[chatName] = actualContent.substring(0, Math.min(FINGERPRINT_LENGTH, actualContent.length));
            console.log(`✅ Fingerprint created for "${chatName}" (from actual conversation)`);
        }
        
        // Always update the last content for finding position next time
        chatLastContent[chatName] = fullContent.substring(Math.max(0, fullContent.length - 1000));
        saveData();
    };
    
    // Create folder selection modal (SIMPLE!)
    const askForFolder = (chatName) => {
        return new Promise(async (resolve) => {
            if (isShowingModal) {
                resolve(null);
                return;
            }
            
            isShowingModal = true;
            
            // Get existing folders from server
            let existingFolders = [];
            try {
                const response = await fetch(`${SERVER_URL}/api/projects`);
                if (response.ok) {
                    const data = await response.json();
                    existingFolders = data.projects.map(p => p.name);
                }
            } catch (error) {
                console.log('Could not fetch folders');
            }
            
            const modal = document.createElement('div');
            modal.id = 'folder-modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2147483647;
                animation: fadeIn 0.3s ease;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 30px;
                width: 450px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            `;
            
            modalContent.innerHTML = `
                <div style="color: white; font-family: -apple-system, sans-serif;">
                    <h2 style="margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                        📁 Where should I save this chat?
                    </h2>
                    
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 14px;">
                            Chat: <strong>${chatName}</strong>
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-size: 14px;">
                            Select folder:
                        </label>
                        <select id="folder-select" style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 8px;
                            border: none;
                            background: white;
                            color: #333;
                            font-size: 16px;
                        ">
                            <option value="">-- Select Folder --</option>
                            ${existingFolders.map(folder => 
                                `<option value="${folder}">${folder}</option>`
                            ).join('')}
                            ${!existingFolders.includes('General') ? '<option value="General">General</option>' : ''}
                            <option value="__new__">+ Create New Folder</option>
                        </select>
                    </div>
                    
                    <div id="new-folder-div" style="display: none; margin-bottom: 15px;">
                        <input type="text" id="new-folder-name" placeholder="Enter folder name..." style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 8px;
                            border: none;
                            background: white;
                            color: #333;
                            font-size: 16px;
                        ">
                    </div>
                    
                    <button id="folder-continue" style="
                        width: 100%;
                        padding: 12px;
                        border-radius: 8px;
                        border: none;
                        background: white;
                        color: #667eea;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Save Here →
                    </button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Handle folder selection
            document.getElementById('folder-select').addEventListener('change', (e) => {
                const newFolderDiv = document.getElementById('new-folder-div');
                if (e.target.value === '__new__') {
                    newFolderDiv.style.display = 'block';
                } else {
                    newFolderDiv.style.display = 'none';
                }
            });
            
            document.getElementById('folder-continue').addEventListener('click', () => {
                const selected = document.getElementById('folder-select').value;
                const newFolder = document.getElementById('new-folder-name').value.trim();
                
                let folder = selected === '__new__' ? newFolder : selected;
                
                if (!folder) {
                    alert('Please select a folder');
                    return;
                }
                
                modal.remove();
                isShowingModal = false;
                resolve(folder);
            });
            
            // Cancel on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isShowingModal) {
                    modal.remove();
                    isShowingModal = false;
                    resolve(null);
                }
            }, { once: true });
        });
    };
    
    // Create persistent indicator
    const createIndicator = () => {
        const existing = document.getElementById('autosave-indicator');
        if (existing) existing.remove();
        
        const existingMini = document.getElementById('autosave-mini');
        if (existingMini) existingMini.remove();
        
        const indicator = document.createElement('div');
        indicator.id = 'autosave-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px 16px;
            border-radius: 12px;
            font-size: 12px;
            font-family: -apple-system, sans-serif;
            z-index: 2147483647;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            cursor: move;
            user-select: none;
            min-width: 320px;
            max-width: 400px;
            display: ${indicatorMinimized ? 'none' : 'block'};
            transition: all 0.3s ease;
        `;
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div id="status-dot" style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                        <span>Auto-Save V7.0 (Simplified)</span>
                        <button id="minimize-btn" style="
                            background: rgba(255,255,255,0.2);
                            border: none;
                            color: white;
                            padding: 2px 8px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 10px;
                        ">_</button>
                    </div>
                    <div style="font-size: 10px; opacity: 0.9; line-height: 1.4;">
                        <div id="chat-info" style="color: #fbbf24; font-weight: 600;"></div>
                        <div id="folder-info" style="color: #86efac;"></div>
                        <div id="token-info"></div>
                        <div id="save-stats"></div>
                        <div id="tracking-info" style="color: #a78bfa; margin-top: 4px;"></div>
                    </div>
                </div>
            </div>
        `;
        
        const miniIndicator = document.createElement('div');
        miniIndicator.id = 'autosave-mini';
        miniIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-family: -apple-system, sans-serif;
            z-index: 2147483647;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            cursor: pointer;
            display: ${indicatorMinimized ? 'flex' : 'none'};
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        `;
        
        miniIndicator.innerHTML = `
            <div id="mini-status-dot" style="width: 6px; height: 6px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
            <span id="mini-chat">💬 ${currentChatName || 'No chat'}</span>
            <span id="mini-saves" style="opacity: 0.8;">💾 ${stats.saves}</span>
        `;
        
        document.body.appendChild(indicator);
        document.body.appendChild(miniIndicator);
        
        // Draggable
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0, yOffset = 0;
        
        indicator.addEventListener('mousedown', (e) => {
            if (e.target.id === 'minimize-btn') return;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                indicator.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.getElementById('minimize-btn').addEventListener('click', () => {
            indicatorMinimized = true;
            indicator.style.display = 'none';
            miniIndicator.style.display = 'flex';
        });
        
        miniIndicator.addEventListener('click', () => {
            indicatorMinimized = false;
            indicator.style.display = 'block';
            miniIndicator.style.display = 'none';
        });
        
        return { indicator, miniIndicator };
    };
    
    const updateIndicator = (status, color = null) => {
        const indicator = document.getElementById('autosave-indicator');
        if (indicator && !indicatorMinimized) {
            const dot = document.getElementById('status-dot');
            const chatInfo = document.getElementById('chat-info');
            const folderInfo = document.getElementById('folder-info');
            const tokenInfo = document.getElementById('token-info');
            const statsEl = document.getElementById('save-stats');
            const trackingInfo = document.getElementById('tracking-info');
            
            if (color && dot) {
                dot.style.background = color;
            }
            
            if (chatInfo && currentChatName) {
                chatInfo.textContent = `💬 ${currentChatName}`;
            }
            
            if (folderInfo && currentFolder) {
                folderInfo.textContent = `📁 Saving to: ${currentFolder}/`;
            }
            
            // Calculate tokens
            const estimatedTokens = Math.round(stats.words * 1.3);
            const tokensRemaining = Math.max(0, 200000 - estimatedTokens);
            const tokenPercent = Math.round((tokensRemaining / 200000) * 100);
            
            if (tokenInfo) {
                const tokenColor = tokenPercent > 50 ? '#4ade80' : tokenPercent > 25 ? '#fbbf24' : '#ef4444';
                tokenInfo.innerHTML = `<span style="color: ${tokenColor}">🎯 ${estimatedTokens.toLocaleString()} / 200k tokens (${tokenPercent}% left)</span>`;
            }
            
            if (statsEl) {
                statsEl.textContent = `💬 ${stats.messages} msgs • 📝 ${stats.words.toLocaleString()} words • 💾 ${stats.saves} saves`;
            }
            
            if (trackingInfo) {
                trackingInfo.textContent = `🔍 Tracking ${Object.keys(chatFolders).length} chats`;
            }
        }
        
        const miniIndicator = document.getElementById('autosave-mini');
        if (miniIndicator && indicatorMinimized) {
            const miniDot = document.getElementById('mini-status-dot');
            const miniChat = document.getElementById('mini-chat');
            const miniSaves = document.getElementById('mini-saves');
            
            if (color && miniDot) {
                miniDot.style.background = color;
            }
            
            if (miniChat) {
                miniChat.textContent = `💬 ${currentChatName || 'No chat'}`;
            }
            
            if (miniSaves) {
                miniSaves.textContent = `💾 ${stats.saves}`;
            }
        }
    };
    
    // Server communication
    const checkServer = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    };
    
    const startSession = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/project/continue`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: SESSION_ID,
                    chatName: currentChatName || 'Untitled',
                    project: currentFolder || 'General',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                sessionActive = true;
                console.log('✅ V7.0 Session started');
                updateIndicator('Auto-Save Active', '#4ade80');
                return true;
            }
        } catch (error) {
            console.error('❌ Failed to start session:', error);
            updateIndicator('Server Offline', '#ef4444');
            return false;
        }
    };
    
    const saveContent = async (content, chatName, folder, isFullCapture = false) => {
        if (!sessionActive || !content || content.length < MIN_CHANGE_SIZE) return;
        
        const now = Date.now();
        if (now - lastSaveTime < 2000 && !isFullCapture) {
            return;
        }
        
        try {
            const response = await fetch(`${SERVER_URL}/api/project/append`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: SESSION_ID,
                    project: folder,
                    newContent: content,
                    fullContent: getConversationContent(),
                    chatName: chatName,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                lastSaveTime = now;
                stats.saves++;
                
                const fullContent = getConversationContent();
                stats.words = fullContent.split(/\s+/).filter(w => w.length > 0).length;
                stats.messages = (fullContent.match(/Human:|Assistant:/g) || []).length;
                
                console.log(`✅ ${isFullCapture ? 'Full capture' : 'Incremental'}: ${content.length} chars`);
                console.log(`   Chat: "${chatName}" → ${folder}/`);
                
                updateIndicator('Auto-Save Active', '#4ade80');
                
                // Flash
                setTimeout(() => {
                    const dot = document.getElementById('status-dot');
                    const miniDot = document.getElementById('mini-status-dot');
                    if (dot) dot.style.background = '#fbbf24';
                    if (miniDot) miniDot.style.background = '#fbbf24';
                    setTimeout(() => {
                        if (dot) dot.style.background = '#4ade80';
                        if (miniDot) miniDot.style.background = '#4ade80';
                    }, 200);
                }, 100);
            }
        } catch (error) {
            console.error('Save error:', error);
            updateIndicator('Connection Error', '#f59e0b');
        }
    };
    
    // Monitor for changes
    const monitorContent = async () => {
        if (!document.getElementById('autosave-indicator') && !document.getElementById('autosave-mini')) {
            createIndicator();
            updateIndicator('Auto-Save Active', '#4ade80');
        }
        
        const chatName = getChatName();
        const content = getConversationContent();
        
        // Check if we switched chats
        if (chatName && chatName !== currentChatName) {
            console.log(`💬 Switched to: "${chatName}"`);
            
            // Save fingerprint of previous chat before switching
            if (currentChatName && lastSeenContent) {
                updateFingerprint(lastSeenContent, currentChatName);
            }
            
            currentChatName = chatName;
            
            // Check if we know this chat's folder
            if (chatFolders[chatName]) {
                // We've seen this chat before
                currentFolder = chatFolders[chatName];
                console.log(`📁 Using saved folder: ${currentFolder}/`);
            } else {
                // New chat - ask for folder
                console.log(`🆕 New chat detected: "${chatName}"`);
                const folder = await askForFolder(chatName);
                if (folder) {
                    chatFolders[chatName] = folder;
                    currentFolder = folder;
                    saveData();
                    console.log(`📁 Mapped: "${chatName}" → ${folder}/`);
                }
            }
            
            // Check what to save
            if (currentFolder) {
                const toSave = getContentToSave(content, chatName);
                if (toSave.content) {
                const separator = `\n\n${'='.repeat(60)}\n📅 ${toSave.isNew ? 'Full Capture' : 'Continuation'}: ${new Date().toLocaleString()}\n💬 Chat: ${chatName}\n📁 Folder: ${currentFolder}\n${'='.repeat(60)}\n\n`;
                await saveContent(separator + toSave.content, chatName, currentFolder, toSave.isNew);
                updateFingerprint(content, chatName);
                    console.log(`📝 Fingerprint updated and saved for "${chatName}"`);
            } else {
                console.log(`⏭️ No new content for "${chatName}" - fingerprint matched`);
            }
            }
            
            lastSeenContent = content;
        }
        
        // Check for new content in current chat
        if (chatName && content !== lastSeenContent && content.length > lastSeenContent.length + MIN_CHANGE_SIZE) {
            // Make sure we have a folder
            if (!currentFolder && chatFolders[chatName]) {
                currentFolder = chatFolders[chatName];
            } else if (!currentFolder) {
                const folder = await askForFolder(chatName);
                if (folder) {
                    chatFolders[chatName] = folder;
                    currentFolder = folder;
                    saveData();
                }
            }
            
            if (currentFolder) {
                const newContent = content.substring(lastSeenContent.length);
                await saveContent(newContent, chatName, currentFolder, false);
                updateFingerprint(content, chatName);
            }
            
            lastSeenContent = content;
        }
        
        updateIndicator('Auto-Save Active', '#4ade80');
    };
    
    // Initialize
    const initializeRealTimeSave = async () => {
        console.log('🚀 Initializing Claude Auto-Save V7.0...');
        
        const serverOnline = await checkServer();
        if (!serverOnline) {
            console.error('❌ Save server not running!');
            createIndicator();
            updateIndicator('Server Offline', '#ef4444');
            setTimeout(() => initializeRealTimeSave(), 5000);
            return;
        }
        
        loadData();
        createIndicator();
        
        const initialChat = getChatName();
        if (initialChat) {
            currentChatName = initialChat;
            
            // Check if we know this chat
            if (chatFolders[initialChat]) {
                currentFolder = chatFolders[initialChat];
                console.log(`📁 Resuming: "${initialChat}" → ${currentFolder}/`);
            } else {
                // Ask for folder
                const folder = await askForFolder(initialChat);
                if (folder) {
                    chatFolders[initialChat] = folder;
                    currentFolder = folder;
                    saveData();
                }
            }
        }
        
        await startSession();
        
        // Initial capture if needed
        const initialContent = getConversationContent();
        if (initialContent && initialContent.length > 100 && currentChatName && currentFolder) {
            const toSave = getContentToSave(initialContent, currentChatName);
            if (toSave.content) {
                console.log(`📸 Initial capture: ${toSave.isNew ? 'Full' : 'Incremental'}`);
                await saveContent(toSave.content, currentChatName, currentFolder, toSave.isNew);
                updateFingerprint(initialContent, currentChatName);
            }
        }
        
        lastSeenContent = initialContent;
        
        // Start monitoring
        setInterval(monitorContent, UPDATE_INTERVAL);
        
        // Keep visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                if (!document.getElementById('autosave-indicator') && !document.getElementById('autosave-mini')) {
                    createIndicator();
                    updateIndicator('Auto-Save Active', '#4ade80');
                }
            }
        });
    };
    
    // Manual commands
    window.saveNow = async () => {
        console.log('💾 Manual save triggered...');
        const content = getConversationContent();
        const chatName = getChatName();
        
        if (chatName && currentFolder) {
            const toSave = getContentToSave(content, chatName);
            if (toSave.content) {
                await saveContent(toSave.content, chatName, currentFolder, toSave.isNew);
                updateFingerprint(content, chatName);
            }
        }
        console.log('✅ Manual save complete');
    };
    
    window.checkSave = () => {
        console.log('');
        console.log('╔═══════════════════════════════════════════════╗');
        console.log('║   CLAUDE AUTO-SAVE V7.0                      ║');
        console.log('║   SIMPLIFIED CHAT TRACKING                    ║');
        console.log('╚═══════════════════════════════════════════════╝');
        console.log('');
        console.log('💬 Current Chat:', currentChatName || 'None');
        console.log('📁 Current Folder:', currentFolder || 'None');
        console.log('');
        console.log('📊 STATS:');
        console.log('   • Words:', stats.words.toLocaleString());
        console.log('   • Messages:', stats.messages);
        console.log('   • Saves:', stats.saves);
        console.log('   • Chats tracked:', Object.keys(chatFolders).length);
        console.log('   • Duplicates prevented:', stats.duplicatesPrevented);
        console.log('');
        console.log('📂 CHAT → FOLDER MAPPINGS:');
        Object.entries(chatFolders).forEach(([chat, folder]) => {
            console.log(`   ${chat} → ${folder}/`);
        });
        console.log('─────────────────────────────────────────────────');
    };
    
    window.changeFolder = async () => {
        if (!currentChatName) {
            console.log('No active chat');
            return;
        }
        
        const folder = await askForFolder(currentChatName);
        if (folder) {
            chatFolders[currentChatName] = folder;
            currentFolder = folder;
            saveData();
            console.log(`✅ Changed folder for "${currentChatName}" to ${folder}/`);
        }
    };
    
    window.resetMappings = () => {
        localStorage.removeItem('chat_folders_v7');
        localStorage.removeItem('chat_fingerprints_v7');
        chatFolders = {};
        chatFingerprints = {};
        console.log('✅ All mappings cleared');
    };
    
    window.stopSave = () => {
        console.log('🛑 Stopping auto-save...');
        sessionActive = false;
        for(let i = 1; i < 99999; i++) clearInterval(i);
        const indicator = document.getElementById('autosave-indicator');
        const miniIndicator = document.getElementById('autosave-mini');
        if (indicator) indicator.remove();
        if (miniIndicator) miniIndicator.remove();
        console.log('✅ Auto-save stopped');
    };
    
    // Start
    initializeRealTimeSave();
    
    console.log('');
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║   CLAUDE AUTO-SAVE V7.0                      ║');
    console.log('║   SIMPLIFIED & WORKING                        ║');
    console.log('╚═══════════════════════════════════════════════╝');
    console.log('');
    console.log('🎯 SIMPLE SYSTEM:');
    console.log('   ✅ Uses Claude\'s chat names directly');
    console.log('   ✅ One folder per chat');
    console.log('   ✅ Smart fingerprinting prevents duplicates');
    console.log('   ✅ Automatic switching when you switch chats');
    console.log('');
    console.log('💡 Commands:');
    console.log('   saveNow()       - Force save');
    console.log('   checkSave()     - View stats & mappings');
    console.log('   changeFolder()  - Change current chat folder');
    console.log('   resetMappings() - Clear all mappings');
    console.log('   stopSave()      - Stop saving');
    console.log('─────────────────────────────────────────────────');
})();
