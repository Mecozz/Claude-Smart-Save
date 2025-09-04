// Debug: Check what messages are being captured
console.log('=== DEBUGGING MESSAGE CAPTURE ===');

// Try different selectors
const selectors = [
    '[data-testid*="message"]',
    '[data-testid="user-message"]',
    '[data-testid="assistant-message"]',
    '[data-message-author]',
    'div[class*="ConversationItem"]',
    'div[class*="Message"]',
    'div[class*="human-message"]',
    'div[class*="assistant-message"]',
    'article',
    '.prose'
];

selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
        console.log(`✓ ${selector}: ${elements.length} found`);
        // Show sample of first element
        if (elements[0].innerText) {
            const preview = elements[0].innerText.substring(0, 50);
            console.log(`  Preview: "${preview}..."`);
        }
    }
});

// Check what's actually being captured
console.log('\n=== CURRENT CAPTURE METHOD ===');
const messages = document.querySelectorAll('[data-testid*="message"]');
console.log(`Found ${messages.length} messages with current selector`);

let humanCount = 0;
let assistantCount = 0;
let totalWords = 0;

messages.forEach((msg, i) => {
    const text = msg.innerText || msg.textContent || '';
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    totalWords += words;
    
    // Try to identify message type
    const isHuman = text.includes('OK') || text.includes('I ') || i % 2 === 0;
    if (isHuman) humanCount++;
    else assistantCount++;
    
    if (i < 3) {
        console.log(`Message ${i + 1}: ${words} words`);
        console.log(`  Type: ${isHuman ? 'Human' : 'Assistant'}`);
        console.log(`  Start: "${text.substring(0, 60)}..."`);
    }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total messages: ${messages.length}`);
console.log(`Human messages: ${humanCount}`);
console.log(`Assistant messages: ${assistantCount}`);
console.log(`Total words captured: ${totalWords}`);

// Try to find Assistant messages specifically
console.log('\n=== LOOKING FOR ASSISTANT CONTENT ===');
const allText = document.body.innerText;
const myResponseSnippet = "checking everything to make sure Smart Save";
if (allText.includes(myResponseSnippet)) {
    console.log('✓ Assistant responses ARE on the page');
    console.log('✗ But not being captured by current selector');
} else {
    console.log('✗ Assistant responses might not be visible');
}