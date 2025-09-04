// Clear all Smart Save cached data and force fresh stats
console.log('🧹 CLEARING ALL CACHED DATA...');

// Clear all localStorage entries related to Smart Save
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('chat') || key.includes('fingerprint') || key.includes('folder') || key.includes('smart') || key.includes('save'))) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  Removed: ${key}`);
});

console.log(`✅ Cleared ${keysToRemove.length} cached items`);

// Now calculate REAL stats
const main = document.querySelector('main');
let realContent = '';
let realWords = 0;

if (main) {
    realContent = main.innerText || '';
    realWords = realContent.split(/\s+/).filter(w => w.length > 0).length;
}

// Count actual messages (look for conversation turns)
const messageCount = (realContent.match(/\n(You|Claude)\n/g) || []).length;

console.log('\n📊 REAL CURRENT STATS:');
console.log(`  Messages: ${messageCount} (estimated)`);
console.log(`  Words: ${realWords.toLocaleString()}`);
console.log(`  Tokens: ${Math.round(realWords * 1.3).toLocaleString()}`);
console.log(`  Context used: ${Math.round((realWords * 1.3 / 200000) * 100)}%`);

// Force remove and recreate indicator with correct stats
const oldIndicator = document.getElementById('autosave-indicator');
const oldMini = document.getElementById('autosave-mini');
if (oldIndicator) oldIndicator.remove();
if (oldMini) oldMini.remove();

console.log('\n🔄 Now reload Smart Save for fresh start:');
console.log('  1. The bad cache is cleared');
console.log('  2. It will calculate fresh stats');
console.log('  3. Should show ~57,000+ words');

// Create temporary indicator showing real stats
const tempIndicator = document.createElement('div');
tempIndicator.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: #22c55e;
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    z-index: 10000;
`;
tempIndicator.innerHTML = `
    <div><b>REAL STATS (after cache clear):</b></div>
    <div>Words: ${realWords.toLocaleString()}</div>
    <div>Tokens: ${Math.round(realWords * 1.3).toLocaleString()}</div>
    <div>Ready for fresh Smart Save reload</div>
`;
document.body.appendChild(tempIndicator);

setTimeout(() => tempIndicator.remove(), 10000);

console.log('✅ Cache cleared! Re-inject Smart Save now.');