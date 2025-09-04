// Test script to manually save current conversation
// Paste this into the Claude app's DevTools console

(async function testSave() {
    console.log('🧪 Testing Smart Save...');
    
    const SERVER_URL = 'http://localhost:3737';
    
    // First check if server is running
    try {
        const health = await fetch(`${SERVER_URL}/api/health`);
        const healthData = await health.json();
        console.log('✅ Server is running:', healthData);
    } catch (err) {
        console.error('❌ Server not running:', err);
        return;
    }
    
    // Get conversation content
    function getContent() {
        const messages = document.querySelectorAll('[data-testid^="conversation-turn"], .prose, [class*="prose"], [class*="message"], [class*="Message"]');
        let content = '';
        messages.forEach(msg => {
            const text = msg.innerText || msg.textContent;
            if (text && text.trim()) {
                content += text + '\n\n';
            }
        });
        return content || document.body.innerText;
    }
    
    // Get chat name
    function getChatName() {
        if (document.title && document.title !== 'Claude' && document.title !== 'Claude.ai') {
            return document.title.replace(' - Claude', '').trim();
        }
        
        // Try to find from URL or page elements
        const urlMatch = window.location.href.match(/chat\/([a-z0-9-]+)/i);
        if (urlMatch) return `Chat_${urlMatch[1]}`;
        
        return `Test_Save_${new Date().getTime()}`;
    }
    
    const content = getContent();
    const chatName = getChatName();
    const project = 'testsaving'; // Fixed project for testing
    
    console.log('📝 Chat name:', chatName);
    console.log('📊 Content length:', content.length);
    console.log('📁 Project:', project);
    
    if (content.length < 50) {
        console.warn('⚠️ Content too short to save');
        return;
    }
    
    // Try to save
    try {
        const response = await fetch(`${SERVER_URL}/api/project/append`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'manual_test',
                project: project,
                newContent: content,
                chatName: chatName,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        console.log('✅ Save result:', result);
        
        if (result.success) {
            console.log(`🎉 Successfully saved to: ${result.savedTo}`);
        } else {
            console.error('❌ Save failed:', result);
        }
    } catch (err) {
        console.error('❌ Error saving:', err);
    }
})();
