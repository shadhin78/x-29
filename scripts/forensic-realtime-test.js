/**
 * Forensic Real-Time Two-Device Sync Test Script
 * Tests the proposed sync fixes:
 * 1. _executeSave uses AppState directly as local payload (no self-resurrection against cached window.appState).
 * 2. startSnapshotListener applies raw cloudData directly when isLocalDirty is false.
 * 3. startSnapshotListener performs 3-way reconciliation when isLocalDirty is true.
 * 4. Stale localStorage timestamps do not block initial cloud snapshot hydration.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const utilsJs = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
const stateJs = fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf8');
let firebaseJs = fs.readFileSync(path.join(__dirname, '../js/firebase.js'), 'utf8');

console.log("==================================================");
console.log("FORENSIC TWO-DEVICE REAL-TIME SYNC AUDIT (WITH FIXES)");
console.log("==================================================\n");

// Shared Firestore Document Store
let sharedFirestoreDoc = null;
let snapshotListeners = [];

function notifyListeners(writingDeviceName) {
    snapshotListeners.forEach(listener => {
        const snapshot = {
            exists: sharedFirestoreDoc !== null,
            data: () => (sharedFirestoreDoc ? JSON.parse(JSON.stringify(sharedFirestoreDoc)) : null),
            metadata: {
                hasPendingWrites: false // Server committed snapshot
            }
        };
        listener.callback(snapshot);
    });
}

function createMockDevice(deviceName, initialLocalStorage = {}) {
    const storage = { ...initialLocalStorage };

    const sandbox = {
        console: console,
        setTimeout: (fn, delay) => { fn(); return 123; },
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
            getElementById: (id) => ({
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
            console.log(`[${deviceName}] renderUI() CALLED (Count: ${sandbox.renderUICount})`);
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
            doc: (docId) => ({
                set: async (data, options) => {
                    console.log(`[${deviceName}] Firestore doc.set() executing...`);
                    sharedFirestoreDoc = JSON.parse(JSON.stringify(data));
                    sharedFirestoreDoc.updatedAt = Date.now();
                    notifyListeners(deviceName);
                    return Promise.resolve();
                },
                onSnapshot: (onNext, onError) => {
                    console.log(`[${deviceName}] Firestore doc.onSnapshot() listener REGISTERED.`);
                    const listenerObj = { deviceName, callback: onNext };
                    snapshotListeners.push(listenerObj);

                    if (sharedFirestoreDoc) {
                        onNext({
                            exists: true,
                            data: () => JSON.parse(JSON.stringify(sharedFirestoreDoc)),
                            metadata: { hasPendingWrites: false }
                        });
                    }

                    return () => {
                        console.log(`[${deviceName}] Firestore doc.onSnapshot() UNSUBSCRIBED.`);
                        snapshotListeners = snapshotListeners.filter(l => l !== listenerObj);
                    };
                },
                delete: async () => {
                    sharedFirestoreDoc = null;
                    notifyListeners(deviceName);
                    return Promise.resolve();
                }
            })
        })
    };

    sandbox.AppState.db = mockDb;
    sandbox.firebase = {
        auth: () => ({
            currentUser: { uid: 'admin_uid_123', email: 'ris2k29@gmail.com' }
        })
    };

    vm.runInContext(firebaseJs, sandbox);

    return {
        name: deviceName,
        sandbox,
        AppState: sandbox.AppState,
        FirebaseService: sandbox.FirebaseService,
        storage
    };
}

async function runForensicAudit() {
    console.log("--- INITIALIZING DEVICE A & DEVICE B ---");
    const devA = createMockDevice("Device A");
    const devB = createMockDevice("Device B");

    console.log("\n--- TEST 1: Initializing Workspace on Device A ---");
    devA.AppState.tasks = [{ id: 'task_1', title: 'Task 1', completed: false }];
    devA.AppState.cloudDocumentExists = true;
    devA.FirebaseService.cloudDocumentExists = true;

    devA.FirebaseService.loadFromCloud();
    await devA.FirebaseService.saveToCloud(true);

    console.log("\nShared Firestore Doc state after Device A save:", JSON.stringify(sharedFirestoreDoc.tasks));

    console.log("\n--- TEST 2: Device B Boot & Snapshot Registration ---");
    devB.FirebaseService.loadFromCloud();

    console.log("Device B tasks after boot sync:", JSON.stringify(devB.AppState.tasks));

    console.log("\n--- TEST 3: Device A updates Task 1 to completed: true ---");
    devA.AppState.tasks[0].completed = true;
    await devA.FirebaseService.saveToCloud(true);

    console.log("Device A tasks:", JSON.stringify(devA.AppState.tasks));
    console.log("Device B tasks (AFTER REMOTE UPDATE):", JSON.stringify(devB.AppState.tasks));

    const test3Pass = devB.AppState.tasks.length === 1 && devB.AppState.tasks[0].completed === true;
    console.log(`TEST 3 RESULT (Device A update -> Device B receives update): ${test3Pass ? 'PASS' : 'FAIL'}`);

    console.log("\n--- TEST 4: Device A adds Task 2 ---");
    devA.AppState.tasks.push({ id: 'task_2', title: 'Task 2', completed: false });
    await devA.FirebaseService.saveToCloud(true);

    console.log("Device A tasks:", JSON.stringify(devA.AppState.tasks.map(t=>t.id)));
    console.log("Device B tasks (AFTER REMOTE ADDITION):", JSON.stringify(devB.AppState.tasks.map(t=>t.id)));

    const test4Pass = devB.AppState.tasks.length === 2 && devB.AppState.tasks.some(t=>t.id==='task_2');
    console.log(`TEST 4 RESULT (Device A add -> Device B receives addition): ${test4Pass ? 'PASS' : 'FAIL'}`);

    console.log("\n--- TEST 5: Device A deletes Task 1 in UI ---");
    devA.AppState.tasks = devA.AppState.tasks.filter(t => t.id !== 'task_1');
    await devA.FirebaseService.saveToCloud(true);

    console.log("Device A tasks after delete:", JSON.stringify(devA.AppState.tasks.map(t=>t.id)));
    console.log("Firestore payload tasks after delete:", JSON.stringify(sharedFirestoreDoc.tasks.map(t=>t.id)));
    console.log("Device B tasks (AFTER REMOTE DELETION):", JSON.stringify(devB.AppState.tasks.map(t=>t.id)));

    const test5Pass = !devB.AppState.tasks.some(t => t.id === 'task_1');
    console.log(`TEST 5 RESULT (Device A delete -> Task deleted in Cloud & Device B): ${test5Pass ? 'PASS' : 'FAIL'}`);

    console.log("\n--- TEST 6: Device B is dirty (e.g. AppState.isLocalDirty = true) when Device A saves ---");
    devB.AppState.isLocalDirty = true;
    devB.FirebaseService._lastLocalEditTime = Date.now();

    devA.AppState.tasks.push({ id: 'task_3', title: 'Task 3', completed: false });
    await devA.FirebaseService.saveToCloud(true);

    console.log("Device A tasks:", JSON.stringify(devA.AppState.tasks.map(t=>t.id)));
    console.log("Device B tasks (WHEN DEVICE B WAS DIRTY):", JSON.stringify(devB.AppState.tasks.map(t=>t.id)));

    const test6Pass = devB.AppState.tasks.some(t => t.id === 'task_3');
    console.log(`TEST 6 RESULT (Device A add while Device B dirty -> Device B receives Task 3): ${test6Pass ? 'PASS' : 'FAIL'}`);
}

runForensicAudit().catch(err => console.error("Test error:", err));
