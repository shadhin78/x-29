const fs = require('fs');
const path = require('path');

// Mock simple DOM for testing
class MockElement {
    constructor(id) {
        this.id = id;
        this._innerHTML = '';
        this.options = [];
        this.value = '';
        this.classList = {
            contains: () => false,
            add: () => {},
            remove: () => {}
        };
        this.isConnected = true;
    }
    get innerHTML() {
        return this._innerHTML;
    }
    set innerHTML(val) {
        this._innerHTML = val;
    }
}

const elements = new Map();
function getOrCreate(id) {
    if (!elements.has(id)) elements.set(id, new MockElement(id));
    return elements.get(id);
}

global.window = global;
global.document = {
    getElementById: (id) => getOrCreate(id),
    querySelectorAll: () => []
};

// Generate dummy targets in monthlyTargetsDatabase
global.monthlyTargetsDatabase = {};
for (let m = 1; m <= 12; m++) {
    const mKey = `2026-0${m}-01 ~ 2026-0${m}-28`;
    global.monthlyTargetsDatabase[mKey] = [];
    for (let t = 1; t <= 30; t++) {
        global.monthlyTargetsDatabase[mKey].push({
            id: `mt-${m}-${t}`,
            track: 'bcs',
            program: 'General',
            subject: 'Bangla Literature',
            chapter: `Ch. ${t}`,
            completed: t % 2 === 0
        });
    }
}
global.tracks = [{ id: 'bcs', name: 'BCS' }];
global.customPrograms = { bcs: ['General'] };
global.getAllSubjects = () => [{ subject: 'Bangla Literature', chapters: 30, track: 'bcs' }];
global.Utils = {
    parseStart: () => new Date('2026-01-01')
};
global.getMonthlyTargetRange = () => ({
    start: new Date('2026-01-01'),
    end: new Date('2026-01-31'),
    daysInMonth: 31
});
global.formatMonthRangeKey = () => '2026-01-01 ~ 2026-01-31';
global.getMonthlyTargetProgress = () => ({ percent: 50 });

// Require monthlyTargets.js
delete require.cache[require.resolve('../js/features/targets/monthlyTargets.js')];
require('../js/features/targets/monthlyTargets.js');

console.log('Running benchmark of renderMonthlyTargets() and renderMtdbList()...');
const t0 = performance.now();
for (let i = 0; i < 100; i++) {
    window.renderMonthlyTargets();
    window.renderMtdbList();
}
const t1 = performance.now();
console.log(`100 iterations took: ${(t1 - t0).toFixed(2)}ms`);
