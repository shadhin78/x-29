/**
 * X-29 Local Website Manual Backup Agent
 * scripts/backup-agent.js
 * 
 * Listens ONLY on local loopback interface (127.0.0.1:4729).
 * Provides health status and authenticated trigger for manual backups.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 4729;
const HOST = '127.0.0.1';
const CODE_DIR = path.resolve(__dirname, '..');
const X29_ROOT_DIR = path.dirname(CODE_DIR);
const BACKUP_BASE_DIR = path.join(X29_ROOT_DIR, 'X-29-Backups');
const LOG_FILE_PATH = path.join(BACKUP_BASE_DIR, 'backup-log.txt');

// Load environment variables from .env if present
const envPath = path.join(CODE_DIR, '.env');
let AUTH_TOKEN = 'x29_manual_backup_secret_key_2026';

if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const parts = trimmed.split('=');
            if (parts[0].trim() === 'BACKUP_AGENT_TOKEN') {
                AUTH_TOKEN = parts.slice(1).join('=').trim();
            }
        }
    });
}
if (process.env.BACKUP_AGENT_TOKEN) {
    AUTH_TOKEN = process.env.BACKUP_AGENT_TOKEN;
}

let isBackupRunning = false;

function getBangladeshTimestampFolders() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const parts = formatter.formatToParts(now);
    const p = {};
    parts.forEach(item => p[item.type] = item.value);

    const day = String(p.day).padStart(2, '0');
    const month = String(p.month).padStart(2, '0');
    const year = p.year;
    let hour = String(p.hour).padStart(2, '0');
    if (hour === '00') hour = '12';
    const minute = String(p.minute).padStart(2, '0');
    const ampm = (p.dayPeriod || 'AM').toUpperCase();

    return `${day} ${month} ${year} ${hour} ${minute} ${ampm}`;
}

function logLogEvent(lineStr) {
    try {
        if (!fs.existsSync(BACKUP_BASE_DIR)) {
            fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
        }
        const timestamp = getBangladeshTimestampFolders();
        const line = `[${timestamp}] ${lineStr}\n`;
        fs.appendFileSync(LOG_FILE_PATH, line, 'utf8');
    } catch (e) {
        console.error(`[AGENT] Log write error: ${e.message}`);
    }
}

const server = http.createServer((req, res) => {
    // CORS headers for local website requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url.split('?')[0];

    // Health Endpoint
    if (req.method === 'GET' && url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ online: true, service: 'X-29 Local Backup Agent' }));
        return;
    }

    // Manual Backup Endpoint
    if (req.method === 'POST' && url === '/manual-backup') {
        // Authentication check
        const authHeader = req.headers['authorization'];
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else if (req.headers['x-api-key']) {
            token = req.headers['x-api-key'].trim();
        }

        if (!token || token !== AUTH_TOKEN) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing Authorization token' }));
            return;
        }

        // Duplicate check
        if (isBackupRunning) {
            res.writeHead(409, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'BACKUP_ALREADY_RUNNING', message: 'A backup process is currently in progress.' }));
            return;
        }

        // Lock backup state
        isBackupRunning = true;
        logLogEvent('WEBSITE MANUAL BACKUP REQUEST RECEIVED');

        const scriptPath = path.join(CODE_DIR, 'scripts', 'backup.js');
        const child = spawn('node', [scriptPath], {
            cwd: CODE_DIR,
            env: { ...process.env }
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', data => {
            output += data.toString();
        });

        child.stderr.on('data', data => {
            errorOutput += data.toString();
        });

        child.on('close', code => {
            isBackupRunning = false;
            if (code === 0) {
                // Match directory from stdout if available
                const dirMatch = output.match(/Directory:\s+(.+)/);
                const targetDir = dirMatch ? dirMatch[1].trim() : '';

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'started',
                    mode: 'manual',
                    result: 'success',
                    directory: targetDir,
                    output: output
                }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'failed',
                    mode: 'manual',
                    error: errorOutput || 'Backup script exited with error code ' + code
                }));
            }
        });

        child.on('error', err => {
            isBackupRunning = false;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'failed',
                mode: 'manual',
                error: err.message
            }));
        });

        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, HOST, () => {
    console.log(`[AGENT] X-29 Local Website Manual Backup Agent listening on http://${HOST}:${PORT}`);
});
