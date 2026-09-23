/**
 * Test Suite: Navigation Performance & Instant Page Switching
 * Verifies that page navigation in X-29 is near-instant, SPA-like,
 * updates navigation active state synchronously, mounts each route exactly once,
 * preloads containers in idle time, and causes zero data inconsistencies.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// 1. Mock DOM Environment
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
            add(...cls) { cls.forEach(c => this.classes.add(c)); },
            remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
            contains(c) { return this.classes.has(c); },
            toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
        };
        this.style = {};
        this.children = [];
        this.eventListeners = {};
    }

    hasChildNodes() {
        return this.children.length > 0 || (this.innerHTML && this.innerHTML.trim().length > 0);
    }

    addEventListener(event, callback) {
        if (!this.eventListeners[event]) this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
    }

    dispatchEvent(e) {
        if (!e) return true;
        const listeners = this.eventListeners[e.type] || [];
        listeners.forEach(cb => cb(e));
        return true;
    }

    closest(sel) {
        if (sel.includes(this.id)) return this;
        return null;
    }

    getAttribute(name) {
        return this[name] || null;
    }

    setAttribute(name, val) {
        this[name] = val;
    }
}

const elements = new Map();
function getOrCreateElement(id, tagName = 'div') {
    if (!elements.has(id)) {
        elements.set(id, new MockElement(id, tagName));
    }
    return elements.get(id);
}

// Pre-create router pages and nav buttons
const allPages = [
    'dashboard',
    'spectra-analytics',
    'timer',
    'daily-actions',
    'schedule',
    'subjects',
    'paces-management',
    'master-config',
    'outcome',
    'exam',
    'monthly-target-setup'
];

allPages.forEach(p => {
    const pageEl = getOrCreateElement(`page-${p}`);
    pageEl.classList.add('hidden');
    getOrCreateElement(`btn-nav-${p}`);
});
getOrCreateElement('main-content-panel');
getOrCreateElement('sidebar-container');
getOrCreateElement('sidebar-backdrop');

global.document = {
    getElementById: (id) => elements.get(id) || null,
    querySelector: (sel) => {
        if (sel.startsWith('#')) return elements.get(sel.slice(1)) || null;
        return null;
    },
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
    requestAnimationFrame: (cb) => { cb(); },
    requestIdleCallback: (cb) => { cb(); },
    setTimeout: (cb) => { cb(); return 1; },
    clearTimeout: () => {},
    scrollTo: () => {}
};

global.fetch = async (url) => {
    return {
        ok: true,
        text: async () => `<div data-mock-html="${url}">Mock Page Content</div>`
    };
};

// 2. Load router.js
const routerCode = fs.readFileSync(path.join(__dirname, '../router/router.js'), 'utf8');
eval(routerCode);

const Router = window.Router;

console.log('=== X-29 — Navigation Performance & Instant Switching Test Suite ===\n');

let passedTests = 0;
function runTest(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passedTests++;
    } catch (e) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

// Test 1: Router Definition & Registration
runTest('Router object is exported and initialized with all routes', () => {
    assert(Router !== undefined, 'Router should exist on window');
    assert.strictEqual(typeof Router.loadPage, 'function', 'loadPage must be a function');
    assert.strictEqual(typeof Router.updateNavButtons, 'function', 'updateNavButtons must be a function');
    assert.strictEqual(typeof Router.preloadAllRoutes, 'function', 'preloadAllRoutes must be a function');
    assert.strictEqual(typeof Router.refreshActivePageCharts, 'function', 'refreshActivePageCharts must be a function');
    assert(Object.keys(Router.routes).length >= 10, 'Router should have at least 10 routes');
});

// Test 2: Synchronous Nav Button Highlight (0ms latency)
runTest('updateNavButtons updates active styling synchronously without delay', () => {
    Router.updateNavButtons('subjects');
    const subjectsBtn = elements.get('btn-nav-subjects');
    const dashBtn = elements.get('btn-nav-dashboard');

    assert(subjectsBtn.className.includes('bg-violet-600'), 'Subjects nav button should have active violet class');
    assert(!dashBtn.className.includes('bg-slate-900'), 'Dashboard nav button should not have active class');
});

// Test 3: Instant Visibility Switching
runTest('loadPage immediately toggles page container visibility and hides other pages', async () => {
    // Pre-populate subjects container so needsHtml is false
    const subjEl = elements.get('page-subjects');
    subjEl.innerHTML = '<div id="subjects-test-content">Loaded</div>';

    // Mock onMount tracker
    let mountCount = 0;
    Router.routes['subjects'].onMount = () => { mountCount++; };

    await Router.loadPage('subjects');

    assert.strictEqual(subjEl.classList.contains('hidden'), false, 'page-subjects should not be hidden');
    assert.strictEqual(subjEl.classList.contains('animate-page-enter'), true, 'page-subjects should have animate-page-enter');
    assert.strictEqual(elements.get('page-dashboard').classList.contains('hidden'), true, 'page-dashboard should be hidden');
    assert.strictEqual(Router.activePageId, 'subjects', 'activePageId should be subjects');
    assert.strictEqual(mountCount, 1, 'onMount should be called exactly once (no double mounting)');
});

// Test 4: Complete Required Navigation Chain
runTest('All required transition chains execute cleanly without error or double mounting', async () => {
    const transitions = [
        { from: 'subjects', to: 'dashboard', btnId: 'btn-nav-dashboard', pageId: 'page-dashboard' },
        { from: 'dashboard', to: 'daily-actions', btnId: 'btn-nav-daily-actions', pageId: 'page-daily-actions' },
        { from: 'daily-actions', to: 'subjects', btnId: 'btn-nav-subjects', pageId: 'page-subjects' },
        { from: 'subjects', to: 'master-config', btnId: 'btn-nav-master-config', pageId: 'page-master-config' },
        { from: 'master-config', to: 'outcome', btnId: 'btn-nav-outcome', pageId: 'page-outcome' },
        { from: 'outcome', to: 'monthly-target-setup', btnId: 'btn-nav-daily-actions', pageId: 'page-monthly-target-setup' },
        { from: 'monthly-target-setup', to: 'dashboard', btnId: 'btn-nav-dashboard', pageId: 'page-dashboard' }
    ];

    for (const t of transitions) {
        const targetEl = elements.get(t.pageId);
        targetEl.innerHTML = `<div>Content for ${t.to}</div>`;

        let onMountCalled = 0;
        if (Router.routes[t.to]) {
            Router.routes[t.to].onMount = () => { onMountCalled++; };
        }

        const start = Date.now();
        await Router.loadPage(t.to);
        const elapsed = Date.now() - start;

        assert.strictEqual(Router.activePageId, t.to, `Router activePageId should be ${t.to}`);
        assert.strictEqual(targetEl.classList.contains('hidden'), false, `${t.pageId} must be visible`);
        assert.strictEqual(onMountCalled, 1, `${t.to} onMount should be invoked exactly once`);
        assert(elapsed < 50, `Transition to ${t.to} must complete in < 50ms (was ${elapsed}ms)`);
    }
});

// Test 5: Scoped Chart Refresh
runTest('refreshActivePageCharts only triggers chart updates for the active page', () => {
    let dbUpdated = 0;
    let analyticsUpdated = 0;
    let timerUpdated = 0;

    window.dbProgressChartInstance = { resize: () => {}, update: () => { dbUpdated++; } };
    window.spectraFocusAnalyticsChartInstance = { resize: () => {}, update: () => { analyticsUpdated++; } };
    window.timerAnalyticsChartInstance = { resize: () => {}, update: () => { timerUpdated++; } };

    Router.refreshActivePageCharts('dashboard');
    assert.strictEqual(dbUpdated, 1, 'Dashboard chart should be updated');
    assert.strictEqual(analyticsUpdated, 0, 'Analytics chart must NOT be updated when on dashboard');
    assert.strictEqual(timerUpdated, 0, 'Timer chart must NOT be updated when on dashboard');

    Router.refreshActivePageCharts('spectra-analytics');
    assert.strictEqual(analyticsUpdated, 1, 'Analytics chart should be updated');
    assert.strictEqual(dbUpdated, 1, 'Dashboard chart must NOT be updated when on analytics');
});

// Test 6: Mobile Drawer Auto-Close on Navigation
runTest('Mobile drawer closes immediately on navigation when viewport is mobile (< 768px)', async () => {
    window.innerWidth = 375;
    let drawerClosed = false;
    window.closeMobileSidebar = () => { drawerClosed = true; };

    await Router.loadPage('subjects');
    assert.strictEqual(drawerClosed, true, 'closeMobileSidebar must be called on mobile navigation');
    window.innerWidth = 1024; // Reset to desktop
});

// Test 7: Idle Preloader Idempotency
runTest('preloadAllRoutes runs safely without crashing or duplicating containers', () => {
    Router.preloadAllRoutes();
    assert.strictEqual(Router._hasPreloadedRoutes, true, 'preloadAllRoutes should set flag');
    Router.preloadAllRoutes(); // Second call should be a no-op
    assert.strictEqual(Router._hasPreloadedRoutes, true, 'preloadAllRoutes is idempotent');
});

console.log(`\n==================================================`);
console.log(`Navigation Performance Suite: ALL ${passedTests} TESTS PASSED!`);
console.log(`==================================================\n`);
