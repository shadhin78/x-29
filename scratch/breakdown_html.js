const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Breakdown by tags
const counts = {};
const sizeByTag = {};

const tagRegex = /<([a-z0-9]+)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
// Let's find top-level sections in body
const bodyStart = html.indexOf('<body');
const body = html.slice(bodyStart);

// Let's list all elements with id directly under #app-wrapper or body
const appWrapperIdx = html.indexOf('id="app-wrapper"');
console.log('index of app-wrapper:', appWrapperIdx);

// Let's find all divs that have id and check their lengths
const divRegex = /<div\s+id="([^"]+)"\s*class="([^"]*)"[^>]*>/g;
let m;
const divs = [];
while ((m = divRegex.exec(html)) !== null) {
    divs.push({ id: m[1], class: m[2], index: m.index });
}
console.log('Total divs with id:', divs.length);

// Check size between each major section
for (let i = 0; i < divs.length; i++) {
    const curr = divs[i];
    const next = divs[i+1];
    const span = next ? next.index - curr.index : html.length - curr.index;
    if (span > 5000) {
        console.log(`Div #${curr.id} span to next id-div: ${span} bytes`);
    }
}
