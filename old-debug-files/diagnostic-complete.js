// COMPREHENSIVE SELECTOR DIAGNOSTIC FOR CLAUDE DESKTOP APP
// Paste this in the DevTools console to find working selectors

console.clear();
console.log('%c🔍 SMART SAVE SELECTOR DIAGNOSTIC', 'color: #667eea; font-size: 20px; font-weight: bold');
console.log('=' .repeat(50));

// Function to safely get text from element
function getTextSafe(el) {
    if (!el) return '';
    // Hide our own elements first
    const ourElements = document.querySelectorAll('#autosave-indicator, #autosave-mini, #folder-modal');
    ourElements.forEach(e => e.style.display = 'none');
    const text = el.innerText || el.textContent || '';
    // Restore them
    ourElements.forEach(e => e.style.display = '');
    return text;
}

// 1. Check page structure
console.log('\n📋 PAGE STRUCTURE:');
console.log('  URL:', window.location.href);
console.log('  Title:', document.title);
console.log('  Body classes:', document.body.className);

// 2. Try ALL possible selectors for messages
console.log('\n💬 MESSAGE SELECTORS TEST:');
const selectors = [
    // Data attributes
    '[data-testid*="message"]',
    '[data-testid*="conversation"]',
    '[data-message-id]',
    '[data-message-author]',
    '[data-turn-index]',
    
    // Class-based
    'div[class*="message"]',
    'div[class*="Message"]',
    'div[class*="turn"]',
    'div[class*="Turn"]',
    'div[class*="prose"]',
    'div[class*="human"]',
    'div[class*="assistant"]',
    'div[class*="user"]',
    'div[class*="claude"]',
    'div[class*="conversation-turn"]',
    
    // Semantic/ARIA
    '[role="article"]',
    '[role="log"]',
    '[role="feed"]',
    'article',
    'section[class*="conversation"]',
    
    // Generic but might work
    'main div div div', // nested structure
    '.prose',
    'pre',
    'code'
];

let workingSelectors = [];
selectors.forEach(selector => {
    try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            const firstText = getTextSafe(elements[0]).substring(0, 50);
            if (firstText && firstText.length > 10) {
                console.log(`  ✅ ${selector}: ${elements.length} found`);
                console.log(`     Sample: "${firstText}..."`);
                workingSelectors.push({selector, count: elements.length, sample: firstText});
            }
        }
    } catch(e) {
        // Ignore invalid selectors
    }
});

// 3. Check main content area
console.log('\n📦 MAIN CONTENT AREA:');
const main = document.querySelector('main');
if (main) {
    const mainText = getTextSafe(main);
    console.log('  Main element found');
    console.log('  Total text length:', mainText.length);
    console.log('  Contains "Human:"?', mainText.includes('Human:'));
    console.log('  Contains "Assistant:"?', mainText.includes('Assistant:'));
    
    // Try to identify message structure
    const lines = mainText.split('\n').filter(l => l.trim());
    console.log('  Total lines:', lines.length);
    
    // Look for patterns
    let humanCount = 0;
    let assistantCount = 0;
    lines.forEach(line => {
        if (line.startsWith('Human:')) humanCount++;
        if (line.startsWith('Assistant:')) assistantCount++;
    });
    console.log('  Human messages:', humanCount);
    console.log('  Assistant messages:', assistantCount);
}

// 4. Best recommendation
console.log('\n🎯 RECOMMENDED APPROACH:');
if (workingSelectors.length > 0) {
    console.log('  Best selector:', workingSelectors[0].selector);
    console.log('  Element count:', workingSelectors[0].count);
} else if (main) {
    console.log('  Use main element with innerText');
    console.log('  Fallback: document.body.innerText');
} else {
    console.log('  ⚠️ No reliable selectors found!');
    console.log('  Try: document.body.innerText as last resort');
}

// 5. Test the actual function
console.log('\n🧪 TESTING CURRENT FUNCTION:');
const testContent = getConversationContent();
console.log('  Content length:', testContent ? testContent.length : 0);
if (testContent) {
    console.log('  First 200 chars:', testContent.substring(0, 200));
}

console.log('\n' + '='.repeat(50));
console.log('%c✨ DIAGNOSTIC COMPLETE', 'color: #4ade80; font-size: 16px; font-weight: bold');

// Return working selectors for easy access
workingSelectors;
