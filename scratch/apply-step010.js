const fs = require('fs');

const firebasePath = 'js/firebase.js';
let rawCode = fs.readFileSync(firebasePath, 'utf8');

// Normalize to \n for clean matching
let code = rawCode.replace(/\r\n/g, '\n');

// 1. Add caching fields to window.FirebaseService object definition
const targetDef = `window.FirebaseService = {
    _saveDebounceTimer: null,`;

const replaceDef = `window.FirebaseService = {
    _saveDebounceTimer: null,
    _cachedSerializedRevision: -1,
    _cachedSerializedJson: null,
    _cachedPayload: null,
    _localPersistTimer: null,`;

if (!code.includes(targetDef)) {
    console.error('Target definition not found in js/firebase.js');
    process.exit(1);
}
code = code.replace(targetDef, replaceDef);

// 2. Replace _fastPersistLocalStorage with coalesced + cached version
const targetFastPersist = `    _fastPersistLocalStorage: function() {
        try {
            const currentCache = this._buildCurrentStatePayload();
            const jsonStr = JSON.stringify(currentCache);
            safeStorage.setItem('local_app_state', jsonStr);
            safeStorage.setItem('appState', jsonStr);
            AppState.lastLocalPersistTime = Date.now();
        } catch(e) {}
    },`;

const replaceFastPersist = `    _fastPersistLocalStorage: function(forceSync = false) {
        if (!forceSync) {
            if (this._localPersistTimer) return;
            this._localPersistTimer = setTimeout(() => {
                this._localPersistTimer = null;
                this._fastPersistLocalStorage(true);
            }, 60);
            return;
        }

        if (this._localPersistTimer) {
            clearTimeout(this._localPersistTimer);
            this._localPersistTimer = null;
        }

        try {
            const rev = (typeof AppState !== 'undefined' && AppState && AppState.localRevision) || 0;
            let jsonStr = '';
            if (rev === this._cachedSerializedRevision && this._cachedSerializedJson) {
                jsonStr = this._cachedSerializedJson;
            } else {
                const currentCache = this._buildCurrentStatePayload();
                jsonStr = JSON.stringify(currentCache);
                this._cachedSerializedRevision = rev;
                this._cachedSerializedJson = jsonStr;
                this._cachedPayload = currentCache;
            }
            safeStorage.setItem('local_app_state', jsonStr);
            safeStorage.setItem('appState', jsonStr);
            if (typeof AppState !== 'undefined' && AppState) {
                AppState.lastLocalPersistTime = Date.now();
            }
        } catch(e) {}
    },`;

if (!code.includes(targetFastPersist)) {
    console.error('_fastPersistLocalStorage target not found in js/firebase.js');
    process.exit(1);
}
code = code.replace(targetFastPersist, replaceFastPersist);

// 3. Update saveToCloud line that calls _fastPersistLocalStorage
const targetSavePersist = `        // Fast synchronous local storage persist (0ms latency local safety)
        this._fastPersistLocalStorage();`;

const replaceSavePersist = `        // Coalesced local storage persist (immediate for manual saves, coalesced for background edits)
        this._fastPersistLocalStorage(immediate);`;

if (!code.includes(targetSavePersist)) {
    console.error('targetSavePersist not found in js/firebase.js');
    process.exit(1);
}
code = code.replace(targetSavePersist, replaceSavePersist);

// 4. Update _executeSave cache assignment
const targetExecutePersist = `            // Fast single-pass local storage persist
            window.appState = payload;
            let jsonStr = '';
            try {
                jsonStr = JSON.stringify(payload);
                safeStorage.setItem('local_app_state', jsonStr);
                safeStorage.setItem('appState', jsonStr);
                AppState.lastLocalPersistTime = Date.now();
            } catch(e) {}`;

const replaceExecutePersist = `            // Fast single-pass local storage persist with serialization caching
            window.appState = payload;
            let jsonStr = '';
            try {
                jsonStr = JSON.stringify(payload);
                this._cachedSerializedRevision = targetRevision;
                this._cachedSerializedJson = jsonStr;
                this._cachedPayload = payload;
                safeStorage.setItem('local_app_state', jsonStr);
                safeStorage.setItem('appState', jsonStr);
                AppState.lastLocalPersistTime = Date.now();
            } catch(e) {}`;

if (!code.includes(targetExecutePersist)) {
    console.error('targetExecutePersist not found in js/firebase.js');
    process.exit(1);
}
code = code.replace(targetExecutePersist, replaceExecutePersist);

// 5. Add beforeunload / pagehide listener at the end of firebase.js if not present
if (!code.includes('_fastPersistLocalStorage(true)')) {
    code += `\n// Auto-flush pending local persistence on window unload or page hide\nif (typeof window !== 'undefined') {\n    window.addEventListener('beforeunload', () => {\n        if (window.FirebaseService && typeof window.FirebaseService._fastPersistLocalStorage === 'function') {\n            window.FirebaseService._fastPersistLocalStorage(true);\n        }\n    });\n    window.addEventListener('pagehide', () => {\n        if (window.FirebaseService && typeof window.FirebaseService._fastPersistLocalStorage === 'function') {\n            window.FirebaseService._fastPersistLocalStorage(true);\n        }\n    });\n}\n`;
}

// Write back with CRLF
const finalOutput = code.replace(/\n/g, '\r\n');
fs.writeFileSync(firebasePath, finalOutput, 'utf8');
console.log('js/firebase.js updated successfully with Step 010 optimizations!');
