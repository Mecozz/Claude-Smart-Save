// TEST: Force save to verify everything is working after fixes
fetch('http://localhost:3737/api/project/append', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        sessionId: 'test_' + Date.now(),
        project: 'testsaving',
        newContent: '\n\n=== TEST SAVE at ' + new Date().toLocaleString() + ' ===\nVerifying Smart Save is working correctly after all fixes.\n',
        fullContent: 'Test content',
        chatName: 'System Test After Fixes',
        timestamp: new Date().toISOString()
    })
})
.then(res => res.json())
.then(data => console.log('Test result:', data))
.catch(err => console.error('Test failed:', err));