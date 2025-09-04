// Smart Save Reload Script - No eval() version
// This works around Content Security Policy restrictions

console.log('🔄 Reloading Smart Save without eval...');

// First, clean up any existing instance
if (window.smartSaveCleanup) {
    window.smartSaveCleanup();
    console.log('✅ Cleaned up old instance');
}

// Create a script element to load Smart Save
const script = document.createElement('script');
script.src = 'http://localhost:3737/inject.js';
script.onload = function() {
    console.log('✅ Smart Save loaded successfully!');
    
    // Verify it's working after 2 seconds
    setTimeout(() => {
        const messages = document.querySelectorAll('[data-testid*="message"]');
        console.log('📊 Messages found:', messages.length);
        
        if (messages.length > 0) {
            let content = '';
            messages.forEach(msg => {
                const text = msg.innerText || msg.textContent || '';
                if (text) content += text + '\n\n';
            });
            
            const words = content.split(/\s+/).filter(w => w.length > 0).length;
            console.log('📝 Actual word count:', words);
            console.log('🔄 Updates every 1 second now!');
            
            // Check if indicator exists
            const indicator = document.getElementById('autosave-indicator');
            const miniIndicator = document.getElementById('autosave-mini');
            
            if (indicator || miniIndicator) {
                console.log('✅ Indicator is present and should be updating');
            } else {
                console.log('⚠️ No indicator found - may need manual injection');
            }
        }
    }, 2000);
};

script.onerror = function() {
    console.error('❌ Failed to load Smart Save script');
    console.log('Try manual injection: Copy the script from http://localhost:3737/inject.js');
};

// Append the script to the document
document.head.appendChild(script);

console.log('⏳ Loading Smart Save...');