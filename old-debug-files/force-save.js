// Manual save trigger for current conversation
// This will force Smart Save to save right now

console.log('=== FORCING SAVE OF CURRENT CONVERSATION ===');

// Get the current chat name and content
const chatName = document.title.replace(' - Claude', '').trim();
const messages = document.querySelectorAll('[data-testid*="message"]');

let fullContent = '';
messages.forEach(msg => {
    const text = msg.innerText || msg.textContent || '';
    if (text) {
        fullContent += text + '\n\n';
    }
});

console.log('Chat name:', chatName);
console.log('Message count:', messages.length);
console.log('Content length:', fullContent.length);

// Calculate stats
const words = fullContent.split(/\s+/).filter(w => w.length > 0).length;
const tokens = Math.round(words * 1.3);
console.log('Words:', words);
console.log('Tokens:', tokens);

// Force save to server
fetch('http://localhost:3737/api/project/append', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        sessionId: 'force_save_' + Date.now(),
        project: 'testsaving',
        newContent: '\n\n=== MANUAL SAVE at ' + new Date().toLocaleString() + ' ===\n\n' + fullContent.substring(fullContent.length - 2000), // Last 2000 chars
        fullContent: fullContent,
        chatName: chatName,
        timestamp: new Date().toISOString()
    })
})
.then(response => {
    if (response.ok) {
        console.log('✅ SAVE SUCCESSFUL!');
        console.log('File should be updated: testsaving/' + chatName + '.md');
        return response.json();
    } else {
        console.log('❌ Save failed:', response.status);
    }
})
.then(data => {
    if (data) {
        console.log('Server response:', data);
    }
})
.catch(error => {
    console.log('❌ Error:', error);
});

console.log('\n=== CHECK THE FILE TO CONFIRM ===');