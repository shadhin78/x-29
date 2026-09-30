const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/core/metrics.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace start of updateMetrics subject iteration with single-pass index
const oldBlock1 = `            const subjectStats = {};
            const allSubjects = typeof window.getAllSubjects === 'function' ? window.getAllSubjects() : [];

            allSubjects.forEach(sObj => {
                const sub = sObj.subject;
                const totalSyllabusChapters = sObj.chapters || 0;
                let trackId = sObj.track;
                if (!trackId && window.syllabusStructure) {
                    for (const tid in window.syllabusStructure) {
                        if (Array.isArray(window.syllabusStructure[tid]) && window.syllabusStructure[tid].some(s => s.subject === sub)) {
                            trackId = tid;
                            break;
                        }
                    }
                }
                trackId = trackId || 'ca';

                const isFrozen = window.passedItems && (
                    (window.passedItems.subjects && window.passedItems.subjects.includes(sub)) ||
                    (window.passedItems.programs && window.passedItems.programs.includes(sObj.program))
                );

                let skippedChapters = 0;
                let completedChapters = 0;
                let earliestCompletedDate = null;
                let tasksAssigned = 0;

                const subTasks = [];
                if (AppState.tasks && Array.isArray(AppState.tasks)) {
                    AppState.tasks.filter(t => t.type === 'study').forEach(t => {
                        if (Array.isArray(window.tracks)) {
                            window.tracks.forEach(track => {
                                const key = track.id + 'Tasks';
                                if (Array.isArray(t[key])) {
                                    t[key].forEach(b => {
                                        if (b.subject === sub) {
                                            subTasks.push({ dayObj: t, taskObj: b, trackId: track.id });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                tasksAssigned = subTasks.filter(x => !x.taskObj.skipped).length;

                if (totalSyllabusChapters > 0) {
                    for (let chNum = 1; chNum <= totalSyllabusChapters; chNum++) {
                        const matchedTaskItem = subTasks.find(x => {
                            const chStr = x.taskObj.chapter;
                            if (chStr === \`Ch. \${chNum}\` || chStr === \`Ch.\${chNum}\` || chStr === String(chNum)) return true;
                            const match = chStr ? chStr.match(/(\\d+)(?!.*\\d)/) : null;
                            return match && parseInt(match[0], 10) === chNum;
                        });`;

const newBlock1 = `            const subjectStats = {};
            const allSubjects = typeof window.getAllSubjects === 'function' ? window.getAllSubjects() : [];

            // Step 006: Single-pass task indexing across all study tasks
            const tasksBySubject = new Map();
            const subjectChapterTaskMap = new Map();
            let globalEarliestCompletedDate = null;

            if (AppState.tasks && Array.isArray(AppState.tasks) && Array.isArray(window.tracks)) {
                for (let i = 0; i < AppState.tasks.length; i++) {
                    const t = AppState.tasks[i];
                    if (t.type !== 'study') continue;
                    for (let j = 0; j < window.tracks.length; j++) {
                        const track = window.tracks[j];
                        const key = track.id + 'Tasks';
                        const taskArr = t[key];
                        if (Array.isArray(taskArr)) {
                            for (let k = 0; k < taskArr.length; k++) {
                                const b = taskArr[k];
                                if (!b || !b.subject) continue;
                                const subName = b.subject;

                                const item = { dayObj: t, taskObj: b, trackId: track.id };

                                let subTaskList = tasksBySubject.get(subName);
                                if (!subTaskList) {
                                    subTaskList = [];
                                    tasksBySubject.set(subName, subTaskList);
                                }
                                subTaskList.push(item);

                                if (b.chapter) {
                                    let chMap = subjectChapterTaskMap.get(subName);
                                    if (!chMap) {
                                        chMap = new Map();
                                        subjectChapterTaskMap.set(subName, chMap);
                                    }
                                    const m = String(b.chapter).match(/(\\d+)(?!.*\\d)/);
                                    if (m) {
                                        const parsedCh = parseInt(m[0], 10);
                                        if (!chMap.has(parsedCh)) {
                                            chMap.set(parsedCh, item);
                                        }
                                    }
                                }

                                if (b.completed) {
                                    let d = b.completedAt ? (typeof Utils !== 'undefined' && typeof Utils.parseDateSafe === 'function' ? Utils.parseDateSafe(b.completedAt) : new Date(b.completedAt)) : getTaskDateSafe(t);
                                    if (isNaN(d.getTime())) d = getTaskDateSafe(t);
                                    if (!isNaN(d.getTime())) {
                                        if (!globalEarliestCompletedDate || d < globalEarliestCompletedDate) {
                                            globalEarliestCompletedDate = d;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            allSubjects.forEach(sObj => {
                const sub = sObj.subject;
                const totalSyllabusChapters = sObj.chapters || 0;
                let trackId = sObj.track;
                if (!trackId && window.syllabusStructure) {
                    for (const tid in window.syllabusStructure) {
                        if (Array.isArray(window.syllabusStructure[tid]) && window.syllabusStructure[tid].some(s => s.subject === sub)) {
                            trackId = tid;
                            break;
                        }
                    }
                }
                trackId = trackId || 'ca';

                const isFrozen = window.passedItems && (
                    (window.passedItems.subjects && window.passedItems.subjects.includes(sub)) ||
                    (window.passedItems.programs && window.passedItems.programs.includes(sObj.program))
                );

                let skippedChapters = 0;
                let completedChapters = 0;
                let earliestCompletedDate = null;
                let tasksAssigned = 0;

                const subTasks = tasksBySubject.get(sub) || [];
                const chMap = subjectChapterTaskMap.get(sub);

                tasksAssigned = subTasks.filter(x => !x.taskObj.skipped).length;

                if (totalSyllabusChapters > 0) {
                    for (let chNum = 1; chNum <= totalSyllabusChapters; chNum++) {
                        const matchedTaskItem = chMap ? chMap.get(chNum) : undefined;`;

// Normalize line endings for replacement
const normalize = s => s.replace(/\r\n/g, '\n');
const normalizedContent = normalize(content);
const normalizedOld = normalize(oldBlock1);
const normalizedNew = normalize(newBlock1);

if (!normalizedContent.includes(normalizedOld)) {
    console.error('Target block 1 not found in metrics.js!');
    process.exit(1);
}

let updated = normalizedContent.replace(normalizedOld, normalizedNew);

// Replace second redundant scan over AppState.tasks for earliestDate
const oldBlock2 = `            if (!AppState.globalStartDate || !AppState.globalEndDate) {
                let earliestDate = null;
                if (AppState.tasks && Array.isArray(AppState.tasks)) {
                    AppState.tasks.forEach(t => {
                        if (t.type === 'study' && Array.isArray(window.tracks)) {
                            window.tracks.forEach(track => {
                                const key = track.id + 'Tasks';
                                if (Array.isArray(t[key])) {
                                    t[key].forEach(b => {
                                        if (b.completed) {
                                            let d = b.completedAt ? new Date(b.completedAt) : getTaskDateSafe(t);
                                            if (!earliestDate || d < earliestDate) earliestDate = d;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }

                let paceTotalChapters = scopeTotalChapters;`;

const newBlock2 = `            if (!AppState.globalStartDate || !AppState.globalEndDate) {
                let earliestDate = globalEarliestCompletedDate;
                let paceTotalChapters = scopeTotalChapters;`;

const normalizedOld2 = normalize(oldBlock2);
const normalizedNew2 = normalize(newBlock2);

if (!updated.includes(normalizedOld2)) {
    console.error('Target block 2 not found in metrics.js!');
    process.exit(1);
}

updated = updated.replace(normalizedOld2, normalizedNew2);

// Re-convert to CRLF
const crlfUpdated = updated.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, crlfUpdated, 'utf8');
console.log('Successfully updated metrics.js!');
