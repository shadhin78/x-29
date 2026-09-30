const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

// Helper to parse .env file
function parseEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        env[key] = val;
      }
    });
  }
  return env;
}

const env = parseEnv();

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let url;
  try {
    url = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    url = req.url.split('?')[0];
  }

  // Route /api/config to environmental response
  if (url === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAZGKCjZC5-ErHkXfoWHa9v7FXyFSs_Hiw",
      authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "x-2k-29.firebaseapp.com",
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "x-2k-29",
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "x-2k-29.firebasestorage.app",
      messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "450109917594",
      appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:450109917594:web:af8ad71ad4addb13d29223"
    }));
    return;
  }

  // Normalize trailing slash for clean URLs (e.g. /timer/ -> /timer)
  if (url.length > 1 && url.endsWith('/')) {
    url = url.replace(/\/+$/, '');
  }

  // Handle clean URLs (e.g. /login -> login.html)
  if (url === '/login') {
    url = '/login.html';
  }

  // Default to index.html
  if (url === '/') {
    url = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, url);

  // Prevent directory traversal
  const relativePath = path.relative(ROOT_DIR, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Block access to sensitive service account credentials and local backup files
  const normalizedRelPath = relativePath.replace(/\\/g, '/');
  if (normalizedRelPath === 'firebase-service-account.json' || normalizedRelPath.startsWith('backup/') || normalizedRelPath === 'backup' || normalizedRelPath.toLowerCase().includes('backup')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Access to service account credentials and backup files is strictly prohibited.');
    return;
  }

  // Direct clean route SPA fallback (e.g. /dashboard, /timer, /subjects, /schedule, /analytics, /exam, /pace, /master-config, /outcome, /daily-actions, /monthly-target-setup)
  const requestedExt = path.extname(url);
  if (!requestedExt && !url.startsWith('/api/')) {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    fs.readFile(indexPath, (indexErr, indexData) => {
      if (indexErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(indexData);
    });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Generate standard ETag based on size and mtime
    const etag = `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;

    let cacheControl = 'no-cache';
    if (ext === '.html') {
      cacheControl = 'no-cache';
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2'].includes(ext)) {
      cacheControl = 'public, max-age=86400, stale-while-revalidate=604800';
    } else if (ext === '.css') {
      cacheControl = 'public, max-age=86400, stale-while-revalidate=604800';
    } else if (ext === '.js') {
      cacheControl = 'public, max-age=3600, must-revalidate';
    }

    // Handle conditional request (instant 304 Not Modified)
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, {
        'ETag': etag,
        'Cache-Control': cacheControl
      });
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'ETag': etag,
      'Cache-Control': cacheControl
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n  ┌─────────────────────────────────────────────────────┐`);
  console.log(`  │  X-29 Dev Server running at:                       │`);
  console.log(`  │  → http://localhost:${PORT}                          │`);
  console.log(`  │                                                     │`);
  console.log(`  │  ⚠  Use ONLY this URL for local development.       │`);
  console.log(`  │     Other ports (5000, 5500, etc.) lack /api/config │`);
  console.log(`  │     and will cause Firebase config resolution       │`);
  console.log(`  │     to fall back to .env or hardcoded values.       │`);
  console.log(`  └─────────────────────────────────────────────────────┘\n`);
});
