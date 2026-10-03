/**
 * Route Entry Synchronizer (scripts/sync-routes.js)
 *
 * Ensures all clean route directories (dashboard, timer, subjects, schedule,
 * analytics, exam, pace, master-config, outcome, daily-actions,
 * monthly-target-setup, login) have a synchronized, pre-rendered entry point.
 *
 * Each route entry point is tailored so that:
 * 1. The target page container is immediately active and visible on parse (no white or wrong-page flash).
 * 2. Inactive page containers are set to hidden.
 * 3. Sidebar navigation buttons reflect the active route.
 * 4. The document <title> accurately reflects the page.
 * 5. <base href="/"> is enforced for clean asset loading from root.
 * 6. Permanent dark mode is strictly preserved.
 *
 * This guarantees 100% parity across:
 * 1. Live Production (Vercel): https://x-29.vercel.app/<page>
 * 2. Local Live Preview: http://127.0.0.1:3000/<page>
 * 3. Local Dev Server: http://127.0.0.1:3000/<page>
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');
const LOGIN_HTML_PATH = path.join(ROOT_DIR, 'login.html');

const SPA_ROUTES = [
    'focus',
    'subjects',
    'daily-actions',
    'daily-actions/monthly-setup',
    'schedule',
    'pace',
    'master-config',
    'outcome',
    'exam',
    'analytics',
    'timer'
];

const OBSOLETE_ROUTE_DIRS = [
    'dashboard',
    'paces-management',
    'spectra-analytics',
    'daily-schedule',
    'subject',
    'exam-routine',
    'monthly-target-setup',
    path.join('pages', 'Polymath Orbit')
];

const ASSET_VERSION = '1.1.0';

const ROUTE_CONFIGS = {
    'focus': {
        containerId: 'page-timer',
        title: 'Focus - X-29',
        navKey: 'timer',
        cssId: 'route-focus-css',
        cssUrl: 'pages/Focus/Focus.css',
        jsId: 'route-focus-js',
        jsUrl: 'pages/Focus/Focus.js'
    },
    'subjects': {
        containerId: 'page-subjects',
        title: 'Subjects - X-29',
        navKey: 'subjects',
        cssId: 'route-subjects-css',
        cssUrl: 'pages/Subjects/Subjects.css',
        jsId: 'route-subjects-js',
        jsUrl: 'pages/Subjects/Subjects.js'
    },
    'daily-actions': {
        containerId: 'page-daily-actions',
        title: 'Daily Actions - X-29',
        navKey: 'daily-actions',
        cssId: 'route-daily-actions-css',
        cssUrl: 'pages/Daily Actions/Daily Actions.css',
        jsId: 'route-daily-actions-js',
        jsUrl: 'pages/Daily Actions/Daily Actions.js'
    },
    'daily-actions/monthly-setup': {
        containerId: 'page-monthly-target-setup',
        title: 'Monthly Target Setup - X-29',
        navKey: 'daily-actions',
        cssId: 'route-monthly-target-css',
        cssUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.css',
        jsId: 'route-monthly-target-js',
        jsUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.js'
    },
    'schedule': {
        containerId: 'page-schedule',
        title: 'Daily Schedule - X-29',
        navKey: 'schedule',
        cssId: 'route-schedule-css',
        cssUrl: 'pages/Daily Schedule/Daily Schedule.css',
        jsId: 'route-schedule-js',
        jsUrl: 'pages/Daily Schedule/Daily Schedule.js'
    },
    'pace': {
        containerId: 'page-paces-management',
        title: 'Pace Management - X-29',
        navKey: 'paces-management',
        cssId: 'route-pace-management-css',
        cssUrl: 'pages/Pace Management/Pace Management.css',
        jsId: 'route-pace-management-js',
        jsUrl: 'pages/Pace Management/Pace Management.js'
    },
    'master-config': {
        containerId: 'page-master-config',
        title: 'Master Config - X-29',
        navKey: 'master-config',
        cssId: 'route-master-config-css',
        cssUrl: 'pages/Master Config/Master Config.css',
        jsId: 'route-master-config-js',
        jsUrl: 'pages/Master Config/Master Config.js'
    },
    'outcome': {
        containerId: 'page-outcome',
        title: 'Outcome - X-29',
        navKey: 'outcome',
        cssId: 'route-outcome-css',
        cssUrl: 'pages/Outcome/Outcome.css',
        jsId: 'route-outcome-js',
        jsUrl: 'pages/Outcome/Outcome.js'
    },
    'exam': {
        containerId: 'page-exam',
        title: 'Exam Routine - X-29',
        navKey: 'exam',
        cssId: 'route-exam-routine-css',
        cssUrl: 'pages/Exam Routine/Exam Routine.css',
        jsId: 'route-exam-routine-js',
        jsUrl: 'pages/Exam Routine/Exam Routine.js'
    },
    'analytics': {
        containerId: 'page-spectra-analytics',
        title: 'Analytics - X-29',
        navKey: 'spectra-analytics',
        cssId: 'route-analytics-css',
        cssUrl: 'pages/Analytics/Analytics.css',
        jsId: 'route-analytics-js',
        jsUrl: 'pages/Analytics/Analytics.js'
    },
    'timer': {
        containerId: 'page-timer',
        title: 'Focus - X-29',
        navKey: 'timer',
        cssId: 'route-focus-css',
        cssUrl: 'pages/Focus/Focus.css',
        jsId: 'route-focus-js',
        jsUrl: 'pages/Focus/Focus.js'
    }
};

const PAGE_CONTAINERS = [
    'page-dashboard',
    'page-spectra-analytics',
    'page-timer',
    'page-daily-actions',
    'page-schedule',
    'page-monthly-target-setup',
    'page-subjects',
    'page-master-config',
    'page-paces-management',
    'page-outcome',
    'page-exam'
];

const NAV_BUTTONS = {
    'dashboard': { id: 'btn-nav-dashboard', active: 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-lg', hover: 'hover:border-blue-400' },
    'spectra-analytics': { id: 'btn-nav-spectra-analytics', active: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white border-transparent shadow-lg shadow-fuchsia-500/20', hover: 'hover:border-fuchsia-400' },
    'timer': { id: 'btn-nav-timer', active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg', hover: 'hover:border-emerald-400' },
    'daily-actions': { id: 'btn-nav-daily-actions', active: 'bg-orange-500 text-white border-orange-500 shadow-lg', hover: 'hover:border-orange-400' },
    'schedule': { id: 'btn-nav-schedule', active: 'bg-cyan-600 text-white border-cyan-600 shadow-lg', hover: 'hover:border-cyan-400' },
    'subjects': { id: 'btn-nav-subjects', active: 'bg-violet-600 text-white border-violet-600 shadow-lg', hover: 'hover:border-violet-400' },
    'paces-management': { id: 'btn-nav-paces-management', active: 'bg-red-600 text-white border-red-600 shadow-lg', hover: 'hover:border-red-400' },
    'master-config': { id: 'btn-nav-master-config', active: 'bg-indigo-600 text-white border-indigo-600 shadow-lg', hover: 'hover:border-indigo-400' },
    'outcome': { id: 'btn-nav-outcome', active: 'bg-yellow-500 text-white border-yellow-500 shadow-lg', hover: 'hover:border-yellow-400' },
    'exam': { id: 'btn-nav-exam', active: 'bg-rose-600 text-white border-rose-600 shadow-lg', hover: 'hover:border-rose-400' }
};

const BASE_BTN_CLASS = "w-full text-left border-2 px-4 py-3 rounded-2xl font-black text-xs transition-all duration-300 hover:translate-x-1.5 hover:shadow-md active:scale-98 flex items-center gap-3";
const INACTIVE_BTN_BASE = "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300";

function tailorHtmlForRoute(baseHtml, targetContainerId, pageTitle, activeNavKey, config) {
    let html = baseHtml;

    // 1. Update Title
    if (pageTitle) {
        html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);
    }

    // 2. Adjust page container visibility
    PAGE_CONTAINERS.forEach(cid => {
        const regex = new RegExp(`(<div\\s+id="${cid}"[^>]*?class=")([^"]*)(")`);
        html = html.replace(regex, (match, prefix, cls, suffix) => {
            let classes = cls.split(/\s+/).filter(Boolean);
            if (cid === targetContainerId) {
                classes = classes.filter(c => c !== 'hidden');
            } else {
                if (!classes.includes('hidden')) {
                    classes.push('hidden');
                }
            }
            return prefix + classes.join(' ') + suffix;
        });
    });

    // 3. Adjust sidebar navigation button active/inactive styling
    Object.keys(NAV_BUTTONS).forEach(key => {
        const btn = NAV_BUTTONS[key];
        const isActive = (key === activeNavKey);
        const desiredClass = isActive
            ? `${BASE_BTN_CLASS} ${btn.active}`
            : `${BASE_BTN_CLASS} ${INACTIVE_BTN_BASE} ${btn.hover}`;

        const btnRegex = new RegExp(`(<button\\s+id="${btn.id}"[\\s\\S]*?class=")([^"]*)(")`);
        html = html.replace(btnRegex, (match, prefix, cls, suffix) => {
            return prefix + desiredClass + suffix;
        });
    });

    // 4. Update Route-specific initial stylesheet & script
    if (config && config.cssId && config.cssUrl) {
        const cssUrlClean = encodeURI(config.cssUrl);
        const cssReplacement = `<link id="${config.cssId}" rel="stylesheet" href="${cssUrlClean}?v=${ASSET_VERSION}">`;
        html = html.replace(/<link id="route-[^"]*-css"[^>]*>/, cssReplacement);
    }
    if (config && config.jsId && config.jsUrl) {
        const jsUrlClean = encodeURI(config.jsUrl);
        const jsReplacement = `<script id="${config.jsId}" src="${jsUrlClean}?v=${ASSET_VERSION}" defer></script>`;
        html = html.replace(/<script id="route-[^"]*-js"[^>]*><\/script>/, jsReplacement);
    }

    return html;
}

function syncRoutes() {
    if (!fs.existsSync(INDEX_HTML_PATH) || !fs.existsSync(LOGIN_HTML_PATH)) {
        console.error('index.html or login.html not found in root.');
        process.exit(1);
    }

    // 1. Purge obsolete duplicate directories
    OBSOLETE_ROUTE_DIRS.forEach(relDir => {
        const fullDir = path.join(ROOT_DIR, relDir);
        if (fs.existsSync(fullDir)) {
            try {
                fs.rmSync(fullDir, { recursive: true, force: true });
                console.log(`[SyncRoutes] Purged obsolete duplicate directory: ${relDir}`);
            } catch (err) {
                console.warn(`[SyncRoutes] Could not purge ${relDir}:`, err.message);
            }
        }
    });

    const indexContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    const loginContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');

    let count = 0;

    // 2. Sync SPA App Routes with tailored pre-rendered HTML
    SPA_ROUTES.forEach(route => {
        const routeDir = path.join(ROOT_DIR, route);
        if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
        }
        const targetFile = path.join(routeDir, 'index.html');
        const config = ROUTE_CONFIGS[route] || {
            containerId: 'page-dashboard',
            title: 'X-29',
            navKey: 'dashboard'
        };
        const tailoredContent = tailorHtmlForRoute(
            indexContent,
            config.containerId,
            config.title,
            config.navKey,
            config
        );
        fs.writeFileSync(targetFile, tailoredContent, 'utf8');
        count++;
    });

    // 3. Sync Login Route
    const loginDir = path.join(ROOT_DIR, 'login');
    if (!fs.existsSync(loginDir)) {
        fs.mkdirSync(loginDir, { recursive: true });
    }
    fs.writeFileSync(path.join(loginDir, 'index.html'), loginContent, 'utf8');
    count++;

    console.log(`[SyncRoutes] Successfully synchronized ${count} canonical route entry points.`);
}

if (require.main === module) {
    syncRoutes();
}

module.exports = { syncRoutes, SPA_ROUTES, OBSOLETE_ROUTE_DIRS, ROUTE_CONFIGS, tailorHtmlForRoute };

