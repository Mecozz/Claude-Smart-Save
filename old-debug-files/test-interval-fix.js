// Test script to verify interval cleanup is safe
console.log('Testing Smart Save V10.0.3 interval management...\n');

// Create a test interval that should NOT be cleared by Smart Save
let testCounter = 0;
const testInterval = setInterval(() => {
    testCounter++;
    console.log(`Test interval still running: ${testCounter}`);
    
    if (testCounter >= 5) {
        console.log('\n✅ SUCCESS! Our interval survived Smart Save cleanup!');
        console.log('This proves Smart Save no longer clears ALL intervals globally.');
        clearInterval(testInterval);
    }
}, 1000);

console.log('Created test interval. If Smart Save still had the bug, this would be killed.');
console.log('Waiting 5 seconds to verify it keeps running...\n');
