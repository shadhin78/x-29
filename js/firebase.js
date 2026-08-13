/**
 * X-29 Firebase & Data Layer Module
 * Established in window.FirebaseService namespace.
 */

// Private internal helper function to update DOM sync status indicator
function showSync(state) {
    const el = document.getElementById('sync-status');
    const icon = document.getElementById('sync-icon');
    const text = document.getElementById('sync-text');
    if (!el || !icon || !text) return;

    el.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
    el.classList.add('opacity-100', 'scale-100');

    if (state === 'saving') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />`;
        icon.classList.add('animate-spin', 'text-blue-500');
        icon.classList.remove('text-emerald-500', 'text-red-500', 'text-amber-500', 'text-rose-500');
        text.textContent = 'Saving...'; text.className = 'text-[9px] font-black uppercase tracking-widest text-blue-500';
    } else if (state === 'saved') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />`;
        icon.classList.remove('animate-spin', 'text-blue-500', 'text-red-500', 'text-amber-500', 'text-rose-500');
        icon.classList.add('text-emerald-500');
        text.textContent = 'Saved'; text.className = 'text-[9px] font-black uppercase tracking-widest text-emerald-500';
        setTimeout(() => { el.classList.remove('opacity-100', 'scale-100'); el.classList.add('opacity-0', 'scale-95', 'pointer-events-none'); }, 2000);
    } else if (state === 'error') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />`;
        icon.classList.remove('animate-spin', 'text-blue-500', 'text-emerald-500', 'text-amber-500', 'text-rose-500');
        icon.classList.add('text-red-500');
        text.textContent = 'Error'; text.className = 'text-[9px] font-black uppercase tracking-widest text-red-500';
    } else if (state === 'uninitialized') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`;
        icon.classList.remove('animate-spin', 'text-blue-500', 'text-emerald-500', 'text-red-500', 'text-rose-500');
        icon.classList.add('text-amber-500');
        text.textContent = 'Not Initialized'; text.className = 'text-[9px] font-black uppercase tracking-widest text-amber-500';
    } else if (state === 'conflict') {
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        icon.classList.remove('animate-spin', 'text-blue-500', 'text-emerald-500', 'text-red-500', 'text-amber-500');
        icon.classList.add('text-rose-500');
        text.textContent = 'Sync Conflict'; text.className = 'text-[9px] font-black uppercase tracking-widest text-rose-500';
    }
}

function hasUserData(payload) {
    if (!payload || typeof payload !== 'object') return false;

    if (Array.isArray(payload.tracks) && payload.tracks.length > 0) return true;
    if (Array.isArray(payload.tasks) && payload.tasks.length > 0) return true;
    if (payload.customPrograms && typeof payload.customPrograms === 'object' && Object.keys(payload.customPrograms).length > 0) return true;
    if (payload.syllabusStructure && typeof payload.syllabusStructure === 'object' && Object.keys(payload.syllabusStructure).length > 0) return true;
    if (Array.isArray(payload.customActions) && payload.customActions.length > 0) return true;
    if (Array.isArray(payload.paceGoals) && payload.paceGoals.length > 0) return true;
    if (Array.isArray(payload.examSessions) && payload.examSessions.length > 0) return true;
    if (Array.isArray(payload.examRoutine) && payload.examRoutine.length > 0) return true;
    if (Array.isArray(payload.scheduleBlocks) && payload.scheduleBlocks.length > 0) return true;
    if (Array.isArray(payload.scheduleBlocks2) && payload.scheduleBlocks2.length > 0) return true;
    if (Array.isArray(payload.timerLogs) && payload.timerLogs.length > 0) return true;
    if (Array.isArray(payload.successResults) && payload.successResults.length > 0) return true;
    if (payload.fiscalLedger && (
        (Array.isArray(payload.fiscalLedger.transactions) && payload.fiscalLedger.transactions.length > 0) ||
        (Array.isArray(payload.fiscalLedger.budgets) && payload.fiscalLedger.budgets.length > 0) ||
        (Array.isArray(payload.fiscalLedger.vaults) && payload.fiscalLedger.vaults.length > 0)
    )) return true;
    if (payload.passedItems && (
        (Array.isArray(payload.passedItems.programs) && payload.passedItems.programs.length > 0) ||
        (Array.isArray(payload.passedItems.subjects) && payload.passedItems.subjects.length > 0)
    )) return true;
    if (payload.revisionData && (
        (Array.isArray(payload.revisionData.active) && payload.revisionData.active.length > 0) ||
        (payload.revisionData.progress && typeof payload.revisionData.progress === 'object' && Object.keys(payload.revisionData.progress).length > 0)
    )) return true;
    if (payload.dailyFocusHoursTarget && payload.dailyFocusHoursTarget > 0) return true;
    if (payload.dailyFocusHoursTargetHistory && Array.isArray(payload.dailyFocusHoursTargetHistory) && payload.dailyFocusHoursTargetHistory.length > 0) return true;

    return false;
}

const firebaseConfig = {
    apiKey: "AIzaSyAiqf66FVpOM9UV20LEcOjOPkkFcS_qFIs",
    authDomain: "x-2k29.firebaseapp.com",
    projectId: "x-2k29",
    storageBucket: "x-2k29.firebasestorage.app",
    messagingSenderId: "17156117405",
    appId: "1:17156117405:web:78cb75ef31f3ffdba15574"
};
window.firebaseConfig = firebaseConfig;

window.FirebaseService = {
    _saveDebounceTimer: null,
    _unsubscribeSnapshot: null,
    _authListeners: [],
    _firestoreInitialized: false,
    _isSaving: false,
    _lastLocalEditTime: 0,
    cloudDocumentExists: null,

    // 1. Fetch Firebase Configuration from API, fallback to .env or cached settings
    fetchConfig: async function() {
        if (window.location.protocol === 'file:') {
            console.log("file:// protocol detected in fetchConfig. Using offline fallback config.");
            return firebaseConfig;
        }

        let config;
        try {
            const clientSendTime = Date.now();
            const res = await fetch('/api/config');
            const clientRecvTime = Date.now();
            if (!res.ok) throw new Error("API config endpoint not available");
            config = await res.json();

            if (!config || !config.apiKey) {
                throw new Error("Invalid or empty configuration from API config endpoint");
            }
            
            const serverDateStr = res.headers.get('Date');
            if (serverDateStr) {
                const serverTime = new Date(serverDateStr).getTime();
                const latency = (clientRecvTime - clientSendTime) / 2;
                window.serverTimeOffset = serverTime - (clientSendTime + latency);
                console.log("Estimated server clock offset (ms):", window.serverTimeOffset);
            }
            
            safeStorage.setItem('firebaseConfig', JSON.stringify(config));
        } catch (err) {
            console.warn("API config failed, trying static .env fallback...", err);
            try {
                const res = await fetch('/.env');
                if (!res.ok) throw new Error(".env file not available");
                const envText = await res.text();
                const env = {};
                envText.split(/\r?\n/).forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#')) {
                        const parts = trimmed.split('=');
                        const key = parts[0].trim();
                        const val = parts.slice(1).join('=').trim();
                        env[key] = val;
                    }
                });

                config = {
                    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey,
                    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
                    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
                    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
                    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
                    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || firebaseConfig.appId
                };

                if (!config.apiKey) throw new Error("No API key found in .env");
                console.log("Loaded Firebase config from static .env fallback successfully!");
                safeStorage.setItem('firebaseConfig', JSON.stringify(config));
            } catch (fallbackErr) {
                console.warn("Network config fetch failed, checking localStorage fallback...", fallbackErr);
                const cachedConfig = safeStorage.getItem('firebaseConfig');
                if (cachedConfig) {
                    try {
                        const parsed = JSON.parse(cachedConfig);
                        if (parsed && parsed.projectId === firebaseConfig.projectId) {
                            config = parsed;
                            console.log("Loaded Firebase config from localStorage cache for offline boot.");
                        }
                    } catch(e) {}
                }
                if (!config) {
                    console.log("Using offline fallback config.");
                    config = firebaseConfig;
                    safeStorage.setItem('firebaseConfig', JSON.stringify(config));
                }
            }
        }
        return config || firebaseConfig;
    },

    // 2. Initialize Firebase Client App and Firestore reference
    init: function(config) {
        const finalConfig = config || firebaseConfig;
        if (window.location.protocol === 'file:') {
            AppState.db = null;
            console.log("Firebase initialized in mock mode for file:// protocol.");
            return;
        }
        if (typeof firebase !== 'undefined') {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(finalConfig);
                }
                if (typeof firebase.firestore === 'function') {
                    AppState.db = firebase.firestore();
                    if (!this._firestoreInitialized) {
                        try {
                            AppState.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
                                console.warn("Firestore persistence notice:", err.code);
                            });
                            this._firestoreInitialized = true;
                        } catch (e) {
                            console.warn("Could not set Firestore settings:", e);
                        }
                    }
                }
                console.log("Firebase initialized successfully with project:", finalConfig.projectId);
            } catch (initErr) {
                console.warn("Firebase initializeApp caught error:", initErr);
                AppState.db = null;
            }
        }
    },

    // 3. Authenticate with Email / Password
    login: async function(email, password) {
        const cleanEmail = (email || '').trim().toLowerCase();

        if (window.location.protocol === 'file:') {
            console.log("Firebase login mocked under file:// protocol.");
            if (cleanEmail === 'ris2k29@gmail.com' && password === '787898') {
                const localUser = { email: 'ris2k29@gmail.com', uid: 'file_protocol_local_user', displayName: 'ris2k29 (Local)' };
                safeStorage.setItem('local_auth_user', JSON.stringify(localUser));
                this._notifyAuthListeners(localUser);
                return { user: localUser };
            }
            throw { code: 'auth/wrong-password', message: 'Invalid email or password.' };
        }

        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                const res = await firebase.auth().signInWithEmailAndPassword(cleanEmail, password);
                if (res && res.user) {
                    const userObj = {
                        email: res.user.email,
                        uid: res.user.uid,
                        displayName: res.user.displayName || res.user.email
                    };
                    safeStorage.setItem('local_auth_user', JSON.stringify(userObj));
                    this._notifyAuthListeners(res.user);
                }
                return res;
            } catch (fbErr) {
                console.warn("Firebase Auth sign-in failed:", fbErr);
                throw fbErr;
            }
        }

        throw { code: 'auth/wrong-password', message: 'Invalid email or password.' };
    },

    _notifyAuthListeners: function(user) {
        if (this._authListeners && this._authListeners.length > 0) {
            this._authListeners.forEach(cb => {
                try { cb(user); } catch(e) {}
            });
        }
    },

    bumpSyncGeneration: function(reason) {
        if (!AppState.syncGeneration) AppState.syncGeneration = 0;
        AppState.syncGeneration++;
        AppState.syncSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log(`SYNC: SYNC_GENERATION_BUMPED (${reason}) -> New Gen: ${AppState.syncGeneration}, SessionID: ${AppState.syncSessionId}`);
        return AppState.syncGeneration;
    },

    // 4. Log out the current session (CRITICAL FIX #5 & #6)
    logout: async function() {
        console.log("SYNC: LOGOUT_INITIATED");
        this.stopSnapshotListener("logout");
        this.bumpSyncGeneration("logout");

        if (this._saveDebounceTimer) {
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = null;
            console.log("SYNC: SAVE_CANCELLED (logout)");
        }

        // Purge ALL user-specific application data from browser storage
        const keysToRemove = [
            'local_app_state',
            'appState',
            'cached_fullAppState',
            'cached_examSessions',
            'cached_examRoutine',
            'cached_selectedCountdownExamId',
            'local_auth_user'
        ];
        keysToRemove.forEach(k => safeStorage.removeItem(k));

        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.clear();
            }
        } catch(e) {}

        // Reset memory AppState to clean empty default
        if (typeof window.applyFullAppState === 'function' && typeof window.getDefaultAppState === 'function') {
            window.applyFullAppState(window.getDefaultAppState(), false, true);
        }

        this.cloudDocumentExists = null;
        if (window.AppState) {
            window.AppState.cloudDocumentExists = null;
            window.AppState.hasLoadedFromCloud = false;
            window.AppState.isLocalDirty = false;
        }

        console.log("SYNC: LOGOUT_CACHE_CLEARED - All user cache and memory state purged.");
        this._notifyAuthListeners(null);

        if (window.location.protocol === 'file:') {
            console.log("Firebase logout mocked under file:// protocol.");
            return;
        }
        if (typeof firebase !== 'undefined' && firebase.auth) {
            try {
                await firebase.auth().signOut();
            } catch (e) {
                console.warn("Firebase signOut error:", e);
            }
        }
    },

    // 5. Expose current authenticated user reference
    getCurrentUser: function() {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser;
        }
        const cached = safeStorage.getItem('local_auth_user');
        if (cached) {
            try {
                const user = JSON.parse(cached);
                if (user && user.uid && user.uid !== 'mock-local-user-id') {
                    return user;
                }
            } catch(e) {}
        }
        if (window.location.protocol === 'file:') {
            return { email: 'ris2k29@gmail.com', uid: 'file_protocol_local_user', displayName: 'ris2k29 (Local)' };
        }
        return null;
    },

    // 6. Auth State Changes Listener
    onAuthStateChanged: function(callback) {
        if (!this._authListeners) this._authListeners = [];
        this._authListeners.push(callback);

        if (window.location.protocol === 'file:') {
            console.log("file:// protocol detected in onAuthStateChanged.");
            setTimeout(() => {
                callback({
                    email: 'ris2k29@gmail.com',
                    uid: 'file_protocol_local_user',
                    displayName: 'ris2k29 (Local)'
                });
            }, 100);
            return () => {
                this._authListeners = this._authListeners.filter(cb => cb !== callback);
            };
        }

        if (typeof firebase !== 'undefined' && firebase.auth) {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    safeStorage.setItem('local_auth_user', JSON.stringify({
                        email: user.email,
                        uid: user.uid,
                        displayName: user.displayName || user.email
                    }));
                    callback(user);
                } else {
                    safeStorage.removeItem('local_auth_user');
                    callback(null);
                }
            });
            return () => {
                this._authListeners = this._authListeners.filter(cb => cb !== callback);
                if (typeof unsubscribe === 'function') unsubscribe();
            };
        } else {
            const localUser = this.getCurrentUser();
            setTimeout(() => callback(localUser), 50);
            return () => {
                this._authListeners = this._authListeners.filter(cb => cb !== callback);
            };
        }
    },

    stopSnapshotListener: function(reason = "manual") {
        if (this._unsubscribeSnapshot) {
            const user = this.getCurrentUser();
            const uid = user ? user.uid : 'unknown';
            console.log(`SYNC: LISTENER_STOP - UID: ${uid}, Reason: ${reason}, Timestamp: ${Date.now()}`);
            try { this._unsubscribeSnapshot(); } catch(e) {}
            this._unsubscribeSnapshot = null;
        }
    },

    // 7. Register Firestore Real-time Snapshot Listener (BUG #1 & BUG #3 FIX)
    startSnapshotListener: function(uid, onData, onError) {
        this.stopSnapshotListener("startNewListener");

        let activeUid = null;
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            activeUid = firebase.auth().currentUser.uid;
        } else if (uid && uid !== 'mock-local-user-id') {
            activeUid = uid;
        }

        if (!AppState.db || !activeUid || window.location.protocol === 'file:') {
            console.warn(`SYNC: LISTENER_START_ABORTED - DB null, unauthenticated user, or file:// protocol. UID: ${activeUid}`);
            return function unsubscribe() {};
        }

        const captureGen = AppState.syncGeneration || 0;
        const captureSessionId = AppState.syncSessionId || "";
        console.log(`SYNC: LISTENER_START - UID: ${activeUid}, Generation: ${captureGen}, SessionID: ${captureSessionId}, Timestamp: ${Date.now()}`);
        console.log(`SYNC: LISTENER_GENERATION - Active Generation: ${captureGen}, Current AppState Gen: ${AppState.syncGeneration}, Timestamp: ${Date.now()}`);

        try {
            const userDocRef = AppState.db.collection('users').doc(activeUid);

            const unsubscribe = userDocRef.onSnapshot((docSnapshot) => {
                console.log(`SYNC: SNAPSHOT_RECEIVED - UID: ${activeUid}, Gen: ${captureGen}, Timestamp: ${Date.now()}`);

                if (captureGen !== (AppState.syncGeneration || 0) || (captureSessionId && captureSessionId !== AppState.syncSessionId)) {
                    console.warn(`SYNC: SNAPSHOT_IGNORED_STALE_GENERATION - UID: ${activeUid}, CapturedGen: ${captureGen}, CurrentGen: ${AppState.syncGeneration}, Timestamp: ${Date.now()}`);
                    return;
                }

                // PENDING WRITE RULE:
                // Distinguish local pending echo of THIS CLIENT'S in-flight write vs actual remote change.
                if (docSnapshot.metadata && docSnapshot.metadata.hasPendingWrites) {
                    console.log(`SYNC: SNAPSHOT_PENDING_WRITE_ECHO - Local write in flight for UID: ${activeUid}. Retaining local edit state.`);
                    this.cloudDocumentExists = true;
                    if (window.AppState) window.AppState.cloudDocumentExists = true;
                    return;
                }

                if (docSnapshot.exists) {
                    console.log(`SYNC: SNAPSHOT_APPLIED - UID: ${activeUid}, Gen: ${captureGen}, Timestamp: ${Date.now()}`);
                    this.cloudDocumentExists = true;
                    if (window.AppState) window.AppState.cloudDocumentExists = true;

                    const cloudData = docSnapshot.data();
                    let cloudTime = 0;
                    if (cloudData && cloudData.updatedAt) {
                        if (typeof cloudData.updatedAt === 'number') {
                            cloudTime = cloudData.updatedAt;
                        } else if (typeof cloudData.updatedAt.toMillis === 'function') {
                            cloudTime = cloudData.updatedAt.toMillis();
                        } else if (cloudData.updatedAt.seconds !== undefined) {
                            cloudTime = cloudData.updatedAt.seconds * 1000;
                        }
                    }

                    // 3-Way Array Reconciliation on Incoming Cloud Snapshot
                    if (cloudData && typeof cloudData === 'object') {
                        const tombstones = Object.assign({}, AppState._tombstones || {}, cloudData._tombstones || {});
                        AppState._tombstones = tombstones;

                        ['tasks', 'tracks', 'customActions', 'paceGoals', 'timerLogs', 'scheduleBlocks', 'scheduleBlocks2', 'scheduleGroups', 'examSessions', 'examRoutine'].forEach(key => {
                            if (Array.isArray(cloudData[key]) || Array.isArray(AppState[key])) {
                                cloudData[key] = window.reconcileArrays(AppState[key] || [], cloudData[key] || [], tombstones, key);
                            }
                        });
                    }

                    if (AppState.isLocalDirty) {
                        const lastApplied = AppState.lastAppliedCloudTimestamp || 0;
                        if (cloudTime > lastApplied) {
                            console.warn(`SYNC: CONFLICT_DETECTED - Remote cloud snapshot timestamp (${cloudTime}) > last applied (${lastApplied}) while local client state is dirty. Merging state via 3-way reconciliation.`);
                            if (this._saveDebounceTimer) {
                                clearTimeout(this._saveDebounceTimer);
                                this._saveDebounceTimer = null;
                                console.log("SYNC: SAVE_CANCELLED (Reconciled with newer cloud snapshot)");
                            }
                            showSync('saved');
                            if (typeof onData === 'function') {
                                onData(cloudData, { exists: true, reconciled: true });
                            }
                        } else {
                            console.log("SYNC: LOCAL_DIRTY_PRESERVED - Local edit is newer than incoming cloud timestamp. Preserving local edit for save.");
                            showSync('saved');
                        }
                    } else {
                        if (this._saveDebounceTimer) {
                            clearTimeout(this._saveDebounceTimer);
                            this._saveDebounceTimer = null;
                            console.log("SYNC: SAVE_CANCELLED (Clean state snapshot applied)");
                        }
                        showSync('saved');
                        if (typeof onData === 'function') {
                            onData(cloudData, { exists: true });
                        }
                    }
                } else {
                    console.warn(`SYNC: CLOUD_DOCUMENT_MISSING - Document does not exist in cloud for UID: ${activeUid}`);
                    if (this._saveDebounceTimer) {
                        clearTimeout(this._saveDebounceTimer);
                        this._saveDebounceTimer = null;
                    }
                    this.cloudDocumentExists = false;
                    if (window.AppState) window.AppState.cloudDocumentExists = false;
                    showSync('uninitialized');
                    if (typeof onData === 'function') {
                        onData(null, { exists: false });
                    }
                }
            }, (error) => {
                console.error(`SYNC: SNAPSHOT_ERROR - UID: ${activeUid}`, error);
                showSync('error');
                if (typeof onError === 'function') {
                    onError(error);
                }
            });

            this._unsubscribeSnapshot = unsubscribe;
            return unsubscribe;
        } catch (e) {
            console.error("Failed to register snapshot listener:", e);
            return function unsubscribe() {};
        }
    },

    // 8. Save AppState to Cloud & Local Storage (BUG #2 & BUG #3 FIX)
    saveToCloud: async function(immediate = false, isExplicitInitialization = false, isUserInitiated = false) {
        AppState.isLocalDirty = true;
        this._lastLocalEditTime = Date.now();

        // BUG #2 FIX: Never pretend "saved" when save is blocked due to missing cloud document
        if (this.cloudDocumentExists === false && !isExplicitInitialization) {
            if (this._saveDebounceTimer) {
                clearTimeout(this._saveDebounceTimer);
                this._saveDebounceTimer = null;
            }
            const user = this.getCurrentUser();
            const gen = AppState.syncGeneration || 0;
            console.warn(`SYNC: SAVE_BLOCKED_NO_CLOUD_DOCUMENT - UID: ${user ? user.uid : 'none'}, SaveGen: ${gen}, Timestamp: ${Date.now()}`);
            showSync('uninitialized');
            return;
        }

        if (this._saveDebounceTimer) {
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = null;
            console.log("SYNC: SAVE_CANCELLED (Superseded by new local edit)");
        }

        const captureGen = AppState.syncGeneration || 0;
        console.log(`SYNC: SAVE_SCHEDULED (Immediate: ${immediate}, ExplicitInit: ${isExplicitInitialization}, Gen: ${captureGen})`);

        showSync('saving');

        if (immediate) {
            await this._executeSave(isExplicitInitialization, isUserInitiated, captureGen);
        } else {
            this._saveDebounceTimer = setTimeout(async () => {
                await this._executeSave(isExplicitInitialization, isUserInitiated, captureGen);
            }, 800);
        }
    },

    _executeSave: async function(isExplicitInitialization = false, isUserInitiated = false, captureGen = null) {
        if (captureGen === null) captureGen = AppState.syncGeneration || 0;

        // GUARD 1: Verify sync generation
        if (captureGen !== (AppState.syncGeneration || 0)) {
            console.warn(`SYNC: SAVE_ABORTED_STALE_GENERATION - Capture: ${captureGen}, Current: ${AppState.syncGeneration}`);
            showSync('saved');
            return;
        }

        // GUARD 2: Verify authenticated user
        const user = this.getCurrentUser();
        if (!user || !user.uid) {
            console.warn("SYNC: SAVE_ABORTED_NO_AUTH - No active authenticated user UID.");
            showSync('saved');
            return;
        }

        // GUARD 3: Missing Document Protection (BUG #2 FIX)
        if (this.cloudDocumentExists === false && !isExplicitInitialization) {
            console.warn(`SYNC: SAVE_BLOCKED_NO_CLOUD_DOCUMENT - UID: ${user.uid}, SaveGen: ${captureGen}, Timestamp: ${Date.now()}`);
            showSync('uninitialized');
            return;
        }

        this._isSaving = true;
        try {
            const tombstones = AppState._tombstones || {};

            const payload = {
                tasks: window.reconcileArrays(AppState.tasks || [], window.appState?.tasks || [], tombstones, 'tasks'),
                tracks: window.reconcileArrays(window.tracks || [], window.appState?.tracks || [], tombstones, 'tracks'),
                customSyllabus: AppState.syllabusStructure || window.syllabusStructure || {},
                syllabusStructure: AppState.syllabusStructure || window.syllabusStructure || {},
                customPrograms: window.customPrograms || {},
                customActions: window.reconcileArrays(window.customActions || [], window.appState?.customActions || [], tombstones, 'customActions'),
                paceGoals: window.reconcileArrays(window.paceGoals || [], window.appState?.paceGoals || [], tombstones, 'paceGoals'),
                passedItems: window.passedItems || { programs: [], subjects: [] },
                revisionData: window.revisionData || { active: [], progress: {} },
                programVisibility: window.programVisibility || {},
                subjectTimeLinks: window.subjectTimeLinks || {},
                successResults: window.successResults || [],
                timerLogs: window.reconcileArrays(window.timerLogs || [], window.appState?.timerLogs || [], tombstones, 'timerLogs'),
                dailyFocusHoursTarget: window.dailyFocusHoursTarget !== undefined ? window.dailyFocusHoursTarget : 0,
                dailyFocusHoursTargetDate: window.dailyFocusHoursTargetDate || "",
                dailyFocusHoursTargetHistory: window.dailyFocusHoursTargetHistory || [],
                timerAnalyticsRange: window.timerAnalyticsRange || 180,
                timerAnalyticsGrouping: window.timerAnalyticsGrouping || 'daily',
                timerAnalyticsChartStyle: window.timerAnalyticsChartStyle || 'combo',
                spectraHeatmapRange: window.spectraHeatmapRange || 365,
                sessionHistoryFilter: window.sessionHistoryFilter || 'all',
                subjectFocusTargets: window.subjectFocusTargets || {},
                dashboardConfig: window.dashboardConfig || {},
                weeklyTargetsDatabase: window.weeklyTargetsDatabase || {},
                dailyTargetsDatabase: window.dailyTargetsDatabase || {},
                scheduleBlocks: window.reconcileArrays(window.scheduleBlocks || [], window.appState?.scheduleBlocks || [], tombstones, 'scheduleBlocks'),
                scheduleBlocks2: window.reconcileArrays(window.scheduleBlocks2 || [], window.appState?.scheduleBlocks2 || [], tombstones, 'scheduleBlocks2'),
                scheduleGroups: window.reconcileArrays(window.scheduleGroups || [], window.appState?.scheduleGroups || [], tombstones, 'scheduleGroups'),
                fiscalLedger: AppState.fiscalLedger || { transactions: [], budgets: [], vaults: [] },
                examSessions: window.reconcileArrays(AppState.examSessions || [], window.appState?.examSessions || [], tombstones, 'examSessions'),
                examRoutine: window.reconcileArrays(AppState.examRoutine || [], window.appState?.examRoutine || [], tombstones, 'examRoutine'),
                selectedCountdownExamId: AppState.selectedCountdownExamId || 'auto',
                activeTimerState: AppState.activeTimerState || {},
                activeRoutineSet: AppState.activeRoutineSet || 1,
                subjectColors: AppState.subjectColors || {},
                _tombstones: tombstones
            };

            // Cache state locally for offline fallback
            window.appState = payload;
            let jsonStr = '';
            try {
                jsonStr = JSON.stringify(payload);
                safeStorage.setItem('local_app_state', jsonStr);
                safeStorage.setItem('appState', jsonStr);
            } catch(e) {}

            if (AppState.db && user && user.uid && window.location.protocol !== 'file:') {
                try {
                    const cleanPayload = jsonStr ? JSON.parse(jsonStr) : JSON.parse(JSON.stringify(payload));
                    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
                        cleanPayload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    } else {
                        cleanPayload.updatedAt = Date.now();
                    }

                    const arrayLengths = {
                        tasks: (cleanPayload.tasks || []).length,
                        tracks: (cleanPayload.tracks || []).length,
                        customActions: (cleanPayload.customActions || []).length,
                        paceGoals: (cleanPayload.paceGoals || []).length,
                        timerLogs: (cleanPayload.timerLogs || []).length,
                        scheduleBlocks: (cleanPayload.scheduleBlocks || []).length,
                        scheduleBlocks2: (cleanPayload.scheduleBlocks2 || []).length,
                        examSessions: (cleanPayload.examSessions || []).length,
                        examRoutine: (cleanPayload.examRoutine || []).length
                    };
                    console.log(`SYNC: EXECUTE_SAVE - UID: ${user.uid}, SaveGen: ${captureGen}, LocalDirty: ${AppState.isLocalDirty}, ArrayLengths: ${JSON.stringify(arrayLengths)}, Reason: ${isExplicitInitialization ? 'ExplicitInit' : (isUserInitiated ? 'UserAction' : 'AutoSave')}, Timestamp: ${Date.now()}`);

                    await AppState.db.collection('users').doc(user.uid).set(cleanPayload, { merge: true });

                    // Re-verify generation after async write
                    if (captureGen !== (AppState.syncGeneration || 0)) {
                        console.warn(`SYNC: SAVE_COMMITTED_BUT_GENERATION_STALE - Capture: ${captureGen}, Current: ${AppState.syncGeneration}`);
                        return;
                    }

                    this.cloudDocumentExists = true;
                    if (window.AppState) {
                        window.AppState.cloudDocumentExists = true;
                        window.AppState.isLocalDirty = false;
                    }
                    console.log(`SYNC: FIRESTORE_WRITE_SUCCESS - UID: ${user.uid}, Timestamp: ${Date.now()}`);
                    showSync('saved');
                } catch (err) {
                    console.error("SYNC: FIRESTORE_WRITE_ERROR", err);
                    showSync('error');
                }
            } else {
                if (window.AppState) window.AppState.isLocalDirty = false;
                showSync('saved');
            }
        } finally {
            this._isSaving = false;
        }
    },

    initializeCloudWorkspace: async function() {
        console.log("SYNC: CLOUD_WORKSPACE_INITIALIZED - Explicit user creation requested.");
        this.stopSnapshotListener("initializeCloudWorkspace");
        this.bumpSyncGeneration("initializeCloudWorkspace");
        this.cloudDocumentExists = true;
        if (window.AppState) window.AppState.cloudDocumentExists = true;
        await this._executeSave(true, true);
        console.log("SYNC: CLOUD_WORKSPACE_INITIALIZED - Save complete.");
    },

    resetLocalWorkspace: function(confirmReset = true) {
        if (confirmReset && typeof window !== 'undefined' && window.confirm) {
            const ok = window.confirm("Are you sure you want to reset your local X-29 workspace?\nThis will clear locally cached app state without modifying Cloud Firestore.");
            if (!ok) return false;
        }
        this.stopSnapshotListener("resetLocalWorkspace");
        this.bumpSyncGeneration("resetLocalWorkspace");
        if (this._saveDebounceTimer) {
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = null;
            console.log("SYNC: SAVE_CANCELLED (resetLocalWorkspace)");
        }

        const keysToRemove = [
            'local_app_state',
            'appState',
            'cached_fullAppState',
            'cached_examSessions',
            'cached_examRoutine',
            'cached_selectedCountdownExamId'
        ];
        keysToRemove.forEach(k => safeStorage.removeItem(k));

        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.clear();
            }
        } catch(e) {}

        this.cloudDocumentExists = false;
        if (window.AppState) {
            window.AppState.cloudDocumentExists = false;
            window.AppState.isLocalDirty = false;
        }

        if (typeof window.applyFullAppState === 'function' && typeof window.getDefaultAppState === 'function') {
            window.applyFullAppState(window.getDefaultAppState(), false, true);
        }
        console.log("SYNC: RESET_COMPLETED - Local workspace reset to clean empty slate.");
        return true;
    },

    wipeCloudWorkspace: async function() {
        this.stopSnapshotListener("wipeCloudWorkspace");
        this.bumpSyncGeneration("wipeCloudWorkspace");
        if (this._saveDebounceTimer) {
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = null;
            console.log("SYNC: SAVE_CANCELLED (wipeCloudWorkspace)");
        }

        const user = this.getCurrentUser();
        if (AppState.db && user && user.uid && window.location.protocol !== 'file:') {
            try {
                await AppState.db.collection('users').doc(user.uid).delete();
                console.log("SYNC: CLOUD_DOCUMENT_DELETED for UID:", user.uid);
            } catch(e) {
                console.warn("Failed to delete Firestore cloud document:", e);
            }
        }
        this.cloudDocumentExists = false;
        if (window.AppState) {
            window.AppState.cloudDocumentExists = false;
            window.AppState.isLocalDirty = false;
        }

        safeStorage.removeItem('local_app_state');
        safeStorage.removeItem('appState');

        if (typeof window.applyFullAppState === 'function' && typeof window.getDefaultAppState === 'function') {
            window.applyFullAppState(window.getDefaultAppState(), false, true);
        }
        console.log("SYNC: RESET_COMPLETED - Cloud workspace wiped to clean empty slate.");
    },

    saveTimerToCloud: async function() {
        this.saveToCloud(true);
    },

    // 9. Load workspace from Cloud with real-time Firestore sync (BOOT / LOCAL STORAGE RULE FIX)
    loadFromCloud: function() {
        const user = this.getCurrentUser();

        this.stopSnapshotListener("loadFromCloud");
        this.bumpSyncGeneration("loadFromCloud");

        if (this._saveDebounceTimer) {
            clearTimeout(this._saveDebounceTimer);
            this._saveDebounceTimer = null;
        }

        // Display local cached state temporarily for instant startup UI
        const cachedStr = safeStorage.getItem('local_app_state') || safeStorage.getItem('appState');
        if (cachedStr) {
            try {
                const cachedData = JSON.parse(cachedStr);
                if (cachedData) {
                    window.applyFullAppState(cachedData, false);
                    console.log("SYNC: LOCAL_CACHE_USED (Temporary initial rendering)");
                }
            } catch (e) {
                console.warn("Failed to parse cached local app state:", e);
            }
        }

        const handleDataLoad = (data, meta = { exists: true }) => {
            if (meta && meta.exists === false) {
                console.log("SYNC: LOCAL_CACHE_DISCARDED - Cloud document does not exist. Initializing EMPTY local workspace.");
                safeStorage.removeItem('local_app_state');
                safeStorage.removeItem('appState');
                this.cloudDocumentExists = false;
                if (window.AppState) {
                    window.AppState.cloudDocumentExists = false;
                    window.AppState.isLocalDirty = false;
                }
                if (typeof window.applyFullAppState === 'function' && typeof window.getDefaultAppState === 'function') {
                    window.applyFullAppState(window.getDefaultAppState(), false, true);
                }
                showSync('uninitialized');
            } else if (data) {
                this.cloudDocumentExists = true;
                if (window.AppState) {
                    window.AppState.cloudDocumentExists = true;
                    window.AppState.isLocalDirty = false;
                }
                window.applyFullAppState(data, false);
                try {
                    const jsonStr = JSON.stringify(data);
                    safeStorage.setItem('local_app_state', jsonStr);
                    safeStorage.setItem('appState', jsonStr);
                } catch (e) {}
                console.log("SYNC: CLOUD_STATE_APPLIED");
            }

            AppState.hasLoadedFromCloud = true;
            if (typeof window.ensureConfigDefaults === 'function') window.ensureConfigDefaults();
            if (typeof window.migrateLegacyData === 'function') window.migrateLegacyData();
            if (typeof window.sortAllCustomData === 'function') window.sortAllCustomData();
            if (typeof recalculateTotals === 'function') recalculateTotals();

            if (AppState.isInitialLoad) {
                window.dismissLoadingScreen();
                if (typeof renderUI === 'function') renderUI();
            } else {
                requestAnimationFrame(() => {
                    const contentPanel = document.getElementById('main-content-panel');
                    const contentScrollPos = contentPanel ? contentPanel.scrollTop : 0;
                    const scrollPos = window.scrollY;

                    if (typeof renderUI === 'function') renderUI();

                    if (contentPanel) {
                        contentPanel.scrollTop = contentScrollPos;
                    }
                    window.scrollTo(0, scrollPos);
                });
            }
        };

        if (AppState.db && user && user.uid && window.location.protocol !== 'file:') {
            this._unsubscribeSnapshot = this.startSnapshotListener(user.uid, (cloudData, meta) => {
                handleDataLoad(cloudData, meta);
            }, (err) => {
                console.warn("Falling back to local storage due to Firestore listener error:", err);
                const localData = safeStorage.getItem('local_app_state') || safeStorage.getItem('appState');
                if (localData && this.cloudDocumentExists !== false) {
                    try { handleDataLoad(JSON.parse(localData), { exists: true, isErrorFallback: true }); } catch(e) { handleDataLoad(null, { exists: false }); }
                } else {
                    handleDataLoad(null, { exists: false });
                }
            });
        } else {
            const localData = safeStorage.getItem('local_app_state') || safeStorage.getItem('appState');
            if (localData && this.cloudDocumentExists !== false) {
                try { handleDataLoad(JSON.parse(localData), { exists: true, isErrorFallback: true }); } catch(e) { handleDataLoad(null, { exists: false }); }
            } else {
                handleDataLoad(null, { exists: false });
            }
        }
    }
};

window.dismissLoadingScreen = function() {
    if (window.setLoadingProgress) window.setLoadingProgress(100, 'Workspace ready!');
    const loadingEl = document.getElementById('auth-loading');
    const wrapperEl = document.getElementById('app-wrapper');
    if (loadingEl) {
        loadingEl.classList.add('transition-all', 'duration-500', 'opacity-0', 'pointer-events-none');
        setTimeout(() => {
            try { loadingEl.remove(); } catch(e){}
        }, 600);
    }
    if (wrapperEl) wrapperEl.classList.remove('hidden');
    AppState.isInitialLoad = false;
};

// Global compatibility aliases
window.saveToCloud = window.FirebaseService.saveToCloud.bind(window.FirebaseService);
window.loadFromCloud = window.FirebaseService.loadFromCloud.bind(window.FirebaseService);
window.saveTimerToCloud = window.FirebaseService.saveTimerToCloud.bind(window.FirebaseService);
window.initializeCloudWorkspace = window.FirebaseService.initializeCloudWorkspace.bind(window.FirebaseService);
window.resetLocalWorkspace = window.FirebaseService.resetLocalWorkspace.bind(window.FirebaseService);
window.showSync = showSync;

