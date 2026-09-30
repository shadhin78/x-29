/**
 * Route Entry Synchronizer (scripts/sync-routes.js)
 *
 * Ensures all clean route directories (dashboard, timer, subjects, schedule,
 * analytics, exam, pace, master-config, outcome, daily-actions,
 * monthly-target-setup, login) have a synchronized entry point.
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
    'dashboard',
    'timer',
    'focus',
    'subjects',
    'subject',
    'schedule',
    'daily-schedule',
    'analytics',
    'spectra-analytics',
    'exam',
    'exam-routine',
    'pace',
    'paces-management',
    'master-config',
    'outcome',
    'daily-actions',
    'monthly-target-setup'
];

function syncRoutes() {
    if (!fs.existsSync(INDEX_HTML_PATH) || !fs.existsSync(LOGIN_HTML_PATH)) {
        console.error('index.html or login.html not found in root.');
        process.exit(1);
    }

    const indexContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    const loginContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');

    let count = 0;

    // Sync SPA App Routes
    SPA_ROUTES.forEach(route => {
        const routeDir = path.join(ROOT_DIR, route);
        if (!fs.existsSync(routeDir)) {
            fs.mkdirSync(routeDir, { recursive: true });
        }
        const targetFile = path.join(routeDir, 'index.html');
        fs.writeFileSync(targetFile, indexContent, 'utf8');
        count++;
    });

    // Sync Login Route
    const loginDir = path.join(ROOT_DIR, 'login');
    if (!fs.existsSync(loginDir)) {
        fs.mkdirSync(loginDir, { recursive: true });
    }
    fs.writeFileSync(path.join(loginDir, 'index.html'), loginContent, 'utf8');
    count++;

    console.log(`[SyncRoutes] Successfully synchronized ${count} route entry points.`);
}

if (require.main === module) {
    syncRoutes();
}

module.exports = { syncRoutes, SPA_ROUTES };
