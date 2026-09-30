const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check major sections
console.log('HTML size:', html.length, 'bytes');

const sections = [];
const idMatches = [...html.matchAll(/id=["']([^"']+)["']/gi)];
console.log('Total id occurrences:', idMatches.length);

// Check for pages
const pages = ['dashboard', 'spectra-analytics', 'timer', 'focus', 'daily-actions', 'schedule', 'subjects', 'paces-management', 'master-config', 'outcome', 'exam', 'monthly-target'];
pages.forEach(p => {
    const hasId = html.includes(`id="page-${p}"`) || html.includes(`id="${p}"`);
    console.log(`Page [${p}] in index.html:`, hasId);
});

// Check modals in index.html
const modalMatches = [...html.matchAll(/<div[^>]*id=["']([^"']*(?:modal|dialog|drawer)[^"']*)["'][^>]*>/gi)];
console.log('Modals found:', modalMatches.length);
modalMatches.forEach(m => console.log(' -', m[1]));

// Breakdown of line ranges
const lines = html.split('\n');
console.log('Total lines:', lines.length);

// Let's sample line counts between major headings or sections
let currentTag = '';
let tagStart = 0;
lines.forEach((line, idx) => {
    const m = line.match(/<!--\s*([A-Za-z0-9\s\-_–—\(\)]+)\s*-->/);
    if (m) {
        if (currentTag && idx - tagStart > 200) {
            console.log(`Section "${currentTag}": lines ${tagStart} - ${idx} (${idx - tagStart} lines)`);
        }
        currentTag = m[1].trim();
        tagStart = idx;
    }
});
