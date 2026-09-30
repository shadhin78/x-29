const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// 1. Find all SVGs with IDs
const svgRegex = /<svg\b([^>]*)>/gi;
let m;
const svgsWithIds = [];
while ((m = svgRegex.exec(html)) !== null) {
    const idMatch = m[1].match(/\bid=["']([^"']+)["']/i);
    if (idMatch) svgsWithIds.push(idMatch[1]);
}
console.log('SVGs with id:', svgsWithIds);

// 2. Analyze all SVGs
const fullSvgRegex = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi;
const allSvgs = [];
while ((m = fullSvgRegex.exec(html)) !== null) {
    allSvgs.push({
        full: m[0],
        attrs: m[1],
        inner: m[2].trim(),
        length: m[0].length
    });
}
console.log('Total SVGs:', allSvgs.length);
console.log('Total SVG bytes:', allSvgs.reduce((acc, s) => acc + s.length, 0));

// 3. Group by inner content
const group = {};
for (const s of allSvgs) {
    const key = s.inner.replace(/\s+/g, ' ');
    if (!group[key]) group[key] = [];
    group[key].push(s);
}

const repeated = Object.entries(group)
    .filter(([_, list]) => list.length > 1)
    .sort((a, b) => (b[1].length * b[1][0].length) - (a[1].length * a[1][0].length));

console.log('Unique repeated groups:', repeated.length);
let totalRepeatSavingsPotential = 0;
repeated.forEach(([key, list], i) => {
    const savings = (list.length - 1) * key.length;
    totalRepeatSavingsPotential += savings;
    console.log(`${i+1}. Count: ${list.length}, inner length: ${key.length}, savings: ${savings} bytes`);
});
console.log('Total repeated inner SVG content bytes potential:', totalRepeatSavingsPotential);
