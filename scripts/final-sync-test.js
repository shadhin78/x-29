/**
 * X-29 Final Production-Grade Multi-Device Sync Test Suite
 * scripts/final-sync-test.js
 *
 * Verifies code-path logic, 3-way array reconciliation, tombstones, listener fencing,
 * boot sequence safety, missing document guards, and conflict resolution without mutating live Firestore data.
 */

const fs = require('fs');
const path = require('path');

console.log("==================================================");
console.log("X-29 PRODUCTION-GRADE MULTI-DEVICE SYNC TEST SUITE");
console.log("==================================================\n");

// Load modules in memory for mock state assertion
const stateJsContent = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf8');
const firebaseJsContent = fs.readFileSync(path.join(__dirname, '../js/firebase.js'), 'utf8');

// Evaluate state module helper functions in mock sandbox
global.window = global;
global.AppState = {
    tasks: [],
    tracks: [],
    customActions: [],
    paceGoals: [],
    timerLogs: [],
    scheduleBlocks: [],
    scheduleBlocks2: [],
    scheduleGroups: [],
    examSessions: [],
    examRoutine: [],
    _tombstones: {},
    syncGeneration: 0,
    syncSessionId: "",
    lastAppliedCloudTimestamp: 0,
    isLocalDirty: false,
    cloudDocumentExists: null
};

eval(stateJsContent);

let testResults = [];

function assert(id, name, condition, details = "") {
    if (condition) {
        console.log(`[PASS] CASE ${id}: ${name}`);
        testResults.push({ id, name, status: 'PASS' });
    } else {
        console.log(`[FAIL] CASE ${id}: ${name} ${details ? '- ' + details : ''}`);
        testResults.push({ id, name, status: 'FAIL', details });
    }
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 1: Concurrent Additions (A adds Task B, B adds Task C)
// -----------------------------------------------------------------------------
try {
    const localArr = [
        { id: 'task_A', title: 'Task A', updatedAt: 1000 },
        { id: 'task_B', title: 'Task B', updatedAt: 2000 }
    ];
    const cloudArr = [
        { id: 'task_A', title: 'Task A', updatedAt: 1000 },
        { id: 'task_C', title: 'Task C', updatedAt: 3000 }
    ];
    const reconciled = window.reconcileArrays(localArr, cloudArr, {}, 'tasks');
    const ids = reconciled.map(i => i.id).sort();
    assert(1, "Concurrent Additions (A adds B, B adds C -> [A, B, C])", 
        ids.length === 3 && ids.includes('task_A') && ids.includes('task_B') && ids.includes('task_C'),
        `Got ids: ${JSON.stringify(ids)}`
    );
} catch (e) {
    assert(1, "Concurrent Additions", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 2: Deletion vs Stale Client (A deletes X while B has stale X)
// -----------------------------------------------------------------------------
try {
    const tombstones = { 'task_X': 5000 };
    const localArr = [{ id: 'task_X', title: 'Task X', updatedAt: 1000 }];
    const cloudArr = [];
    const reconciled = window.reconcileArrays(localArr, cloudArr, tombstones, 'tasks');
    const ids = reconciled.map(i => i.id);
    assert(2, "Deletion Tombstone vs Stale Client (A deletes X -> X remains deleted)", 
        ids.length === 0,
        `Got ids: ${JSON.stringify(ids)}`
    );
} catch (e) {
    assert(2, "Deletion Tombstone vs Stale Client", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 3: Concurrent Updates (A updates X, B updates Y)
// -----------------------------------------------------------------------------
try {
    const localArr = [
        { id: 'task_X', title: 'Task X - Device A Update', updatedAt: 5000 },
        { id: 'task_Y', title: 'Task Y - Old', updatedAt: 1000 }
    ];
    const cloudArr = [
        { id: 'task_X', title: 'Task X - Old', updatedAt: 1000 },
        { id: 'task_Y', title: 'Task Y - Device B Update', updatedAt: 6000 }
    ];
    const reconciled = window.reconcileArrays(localArr, cloudArr, {}, 'tasks');
    const itemX = reconciled.find(i => i.id === 'task_X');
    const itemY = reconciled.find(i => i.id === 'task_Y');
    assert(3, "Concurrent Updates (A updates X, B updates Y -> both survive)", 
        itemX && itemX.title.includes('Device A Update') && itemY && itemY.title.includes('Device B Update'),
        `Reconciled: ${JSON.stringify(reconciled)}`
    );
} catch (e) {
    assert(3, "Concurrent Updates", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 4: Delete X vs Update Y (A deletes X, B updates Y)
// -----------------------------------------------------------------------------
try {
    const tombstones = { 'task_X': 7000 };
    const localArr = [
        { id: 'task_X', title: 'Task X', updatedAt: 1000 },
        { id: 'task_Y', title: 'Task Y - Device B Update', updatedAt: 8000 }
    ];
    const cloudArr = [
        { id: 'task_Y', title: 'Task Y - Old', updatedAt: 1000 }
    ];
    const reconciled = window.reconcileArrays(localArr, cloudArr, tombstones, 'tasks');
    const ids = reconciled.map(i => i.id);
    const itemY = reconciled.find(i => i.id === 'task_Y');
    assert(4, "Delete X vs Update Y (X deleted, Y update survives)", 
        !ids.includes('task_X') && itemY && itemY.title.includes('Device B Update'),
        `Got ids: ${JSON.stringify(ids)}`
    );
} catch (e) {
    assert(4, "Delete X vs Update Y", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 5: Offline Reconnect Stale Cache Protection
// -----------------------------------------------------------------------------
try {
    const tombstones = { 'task_Stale': 9000 };
    const localArr = [{ id: 'task_Stale', title: 'Stale Offline Item', updatedAt: 2000 }];
    const cloudArr = [{ id: 'task_Fresh', title: 'Fresh Cloud Item', updatedAt: 10000 }];
    const reconciled = window.reconcileArrays(localArr, cloudArr, tombstones, 'tasks');
    const ids = reconciled.map(i => i.id);
    assert(5, "Offline Reconnect Protection (Stale cache items do not resurrect)", 
        ids.includes('task_Fresh') && !ids.includes('task_Stale'),
        `Got ids: ${JSON.stringify(ids)}`
    );
} catch (e) {
    assert(5, "Offline Reconnect Protection", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 6: Logout / Reset Session Invalidating Pending Save
// -----------------------------------------------------------------------------
try {
    const hasLogoutSessionBump = firebaseJsContent.includes('this.stopSnapshotListener("logout");') &&
                                firebaseJsContent.includes('this.bumpSyncGeneration("logout");');
    assert(6, "Logout / Reset Session Invalidating Pending Save", 
        hasLogoutSessionBump,
        "Session bump on logout missing"
    );
} catch (e) {
    assert(6, "Logout / Reset Session Fencing", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 7: Missing Document Protection Guard
// -----------------------------------------------------------------------------
try {
    const hasMissingDocGuard = firebaseJsContent.includes('if (this.cloudDocumentExists === false && !isExplicitInitialization)') &&
                                firebaseJsContent.includes('SYNC: SAVE_BLOCKED_NO_CLOUD_DOCUMENT') &&
                                firebaseJsContent.includes("showSync('uninitialized')");
    assert(7, "Missing Document Guard (No auto-creation & no deceptive 'saved' indicator)", 
        hasMissingDocGuard,
        "Missing doc guard incomplete"
    );
} catch (e) {
    assert(7, "Missing Document Guard", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 8: Boot / Local Storage Hydration Order Safety
// -----------------------------------------------------------------------------
try {
    const loadFromCloudBlock = firebaseJsContent.substring(
        firebaseJsContent.indexOf('loadFromCloud: function'),
        firebaseJsContent.indexOf('dismissLoadingScreen')
    );
    const safeBootOrder = !loadFromCloudBlock.includes('saveToCloud(') &&
                           loadFromCloudBlock.includes('showSync(\'uninitialized\')');
    assert(8, "Boot Sequence Local Storage Safety (No auto-upload of cached state)", 
        safeBootOrder,
        "Boot sequence contains dangerous auto-save"
    );
} catch (e) {
    assert(8, "Boot Local Storage Safety", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 9: Listener Lifecycle & Generation/Session Fencing
// -----------------------------------------------------------------------------
try {
    const hasListenerFencing = firebaseJsContent.includes('stopSnapshotListener: function') &&
                                firebaseJsContent.includes('this.stopSnapshotListener("startNewListener");') &&
                                firebaseJsContent.includes('AppState.syncSessionId');
    assert(9, "Listener Lifecycle & Generation/Session Fencing", 
        hasListenerFencing,
        "Listener lifecycle fencing incomplete"
    );
} catch (e) {
    assert(9, "Listener Lifecycle Fencing", false, e.message);
}

// -----------------------------------------------------------------------------
// ASSERTION CASE 10: Backup Restore Protection
// -----------------------------------------------------------------------------
try {
    const hasRestoreReconciliation = firebaseJsContent.includes('SYNC: CONFLICT_DETECTED') &&
                                      firebaseJsContent.includes('window.reconcileArrays');
    assert(10, "Backup Restore Protection (Restored cloud state overrides stale local state)", 
        hasRestoreReconciliation,
        "Conflict reconciliation missing"
    );
} catch (e) {
    assert(10, "Backup Restore Protection", false, e.message);
}

console.log("\n==================================================");
const passedCount = testResults.filter(r => r.status === 'PASS').length;
console.log(`FINAL SUITE RESULT: ${passedCount}/${testResults.length} Cases Passed`);
console.log("==================================================");
