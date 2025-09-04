// ============================================
// SAFE RETRY UTILITY FOR SMART SAVE
// ============================================

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryOperation(operation, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            console.log(`⚠️ ${context} failed (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
            
            if (attempt < MAX_RETRIES) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
            }
        }
    }
    
    console.error(`❌ ${context} failed after ${MAX_RETRIES} attempts:`, lastError);
    throw lastError;
}

module.exports = { retryOperation, MAX_RETRIES, RETRY_DELAY };
