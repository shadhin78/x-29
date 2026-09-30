const http = require('http');
const fs = require('fs');
const path = require('path');

// Spin up a test server using the exact dev-server handler
const ROOT_DIR = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];
    if (url === '/login') url = '/login.html';
    if (url === '/') url = '/index.html';

    const filePath = path.join(ROOT_DIR, url);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
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

            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(3999, async () => {
    const fetch = (url) => new Promise((resolve) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });
    });

    console.log('Testing dev server clean route rewrites...');

    const resSubjects = await fetch('http://localhost:3999/subjects');
    console.log('GET /subjects:', resSubjects.statusCode, resSubjects.data.includes('<title>X-29') ? '(Valid HTML shell)' : '');
    if (resSubjects.statusCode !== 200 || !resSubjects.data.includes('<title>X-29')) {
        console.error('FAIL on /subjects');
        process.exit(1);
    }

    const resSchedule = await fetch('http://localhost:3999/schedule');
    console.log('GET /schedule:', resSchedule.statusCode, resSchedule.data.includes('<title>X-29') ? '(Valid HTML shell)' : '');
    if (resSchedule.statusCode !== 200 || !resSchedule.data.includes('<title>X-29')) {
        console.error('FAIL on /schedule');
        process.exit(1);
    }

    const resMissingFile = await fetch('http://localhost:3999/nonexistent.js');
    console.log('GET /nonexistent.js:', resMissingFile.statusCode);
    if (resMissingFile.statusCode !== 404) {
        console.error('FAIL on nonexistent.js');
        process.exit(1);
    }

    console.log('ALL DEV SERVER ROUTE TESTS PASSED!');
    server.close();
});
