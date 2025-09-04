// Force save test - run this in the browser console
(async function() {
    console.log('🔧 Testing Smart Save connection...');
    
    // Get conversation content
    const messages = document.querySelectorAll('[data-testid^="message-"]');
    let content = '';
    messages.forEach(msg => {
        content += msg.innerText + '\n\n';
    });
    
    if (!content) {
        // Fallback to getting all article elements
        const articles = document.querySelectorAll('article');
        articles.forEach(article => {
            content += article.innerText + '\n\n';
        });
    }
    
    console.log(`📝 Found ${content.length} characters of content`);
    
    // Get chat name
    const chatName = document.title.replace(' - Claude', '').trim() || 'Test Chat';
    console.log(`💬 Chat name: ${chatName}`);
    
    // Send to server
    try {
        const response = await fetch('http://localhost:3737/api/project/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'manual_test_' + Date.now(),
                project: 'DumbAss',
                newContent: content,
                chatName: chatName,
                timestamp: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        console.log('✅ Save result:', result);
        
        if (result.success) {
            alert(`Saved ${result.contentLength} characters to ${chatName}.md in DumbAss folder!`);
        } else {
            alert('Save failed: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        alert('Error: ' + error.message);
    }
})();
