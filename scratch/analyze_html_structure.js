const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const topIds = [];
lines.forEach((l, idx) => {
    const m = l.match(/^(\s*)<([a-z0-9]+)\b[^>]*\bid=["']([^"']+)["']/i);
    if (m && m[1].length <= 8 && idx > 50) {
        topIds.push({ line: idx + 1, indent: m[1].length, tag: m[2], id: m[3] });
    }
});

topIds.slice(30, 80).forEach(item => {
    console.log(`L${item.line} (indent ${item.indent}): <${item.tag} id="${item.id}">`);
});
