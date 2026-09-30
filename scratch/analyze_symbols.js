const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

const fullSvgRegex = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi;
const allSvgs = [];
let m;
while ((m = fullSvgRegex.exec(html)) !== null) {
    allSvgs.push({
        full: m[0],
        attrs: m[1],
        inner: m[2].trim(),
        index: m.index
    });
}

// Group by inner path/content
const groups = {};
for (const s of allSvgs) {
    const key = s.inner.replace(/\s+/g, ' ');
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
}

// Filter to those with count >= 3
const candidates = Object.entries(groups)
    .filter(([_, list]) => list.length >= 3)
    .sort((a, b) => b[1].length - a[1].length);

console.log(`Found ${candidates.length} SVG patterns repeated 3 or more times:\n`);
candidates.forEach(([key, list], i) => {
    console.log(`=== SYMBOL ${i+1}: Count = ${list.length} ===`);
    console.log('Sample attrs:');
    list.slice(0, 3).forEach(s => console.log('  ', s.attrs.trim().replace(/\s+/g, ' ')));
    console.log('Inner content:');
    console.log('  ', key.slice(0, 150));
    console.log('');
});
