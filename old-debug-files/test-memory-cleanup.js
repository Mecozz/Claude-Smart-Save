// Test script to verify memory cleanup is working
const http = require('http');

console.log('Testing Smart Save memory cleanup...\n');

// Make multiple requests to create cache entries
async function makeRequest(project, chatName) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            sessionId: `test_${Date.now()}_${Math.random()}`,
            project: project,
            chatName: chatName
        });

        const options = {
            hostname: 'localhost',
            port: 3737,
            path: '/api/project/continue',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(body));
        });

        req.write(data);
        req.end();
    });
}

// Create some test entries
async function test() {
    console.log('Creating test cache entries...');
    
    for (let i = 0; i < 5; i++) {
        await makeRequest(`TestProject${i}`, `TestChat${i}`);
        console.log(`Created cache entry ${i + 1}/5`);
    }
    
    console.log('\n✅ Test complete!');
    console.log('The server will clean these up in the next cleanup cycle (every 30 minutes)');
    console.log('You should see a message like: "🧹 Memory cleanup: Removed X old cache entries"');
    console.log('\nTo see it immediately, wait 30 minutes or restart the server with a shorter interval for testing.');
}

test();
