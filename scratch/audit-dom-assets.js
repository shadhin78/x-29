const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');

// DOM tag count estimate
const tags = indexHtml.match(/<[a-zA-Z0-9\-]+(\s|>)/g) || [];
const svgTags = indexHtml.match(/<svg\b/gi) || [];
const pathTags = indexHtml.match(/<path\b/gi) || [];
const buttonTags = indexHtml.match(/<button\b/gi) || [];
const inputTags = indexHtml.match(/<input\b/gi) || [];
const divTags = indexHtml.match(/<div\b/gi) || [];

// Assets in icons/
let iconBytes = 0;
const iconFiles = fs.readdirSync('icons').map(f => {
    const s = fs.statSync(path.join('icons', f));
    iconBytes += s.size;
    return { file: f, size: s.size, kb: (s.size / 1024).toFixed(1) };
});

console.log('--- DOM TAG METRICS ---');
console.log('Estimated Total HTML Tags:', tags.length);
console.log('<div> count:', divTags.length);
console.log('<button> count:', buttonTags.length);
console.log('<input> count:', inputTags.length);
console.log('<svg> count:', svgTags.length);
console.log('<path> count:', pathTags.length);
console.log('Total Icon Asset Bytes:', iconBytes, `(${(iconBytes / 1024).toFixed(1)} KB)`);
console.log('Icons:', iconFiles);
