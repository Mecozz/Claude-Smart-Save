// FIXED Smart Save content extractor for Claude Desktop App
// This should properly get the conversation content and count words/tokens

console.log('=== SMART SAVE FIX TEST ===');

// Get chat name - this is working!
const chatName = document.title.replace(' - Claude', '').trim();
console.log('Chat name:', chatName);

// Get messages using the selector that WORKS
const messages = document.querySelectorAll('[data-testid*="message"]');
console.log('Found', messages.length, 'messages');

// Extract all message content
let fullContent = '';
let messageCount = 0;

messages.forEach((msg, index) => {
    const text = msg.innerText || msg.textContent || '';
    if (text) {
        fullContent += text + '\n\n';
        messageCount++;
        
        // Show first 100 chars of each message
        if (index < 3) {
            console.log(`Message ${index + 1} preview:`, text.substring(0, 100) + '...');
        }
    }
});

console.log('\n=== STATISTICS ===');
console.log('Total messages:', messageCount);
console.log('Content length:', fullContent.length, 'characters');

// Calculate words and tokens
const words = fullContent.split(/\s+/).filter(w => w.length > 0).length;
const tokens = Math.round(words * 1.3);

console.log('Words:', words);
console.log('Estimated tokens:', tokens);

// Show what should be saved
console.log('\n=== WHAT SHOULD BE SAVED ===');
console.log('First 500 chars of conversation:');
console.log(fullContent.substring(0, 500));

// Test the actual save
console.log('\n=== TESTING SAVE FUNCTION ===');

// Check if server is running
fetch('http://localhost:3737/api/health')
    .then(response => response.json())
    .then(data => {
        console.log('✅ Server is running:', data);
        
        // Now try to save
        return fetch('http://localhost:3737/api/project/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: 'debug_test_' + Date.now(),
                project: 'testsaving',
                newContent: fullContent.substring(0, 1000), // Save first 1000 chars as test
                fullContent: fullContent,
                chatName: chatName,
                timestamp: new Date().toISOString()
            })
        });
    })
    .then(response => {
        if (response.ok) {
            console.log('✅ SAVE SUCCESSFUL!');
            console.log('Check the testsaving folder for:', chatName + '.md');
        } else {
            console.log('❌ Save failed:', response.status);
        }
    })
    .catch(error => {
        console.log('❌ Error:', error.message);
    });

console.log('\n=== END FIX TEST ===');
