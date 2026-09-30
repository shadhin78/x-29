const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check empty lines
const lines = html.split('\n');
const emptyLines = lines.filter(l => l.trim().length === 0).length;
console.log('Total lines:', lines.length);
console.log('Empty lines:', emptyLines);

// Check whitespace indentation bytes
let indentBytes = 0;
lines.forEach(l => {
    const m = l.match(/^ +/);
    if (m) indentBytes += m[0].length;
});
console.log('Indentation whitespace bytes:', indentBytes);

// Check comments
const comments = html.match(/<!--[\s\S]*?-->/g) || [];
console.log('Comments count:', comments.length);
const commentBytes = comments.reduce((sum, c) => sum + c.length, 0);
console.log('Comment bytes:', commentBytes);
