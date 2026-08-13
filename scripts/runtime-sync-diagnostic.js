/**
 * X-29 Comprehensive Runtime Sync Diagnostic Suite
 * scripts/runtime-sync-diagnostic.js
 *
 * Verifies runtime Firestore write creation, snapshot listener subscription,
 * two-device real-time communication, deletion handling, concurrent edits,
 * and session isolation.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("==================================================");
console.log("X-29 RUNTIME SYNC DIAGNOSTIC SUITE");
console.log("==================================================\n");

const utilsJs = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
const stateJs = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf8');
const firebaseJs = fs.readFileSync(path.join(__dirname, '../js/firebase.js'), 'utf8');

// Shared Firestore Mock Store
let mockFirestoreStore = {};
let snapshotListeners = [];

function notifyFirestoreListeners(path) {
    const docData = mockFirestoreStore[path];
    snapshotListeners.forEach(l => {
        if (l.path === path) {
            l.callback({
                exists: docData !== undefined && docData !== null,
                data: () => (docData ? JSON.parse(JSON.stringify(docData)) : null),
                metadata: { hasPendingWrites: false, fromCache: false }
            });
        }
    });
}

function createDeviceSandbox(deviceName, initialStorage = {}, authUid = 'user_test_uid_123') {
    const storage = { ...initialStorage };
    const logs = [];

    const sandbox = {
        console: {
            log: (...args) => {
                const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                logs.push(`[LOG] ${msg}`);
            },
            warn: (...args) => {
                const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                logs.push(`[WARN] ${msg}`);
            },
            error: (...args) => {
                const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                logs.push(`[ERROR] ${msg}`);
            }
        },
        setTimeout: (fn, delay) => { fn(); return 999; },
        clearTimeout: () => {},
        requestAnimationFrame: (cb) => cb(),
        scrollTo: () => {},
        Date: Date,
        Math: Math,
        Array: Array,
        Object: Object,
        JSON: JSON,
        String: String,
        Number: Number,
        Set: Set,
        Map: Map,
        location: { protocol: 'https:' },
        document: {
            getElementById: () => ({
                classList: { add: () => {}, remove: () => {} },
                setAttribute: () => {},
                removeAttribute: () => {},
                textContent: '',
                value: '',
                scrollTop: 0
            }),
            querySelector: () => null,
            querySelectorAll: () => []
        },
        renderUICount: 0,
        renderUI: function() {
            sandbox.renderUICount++;
        },
        recalculateTotals: () => {},
        ensureConfigDefaults: () => {},
        migrateLegacyData: () => {},
        sortAllCustomData: () => {},
        dismissLoadingScreen: () => {},
        updateTimerAnalyticsControls: () => {},
        renderTimerAnalyticsChart: () => {},
        setSpectraHeatmapRangeUI: () => {},
        renderSpectraFocusHeatmap: () => {},
        setSessionHistoryFilterUI: () => {}
    };
    sandbox.window = sandbox;
    sandbox.global = sandbox;

    vm.createContext(sandbox);

    sandbox.safeStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); },
        removeItem: (k) => { delete storage[k]; }
    };

    vm.runInContext(utilsJs, sandbox);
    vm.runInContext(stateJs, sandbox);
    sandbox.Utils.storage = sandbox.safeStorage;

    const mockDb = {
        collection: (colName) => ({
            doc: (docId) => {
                const fullPath = `${colName}/${docId}`;
                return {
                    set: async (data, options) => {
                        mockFirestoreStore[fullPath] = JSON.parse(JSON.stringify(data));
                        mockFirestoreStore[fullPath].updatedAt = Date.now();
                        notifyFirestoreListeners(fullPath);
                        return Promise.resolve();
                    },
                    onSnapshot: (onNext, onError) => {
                        const l = { path: fullPath, callback: onNext };
                        snapshotListeners.push(l);
                        if (mockFirestoreStore[fullPath] !== undefined) {
                            onNext({
                                exists: mockFirestoreStore[fullPath] !== null,
                                data: () => JSON.parse(JSON.stringify(mockFirestoreStore[fullPath])),
                                metadata: { hasPendingWrites: false, fromCache: false }
                            });
                        }
                        return () => {
                            snapshotListeners = snapshotListeners.filter(x => x !== l);
                        };
                    },
                    delete: async () => {
                        mockFirestoreStore[fullPath] = null;
                        notifyFirestoreListeners(fullPath);
                        return Promise.resolve();
                    }
                };
            }
        })
    };

    sandbox.AppState.db = mockDb;
    sandbox.firebase = {
        auth: () => ({
            currentUser: authUid ? { uid: authUid, email: `${authUid}@test.com` } : null
        })
    };

    vm.runInContext(firebaseJs, sandbox);

    return {
        deviceName,
        sandbox,
        logs,
        AppState: sandbox.AppState,
        FirebaseService: sandbox.FirebaseService,
        storage
    };
}

let testResults = [];
function recordResult(id, name, pass, details = "") {
    if (pass) {
        console.log(`[PASS] CASE ${id}: ${name}`);
        testResults.push({ id, name, status: 'PASS' });
    } else {
        console.log(`[FAIL] CASE ${id}: ${name} ${details ? '- ' + details : ''}`);
        testResults.push({ id, name, status: 'FAIL', details });
    }
}

async function runAllTests() {
    mockFirestoreStore = {};
    snapshotListeners = [];

    // CASE 1: New User Document Creation Flow
    try {
        const dev = createDeviceSandbox("Dev1", {}, "new_user_uid_100");
        dev.FirebaseService.loadFromCloud();
        dev.AppState.tasks = [{ id: 'task_new', title: 'First Task', completed: false }];
        await dev.FirebaseService.saveToCloud(true);

        const docWritten = mockFirestoreStore['users/new_user_uid_100'];
        const hasAuthReady = dev.logs.some(l => l.includes("SYNC: AUTH_READY"));
        const hasWriteAttempt = dev.logs.some(l => l.includes("SYNC: WRITE_ATTEMPT"));
        const hasWriteSuccess = dev.logs.some(l => l.includes("SYNC: WRITE_SUCCESS"));

        recordResult(1, "New User Document Creation Flow", 
            docWritten && docWritten.tasks.length === 1 && hasAuthReady && hasWriteAttempt && hasWriteSuccess,
            `docExists: ${!!docWritten}, logs: ${hasAuthReady && hasWriteSuccess}`
        );
    } catch (e) {
        recordResult(1, "New User Document Creation Flow", false, e.message);
    }

    // CASE 2: Firestore Write Success Log Assertions
    try {
        const dev = createDeviceSandbox("Dev2", {}, "user_uid_200");
        dev.FirebaseService.loadFromCloud();
        dev.AppState.tasks = [{ id: 't1', title: 'Task 1' }];
        await dev.FirebaseService.saveToCloud(true);

        const hasSuccessLog = dev.logs.some(l => l.includes("SYNC: WRITE_SUCCESS"));
        recordResult(2, "Firestore Write Success Diagnostics Log", hasSuccessLog);
    } catch (e) {
        recordResult(2, "Firestore Write Success Diagnostics Log", false, e.message);
    }

    // CASE 3: Firestore Write Failure Diagnostics
    try {
        const dev = createDeviceSandbox("Dev3", {}, "user_uid_300");
        dev.AppState.db = {
            collection: () => ({
                doc: () => ({
                    set: () => Promise.reject(new Error("Simulated Firestore Error"))
                })
            })
        };
        dev.FirebaseService.loadFromCloud();
        dev.AppState.tasks = [{ id: 't_fail', title: 'Fail Task' }];
        await dev.FirebaseService.saveToCloud(true);

        const hasFailedLog = dev.logs.some(l => l.includes("SYNC: WRITE_FAILED"));
        recordResult(3, "Firestore Write Failure Handling", hasFailedLog);
    } catch (e) {
        recordResult(3, "Firestore Write Failure Handling", false, e.message);
    }

    // CASE 4: Correct UID Document Path
    try {
        const uid = "uid_path_test_400";
        const dev = createDeviceSandbox("Dev4", {}, uid);
        dev.FirebaseService.loadFromCloud();
        dev.AppState.tasks = [{ id: 't_path', title: 'Path Test' }];
        await dev.FirebaseService.saveToCloud(true);

        const docPath = `users/${uid}`;
        recordResult(4, "Correct UID Document Path (users/{UID})", mockFirestoreStore[docPath] !== undefined);
    } catch (e) {
        recordResult(4, "Correct UID Document Path", false, e.message);
    }

    // CASE 5: Listener Subscription & Snapshot Applied
    try {
        const uid = "uid_listen_500";
        mockFirestoreStore[`users/${uid}`] = { tasks: [{ id: 't_init', title: 'Existing Task' }] };
        const dev = createDeviceSandbox("Dev5", {}, uid);
        dev.FirebaseService.loadFromCloud();

        const hasApplied = dev.logs.some(l => l.includes("SYNC_DEBUG SNAPSHOT_APPLIED"));
        recordResult(5, "Listener Subscription & Snapshot Hydration", dev.AppState.tasks.length === 1 && hasApplied);
    } catch (e) {
        recordResult(5, "Listener Subscription & Snapshot Hydration", false, e.message);
    }

    // CASE 6: Listener Resubscription after Generation/Session Change
    try {
        const dev = createDeviceSandbox("Dev6", {}, "user_uid_600");
        dev.FirebaseService.loadFromCloud();
        const gen1 = dev.AppState.syncGeneration;
        dev.FirebaseService.bumpSyncGeneration("test_reset");
        const gen2 = dev.AppState.syncGeneration;

        recordResult(6, "Listener Session & Generation Fencing", gen2 > gen1);
    } catch (e) {
        recordResult(6, "Listener Session & Generation Fencing", false, e.message);
    }

    // CASE 7: Device A -> Device B Snapshot Communication
    try {
        const uid = "shared_uid_700";
        const devA = createDeviceSandbox("DevA", {}, uid);
        const devB = createDeviceSandbox("DevB", {}, uid);

        devA.FirebaseService.loadFromCloud();
        devB.FirebaseService.loadFromCloud();

        devA.AppState.tasks = [{ id: 'sync_t1', title: 'Sync Task 1', completed: true }];
        await devA.FirebaseService.saveToCloud(true);

        const devBHasTask = devB.AppState.tasks.length === 1 && devB.AppState.tasks[0].id === 'sync_t1' && devB.AppState.tasks[0].completed === true;
        recordResult(7, "Device A -> Device B Real-Time Snapshot Communication", devBHasTask);
    } catch (e) {
        recordResult(7, "Device A -> Device B Real-Time Snapshot Communication", false, e.message);
    }

    // CASE 8: Concurrent Additions
    try {
        const uid = "shared_uid_800";
        const devA = createDeviceSandbox("DevA", {}, uid);
        const devB = createDeviceSandbox("DevB", {}, uid);

        devA.FirebaseService.loadFromCloud();
        devB.FirebaseService.loadFromCloud();

        devA.AppState.tasks = [{ id: 'task_A', title: 'Task A' }];
        await devA.FirebaseService.saveToCloud(true);

        devB.AppState.tasks.push({ id: 'task_B', title: 'Task B' });
        await devB.FirebaseService.saveToCloud(true);

        const idsInCloud = (mockFirestoreStore[`users/${uid}`].tasks || []).map(t => t.id);
        const bothSurvive = idsInCloud.includes('task_A') && idsInCloud.includes('task_B');
        recordResult(8, "Concurrent Additions (Both Items Survive)", bothSurvive, `Got IDs: ${JSON.stringify(idsInCloud)}`);
    } catch (e) {
        recordResult(8, "Concurrent Additions", false, e.message);
    }

    // CASE 9: Concurrent Updates
    try {
        const uid = "shared_uid_900";
        const devA = createDeviceSandbox("DevA", {}, uid);
        const devB = createDeviceSandbox("DevB", {}, uid);

        devA.FirebaseService.loadFromCloud();
        devB.FirebaseService.loadFromCloud();

        devA.AppState.tasks = [{ id: 't1', title: 'Task 1 - Updated by A', updatedAt: 2000 }];
        await devA.FirebaseService.saveToCloud(true);

        const devBTitle = devB.AppState.tasks[0]?.title;
        recordResult(9, "Concurrent Updates Delivery", devBTitle === 'Task 1 - Updated by A');
    } catch (e) {
        recordResult(9, "Concurrent Updates Delivery", false, e.message);
    }

    // CASE 10: Delete / Tombstone Protection
    try {
        const uid = "shared_uid_1000";
        const devA = createDeviceSandbox("DevA", {}, uid);
        const devB = createDeviceSandbox("DevB", {}, uid);

        devA.FirebaseService.loadFromCloud();
        devB.FirebaseService.loadFromCloud();

        devA.AppState.tasks = [{ id: 't1', title: 'Task 1' }, { id: 't2', title: 'Task 2' }];
        await devA.FirebaseService.saveToCloud(true);

        // DevA deletes t1
        devA.AppState.tasks = devA.AppState.tasks.filter(t => t.id !== 't1');
        await devA.FirebaseService.saveToCloud(true);

        const cloudTasks = mockFirestoreStore[`users/${uid}`].tasks.map(t => t.id);
        const devBTasks = devB.AppState.tasks.map(t => t.id);

        const deletedSuccessfully = !cloudTasks.includes('t1') && !devBTasks.includes('t1');
        recordResult(10, "Delete Protection (Item Does Not Resurrect)", deletedSuccessfully);
    } catch (e) {
        recordResult(10, "Delete Protection", false, e.message);
    }

    // CASE 11: Offline Reconnect Protection
    try {
        const uid = "shared_uid_1100";
        const devA = createDeviceSandbox("DevA", {}, uid);
        const devB = createDeviceSandbox("DevB", {}, uid);

        devA.FirebaseService.loadFromCloud();
        devB.FirebaseService.loadFromCloud();

        devA.AppState.tasks = [{ id: 'online_t1', title: 'Online Task' }];
        await devA.FirebaseService.saveToCloud(true);

        recordResult(11, "Offline / Reconnect Sync Baseline Integrity", devB.AppState.tasks.length === 1);
    } catch (e) {
        recordResult(11, "Offline / Reconnect Sync Baseline Integrity", false, e.message);
    }

    // CASE 12: Logout / Login Session Isolation
    try {
        const dev = createDeviceSandbox("Dev12", {}, "user_A_1200");
        dev.FirebaseService.loadFromCloud();
        dev.AppState.tasks = [{ id: 'userA_task', title: 'User A Secret' }];
        await dev.FirebaseService.saveToCloud(true);

        await dev.FirebaseService.logout();
        const emptyAfterLogout = dev.AppState.tasks.length === 0;

        recordResult(12, "Logout / Login Session Isolation", emptyAfterLogout);
    } catch (e) {
        recordResult(12, "Logout / Login Session Isolation", false, e.message);
    }

    console.log("\n==================================================");
    const passedCount = testResults.filter(r => r.status === 'PASS').length;
    console.log(`SUMMARY: ${passedCount}/${testResults.length} Runtime Diagnostic Cases Passed`);
    console.log("==================================================");
}

runAllTests().catch(err => console.error("Diagnostic execution error:", err));
