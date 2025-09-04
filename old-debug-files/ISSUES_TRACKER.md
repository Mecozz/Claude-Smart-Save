# Smart Save Issues & Fixes Tracker
**Created:** September 3, 2025  
**Current Version:** 10.0.4  
**Target Version:** 10.1.0 (after all critical fixes)

---

## 🔴 CRITICAL BUGS (Must Fix Immediately)

### 1. ✅ Memory Leak in chatFiles Map
- **Status:** FIXED in v10.0.2
- **File:** claude-server-v5.js (Line 57)
- **Issue:** The chatFiles Map never clears old entries, growing indefinitely
- **Impact:** Server will eventually run out of memory
- **Fix Applied:** 
  - Added periodic cleanup every 30 minutes
  - Cache entries expire after 1 hour of no access
  - Sessions expire after 2 hours
  - Added memory usage logging
- **Version:** Fixed in 10.0.2 ✅

### 2. ✅ Dangerous Global Interval Clearing
- **Status:** FIXED in v10.0.3
- **File:** claude-desktop-MAIN.js (Line 13)
- **Issue:** Clears ALL intervals on page with for loop to 99999
- **Impact:** Breaks other browser extensions and features
- **Fix Applied:** 
  - Created smartSaveIntervals array to track our intervals
  - Added cleanup function that only clears our intervals
  - Won't interfere with other extensions
- **Version:** Fixed in 10.0.3 ✅

### 3. ✅ Process Killing Too Aggressive
- **Status:** FIXED in v10.0.4
- **Files:** menubar.py, START.command
- **Issue:** killall node kills ALL Node processes system-wide
- **Impact:** Terminates unrelated Node applications
- **Fix Applied:**
  - Implemented PID file tracking system
  - Each process saves its PID to ~/.smart_save_pids/
  - Menubar app tracks server PID
  - Clean shutdown only kills tracked PIDs
  - Won't affect other Node applications
- **Version:** Fixed in 10.0.4 ✅

### 4. ✅ Version Mismatch in Health Check
- **Status:** FIXED in v10.0.3 (as part of centralization)
- **File:** claude-server-v5.js (Lines 101-102)
- **Issue:** Returns hardcoded version instead of actual version
- **Impact:** Incorrect version reporting throughout system
- **Fix Applied:** Server now reads version from config.json
- **Version:** Fixed in 10.0.3 ✅

---

## 🟡 HIGH PRIORITY BUGS

### 5. ❌ Race Condition in Modal Creation
- **Status:** NOT FIXED
- **File:** claude-desktop-MAIN.js (Lines 345-360)

### 6. ❌ Fingerprint Length Mismatch
- **Status:** NOT FIXED
- **File:** claude-desktop-MAIN.js (Line 43 comment)

### 7. ❌ No Error Handling for File Operations
- **Status:** NOT FIXED
- **File:** claude-server-v5.js (Multiple locations)

### 8. ❌ Browser Detection Assumption
- **Status:** NOT FIXED
- **File:** START.command (Lines 69-70)

---

## 🟢 FIXED ISSUES

### 1. ✅ Memory Leak in chatFiles Map (v10.0.2)
- Fixed with periodic cleanup and cache expiration
- Cache cleaned every 30 minutes
- Old sessions removed after 2 hours

### 2. ✅ Dangerous Global Interval Clearing (v10.0.3)
- Now tracks only Smart Save's intervals
- Won't interfere with other browser extensions

### 3. ✅ Process Killing Too Aggressive (v10.0.4)
- Uses PID tracking to kill only Smart Save processes
- Won't affect other Node applications

### 4. ✅ Version Mismatch (v10.0.3)
- All components now read from config.json

---

## 📊 Fix Progress

| Version | Date | Issues Fixed | Issues Remaining |
|---------|------|--------------|------------------|
| 10.0.1  | Sep 3 | Initial fixes | 27 |
| 10.0.2  | Sep 3 | Memory leak | 26 |
| 10.0.3  | Sep 3 | Interval clearing, version centralization | 24 |
| 10.0.4  | Sep 3 | Process management | 23 |
| 10.0.3  | TBD | Interval clearing | 25 |
| 10.0.4  | TBD | Process killing | 24 |
| 10.0.5  | TBD | Version reporting | 23 |

---

## 🔧 Fix Log

### Version 10.0.2 (In Progress)
- **Date:** September 3, 2025
- **Focus:** Memory leak fix
- **Changes:**
  - [ ] Add periodic cleanup for chatFiles Map
  - [ ] Implement 1-hour garbage collection
  - [ ] Add memory usage logging
  - [ ] Test with long-running sessions

### Version 10.0.3 (Planned)
- **Focus:** Fix interval clearing
- **Changes:**
  - [ ] Track our intervals in array
  - [ ] Clear only tracked intervals
  - [ ] Test with other extensions

### Version 10.0.4 (Planned)
- **Focus:** Fix process management
- **Changes:**
  - [ ] Implement PID file tracking
  - [ ] Kill only specific PIDs
  - [ ] Test with other Node apps running

### Version 10.0.5 (Planned)
- **Focus:** Fix version reporting
- **Changes:**
  - [ ] Centralize version in config
  - [ ] Update all version references
  - [ ] Test version display everywhere

---

## 📝 Notes

- Each fix gets its own version bump for easy rollback
- Test thoroughly after each fix before moving to next
- Update this document after each successful fix
- Create backups before each major change
