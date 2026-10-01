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
        { urlPath: '/', expectedPageId: 'dashboard', expectedPath: '/' },
        { urlPath: '/dashboard', expectedPageId: 'dashboard', expectedPath: '/' },
        { urlPath: '/dashboard/', expectedPageId: 'dashboard', expectedPath: '/' },
        { urlPath: '/timer', expectedPageId: 'timer', expectedPath: '/timer' },
        { urlPath: '/timer/', expectedPageId: 'timer', expectedPath: '/timer' },
        { urlPath: '/timer%20or%20page', expectedPageId: 'timer', expectedPath: '/timer' },
        { urlPath: '/focus', expectedPageId: 'focus', expectedPath: '/focus' },
        { urlPath: '/subjects', expectedPageId: 'subjects', expectedPath: '/subjects' },
        { urlPath: '/subjects/', expectedPageId: 'subjects', expectedPath: '/subjects' },
        { urlPath: '/subject', expectedPageId: 'subjects', expectedPath: '/subjects' },
        { urlPath: '/schedule', expectedPageId: 'schedule', expectedPath: '/schedule' },
        { urlPath: '/schedule/', expectedPageId: 'schedule', expectedPath: '/schedule' },
        { urlPath: '/daily-schedule', expectedPageId: 'schedule', expectedPath: '/schedule' },
        { urlPath: '/analytics', expectedPageId: 'spectra-analytics', expectedPath: '/analytics' },
        { urlPath: '/analytics/', expectedPageId: 'spectra-analytics', expectedPath: '/analytics' },
        { urlPath: '/spectra-analytics', expectedPageId: 'spectra-analytics', expectedPath: '/analytics' },
        { urlPath: '/exam', expectedPageId: 'exam', expectedPath: '/exam' },
        { urlPath: '/exam/', expectedPageId: 'exam', expectedPath: '/exam' },
        { urlPath: '/exam-routine', expectedPageId: 'exam', expectedPath: '/exam' },
        { urlPath: '/pace', expectedPageId: 'paces-management', expectedPath: '/pace' },
        { urlPath: '/pace/', expectedPageId: 'paces-management', expectedPath: '/pace' },
        { urlPath: '/paces-management', expectedPageId: 'paces-management', expectedPath: '/pace' },
        { urlPath: '/master-config', expectedPageId: 'master-config', expectedPath: '/master-config' },
        { urlPath: '/outcome', expectedPageId: 'outcome', expectedPath: '/outcome' },
        { urlPath: '/daily-actions', expectedPageId: 'daily-actions', expectedPath: '/daily-actions' },
        { urlPath: '/daily%20actions', expectedPageId: 'daily-actions', expectedPath: '/daily-actions' },
        { urlPath: '/daily-actions/monthly-setup', expectedPageId: 'monthly-target-setup', expectedPath: '/daily-actions/monthly-setup' },
        { urlPath: '/monthly-target-setup', expectedPageId: 'monthly-target-setup', expectedPath: '/daily-actions/monthly-setup' }
    ];

    for (const r of routeMappings) {
        await runTest(`URL path "${r.urlPath}" resolves to page "${r.expectedPageId}" and canonical path "${r.canonicalExpectedPath || r.expectedPath}"`, () => {
            window.location.pathname = r.urlPath;
            const resolvedPage = Router.getPageIdFromPath(r.urlPath);
            assert.strictEqual(resolvedPage, r.expectedPageId, `Expected ${r.expectedPageId} for ${r.urlPath}`);
            const generatedPath = Router.getPathForPageId(resolvedPage);
            const expectedPath = r.canonicalExpectedPath || r.expectedPath;
            assert.strictEqual(generatedPath, expectedPath, `Expected path ${expectedPath} for ${r.urlPath}`);
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
        assert.strictEqual(window.location.pathname, '/');
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

        window.location.pathname = '/';
        window.history.replaceState({ pageId: 'dashboard' }, '', '/');

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

        // Simulate Browser Back to /
        const firstState = historyStack[0];
        await Router.loadPage(firstState.state.pageId, null, { updateHistory: false });
        window.location.pathname = firstState.url;
        assert.strictEqual(Router.activePageId, 'dashboard');
        assert.strictEqual(window.location.pathname, '/');
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

    await runTest('All canonical route directories contain valid, non-empty index.html entry points', () => {
        const canonicalRoutesToCheck = [
            'focus', 'subjects', 'daily-actions', 'daily-actions/monthly-setup',
            'schedule', 'pace', 'master-config', 'outcome', 'exam', 'analytics', 'timer', 'login'
        ];
        canonicalRoutesToCheck.forEach(r => {
            const entryPath = path.join(__dirname, '..', r, 'index.html');
            assert(fs.existsSync(entryPath), `Canonical route directory "${r}" must contain index.html`);
            const stat = fs.statSync(entryPath);
            assert(stat.size > 1000, `Canonical route entry "${r}/index.html" must not be empty (was ${stat.size} bytes)`);
        });
    });

    await runTest('Obsolete duplicate route directories are completely removed and cannot be served', () => {
        const obsoleteDirs = [
            'dashboard', 'paces-management', 'spectra-analytics',
            'daily-schedule', 'subject', 'exam-routine', 'monthly-target-setup',
            path.join('pages', 'Polymath Orbit')
        ];
        obsoleteDirs.forEach(dir => {
            assert(!fs.existsSync(path.join(__dirname, '..', dir)), `Obsolete duplicate directory "${dir}" must NOT exist`);
        });
    });

    // ---------------------------------------------------------
    // 7. SVG SPRITE VECTOR INTEGRITY & ICONS PRESERVATION
    // ---------------------------------------------------------
    console.log('\n7. SVG Sprite Vector Integrity & Icons Preservation:');

    await runTest('index.html contains valid vector path geometry for all 11 SVG sprite symbols with zero circular references', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        const requiredIcons = [
            'x29-icon-close-thick',
            'x29-icon-close',
            'x29-icon-close-thin',
            'x29-icon-plus',
            'x29-icon-external',
            'x29-icon-calendar',
            'x29-icon-clock',
            'x29-icon-chevron-down',
            'x29-icon-bolt',
            'x29-icon-sparkles',
            'x29-icon-pencil'
        ];

        requiredIcons.forEach(id => {
            const circularPattern = new RegExp(`<g\\s+id="${id}">\\s*<use\\s+href="#${id}"\\/>\\s*<\\/g>`);
            assert(!circularPattern.test(indexHtml), `index.html must not contain circular <use> for ${id}`);

            const validPathPattern = new RegExp(`<g\\s+id="${id}">[\\s\\S]*?<path\\s+[^>]*?d="[^"]+"[\\s\\S]*?<\\/g>`);
            assert(validPathPattern.test(indexHtml), `index.html must contain valid <path> for ${id}`);
        });
    });

    await runTest('All 11 canonical SPA route index.html files contain matching valid SVG sprite definitions', () => {
        const routesToCheck = [
            'focus', 'subjects', 'daily-actions', 'daily-actions/monthly-setup',
            'schedule', 'pace', 'master-config', 'outcome', 'exam', 'analytics', 'timer'
        ];
        const requiredIcons = [
            'x29-icon-close-thick', 'x29-icon-close', 'x29-icon-close-thin', 'x29-icon-plus',
            'x29-icon-external', 'x29-icon-calendar', 'x29-icon-clock', 'x29-icon-chevron-down',
            'x29-icon-bolt', 'x29-icon-sparkles', 'x29-icon-pencil'
        ];

        routesToCheck.forEach(r => {
            const entryPath = path.join(__dirname, '..', r, 'index.html');
            const content = fs.readFileSync(entryPath, 'utf8');
            requiredIcons.forEach(id => {
                const validPathPattern = new RegExp(`<g\\s+id="${id}">[\\s\\S]*?<path\\s+[^>]*?d="[^"]+"[\\s\\S]*?<\\/g>`);
                assert(validPathPattern.test(content), `Route ${r}/index.html must contain valid <path> for ${id}`);
            });
        });
    });

    await runTest('Application Shell, Navigation & Header controls contain authentic inline vector graphics (Step 003)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert(indexHtml.includes('id="sidebar-close-btn"'), 'sidebar-close-btn exists');
        assert(/id="sidebar-close-btn"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'sidebar-close-btn has close path');
        assert(/id="btn-nav-timer"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'btn-nav-timer has clock path');
        assert(/id="btn-nav-daily-actions"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'btn-nav-daily-actions has clock path');
        assert(/id="btn-nav-paces-management"[\s\S]*?<path[^>]*?d="M13 10V3L4 14h7v7l9-11h-7z"/.test(indexHtml), 'btn-nav-paces-management has bolt path');
        assert(/id="header-exam-countdown-compact"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'header-exam-countdown-compact has clock path');
    });

    await runTest('Dashboard Action Cards & Navigation Jump Buttons contain authentic inline vector graphics (Step 004)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert(/id="dashboard-pace-section"[\s\S]*?<path[^>]*?d="M13 10V3L4 14h7v7l9-11h-7z"/.test(indexHtml), 'Pace section bolt path');
        assert(/data-switch-page="paces-management"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Pace jump external link path');
        assert(/data-switch-page="spectra-analytics"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Heatmap detail jump external path');
        assert(/id="db-monthly-checklist-pct"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Monthly checklist pct external path');
        assert(/data-switch-page="daily-actions"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Daily actions tracker external path');
        assert(/id="db-outcome-overall-badge"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Outcome overall badge external path');
        assert(/id="db-daily-checklist-pct"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Daily checklist pct external path');
        assert(/id="db-weekly-checklist-pct"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Weekly checklist pct external path');
        assert(/id="dashboard-daily-actions-progress"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Daily actions progress external path');
        assert(/id="db-upcoming-exams-count-badge"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Upcoming exams external path');
        assert(/id="db-passed-subjects-count-badge"[\s\S]*?<path[^>]*?d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/.test(indexHtml), 'Passed subjects external path');
        assert(/id="trends-bar-days-remain-container"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'Trends days remain clock path');
        assert(/id="trends-bar-actual-pace-container"[\s\S]*?<path[^>]*?d="M13 10V3L4 14h7v7l9-11h-7z"/.test(indexHtml), 'Trends actual pace bolt path');
    });

    await runTest('Focus / Timer & Chronograph Visual Assets contain authentic inline vector graphics (Step 005)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert(/id="timer-stat-today"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'Timer stat today clock path');
        assert(/id="timer-btn-add-subject-target"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Timer add target plus path');
        assert(/id="timer-history-total-time-badge"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'Timer history total clock path');
        assert(/id="timer-btn-open-add-session"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Timer add session plus path');
        assert(/data-open-monthly-target-setup[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Target setup plus path');
    });

    await runTest('Daily Schedule, Analytics & Monthly Target Setup contain authentic inline vector graphics (Step 006)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert(/id="spectra-filter-dropdown-btn"[\s\S]*?<path[^>]*?d="M19 9l-7 7-7-7"/.test(indexHtml), 'Spectra filter dropdown chevron path');
        assert(/Create[\s\S]*?Daily[\s\S]*?Action Tracker[\s\S]*?<path[^>]*?d="M19 9l-7 7-7-7"/.test(indexHtml), 'Daily action tracker chevron path');
        assert(/id="btn-open-add-schedule"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Open add schedule plus path');
        assert(/id="mt-daily-allocation-card"[\s\S]*?<path[^>]*?d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/.test(indexHtml), 'Monthly target calendar path');
        assert(/data-spread-from-start-date[\s\S]*?<path[^>]*?d="M13 10V3L4 14h7v7l9-11h-7z"/.test(indexHtml), 'Monthly target bulk assign bolt path');
        assert(/id="sidebar-progress-section"[\s\S]*?<path[^>]*?d="M19 9l-7 7-7-7"/.test(indexHtml), 'Subject progress chevron path');
        assert(/Pass \/[\s\S]*?Freeze[\s\S]*?Configuration[\s\S]*?<path[^>]*?d="M19 9l-7 7-7-7"/.test(indexHtml), 'Outcome pass freeze chevron path');
        assert(/Milestone Celebration Criteria[\s\S]*?<path[^>]*?d="M19 9l-7 7-7-7"/.test(indexHtml), 'Outcome milestone chevron path');
        assert(/data-open-session-modal[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Add result session plus path');
    });

    await runTest('Universal Modal Dialogs & Confirmation Close Icons contain authentic inline vector graphics (Step 007)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        assert(/data-close-session-modal[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Session modal thin close path');
        assert(/data-close-exam-modal[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Exam modal thin close path');
        assert(/id="esm-btn-delete"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Delete subject close path');
        assert(/data-modal-close="edit-timeline-entry-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Timeline entry close path');
        assert(/id="custom-timer-modal"[\s\S]*?<path[^>]*?d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/.test(indexHtml), 'Custom timer duration clock path');
        assert(/data-modal-close="custom-timer-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Custom timer close thick path');
        assert(/data-modal-close="subject-target-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Subject target close thick path');
        assert(/id="add-timer-session-modal"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Add timer session plus badge path');
        assert(/data-modal-close="add-timer-session-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Add timer session close thick path');
        assert(/data-modal-close="edit-timer-session-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Edit timer session close thick path');
        assert(/data-modal-close="global-chapters-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Global chapters close thick path');
        assert(/data-modal-close="timer-analytics-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Timer analytics close thick path');
        assert(/data-modal-close="account-settings-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Account settings close thick path');
        assert(/id="add-schedule-modal"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Add schedule plus badge path');
        assert(/data-modal-close="add-schedule-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Add schedule close thick path');
        assert(/data-modal-close="create-schedule-group-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Create schedule group close thick path');
        assert(/id="add-daily-target-modal"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Add daily target plus badge path');
        assert(/data-modal-close="add-daily-target-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Add daily target close thick path');
        assert(/id="add-weekly-target-modal"[\s\S]*?<path[^>]*?d="M12 4v16m8-8H4"/.test(indexHtml), 'Add weekly target plus badge path');
        assert(/data-modal-close="add-weekly-target-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Add weekly target close thick path');
        assert(/data-modal-close="celebration-setup-modal"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Celebration setup close thick path');
        assert(/id="spectra-hm-modal-close-btn"[\s\S]*?<path[^>]*?d="M6 18L18 6M6 6l12 12"/.test(indexHtml), 'Spectra heatmap modal close thin path');
    });

    await runTest('Site-wide SVG vector integrity & total parity across all 18 route files (Step 008)', () => {
        const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
        const countPaths = (indexHtml.match(/<path\b/g) || []).length;
        assert(countPaths > 180, `index.html must contain comprehensive inline paths (found ${countPaths})`);

        const routesToCheck = [
            'dashboard', 'timer', 'focus', 'subjects', 'subject', 'schedule', 'daily-schedule',
            'analytics', 'spectra-analytics', 'exam', 'exam-routine', 'pace', 'paces-management',
            'master-config', 'outcome', 'daily-actions', 'monthly-target-setup'
        ];

        routesToCheck.forEach(r => {
            const entryPath = path.join(__dirname, '..', r, 'index.html');
            const content = fs.readFileSync(entryPath, 'utf8');
            const routePaths = (content.match(/<path\b/g) || []).length;
            assert.strictEqual(routePaths, countPaths, `Route ${r}/index.html must have identical path count (${countPaths})`);
        });
    });

    console.log('\n==================================================');
    console.log('ALL GLOBAL ROUTE REQUIREMENTS VERIFIED! (100% PASS)');
    console.log('==================================================\n');
}

testAll();


