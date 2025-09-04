// Smart Save Auto-Injector
// This injects the main script into Claude.ai

console.log('🚀 Smart Save Auto-Injector loading...');

// Check if we're on Claude.ai
if (window.location.hostname === 'claude.ai') {
    console.log('✅ On Claude.ai - injecting Smart Save...');
    
    // Create script element to inject the main script
    const script = document.createElement('script');
    script.textContent = `
        // Load the main Smart Save script from the server
        fetch('http://localhost:3737/inject.js')
            .then(response => response.text())
            .then(code => {
                eval(code);
                console.log('✅ Smart Save injected and running!');
            })
            .catch(err => {
                console.error('❌ Failed to load Smart Save:', err);
                
                // If server is down, show a message
                const indicator = document.createElement('div');
                indicator.style.cssText = \`
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: #ef4444;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    z-index: 10000;
                    font-family: sans-serif;
                \`;
                indicator.textContent = 'Smart Save server not running! Start it with START.command';
                document.body.appendChild(indicator);
                
                setTimeout(() => indicator.remove(), 5000);
            });
    `;
    
    // Inject the script
    (document.head || document.documentElement).appendChild(script);
    script.remove();
} else {
    console.log('❌ Not on Claude.ai - Smart Save not needed');
}
