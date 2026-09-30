const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const updated = html.replace(/<script\b([^>]*)src=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    // Leave type="module" as is (modules are deferred by spec)
    if (before.includes('type="module"') || after.includes('type="module"')) {
        return match;
    }
    // Leave Tailwind CDN runtime compiler synchronous for now (Step 004 handles replacing Tailwind CDN)
    if (src.includes('tailwindcss.com')) {
        return match;
    }
    // If already has defer or async, return
    if (before.includes('defer') || after.includes('defer') || before.includes('async') || after.includes('async')) {
        return match;
    }
    // Append defer
    return `<script${before}src="${src}"${after} defer>`;
});

fs.writeFileSync('index.html', updated, 'utf8');
console.log('SUCCESS: Applied defer to external scripts in index.html');
