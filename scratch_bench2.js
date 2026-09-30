const fs = require('fs');

// Mock browser environment
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.value = '';
        this.innerHTML = '';
        this.textContent = '';
        this.className = '';
        this.classList = {
            classes: new Set(),
            add(...c) { c.forEach(x => this.classes.add(x)); },
            remove(...c) { c.forEach(x => this.classes.delete(x)); },
            contains(x) { return this.classes.has(x); }
        };
        this.style = {};
        this.children = [];
    }
    addEventListener() {}
    appendChild(child) { this.children.push(child); return child; }
    querySelector() { return null; }
    querySelectorAll() { return []; }
    getContext() {
        return {
            fillRect: () => {},
            clearRect: () => {},
            getImageData: () => ({ data: new Array(4) }),
            putImageData: () => {},
            createImageData: () => [],
            setTransform: () => {},
            drawImage: () => {},
            save: () => {},
            fillText: () => {},
            restore: () => {},
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            stroke: () => {},
            translate: () => {},
            scale: () => {},
            rotate: () => {},
            arc: () => {},
            fill: () => {},
            measureText: () => ({ width: 0 })
        };
    }
}

const elements = new Map();
global.document = {
    getElementById: (id) => {
        if (!elements.has(id)) elements.set(id, new MockElement(id));
        return elements.get(id);
    },
    createElement: (tag) => new MockElement('', tag),
    querySelectorAll: () => [],
    querySelector: () => null,
    addEventListener: () => {}
};
global.window = global;
global.window.Chart = function() {
    return {
        destroy: () => {},
        resize: () => {},
        update: () => {}
    };
};
global.window.requestAnimationFrame = (fn) => fn(); // synchronous in node!

global.tracks = [{ id: 'bcs', name: 'BCS' }, { id: 'bank', name: 'Bank' }];
global.customPrograms = { bcs: [{ name: 'Preli' }], bank: [{ name: 'General' }] };
global.syllabusStructure = {
    bcs: [
        { subject: 'Bangla Lit', chapters: 25, program: 'Preli' },
        { subject: 'English', chapters: 30, program: 'Preli' },
        { subject: 'Bangladesh', chapters: 35, program: 'Preli' },
        { subject: 'International', chapters: 20, program: 'Preli' },
        { subject: 'Math', chapters: 25, program: 'Preli' }
    ],
    bank: [
        { subject: 'Accounting', chapters: 20, program: 'General' },
        { subject: 'Finance', chapters: 20, program: 'General' },
        { subject: 'Marketing', chapters: 15, program: 'General' }
    ]
};
global.getAllSubjects = () => [
    ...global.syllabusStructure.bcs,
    ...global.syllabusStructure.bank
];
global.getAllPrograms = () => [{ name: 'Preli', track: 'bcs' }, { name: 'General', track: 'bank' }];
global.AppState = {
    tasks: [],
    timerLogs: []
};
// 365 days of tasks
for (let d = 0; d < 365; d++) {
    global.AppState.tasks.push({
        date: `2026-01-${d + 1}`,
        type: 'study',
        bcsTasks: [
            { subject: 'Bangla Lit', chapter: `Ch. ${(d % 25) + 1}`, completed: d % 2 === 0 },
            { subject: 'English', chapter: `Ch. ${(d % 30) + 1}`, completed: d % 3 === 0 }
        ]
    });
    global.AppState.timerLogs.push({
        date: `2026-01-${d + 1}`,
        durationSeconds: (d % 4) * 3600
    });
}

require('./js/features/analytics/chapterMap.js');
require('./js/features/analytics/heatmap.js');
require('./js/features/analytics/history.js');
require('./js/features/analytics/spectra.js');
require('./pages/Analytics/Analytics.js');

const t0 = Date.now();
window.AnalyticsPage.mount(true);
const t1 = Date.now();
console.log(`AnalyticsPage.mount took: ${t1 - t0}ms`);
