// FIX for getConversationContent function
// Replace the old function at line 165-198 with this:

    // Get conversation content (FIXED for Claude Desktop App!)
    const getConversationContent = () => {
        // First, temporarily hide our indicators
        const indicator = document.getElementById('autosave-indicator');
        const miniIndicator = document.getElementById('autosave-mini');
        const modal = document.getElementById('folder-modal');
        
        if (indicator) indicator.style.display = 'none';
        if (miniIndicator) miniIndicator.style.display = 'none';
        if (modal) modal.style.display = 'none';
        
        let text = '';
        
        // FIXED: Use the selector that WORKS in Claude Desktop App
        const messages = document.querySelectorAll('[data-testid*="message"]');
        if (messages.length > 0) {
            messages.forEach(msg => {
                const msgText = msg.innerText || msg.textContent || '';
                if (msgText) {
                    text += msgText + '\n\n';
                }
            });
        } else {
            // Fallback: try to get from main element
            const main = document.querySelector('main');
            if (main) {
                text = main.innerText || '';
            }
        }
        
        // Restore indicators visibility
        if (indicator && !indicatorMinimized) indicator.style.display = 'block';
        if (miniIndicator && indicatorMinimized) miniIndicator.style.display = 'flex';
        if (modal && isShowingModal) modal.style.display = 'flex';
        
        return text;
    };