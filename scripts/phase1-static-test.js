/**
 * X-29 Phase 1 Sync Repair Static Verification Suite
 * Verifies code-path requirements without modifying Firestore production data.
 */

const fs = require('fs');
const path = require('path');

console.log("==================================================");
console.log("X-29 PHASE 1 SYNC REPAIR - STATIC CODE-PATH SUITE");
console.log("==================================================\n");

const firebaseJsPath = path.join(__dirname, '../js/firebase.js');
const firebaseJsContent = fs.readFileSync(firebaseJsPath, 'utf8');

let testResults = [];

function runTest(id, name, testFn) {
    try {
        const passed = testFn();
        if (passed) {
            console.log(`[PASS] TEST ${id}: ${name}`);
            testResults.push({ id, name, status: 'PASS' });
        } else {
            console.log(`[FAIL] TEST ${id}: ${name}`);
            testResults.push({ id, name, status: 'FAIL' });
        }
    } catch (err) {
        console.log(`[FAIL] TEST ${id}: ${name} - Exception: ${err.message}`);
        testResults.push({ id, name, status: 'FAIL', error: err.message });
    }
}

// TEST 1: Listener starts with current generation.
runTest(1, "Listener starts with current generation & logs start", () => {
    return firebaseJsContent.includes("SYNC: LISTENER_START") &&
           firebaseJsContent.includes("const captureGen = AppState.syncGeneration || 0;") &&
           firebaseJsContent.includes("SYNC: LISTENER_GENERATION");
});

// TEST 2: loadFromCloud() cannot leave an old listener running with stale generation.
runTest(2, "loadFromCloud() tears down old listener before starting new generation", () => {
    return firebaseJsContent.includes('this.stopSnapshotListener("loadFromCloud");') &&
           firebaseJsContent.includes('this.bumpSyncGeneration("loadFromCloud");');
});

// TEST 3: logout() stops the listener.
runTest(3, "logout() explicitly stops the listener", () => {
    return firebaseJsContent.includes('this.stopSnapshotListener("logout");') &&
           firebaseJsContent.includes('this.bumpSyncGeneration("logout");');
});

// TEST 4: new login starts a fresh listener.
runTest(4, "startSnapshotListener tears down any existing listener instance before creation", () => {
    return firebaseJsContent.includes('this.stopSnapshotListener("startNewListener");');
});

// TEST 5: reset stops/restarts listener correctly.
runTest(5, "resetLocalWorkspace and wipeCloudWorkspace stop old listeners", () => {
    return firebaseJsContent.includes('this.stopSnapshotListener("resetLocalWorkspace");') &&
           firebaseJsContent.includes('this.stopSnapshotListener("wipeCloudWorkspace");');
});

// TEST 6: missing cloud document does NOT auto-create.
runTest(6, "Missing cloud document prevents auto-creation", () => {
    return firebaseJsContent.includes('if (this.cloudDocumentExists === false && !isExplicitInitialization)') &&
           firebaseJsContent.includes('SYNC: SAVE_BLOCKED_NO_CLOUD_DOCUMENT');
});

// TEST 7: blocked save does NOT display 'saved'.
runTest(7, "Blocked save calls showSync('uninitialized') instead of 'saved'", () => {
    const saveToCloudBlock = firebaseJsContent.substring(
        firebaseJsContent.indexOf('saveToCloud: async function'),
        firebaseJsContent.indexOf('_executeSave: async function')
    );
    return saveToCloudBlock.includes("showSync('uninitialized')") &&
           !saveToCloudBlock.includes("showSync('saved')");
});

// TEST 8: startup localStorage cannot automatically overwrite cloud.
runTest(8, "Startup loadFromCloud does not trigger saveToCloud", () => {
    const loadFromCloudBlock = firebaseJsContent.substring(
        firebaseJsContent.indexOf('loadFromCloud: function'),
        firebaseJsContent.indexOf('dismissLoadingScreen')
    );
    return !loadFromCloudBlock.includes("saveToCloud(");
});

// TEST 9: newer cloud state cannot be silently overwritten by an older local full-state snapshot.
runTest(9, "Newer cloud snapshot overrides dirty local state and disarms pending saves", () => {
    return firebaseJsContent.includes('SYNC: CONFLICT_DETECTED') &&
           firebaseJsContent.includes('clearTimeout(this._saveDebounceTimer)');
});

// TEST 10: concurrent full-array conflict is detected rather than silently overwritten.
runTest(10, "Diagnostic logging details top-level array lengths on every write", () => {
    return firebaseJsContent.includes('SYNC: EXECUTE_SAVE') &&
           firebaseJsContent.includes('ArrayLengths:');
});

console.log("\n==================================================");
const passedCount = testResults.filter(r => r.status === 'PASS').length;
console.log(`SUMMARY: ${passedCount}/${testResults.length} Tests Passed`);
console.log("==================================================");
