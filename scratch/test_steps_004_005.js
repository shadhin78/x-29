/**
 * Test Suite: Step 004 & Step 005 Verification
 * 1. History API & Deep-Linking (pushState, popstate, getPageIdFromPath, getPathForPageId, dev-server SPA fallback)
 * 2. Chunked Frame-Budgeted Scheduling (DailyActionsPage, SubjectsPage)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== Testing Step 004 (History API & Deep-Linking) & Step 005 (Chunked Scheduling) ===\n');

// 1. Load router.js in a controlled mock environment
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.classList = {
            classes: new Set(),
            add(...cls) { cls.forEach(c => this.classes.add(c)); },
            remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
            contains(c) { return this.classes.has(c); }
        };
        this.style = {};
        this.children = [];
        this.innerHTML = '<div class="test-content">Mock</div>';
    }
    hasChildNodes() { return true; }
    closest() { return null; }
    getAttribute() { return null; }
    setAttribute() {}
}

const elements = new Map();
function getEl(id) {
    if (!elements.has(id)) elements.set(id, new MockElement(id));
    return elements.get(id);
}

const historyStack = [];
let historyIndex = -1;

global.document = {
    getElementById: (id) => getEl(id),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => new MockElement('', tag),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    addEventListener: () => {},
    readyState: 'complete'
};

global.window = {
    document: global.document,
    innerWidth: 1024,
    location: {
        protocol: 'http:',
        pathname: '/',
        hash: '',
        href: 'http://localhost:3000/'
    },
    history: {
        pushState: (state, title, url) => {
            historyStack.push({ state, title, url });
            historyIndex++;
            global.window.location.pathname = url;
        },
        replaceState: (state, title, url) => {
            if (historyIndex >= 0) {
                historyStack[historyIndex] = { state, title, url };
            } else {
                historyStack.push({ state, title, url });
                historyIndex = 0;
            }
            global.window.location.pathname = url;
        }
    },
    addEventListener: (evt, handler) => {
        if (!global.window._listeners) global.window._listeners = {};
        if (!global.window._listeners[evt]) global.window._listeners[evt] = [];
        global.window._listeners[evt].push(handler);
    },
    dispatchEvent: (evt) => {
        const listeners = (global.window._listeners && global.window._listeners[evt.type]) || [];
        listeners.forEach(cb => cb(evt));
    },
    requestAnimationFrame: (cb) => {
        global.window._rafQueue.push(cb);
        return global.window._rafQueue.length;
    },
    requestIdleCallback: (cb) => { cb(); },
    setTimeout: (cb) => { cb(); return 1; },
    _rafQueue: []
};

global.fetch = async (url) => {
    return {
        ok: true,
        text: async () => `<div data-mock-html="${url}">Mock Page Content</div>`
    };
};

const routerCode = fs.readFileSync(path.join(__dirname, '../router/router.js'), 'utf8');
eval(routerCode);
const Router = window.Router;

// --- STEP 004 TESTS ---

// A. URL Path Helpers
console.log('--- Step 004: URL Path Helpers ---');
assert.strictEqual(Router.getPageIdFromPath('/'), 'dashboard');
assert.strictEqual(Router.getPageIdFromPath('/index.html'), 'dashboard');
assert.strictEqual(Router.getPageIdFromPath('/dashboard'), 'dashboard');
assert.strictEqual(Router.getPageIdFromPath('/subjects'), 'subjects');
assert.strictEqual(Router.getPageIdFromPath('/subjects/'), 'subjects');
assert.strictEqual(Router.getPageIdFromPath('/schedule'), 'schedule');
assert.strictEqual(Router.getPageIdFromPath('/daily-schedule'), 'schedule');
assert.strictEqual(Router.getPageIdFromPath('/daily-actions'), 'daily-actions');
assert.strictEqual(Router.getPageIdFromPath('/analytics'), 'spectra-analytics');
assert.strictEqual(Router.getPageIdFromPath('/spectra-analytics'), 'spectra-analytics');
assert.strictEqual(Router.getPageIdFromPath('/focus'), 'timer');
assert.strictEqual(Router.getPageIdFromPath('/timer'), 'timer');
assert.strictEqual(Router.getPageIdFromPath('/exam'), 'exam');
assert.strictEqual(Router.getPageIdFromPath('/exam-routine'), 'exam');
assert.strictEqual(Router.getPageIdFromPath('/#/paces-management'), 'paces-management');
console.log('  ✓ getPageIdFromPath maps all clean paths & aliases accurately');

assert.strictEqual(Router.getPathForPageId('dashboard'), '/');
assert.strictEqual(Router.getPathForPageId('subjects'), '/subjects');
assert.strictEqual(Router.getPathForPageId('schedule'), '/schedule');
assert.strictEqual(Router.getPathForPageId('spectra-analytics'), '/spectra-analytics');
assert.strictEqual(Router.getPathForPageId('analytics'), '/spectra-analytics');
assert.strictEqual(Router.getPathForPageId('timer'), '/timer');
assert.strictEqual(Router.getPathForPageId('focus'), '/timer');
console.log('  ✓ getPathForPageId canonicalizes route paths correctly');

// B. History PushState & Navigation
console.log('\n--- Step 004: Navigation & History PushState ---');
(async () => {
    historyStack.length = 0;
    historyIndex = -1;

    await Router.loadPage('subjects');
    assert.strictEqual(Router.activePageId, 'subjects');
    assert.strictEqual(window.location.pathname, '/subjects');
    assert.strictEqual(historyStack.length, 1);
    assert.strictEqual(historyStack[0].state.pageId, 'subjects');
    console.log('  ✓ Router.loadPage pushes new history entry and updates address bar');

    await Router.loadPage('schedule');
    assert.strictEqual(Router.activePageId, 'schedule');
    assert.strictEqual(window.location.pathname, '/schedule');
    assert.strictEqual(historyStack.length, 2);
    console.log('  ✓ Navigating to secondary page creates sequential history record');

    // C. PopState Traversal (Browser Back Button)
    console.log('\n--- Step 004: PopState Traversal (Browser Back) ---');
    const popStateListeners = window._listeners['popstate'] || [];
    assert(popStateListeners.length > 0, 'popstate listener must be registered');

    // Simulate clicking Back button to subjects
    popStateListeners.forEach(listener => {
        listener({ state: { pageId: 'subjects' } });
    });
    // Wait microtask
    await new Promise(r => setTimeout(r, 10));

    assert.strictEqual(Router.activePageId, 'subjects', 'Back button must restore previous activePageId');
    assert.strictEqual(historyStack.length, 2, 'PopState traversal must not push a new history entry');
    console.log('  ✓ Browser Back/Forward navigation traverses history cleanly without re-pushing');

    // D. Dev-Server SPA Fallback Check
    console.log('\n--- Step 004: Dev-Server SPA Route Fallback ---');
    const devServerPath = path.join(__dirname, '../js/dev-server.js');
    const devServerContent = fs.readFileSync(devServerPath, 'utf8');
    assert(devServerContent.includes('// SPA route fallback for clean paths'), 'dev-server.js must have SPA fallback handler');
    assert(devServerContent.includes('!requestedExt && !url.startsWith(\'/api/\')'), 'dev-server.js must rewrite non-ext clean paths');
    console.log('  ✓ dev-server.js SPA route fallback verified');

    // --- STEP 005 TESTS ---
    console.log('\n--- Step 005: Chunked Frame-Budgeted Scheduling ---');
    window._rafQueue = [];

    // Load Daily Actions module
    const daPath = path.join(__dirname, '../pages/Daily Actions/Daily Actions.js');
    eval(fs.readFileSync(daPath, 'utf8'));

    let trackerRendered = false;
    let heatmapsRendered = false;
    let monthlyRendered = false;

    window.renderDailyTracker = () => { trackerRendered = true; };
    window.renderDailyLogs = () => { heatmapsRendered = true; };
    window.renderMonthlyTargets = () => { monthlyRendered = true; };
    window.renderWeeklyTargets = () => {};
    window.renderDailyTargets = () => {};

    // Mount Daily Actions
    window.DailyActionsPage._hasRendered = false;
    window.DailyActionsPage.mount();

    assert.strictEqual(trackerRendered, true, 'Frame 1: Critical primary tracker must render immediately');
    assert.strictEqual(heatmapsRendered, false, 'Frame 2: 180-day heatmaps must NOT render in Frame 1');
    assert.strictEqual(monthlyRendered, false, 'Frame 2: Monthly targets must NOT render in Frame 1');
    assert(window._rafQueue.length > 0, 'Frame 2 tasks must be scheduled in RAF queue');
    console.log('  ✓ DailyActionsPage: Frame 1 renders critical tracker synchronously without lag');

    // Execute RAF tick (Frame 2)
    const pendingTasks = [...window._rafQueue];
    window._rafQueue = [];
    pendingTasks.forEach(task => task());

    assert.strictEqual(heatmapsRendered, true, 'Frame 2: Heatmaps rendered after RAF tick');
    assert.strictEqual(monthlyRendered, true, 'Frame 2: Monthly targets rendered after RAF tick');
    console.log('  ✓ DailyActionsPage: Frame 2 hydrates heatmaps and cascaded targets cleanly');

    // Test Rapid Navigation Cancellation (Guard against zombie renders)
    console.log('\n--- Step 005: Rapid Navigation Cancellation Guard ---');
    window.DailyActionsPage._hasRendered = false;
    trackerRendered = false;
    heatmapsRendered = false;

    window.DailyActionsPage.mount();
    assert.strictEqual(trackerRendered, true);
    assert.strictEqual(heatmapsRendered, false);

    // User navigates away before Frame 2 fires!
    window.DailyActionsPage.destroy();
    assert.strictEqual(window.DailyActionsPage.isMounted, false);

    // Execute Frame 2
    const pendingCanceled = [...window._rafQueue];
    window._rafQueue = [];
    pendingCanceled.forEach(task => task());

    assert.strictEqual(heatmapsRendered, false, 'Frame 2 must abort when unmounted');
    console.log('  ✓ Zombie render guard prevented unmounted route hydration');

    // SubjectsPage chunking check
    console.log('\n--- Step 005: SubjectsPage Chunked Scheduling ---');
    const subjectsPath = path.join(__dirname, '../pages/Subjects/Subjects.js');
    eval(fs.readFileSync(subjectsPath, 'utf8'));

    let subNavRendered = false;
    let subTaskListRendered = false;
    let subMetricsUpdated = false;

    window.renderSubjectNavigation = () => { subNavRendered = true; };
    window.renderSubjectProgress = () => {};
    window.renderTaskList = () => { subTaskListRendered = true; };
    window.updateMetrics = () => { subMetricsUpdated = true; };

    window.SubjectsPage._hasRendered = false;
    window._rafQueue = [];
    window.SubjectsPage.mount();

    assert.strictEqual(subNavRendered, true, 'Frame 1: Subject nav rendered immediately');
    assert.strictEqual(subTaskListRendered, false, 'Frame 2: 1,300-row task list deferred to Frame 2');
    assert.strictEqual(subMetricsUpdated, false, 'Frame 2: Metrics calculation deferred to Frame 2');

    // Fire RAF
    const pendingSubTasks = [...window._rafQueue];
    window._rafQueue = [];
    pendingSubTasks.forEach(task => task());

    assert.strictEqual(subTaskListRendered, true, 'Frame 2: Task list rendered on RAF');
    assert.strictEqual(subMetricsUpdated, true, 'Frame 2: Metrics updated on RAF');
    console.log('  ✓ SubjectsPage: Frame 1 renders navigation header; Frame 2 hydrates heavy task list');

    console.log('\n==================================================');
    console.log('ALL STEP 004 & STEP 005 TESTS PASSED SUCCESSFULLY!');
    console.log('==================================================');
})();
