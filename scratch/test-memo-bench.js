const fs = require('fs');
const path = require('path');

// Load task engine
global.window = global;
global.AppState = { tasks: [] };
global.dailyTargetsDatabase = {};
global.weeklyTargetsDatabase = {};
global.monthlyTargetsDatabase = {};

// Create 365 days of tasks
for (let d = 0; d < 365; d++) {
    global.AppState.tasks.push({
        type: 'study',
        bcsTasks: [
            { subject: 'Bangla Literature', chapter: 'Ch. 1', completed: false },
            { subject: 'English Grammar', chapter: 'Ch. 2', completed: false }
        ]
    });
    global.dailyTargetsDatabase[`2026-01-${d}`] = [
        { subject: 'Bangla Literature', chapter: 'Ch. 1', completed: false }
    ];
}

const TaskEngine = require(path.join(__dirname, '../js/features/tasks/taskEngine.js'));

// Benchmark current un-memoized (or before memo)
const t0 = performance.now();
for (let i = 0; i < 5; i++) {
    for (let ch = 1; ch <= 300; ch++) {
        TaskEngine.getChapterStatus('Bangla Literature', ch, 'bcs');
    }
}
const t1 = performance.now();
console.log(`1500 calls to getChapterStatus took: ${(t1 - t0).toFixed(2)}ms`);
