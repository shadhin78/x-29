/**
 * X-29 (x-2k29) Automatic Firebase Firestore Backup System
 * scripts/backup.js
 * 
 * Supports:
 * 1. Manual local backups -> Saved under D:\X-29 Project\X-29\X-29-Backups\Manual\
 * 2. Automatic GitHub Actions backups -> Saved under backups/Automatic/
 * 
 * Strictly READ-ONLY with respect to Firestore.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, GeoPoint, DocumentReference } = require('firebase-admin/firestore');

const CODE_DIR = path.resolve(__dirname, '..');
const X29_ROOT_DIR = path.dirname(CODE_DIR);
const SERVICE_ACCOUNT_PATH = path.join(CODE_DIR, 'firebase-service-account.json');
const EXPECTED_PROJECT_ID = 'x-2k29';
const DEFAULT_KEEP_DAYS = 30;

// Determine environment mode: Automatic (GitHub Actions) vs Manual (Local CLI)
const isAutomaticMode = process.env.GITHUB_ACTIONS === 'true' || process.env.BACKUP_MODE === 'automatic';

// Base target directory:
// Automatic (GitHub Actions): CODE_DIR/backups/Automatic/
// Manual (Local CLI): X29_ROOT_DIR/X-29-Backups/Manual/
const TARGET_BASE_DIR = isAutomaticMode
    ? path.join(CODE_DIR, 'backups', 'Automatic')
    : path.join(X29_ROOT_DIR, 'X-29-Backups', 'Manual');

// 1. Generate Bangladesh Timezone Timestamp Format: DD MM YYYY HH MM AM/PM
function getBangladeshTimestamp() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const parts = formatter.formatToParts(now);
    const p = {};
    parts.forEach(item => p[item.type] = item.value);

    const day = String(p.day).padStart(2, '0');
    const month = String(p.month).padStart(2, '0');
    const year = p.year;
    let hour = String(p.hour).padStart(2, '0');
    const minute = String(p.minute).padStart(2, '0');
    const ampm = (p.dayPeriod || 'AM').toUpperCase();

    return `${day} ${month} ${year} ${hour} ${minute} ${ampm}`;
}

// 2. Verify & Load Service Account Credentials
function loadServiceAccount() {
    let serviceAccount;
    const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT ? process.env.FIREBASE_SERVICE_ACCOUNT.trim() : '';

    if (rawEnv !== '') {
        console.log(`SECRET_STATUS=PRESENT`);
        console.log(`SECRET_LENGTH=${rawEnv.length}`);
        let jsonStr = rawEnv;
        if (!jsonStr.startsWith('{')) {
            try {
                const decoded = Buffer.from(jsonStr, 'base64').toString('utf8').trim();
                if (decoded.startsWith('{')) {
                    jsonStr = decoded;
                }
            } catch (e) {
                // Ignore base64 decoding error, fallback to raw string attempt
            }
        }

        try {
            serviceAccount = JSON.parse(jsonStr);
        } catch (err) {
            // Attempt sanitizing raw unescaped newlines if JSON string had unescaped newlines in private key
            try {
                const sanitizedStr = jsonStr.replace(/\r?\n/g, '\\n');
                serviceAccount = JSON.parse(sanitizedStr);
            } catch (err2) {
                console.error(`SECRET_STATUS=PRESENT`);
                console.error(`CREDENTIAL_FORMAT=INVALID_JSON`);
                console.error(`[BACKUP] ❌ ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable / secret as JSON.`);
                console.error(`Please ensure the GitHub Repository Secret 'FIREBASE_SERVICE_ACCOUNT' contains valid Service Account JSON.`);
                process.exit(1);
            }
        }
    } else if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        try {
            const fileContent = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
            serviceAccount = JSON.parse(fileContent);
        } catch (err) {
            console.error(`CREDENTIAL_FORMAT=INVALID_JSON`);
            console.error(`[BACKUP] ❌ ERROR: Failed to parse service account JSON file at ${SERVICE_ACCOUNT_PATH}: ${err.message}`);
            process.exit(1);
        }
    } else {
        console.error(`SECRET_STATUS=EMPTY`);
        console.error(`[BACKUP] ❌ ERROR: Service account credentials missing.`);
        if (isAutomaticMode) {
            console.error(`In GitHub Actions, please ensure the GitHub Repository Secret 'FIREBASE_SERVICE_ACCOUNT' is set under:`);
            console.error(`Settings -> Secrets and variables -> Actions -> New repository secret`);
        } else {
            console.error(`For local PC execution, place 'firebase-service-account.json' at:`);
            console.error(`${SERVICE_ACCOUNT_PATH}`);
            console.error(`or set the FIREBASE_SERVICE_ACCOUNT environment variable.`);
        }
        process.exit(1);
    }

    if (!serviceAccount || typeof serviceAccount !== 'object') {
        console.error(`SECRET_STATUS=PRESENT`);
        console.error(`CREDENTIAL_FORMAT=INVALID_JSON`);
        console.error(`[BACKUP] ❌ ERROR: Service account payload is not a valid JSON object.`);
        process.exit(1);
    }

    const projectId = serviceAccount.project_id || serviceAccount.projectId;
    if (!projectId) {
        console.error(`SECRET_STATUS=PRESENT`);
        console.error(`CREDENTIAL_FORMAT=INVALID_JSON`);
        console.error(`[BACKUP] ❌ ERROR: Service account JSON is missing the required 'project_id' field.`);
        process.exit(1);
    }

    if (projectId !== EXPECTED_PROJECT_ID) {
        console.error(`[BACKUP] ❌ ERROR: Service account project ID is [${projectId}], expected [${EXPECTED_PROJECT_ID}].`);
        console.error(`Backup aborted to protect wrong project data.`);
        process.exit(1);
    }

    if (!serviceAccount.private_key || !serviceAccount.client_email) {
        console.error(`SECRET_STATUS=PRESENT`);
        console.error(`CREDENTIAL_FORMAT=INVALID_JSON`);
        console.error(`[BACKUP] ❌ ERROR: Service account JSON is missing required fields ('private_key' or 'client_email').`);
        process.exit(1);
    }

    return serviceAccount;
}

// 3. Serialize Firestore Data Types Safely
function serializeFirestoreValue(val) {
    if (val === null || val === undefined) {
        return val;
    }

    // Firestore Timestamp
    if ((Timestamp && val instanceof Timestamp) ||
        (typeof val.toDate === 'function' && typeof val.toMillis === 'function' && typeof val.seconds === 'number')) {
        return {
            __type: 'timestamp',
            seconds: val.seconds,
            nanoseconds: val.nanoseconds || 0,
            iso: val.toDate().toISOString()
        };
    }

    // Firestore GeoPoint
    if ((GeoPoint && val instanceof GeoPoint) ||
        (typeof val.latitude === 'number' && typeof val.longitude === 'number' && val.constructor && val.constructor.name === 'GeoPoint')) {
        return {
            __type: 'geopoint',
            latitude: val.latitude,
            longitude: val.longitude
        };
    }

    // Firestore DocumentReference
    if ((DocumentReference && val instanceof DocumentReference) ||
        (val.path && typeof val.collection === 'function' && typeof val.doc === 'function')) {
        return {
            __type: 'reference',
            path: val.path
        };
    }

    // Firestore Bytes / Buffer
    if (Buffer.isBuffer(val) || (val && typeof val.toBuffer === 'function') || (val && val.constructor && val.constructor.name === 'Bytes')) {
        const buffer = Buffer.isBuffer(val) ? val : (typeof val.toBuffer === 'function' ? val.toBuffer() : Buffer.from(val.toUint8Array ? val.toUint8Array() : val));
        return {
            __type: 'bytes',
            base64: buffer.toString('base64')
        };
    }

    // Array
    if (Array.isArray(val)) {
        return val.map(item => serializeFirestoreValue(item));
    }

    // Plain Object / Map
    if (typeof val === 'object' && val.constructor === Object) {
        const serializedObj = {};
        for (const [key, propVal] of Object.entries(val)) {
            serializedObj[key] = serializeFirestoreValue(propVal);
        }
        return serializedObj;
    }

    // Primitives (string, number, boolean)
    return val;
}

// 4. Recursive Collection Backup Traversal
async function backupCollection(collectionRef, stats) {
    stats.totalCollections++;
    const colPath = collectionRef.path;
    const colId = collectionRef.id;

    const snapshot = await collectionRef.get();
    const documents = [];

    for (const doc of snapshot.docs) {
        stats.totalDocuments++;
        const docData = doc.data();
        const serializedData = serializeFirestoreValue(docData);

        // Discover nested subcollections recursively
        const subcollectionRefs = await doc.ref.listCollections();
        const subcollections = [];

        for (const subColRef of subcollectionRefs) {
            const subColData = await backupCollection(subColRef, stats);
            subcollections.push(subColData);
        }

        documents.push({
            id: doc.id,
            path: doc.ref.path,
            data: serializedData,
            subcollections: subcollections
        });
    }

    return {
        id: colId,
        path: colPath,
        documents: documents
    };
}

// 5. Calculate SHA-256 Checksum
function calculateSHA256(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// 6. Validate Backup Files (firestore-backup.json & metadata.json)
function validateBackup(backupJsonPath, metadataJsonPath, stats) {
    console.log(`[BACKUP] Validating JSON...`);

    if (!fs.existsSync(backupJsonPath)) {
        throw new Error(`Backup data file missing at: ${backupJsonPath}`);
    }
    if (!fs.existsSync(metadataJsonPath)) {
        throw new Error(`Backup metadata file missing at: ${metadataJsonPath}`);
    }

    const backupContent = fs.readFileSync(backupJsonPath, 'utf8');
    if (!backupContent || backupContent.trim().length === 0) {
        throw new Error(`Backup file ${backupJsonPath} is empty.`);
    }

    const parsedData = JSON.parse(backupContent);
    const metadataData = JSON.parse(fs.readFileSync(metadataJsonPath, 'utf8'));

    if (!parsedData.metadata) {
        throw new Error(`Missing metadata block in backup file.`);
    }

    const { projectId, createdAt, totalCollections, totalDocuments } = parsedData.metadata;

    if (projectId !== EXPECTED_PROJECT_ID) {
        throw new Error(`Project ID mismatch: [${projectId}] vs expected [${EXPECTED_PROJECT_ID}]`);
    }

    if (!createdAt) {
        throw new Error(`Missing createdAt timestamp in metadata.`);
    }

    if (typeof totalCollections !== 'number' || typeof totalDocuments !== 'number') {
        throw new Error(`Invalid document or collection count in metadata.`);
    }

    if (totalCollections !== stats.totalCollections || totalDocuments !== stats.totalDocuments) {
        throw new Error(`Count mismatch: Metadata reports (${totalCollections} cols, ${totalDocuments} docs), calculated (${stats.totalCollections} cols, ${stats.totalDocuments} docs).`);
    }

    if (!Array.isArray(parsedData.collections)) {
        throw new Error(`Missing or invalid collections array in backup payload.`);
    }

    // Verify SHA-256 hash match
    const computedSHA = calculateSHA256(backupJsonPath);
    console.log(`[BACKUP] SHA-256 generated: ${computedSHA}`);

    if (metadataData.sha256 !== computedSHA) {
        throw new Error(`SHA-256 checksum mismatch: metadata (${metadataData.sha256}) vs calculated (${computedSHA})`);
    }

    console.log(`[BACKUP] Verification successful`);
    return parsedData;
}

// 7. Parse Date from Folder Name (Supports 'DD MM YYYY HH MM AM/PM' and legacy formats)
function parseFolderDate(folderName) {
    // Format: "14 08 2026 10 32 AM"
    const parts = folderName.trim().split(/\s+/);
    if (parts.length === 6) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        let hour = parseInt(parts[3], 10);
        const minute = parseInt(parts[4], 10);
        const ampm = parts[5].toUpperCase();

        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;

        // Subtract 6 hours for Dhaka UTC+6 to get UTC Date for age calculation
        return new Date(Date.UTC(year, month, day, hour - 6, minute));
    }

    // Legacy Format: YYYY-MM-DD or YYYY-MM-DD_HH-mm-ss
    const dateParts = folderName.split('_')[0].split('-');
    if (dateParts.length === 3) {
        return new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
    }

    return null;
}

// 8. Configurable Retention Policy
function applyRetentionPolicy(baseDir) {
    const keepDaysStr = process.env.KEEP_DAYS || String(DEFAULT_KEEP_DAYS);
    const keepDays = parseInt(keepDaysStr, 10);

    if (isNaN(keepDays) || keepDays <= 0 || !fs.existsSync(baseDir)) {
        return;
    }

    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const backupDirs = entries
        .filter(entry => entry.isDirectory() && (
            fs.existsSync(path.join(baseDir, entry.name, 'firestore-backup.json')) ||
            fs.existsSync(path.join(baseDir, entry.name, 'firestore.json'))
        ))
        .map(entry => entry.name)
        .sort();

    if (backupDirs.length <= 1) {
        return; // Retain at least 1 latest backup
    }

    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    for (let i = 0; i < backupDirs.length - 1; i++) {
        const dirName = backupDirs[i];
        const folderDate = parseFolderDate(dirName);
        if (folderDate && !isNaN(folderDate.getTime())) {
            const ageDays = (now - folderDate.getTime()) / msPerDay;
            if (ageDays > keepDays) {
                const dirPath = path.join(baseDir, dirName);
                console.log(`[BACKUP] Pruning old backup (${dirName}, age: ${Math.floor(ageDays)} days > max ${keepDays} days)...`);
                fs.rmSync(dirPath, { recursive: true, force: true });
            }
        }
    }
}

// 9. Main Backup Execution Entry Point
async function runBackup() {
    const modeName = isAutomaticMode ? 'Automatic (Cloud GitHub Actions)' : 'Manual (Local PC)';
    console.log(`[BACKUP] Starting Firebase backup... [Mode: ${modeName}]`);

    const serviceAccount = loadServiceAccount();

    initializeApp({
        credential: cert(serviceAccount)
    });

    const db = getFirestore();
    console.log(`[BACKUP] Connected to Firebase (Project: ${EXPECTED_PROJECT_ID})`);

    const stats = {
        totalCollections: 0,
        totalDocuments: 0
    };

    console.log(`[BACKUP] Reading Firestore...`);

    const rootCollections = await db.listCollections();
    const collectionsData = [];

    for (const colRef of rootCollections) {
        const colData = await backupCollection(colRef, stats);
        collectionsData.push(colData);
    }

    console.log(`[BACKUP] Collections found: ${stats.totalCollections}`);
    console.log(`[BACKUP] Documents found: ${stats.totalDocuments}`);

    // Zero-Document Safeguard
    if (stats.totalDocuments === 0) {
        throw new Error(`[BACKUP] ❌ Suspicious result: Firestore returned 0 total documents! Aborting backup to protect backup history.`);
    }

    console.log(`[BACKUP] Creating JSON...`);

    const timestampFolder = getBangladeshTimestamp();
    const targetDir = path.join(TARGET_BASE_DIR, timestampFolder);
    const backupJsonPath = path.join(targetDir, 'firestore-backup.json');
    const metadataJsonPath = path.join(targetDir, 'metadata.json');

    fs.mkdirSync(targetDir, { recursive: true });

    const nowIso = new Date().toISOString();

    const backupPayload = {
        metadata: {
            project: 'X-29',
            backupType: 'firestore-json',
            version: '1.0',
            createdAt: nowIso,
            projectId: EXPECTED_PROJECT_ID,
            totalCollections: stats.totalCollections,
            totalDocuments: stats.totalDocuments
        },
        collections: collectionsData
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    fs.writeFileSync(backupJsonPath, jsonStr, 'utf8');

    // Also write firestore.json alias
    fs.writeFileSync(path.join(targetDir, 'firestore.json'), jsonStr, 'utf8');

    const fileSize = Buffer.byteLength(jsonStr, 'utf8');
    const sha256Hash = calculateSHA256(backupJsonPath);

    const metadataPayload = {
        backupDate: nowIso,
        backupFolderTimestamp: timestampFolder,
        backupMode: isAutomaticMode ? 'automatic' : 'manual',
        firebaseProject: EXPECTED_PROJECT_ID,
        documentCount: stats.totalDocuments,
        collectionCount: stats.totalCollections,
        backupSizeBytes: fileSize,
        sha256: sha256Hash,
        status: 'verified'
    };

    fs.writeFileSync(metadataJsonPath, JSON.stringify(metadataPayload, null, 2), 'utf8');

    // Run verification
    try {
        validateBackup(backupJsonPath, metadataJsonPath, stats);
    } catch (valErr) {
        console.error(`[BACKUP] ❌ BACKUP VERIFICATION FAILED: ${valErr.message}`);
        fs.rmSync(targetDir, { recursive: true, force: true });
        process.exit(1);
    }

    // Apply retention policy after verification succeeded
    applyRetentionPolicy(TARGET_BASE_DIR);

    console.log(`[BACKUP] Backup completed successfully`);
    console.log(`[BACKUP] Destination: ${targetDir}`);
}

runBackup().catch(err => {
    console.error(`[BACKUP] ❌ BACKUP FAILED WITH EXCEPTION:`, err.message || err);
    process.exit(1);
});


