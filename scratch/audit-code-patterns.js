const fs = require('fs');
const path = require('path');

function walk(dir, ext) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'scratch') {
                results = results.concat(walk(fullPath, ext));
            }
        } else if (file.endsWith(ext)) {
            results.push(fullPath);
        }
    });
    return results;
}

const jsFiles = walk('.', '.js');

// 1. Analyze Event Listeners
let addEventListenerCount = 0;
let inlineEventHandlersCount = 0;
const listenerLocations = [];

jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const matches = code.match(/addEventListener/g);
    if (matches) {
        addEventListenerCount += matches.length;
        listenerLocations.push({ file: file.replace(/\\/g, '/'), count: matches.length });
    }
});

// 2. Analyze DOM queries (getElementById, querySelector, querySelectorAll)
let getElementByIdCount = 0;
let querySelectorCount = 0;
let querySelectorAllCount = 0;
const domQueryLocations = [];

jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const gebi = (code.match(/getElementById/g) || []).length;
    const qs = (code.match(/querySelector\b/g) || []).length;
    const qsa = (code.match(/querySelectorAll\b/g) || []).length;
    getElementByIdCount += gebi;
    querySelectorCount += qs;
    querySelectorAllCount += qsa;
    if (gebi + qs + qsa > 20) {
        domQueryLocations.push({ file: file.replace(/\\/g, '/'), gebi, qs, qsa, total: gebi + qs + qsa });
    }
});
domQueryLocations.sort((a, b) => b.total - a.total);

// 3. Analyze Firebase calls
let firestoreCalls = 0;
const firestoreLocations = [];
jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const getDocs = (code.match(/\.get\(\)|\.set\(|\.update\(|\.onSnapshot\(/g) || []).length;
    if (getDocs > 0) {
        firestoreCalls += getDocs;
        firestoreLocations.push({ file: file.replace(/\\/g, '/'), count: getDocs });
    }
});

// 4. Analyze localStorage / sessionStorage
let storageCalls = 0;
const storageLocations = [];
jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const s = (code.match(/localStorage\.|sessionStorage\./g) || []).length;
    if (s > 0) {
        storageCalls += s;
        storageLocations.push({ file: file.replace(/\\/g, '/'), count: s });
    }
});

// 5. Analyze JSON.parse / JSON.stringify
let jsonCalls = 0;
const jsonLocations = [];
jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const j = (code.match(/JSON\.(parse|stringify)/g) || []).length;
    if (j > 0) {
        jsonCalls += j;
        jsonLocations.push({ file: file.replace(/\\/g, '/'), count: j });
    }
});
jsonLocations.sort((a, b) => b.count - a.count);

// 6. Analyze Timer/Interval loops
let timerCalls = 0;
const timerLocations = [];
jsFiles.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const t = (code.match(/setInterval|setTimeout|requestAnimationFrame/g) || []).length;
    if (t > 0) {
        timerCalls += t;
        timerLocations.push({ file: file.replace(/\\/g, '/'), count: t });
    }
});

console.log(JSON.stringify({
    addEventListenerCount,
    topListeners: listenerLocations.sort((a, b) => b.count - a.count).slice(0, 10),
    domQueries: {
        getElementByIdCount,
        querySelectorCount,
        querySelectorAllCount,
        total: getElementByIdCount + querySelectorCount + querySelectorAllCount,
        topDomQueryFiles: domQueryLocations.slice(0, 10)
    },
    firestoreCalls,
    firestoreLocations,
    storageCalls,
    storageLocations,
    jsonCalls,
    topJsonLocations: jsonLocations.slice(0, 10),
    timerCalls,
    topTimerLocations: timerLocations.sort((a, b) => b.count - a.count).slice(0, 10)
}, null, 2));
