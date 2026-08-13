/**
 * X-29 (x-2k29) Local Firestore Backup System
 * scripts/backup.js
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, GeoPoint, DocumentReference } = require('firebase-admin/firestore');

const CODE_DIR = path.resolve(__dirname, '..');
const X29_ROOT_DIR = path.dirname(CODE_DIR);
const SERVICE_ACCOUNT_PATH = path.join(CODE_DIR, 'firebase-service-account.json');
const BACKUP_BASE_DIR = path.join(X29_ROOT_DIR, 'X-29-Backups');
const EXPECTED_PROJECT_ID = 'x-2k29';
const MAX_BACKUP_RETENTION = 30;

// 1. Verify Service Account File & Project ID
function loadServiceAccount() {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error(`\n❌ ERROR: Service account file not found at: ${SERVICE_ACCOUNT_PATH}`);
        console.error(`Please place your 'firebase-service-account.json' in the project root directory.\n`);
        process.exit(1);
    }

    let serviceAccount;
    try {
        const fileContent = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
        serviceAccount = JSON.parse(fileContent);
    } catch (err) {
        console.error(`\n❌ ERROR: Failed to parse service account JSON file: ${err.message}\n`);
        process.exit(1);
    }

    const projectId = serviceAccount.project_id || serviceAccount.projectId;
    if (projectId !== EXPECTED_PROJECT_ID) {
        console.error(`\n❌ ERROR: Service account project ID is [${projectId}], expected [${EXPECTED_PROJECT_ID}].`);
        console.error(`Backup aborted to protect wrong project data.\n`);
        process.exit(1);
    }

    return serviceAccount;
}

// 2. Serialize Firestore Data Types safely
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

// 3. Recursive Backup Traversal
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

        // Discover nested subcollections
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

// 4. Validate Backup JSON File
function validateBackup(filePath, stats) {
    console.log(`\n🔍 Validating backup JSON file...`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file does not exist at: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(content);

    if (!parsed.metadata) {
        throw new Error(`Missing metadata block in backup file.`);
    }

    const { version, projectId, createdAt, totalCollections, totalDocuments } = parsed.metadata;

    if (!version || version < 1) {
        throw new Error(`Invalid or missing backup version in metadata.`);
    }

    if (projectId !== EXPECTED_PROJECT_ID) {
        throw new Error(`Backup metadata project ID [${projectId}] does not match expected [${EXPECTED_PROJECT_ID}].`);
    }

    if (!createdAt) {
        throw new Error(`Missing createdAt timestamp in metadata.`);
    }

    if (typeof totalCollections !== 'number' || typeof totalDocuments !== 'number') {
        throw new Error(`Invalid document or collection counts in metadata.`);
    }

    if (totalCollections !== stats.totalCollections || totalDocuments !== stats.totalDocuments) {
        throw new Error(`Count mismatch: Metadata reports (${totalCollections} cols, ${totalDocuments} docs), expected (${stats.totalCollections} cols, ${stats.totalDocuments} docs).`);
    }

    if (!Array.isArray(parsed.collections)) {
        throw new Error(`Missing or invalid collections array in backup payload.`);
    }

    console.log(`✅ Validation Passed! Metadata verified successfully.`);
    return parsed;
}

// 5. Backup Retention Cleanup (Keep latest 30)
function applyRetentionPolicy() {
    console.log(`\n🧹 Checking retention policy (max ${MAX_BACKUP_RETENTION} backups)...`);
    if (!fs.existsSync(BACKUP_BASE_DIR)) return;

    const entries = fs.readdirSync(BACKUP_BASE_DIR, { withFileTypes: true });
    const backupDirs = entries
        .filter(entry => entry.isDirectory() && fs.existsSync(path.join(BACKUP_BASE_DIR, entry.name, 'firestore-backup.json')))
        .map(entry => entry.name)
        .sort(); // Lexicographical sort works for YYYY-MM-DD_HH-mm-ss format

    if (backupDirs.length > MAX_BACKUP_RETENTION) {
        const toDelete = backupDirs.slice(0, backupDirs.length - MAX_BACKUP_RETENTION);
        console.log(`Found ${backupDirs.length} backups. Purging ${toDelete.length} older backup(s)...`);
        for (const dirName of toDelete) {
            const fullPath = path.join(BACKUP_BASE_DIR, dirName);
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(` - Removed old backup: ${dirName}`);
        }
    } else {
        console.log(`Total successful backups: ${backupDirs.length}/${MAX_BACKUP_RETENTION}. No cleanup required.`);
    }
}

// 6. Main Backup Execution Function
async function runBackup() {
    const startTime = Date.now();
    const serviceAccount = loadServiceAccount();

    initializeApp({
        credential: cert(serviceAccount)
    });

    const db = getFirestore();
    console.log(`\n==================================================`);
    console.log(` X-29 FIRESTORE BACKUP SYSTEM`);
    console.log(` Connected to X-29 Firebase Project: [${EXPECTED_PROJECT_ID}]`);
    console.log(`==================================================\n`);

    const stats = {
        totalCollections: 0,
        totalDocuments: 0
    };

    console.log(`🚀 Starting recursive X-29 Firestore backup...`);

    const rootCollections = await db.listCollections();
    const collectionsData = [];

    for (const colRef of rootCollections) {
        console.log(` 📦 Backing up root collection: [${colRef.id}]...`);
        const colData = await backupCollection(colRef, stats);
        collectionsData.push(colData);
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    const targetDir = path.join(BACKUP_BASE_DIR, timestampStr);
    const targetFilePath = path.join(targetDir, 'firestore-backup.json');

    fs.mkdirSync(targetDir, { recursive: true });

    const backupPayload = {
        metadata: {
            version: 1,
            createdAt: now.toISOString(),
            projectId: EXPECTED_PROJECT_ID,
            totalCollections: stats.totalCollections,
            totalDocuments: stats.totalDocuments
        },
        collections: collectionsData
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    fs.writeFileSync(targetFilePath, jsonStr, 'utf8');

    const fileSizeKB = (Buffer.byteLength(jsonStr, 'utf8') / 1024).toFixed(2);
    console.log(`\n💾 Backup file created at:\n   ${targetFilePath}`);
    console.log(`   Size: ${fileSizeKB} KB`);

    // Validate the created backup
    try {
        validateBackup(targetFilePath, stats);
    } catch (valErr) {
        console.error(`\n❌ X-29 BACKUP VALIDATION FAILED: ${valErr.message}`);
        console.error(`The generated backup file is invalid. Do NOT rely on this backup.\n`);
        process.exit(1);
    }

    // Apply retention policy after successful validation
    applyRetentionPolicy();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n==================================================`);
    console.log(`🎉 X-29 BACKUP SUCCESSFUL!`);
    console.log(`   Project ID:       ${EXPECTED_PROJECT_ID}`);
    console.log(`   Directory:        X-29-Backups/${timestampStr}`);
    console.log(`   Total Collections:${stats.totalCollections}`);
    console.log(`   Total Documents:  ${stats.totalDocuments}`);
    console.log(`   File Size:        ${fileSizeKB} KB`);
    console.log(`   Duration:         ${duration}s`);
    console.log(`==================================================\n`);
}

runBackup().catch(err => {
    console.error(`\n❌ BACKUP FAILED WITH EXCEPTION:`, err);
    process.exit(1);
});
