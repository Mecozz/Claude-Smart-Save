// Debug script to test Smart Save selectors in Claude Desktop App
// Run this in the console to see what's being detected

console.log('=== SMART SAVE DEBUG TEST ===');

// Test 1: Document Title
console.log('\n1. Document Title:');
console.log('  Title:', document.title);
console.log('  Cleaned:', document.title.replace(' - Claude', '').trim());

// Test 2: Find conversation content
console.log('\n2. Conversation Content Selectors:');
const mainContent = document.querySelector('main[class*="conversation"]');
console.log('  main[class*="conversation"]:', mainContent ? 'FOUND' : 'NOT FOUND');

if (!mainContent) {
    // Try alternative selectors
    const alternatives = [
        'main',
        '[role="main"]',
        'div[class*="conversation"]',
        'div[class*="chat"]',
        'div[class*="messages"]',
        '.conversation-container',
        '#conversation',
        '[data-testid="conversation"]'
    ];
    
    console.log('  Trying alternatives:');
    alternatives.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
            console.log(`    ${selector}: FOUND`);
            console.log(`      Classes: ${el.className}`);
            console.log(`      ID: ${el.id || 'none'}`);
        }
    });
}

// Test 3: Find messages
console.log('\n3. Message Selectors:');
const messageSelectors = [
    '[data-testid*="message"]',
    '[class*="message-content"]',
    '[class*="prose"]',
    'div[class*="human"]',
    'div[class*="assistant"]',
    '[data-message-author]',
    '.message',
    'article'
];

messageSelectors.forEach(selector => {
    const messages = document.querySelectorAll(selector);
    if (messages.length > 0) {
        console.log(`  ${selector}: ${messages.length} found`);
        // Show first message preview
        if (messages[0].innerText) {
            const preview = messages[0].innerText.substring(0, 100);
            console.log(`    Preview: "${preview}..."`);
        }
    }
});

// Test 4: Get actual content
console.log('\n4. Extracting Content:');
let content = '';

// Try to get all text from main
const main = document.querySelector('main');
if (main) {
    content = main.innerText;
    console.log('  Main content length:', content.length);
    console.log('  First 200 chars:', content.substring(0, 200));
    
    // Count messages
    const humanCount = (content.match(/Human:/g) || []).length;
    const assistantCount = (content.match(/Assistant:/g) || []).length;
    console.log('  Human messages:', humanCount);
    console.log('  Assistant messages:', assistantCount);
}

// Test 5: Word and token count
console.log('\n5. Statistics:');
if (content) {
    const words = content.split(/\s+/).filter(w => w.length > 0).length;
    const tokens = Math.round(words * 1.3); // Rough estimate
    console.log('  Words:', words);
    console.log('  Estimated tokens:', tokens);
}

console.log('\n=== END DEBUG TEST ===');
