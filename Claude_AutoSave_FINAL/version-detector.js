// ============================================
// VERSION AUTO-DETECTION UTILITY
// ============================================
// Automatically detects version from folder name
// Usage: const version = require('./version-detector.js');

const fs = require('fs');
const path = require('path');

function detectVersionFromFolder() {
    try {
        // Get the parent folder of this script
        let currentDir = __dirname;
        
        // Go up directories until we find one with version pattern
        let attempts = 0;
        while (attempts < 5) { // Safety limit
            const folderName = path.basename(currentDir);
            
            // Match patterns like Smart-Save-V10.0.5, V10.0.5, or 10.0.5
            const versionMatch = folderName.match(/[Vv]?(\d+\.\d+\.\d+)/);
            if (versionMatch) {
                const detectedVersion = versionMatch[1];
                console.log(`[VERSION] Auto-detected from folder '${folderName}': ${detectedVersion}`);
                return detectedVersion;
            }
            
            // Move up one directory
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) break; // Reached root
            currentDir = parentDir;
            attempts++;
        }
        
        // Fallback: try to read from config.json
        try {
            const configPath = path.join(__dirname, 'config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                if (config.version) {
                    console.log(`[VERSION] Using config.json fallback: ${config.version}`);
                    return config.version;
                }
            }
        } catch (configError) {
            // Config fallback failed, continue to hardcoded fallback
        }
        
        // Last resort fallback
        const fallbackVersion = '10.0.5';
        console.log(`[VERSION] Using hardcoded fallback: ${fallbackVersion}`);
        return fallbackVersion;
        
    } catch (error) {
        console.log(`[VERSION] Error detecting version: ${error.message}`);
        return '10.0.5'; // Ultimate fallback
    }
}

module.exports = detectVersionFromFolder();
