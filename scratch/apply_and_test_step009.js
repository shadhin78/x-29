const fs = require('fs');
const assert = require('assert');

// Read the cleaned HTML generated
const { execSync } = require('child_process');

// Backup original index.html
fs.copyFileSync('index.html', 'index.html.bak-step009');

try {
    // Generate cleaned html
    require('./scratch/test_svg_and_indent.js');
    const newHtml = fs.readFileSync('index.html.test', 'utf8'); // wait, test_svg_and_indent didn't write to file yet
} catch(e) {
    // Ignore
}
