const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-service-account.json'), 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function checkLive() {
    const rootCols = await db.listCollections();
    console.log('Root collections count:', rootCols.length);
    console.log('Root collections:', rootCols.map(c => c.id));
    
    for (const colRef of rootCols) {
        const snap = await colRef.get();
        console.log(`Collection [${colRef.id}] doc count: ${snap.size}`);
        for (const doc of snap.docs) {
            console.log(`Doc ID: ${doc.id}`);
            console.log(`Doc Path: ${doc.ref.path}`);
            const data = doc.data();
            const keys = Object.keys(data);
            console.log(`Top-level fields count: ${keys.length}`);
            console.log('Keys:', keys);
            
            console.log('tracks count:', Array.isArray(data.tracks) ? data.tracks.length : 'N/A');
            console.log('syllabusStructure present:', !!data.syllabusStructure);
            console.log('customSyllabus present:', !!data.customSyllabus);
            console.log('tasks count:', Array.isArray(data.tasks) ? data.tasks.length : 'N/A');
            console.log('timerLogs count:', Array.isArray(data.timerLogs) ? data.timerLogs.length : 'N/A');
            console.log('updatedAt:', JSON.stringify(data.updatedAt));
        }
    }
    process.exit(0);
}

checkLive().catch(console.error);
