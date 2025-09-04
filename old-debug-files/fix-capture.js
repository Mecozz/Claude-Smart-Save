// Fixed message capture - gets BOTH sides of conversation
const captureAllMessages = () => {
    console.log('=== CAPTURING FULL CONVERSATION ===');
    
    // Method 1: Try to get all text from the main conversation area
    const main = document.querySelector('main');
    if (main) {
        const fullText = main.innerText;
        const words = fullText.split(/\s+/).filter(w => w.length > 0).length;
        console.log(`Method 1 - Main element: ${words} words total`);
        
        // Count actual back-and-forth
        const humanMarkers = (fullText.match(/^You$/gm) || []).length;
        const assistantMarkers = (fullText.match(/^Claude$/gm) || []).length;
        console.log(`Detected ${humanMarkers} human markers, ${assistantMarkers} assistant markers`);
        
        return {
            content: fullText,
            words: words,
            method: 'main'
        };
    }
    
    // Method 2: Get body text but filter out UI elements
    const bodyClone = document.body.cloneNode(true);
    
    // Remove UI elements
    const selectorsToRemove = [
        '#autosave-indicator',
        '#autosave-mini',
        '#folder-modal',
        'nav',
        'header',
        'footer',
        '[class*="sidebar"]',
        '[class*="Sidebar"]',
        'button',
        '[role="navigation"]'
    ];
    
    selectorsToRemove.forEach(selector => {
        bodyClone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    const cleanText = bodyClone.innerText;
    const cleanWords = cleanText.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`Method 2 - Filtered body: ${cleanWords} words`);
    
    return {
        content: cleanText,
        words: cleanWords,
        method: 'filtered-body'
    };
};

// Test it
const result = captureAllMessages();
console.log(`\n✅ Captured ${result.words} words using ${result.method} method`);
console.log('First 500 chars:', result.content.substring(0, 500));

// Check if this includes both sides
const hasYourMessage = result.content.includes('Smart save the issue');
const hasMyResponse = result.content.includes('thoroughly check everything');

console.log(`\n=== VALIDATION ===`);
console.log(`Contains your messages: ${hasYourMessage ? '✅' : '❌'}`);
console.log(`Contains my responses: ${hasMyResponse ? '✅' : '❌'}`);

if (result.words > 1000) {
    console.log('✅ This looks like the full conversation!');
} else {
    console.log('⚠️ Still seems incomplete');
}

// Return the capture function for use
window.captureAllMessages = captureAllMessages;
console.log('\n💡 Function saved as window.captureAllMessages()');
