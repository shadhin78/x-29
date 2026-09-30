const fs = require('fs');

// 1. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
const oldIndexScript = '<script src="https://cdn.tailwindcss.com"></script>';
const newIndexLink = '<link rel="stylesheet" href="css/tailwind.css?v=1.0.0">';

if (!indexHtml.includes(oldIndexScript)) {
    console.error('ERROR: oldIndexScript not found in index.html');
    process.exit(1);
}
indexHtml = indexHtml.replace(oldIndexScript, newIndexLink);
fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('SUCCESS: Replaced Tailwind CDN in index.html with static CSS link.');

// 2. Update login.html
let loginHtml = fs.readFileSync('login.html', 'utf8');
const oldLoginScript = '<script src="https://cdn.tailwindcss.com"></script>';
const newLoginLink = '<link rel="stylesheet" href="css/tailwind.css?v=1.0.0">';

if (!loginHtml.includes(oldLoginScript)) {
    console.error('ERROR: oldLoginScript not found in login.html');
    process.exit(1);
}
loginHtml = loginHtml.replace(oldLoginScript, newLoginLink);
fs.writeFileSync('login.html', loginHtml, 'utf8');
console.log('SUCCESS: Replaced Tailwind CDN in login.html with static CSS link.');
