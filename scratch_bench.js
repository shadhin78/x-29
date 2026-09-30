const fs = require('fs');
const TaskEngine = require('./js/features/tasks/taskEngine.js');

// Mock data
global.window = global;
global.AppState = {
    tasks: []
};
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

const start = Date.now();
for (let ch = 1; ch <= 300; ch++) {
    TaskEngine.getChapterStatus('Bangla Literature', ch, 'bcs');
}
const elapsed = Date.now() - start;
console.log(`300 calls to getChapterStatus took: ${elapsed}ms`);
