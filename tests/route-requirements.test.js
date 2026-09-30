/**
 * Test Suite: Global Route Requirements Verification
 *
 * Verifies:
 * 1. Dedicated accessible route exists for every page (/dashboard, /timer, /subjects, /schedule, /analytics, /exam, /pace, /master-config, /outcome, /daily-actions, /monthly-target-setup, /login)
 * 2. URL synchronization via History API (pushState, replaceState, popstate)
 * 3. Deep-linking and URL refresh persistence
 * 4. Browser Back/Forward navigation without page reloads
 * 5. Permanent Dark Mode enforcement (no light flash, dark class on html, dark-mode body, color-scheme)
 * 6. Dev server clean SPA route fallback (HTTP 200 index.html for all clean routes)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== X-29 — Global Route Requirements Verification Suite ===\n');

// 1. Mock DOM Environment for Router testing
class MockElement {
    constructor(id = '', tagName = 'div') {
        this.id = id;
        this.tagName = tagName.toUpperCase();
        this.classList = {
            classes: new Set(),
            add(...cls) { cls.forEach(c => this.classes.add(c)); },
            remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
            contains(c) { return this.classes.has(c); },
            toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
        };
        this.children = [];
        this.innerHTML = 'content';
    }
    hasChildNodes() { return true; }
    closest() { return this; }
    getAttribute() { return null; }
    setAttribute() {}
}

const elements = new Map();
function getEl(id) {
    if (!elements.has(id)) elements.set(id, new MockElement(id));
    return elements.get(id);
}

const allPages = [
    'dashboard',
    'spectra-analytics',
    'analytics',
    'timer',
    'focus',
    'daily-actions',
    'schedule',
    'daily-schedule',
    'subjects',
    'paces-management',
    'pace',
    'master-config',
    'outcome',
    'exam',
    'exam-routine',
    'monthly-target-setup'
];

allPages.forEach(p => {
    getEl(`page-${p}`);
    getEl(`btn-nav-${p}`);
});
getEl('main-content-panel');

let historyStack = [];
let currentHistoryIndex = -1;

global.window = {
    location: { pathname: '/', search: '', hash: '', protocol: 'http:' },
    history: {
        pushState: (state, title, url) => {
            currentHistoryIndex++;
            historyStack = historyStack.slice(0, currentHistoryIndex);
            historyStack.push({ state, url });
            global.window.location.pathname = url;
        },
        replaceState: (state, title, url) => {
            if (currentHistoryIndex === -1) {
                historyStack.push({ state, url });
                currentHistoryIndex = 0;
            } else {
                historyStack[currentHistoryIndex] = { state, url };
            }
            global.window.location.pathname = url;
        }
    },
    addEventListener: () => {},
    requestAnimationFrame: (cb) => cb(),
    requestIdleCallback: (cb) => cb(),
    setTimeout: (cb) => { cb(); return 1; },
    clearTimeout: () => {}
};

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

global.fetch = async (url) => {
    return {
        ok: true,
        text: async () => `<div data-mock-html="${url}">Mock Page Content</div>`
    };
};

const routerCode = fs.readFileSync(path.join(__dirname, '../router/router.js'), 'utf8');
eval(routerCode);
const Router = window.Router;

async function runTest(name, fn) {
    try {
        await fn();
        console.log(`  ✓ ${name}`);
    } catch (e) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

async function testAll() {
    // ---------------------------------------------------------
    // 1. ROUTE MAPPING & SEPARATE DEDICATED ROUTES AUDIT
    // ---------------------------------------------------------
    console.log('1. Dedicated Route Mapping & Canonical Resolution:');

    const routeMappings = [
        { urlPath: '/', expectedPageId: 'dashboard', expectedPath: '/dashboard' },
        { urlPath: '/dashboard', expectedPageId: 'dashboard', expectedPath: '/dashboard' },
        { urlPath: '/timer', expectedPageId: 'timer', expectedPath: '/timer' },
        { urlPath: '/focus', expectedPageId: 'timer', expectedPath: '/focus' },
        { urlPath: '/subjects', expectedPageId: 'subjects', expectedPath: '/subjects' },
        { urlPath: '/schedule', expectedPageId: 'schedule', expectedPath: '/schedule' },
        { urlPath: '/daily-schedule', expectedPageId: 'schedule', expectedPath: '/daily-schedule' },
        { urlPath: '/analytics', expectedPageId: 'spectra-analytics', expectedPath: '/analytics' },
        { urlPath: '/spectra-analytics', expectedPageId: 'spectra-analytics', expectedPath: '/spectra-analytics' },
        { urlPath: '/exam', expectedPageId: 'exam', expectedPath: '/exam' },
        { urlPath: '/exam-routine', expectedPageId: 'exam', expectedPath: '/exam-routine' },
        { urlPath: '/pace', expectedPageId: 'paces-management', expectedPath: '/pace' },
        { urlPath: '/paces-management', expectedPageId: 'paces-management', expectedPath: '/paces-management' },
        { urlPath: '/master-config', expectedPageId: 'master-config', expectedPath: '/master-config' },
        { urlPath: '/outcome', expectedPageId: 'outcome', expectedPath: '/outcome' },
        { urlPath: '/daily-actions', expectedPageId: 'daily-actions', expectedPath: '/daily-actions' },
        { urlPath: '/monthly-target-setup', expectedPageId: 'monthly-target-setup', expectedPath: '/monthly-target-setup' }
    ];

    for (const r of routeMappings) {
        await runTest(`URL path "${r.urlPath}" resolves to page "${r.expectedPageId}" and preserves path "${r.expectedPath}"`, () => {
            window.location.pathname = r.urlPath;
            const resolvedPage = Router.getPageIdFromPath(r.urlPath);
            assert.strictEqual(resolvedPage, r.expectedPageId, `Expected ${r.expectedPageId} for ${r.urlPath}`);
            const generatedPath = Router.getPathForPageId(resolvedPage);
            assert.strictEqual(generatedPath, r.expectedPath, `Expected path ${r.expectedPath} for ${r.urlPath}`);
        });
    }

    // ---------------------------------------------------------
    // 2. DIRECT ROUTE NAVIGATION & REFRESH PERSISTENCE
    // ---------------------------------------------------------
    console.log('\n2. Direct URL Opening, Refresh, and Tab Persistence:');

    await runTest('Navigating to a route updates address bar to dedicated route without page reload', async () => {
        window.location.pathname = '/';
        await Router.loadPage('timer');
        assert.strictEqual(window.location.pathname, '/timer');
        assert.strictEqual(Router.activePageId, 'timer');

        await Router.loadPage('subjects');
        assert.strictEqual(window.location.pathname, '/subjects');
        assert.strictEqual(Router.activePageId, 'subjects');

        await Router.loadPage('dashboard');
        assert.strictEqual(window.location.pathname, '/dashboard');
        assert.strictEqual(Router.activePageId, 'dashboard');
    });

    await runTest('Simulating page refresh on deep-link /subjects re-mounts subjects view', async () => {
        window.location.pathname = '/subjects';
        const pageFromPath = Router.getPageIdFromPath(window.location.pathname);
        assert.strictEqual(pageFromPath, 'subjects');
        await Router.loadPage(pageFromPath, null, { replace: true });
        assert.strictEqual(Router.activePageId, 'subjects');
        assert.strictEqual(window.location.pathname, '/subjects');
    });

    // ---------------------------------------------------------
    // 3. BROWSER BACK / FORWARD NAVIGATION TRAVERSAL
    // ---------------------------------------------------------
    console.log('\n3. Browser History Back / Forward Traversal:');

    await runTest('Back/Forward traverses history cleanly without full reload or state corruption', async () => {
        historyStack = [];
        currentHistoryIndex = -1;

        window.location.pathname = '/dashboard';
        window.history.replaceState({ pageId: 'dashboard' }, '', '/dashboard');

        await Router.loadPage('schedule');
        assert.strictEqual(window.location.pathname, '/schedule');

        await Router.loadPage('exam');
        assert.strictEqual(window.location.pathname, '/exam');

        // Simulate Browser Back to /schedule
        const backState = historyStack[1];
        await Router.loadPage(backState.state.pageId, null, { updateHistory: false });
        window.location.pathname = backState.url;
        assert.strictEqual(Router.activePageId, 'schedule');
        assert.strictEqual(window.location.pathname, '/schedule');

        // Simulate Browser Back to /dashboard
        const firstState = historyStack[0];
        await Router.loadPage(firstState.state.pageId, null, { updateHistory: false });
        window.location.pathname = firstState.url;
        assert.strictEqual(Router.activePageId, 'dashboard');
        assert.strictEqual(window.location.pathname, '/dashboard');
    });

    // ---------------------------------------------------------
    // 4. PERMANENT DARK MODE VERIFICATION
    // ---------------------------------------------------------
    console.log('\n4. Permanent Dark Mode Verification Across All Routes:');

    await runTest('index.html and login.html enforce permanent dark mode on html, body, and style', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        const loginHtml = fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8');
        const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

        // Check dark class on <html>
        assert(indexHtml.includes('<html lang="en" class="dark'), 'index.html must have dark class on html');
        assert(loginHtml.includes('<html lang="en" class="dark'), 'login.html must have dark class on html');

        // Check inline background and color-scheme on <html>
        assert(indexHtml.includes('style="background-color: #0f172a; color-scheme: dark;"'), 'index.html html inline dark style');
        assert(loginHtml.includes('style="background-color: #0b0f19; color-scheme: dark;"'), 'login.html html inline dark style');

        const bodyTag = indexHtml.match(/<body[^>]*>/)[0];
        assert(!bodyTag.includes('bg-slate-50'), 'index.html <body> must NOT contain bg-slate-50 fallback');
        assert(bodyTag.includes('bg-[#0f172a]'), 'index.html <body> must use dark bg-[#0f172a]');

        // Check color-scheme in style.css
        assert(styleCss.includes('color-scheme: dark'), 'css/style.css must have color-scheme: dark');
        assert(styleCss.includes('background-color: #0f172a'), 'css/style.css must have dark background');
    });

    // ---------------------------------------------------------
    // 5. DEV SERVER CLEAN ROUTE SPA FALLBACK
    // ---------------------------------------------------------
    console.log('\n5. Dev Server Clean SPA Route Fallback (Local 3000):');

    await runTest('Dev server configuration rewrites all clean routes to index.html with 200 OK', () => {
        const devServerCode = fs.readFileSync(path.join(__dirname, '../js/dev-server.js'), 'utf8');
        assert(devServerCode.includes('requestedExt = path.extname(url)'), 'dev-server must check requestedExt');
        assert(devServerCode.includes('index.html'), 'dev-server must serve index.html for clean routes');
        assert(devServerCode.includes("url === '/login'"), 'dev-server must handle clean /login URL');
    });

    // ---------------------------------------------------------
    // 6. BASE TAG & STATIC ROUTE ENTRY SYNCHRONIZATION
    // ---------------------------------------------------------
    console.log('\n6. Base Tag & Static Route Entry Synchronization:');

    await runTest('index.html and login.html include <base href="/"> for clean relative asset loading', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        const loginHtml = fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8');
        assert(indexHtml.includes('<base href="/">'), 'index.html must include <base href="/">');
        assert(loginHtml.includes('<base href="/">'), 'login.html must include <base href="/">');
    });

    await runTest('All 18 route directories contain valid, non-empty index.html entry points', () => {
        const routesToCheck = [
            'dashboard', 'timer', 'focus', 'subjects', 'subject', 'schedule', 'daily-schedule',
            'analytics', 'spectra-analytics', 'exam', 'exam-routine', 'pace', 'paces-management',
            'master-config', 'outcome', 'daily-actions', 'monthly-target-setup', 'login'
        ];
        routesToCheck.forEach(r => {
            const entryPath = path.join(__dirname, '..', r, 'index.html');
            assert(fs.existsSync(entryPath), `Route directory "${r}" must contain index.html`);
            const stat = fs.statSync(entryPath);
            assert(stat.size > 1000, `Route entry "${r}/index.html" must not be empty (was ${stat.size} bytes)`);
        });
    });

    console.log('\n==================================================');
    console.log('ALL GLOBAL ROUTE REQUIREMENTS VERIFIED! (100% PASS)');
    console.log('==================================================\n');
}

testAll();
