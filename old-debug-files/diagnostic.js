// Diagnostic script - run this in the browser console where Smart Save is loaded
console.log('🔍 SMART SAVE DIAGNOSTIC');
console.log('========================');

// Check if script is loaded
console.log('1. Script loaded:', typeof getChatName !== 'undefined' ? '✅ Yes' : '❌ No');

// Check document title
console.log('2. Document title:', document.title);

// Check if getChatName function exists and works
if (typeof getChatName !== 'undefined') {
    const chatName = getChatName();
    console.log('3. getChatName() returns:', chatName || '(empty string)');
} else {
    console.log('3. getChatName() not found ❌');
}

// Check if getConversationContent works
if (typeof getConversationContent !== 'undefined') {
    const content = getConversationContent();
    console.log('4. Content length:', content ? content.length : 0);
    console.log('   First 100 chars:', content ? content.substring(0, 100) : '(none)');
} else {
    console.log('4. getConversationContent() not found ❌');
}

// Check localStorage
console.log('5. localStorage data:');
console.log('   chat_folders_v7:', localStorage.getItem('chat_folders_v7'));
console.log('   chat_fingerprints_v7:', localStorage.getItem('chat_fingerprints_v7') ? 'Present' : 'Empty');

// Check current state variables
console.log('6. Current state:');
console.log('   currentChatName:', typeof currentChatName !== 'undefined' ? currentChatName : 'undefined');
console.log('   currentFolder:', typeof currentFolder !== 'undefined' ? currentFolder : 'undefined');
console.log('   sessionActive:', typeof sessionActive !== 'undefined' ? sessionActive : 'undefined');

// Check server connection
fetch('http://localhost:3737/api/health')
    .then(r => r.json())
    .then(data => console.log('7. Server status:', data))
    .catch(err => console.log('7. Server error:', err.message));

// Check if monitoring is running
console.log('8. Intervals/Timeouts:');
console.log('   smartSaveIntervals:', typeof smartSaveIntervals !== 'undefined' ? smartSaveIntervals : 'undefined');

// Try to manually trigger a save
if (typeof saveContent !== 'undefined' && typeof currentChatName !== 'undefined' && typeof currentFolder !== 'undefined') {
    console.log('9. Attempting manual save...');
    const testContent = 'TEST SAVE FROM DIAGNOSTIC at ' + new Date().toISOString();
    saveContent(testContent, currentChatName || 'Test Chat', currentFolder || 'DumbAss', true)
        .then(() => console.log('   ✅ Manual save completed'))
        .catch(err => console.log('   ❌ Manual save failed:', err));
} else {
    console.log('9. Cannot test save - missing functions or variables');
}

console.log('========================');
console.log('END DIAGNOSTIC');
