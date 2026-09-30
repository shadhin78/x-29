const http = require('http');
const assert = require('assert');
const fs = require('fs');

// 1. Verify vercel.json
console.log('Testing vercel.json...');
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
assert(Array.isArray(vercelConfig.headers), 'vercel.json must have headers array');
assert(vercelConfig.headers.length >= 4, 'vercel.json must have at least 4 header rules');
console.log('  ✓ vercel.json syntax and headers array verified');

// 2. Test dev-server.js logic in-process
console.log('\nTesting dev-server.js response headers logic...');
// Start temporary server
const serverProcess = require('../js/dev-server.js');

// Give server time to bind, then run tests
setTimeout(() => {
    http.get('http://localhost:3000/icons/logo-sticker.png', (res) => {
        console.log('  Status (initial):', res.statusCode);
        console.log('  Cache-Control:', res.headers['cache-control']);
        console.log('  ETag:', res.headers['etag']);
        
        assert.strictEqual(res.statusCode, 200, 'Initial request should return 200');
        assert(res.headers['etag'], 'Response should have ETag');
        assert(res.headers['cache-control'].includes('public'), 'Static asset should have public cache');

        const etag = res.headers['etag'];

        // Conditional request with ETag
        const opt = {
            hostname: 'localhost',
            port: 3000,
            path: '/icons/logo-sticker.png',
            headers: {
                'If-None-Match': etag
            }
        };

        http.get(opt, (res2) => {
            console.log('  Status (conditional with If-None-Match):', res2.statusCode);
            assert.strictEqual(res2.statusCode, 304, 'Conditional request should return 304 Not Modified');
            console.log('  ✓ Conditional 304 Not Modified verified successfully!');
            process.exit(0);
        });
    });
}, 500);
