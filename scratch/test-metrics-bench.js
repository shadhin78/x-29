const fs = require('fs');
const path = require('path');

// Setup Node mock environment
global.window = global;
global.document = {
    getElementById: () => null,
    querySelectorAll: () => [],
    documentElement: { classList: { contains: () => false } }
};
global.safeGetEl = () => null;
global.safeSetText = () => {};
global.safeSetHtml = () => {};
global.AppState = {
    tasks: [],
    PLAN_START_DATE: new Date('2026-01-01'),
    PLAN_END_DATE: new Date('2026-12-31'),
    globalStartDate: new Date('2026-01-01'),
    globalEndDate: new Date('2026-12-31')
};
global.tracks = [
    { id: 'bcs', name: 'BCS' },
    { id: 'bank', name: 'Bank' },
    { id: 'primary', name: 'Primary' },
    { id: 'ntrca', name: 'NTRCA' }
];

const subjects = [
    { subject: 'Bangla Literature', chapters: 30, track: 'bcs', program: 'General' },
    { subject: 'English Grammar', chapters: 25, track: 'bcs', program: 'General' },
    { subject: 'Bangladesh Affairs', chapters: 35, track: 'bcs', program: 'General' },
    { subject: 'International Affairs', chapters: 20, track: 'bcs', program: 'General' },
    { subject: 'General Science', chapters: 20, track: 'bcs', program: 'Science' },
    { subject: 'Mathematical Reasoning', chapters: 25, track: 'bcs', program: 'Math' },
    { subject: 'Mental Ability', chapters: 15, track: 'bcs', program: 'Math' },
    { subject: 'Ethics & Values', chapters: 10, track: 'bcs', program: 'General' },
    { subject: 'Accounting', chapters: 20, track: 'bank', program: 'Commerce' },
    { subject: 'Finance & Banking', chapters: 18, track: 'bank', program: 'Commerce' }
];

global.getAllSubjects = () => subjects;
global.syllabusStructure = {
    bcs: subjects.filter(s => s.track === 'bcs'),
    bank: subjects.filter(s => s.track === 'bank'),
    primary: [],
    ntrca: []
};
global.passedItems = { subjects: [], programs: [] };
global.celebrationTargets = { subjects: [], programs: [] };
global.paceGoals = [{ type: 'global', startDate: '2026-01-01', deadline: '2026-12-31' }];

// Generate 365 days of tasks
for (let d = 1; d <= 365; d++) {
    const curDate = new Date(2026, 0, d);
    const dateStr = curDate.toISOString().split('T')[0];
    global.AppState.tasks.push({
        id: d,
        type: 'study',
        date: dateStr,
        day: 'Mon',
        bcsTasks: [
            { id: `bcs-${d}`, subject: subjects[d % subjects.length].subject, chapter: `Ch. ${(d % 20) + 1}`, completed: d % 3 === 0, completedAt: dateStr }
        ],
        bankTasks: [
            { id: `bank-${d}`, subject: 'Accounting', chapter: `Ch. ${(d % 15) + 1}`, completed: d % 4 === 0, completedAt: dateStr }
        ]
    });
}

// Load current metrics.js
delete require.cache[require.resolve('../js/core/metrics.js')];
const metrics = require('../js/core/metrics.js');

// Benchmark 50 runs of updateMetrics
console.log('Running benchmark of updateMetrics()...');
const t0 = performance.now();
for (let i = 0; i < 50; i++) {
    metrics.updateMetrics();
}
const t1 = performance.now();
console.log(`50 iterations of updateMetrics took: ${(t1 - t0).toFixed(2)}ms (${((t1 - t0) / 50).toFixed(2)}ms per call)`);
