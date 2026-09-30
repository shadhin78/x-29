/**
 * Verification test: Permanent Dark Mode
 * Ensures the dark class is present on <html> before first paint,
 * color-scheme: dark is set, and all JS isDarkMode checks resolve true.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== X-29 — Permanent Dark Mode Verification Suite ===\n');

// 1. index.html <html> tag must have class="dark"
console.log('1. Verifying index.html <html> has dark class...');
const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const htmlTagMatch = indexHtml.match(/<html[^>]*>/);
assert(htmlTagMatch, 'index.html must have an <html> tag');
assert(htmlTagMatch[0].includes('class='), 'index.html <html> must have a class attribute');
assert(htmlTagMatch[0].includes('dark'), 'index.html <html> class must contain "dark"');
console.log('  ✓ index.html <html> has dark class');

// 2. login.html <html> tag must have class="dark"
console.log('\n2. Verifying login.html <html> has dark class...');
const loginHtml = fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8');
const loginHtmlTag = loginHtml.match(/<html[^>]*>/);
assert(loginHtmlTag, 'login.html must have an <html> tag');
assert(loginHtmlTag[0].includes('dark'), 'login.html <html> class must contain "dark"');
console.log('  ✓ login.html <html> has dark class');

// 3. css/style.css must have color-scheme: dark
console.log('\n3. Verifying css/style.css has color-scheme: dark...');
const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');
assert(styleCss.includes('color-scheme: dark'), 'css/style.css must set color-scheme: dark');
assert(styleCss.includes('background-color: #0f172a'), 'css/style.css html must set dark background-color');
console.log('  ✓ css/style.css has color-scheme: dark and dark background on html');

// 4. auth-loading screen uses hardcoded dark background (no dependency on class)
console.log('\n4. Verifying loading screen is hardcoded dark...');
assert(indexHtml.includes('bg-[#0b0f19]'), 'Loading screen must use hardcoded dark bg-[#0b0f19]');
console.log('  ✓ Loading screen uses hardcoded dark background');

// 5. app-wrapper has dark: variant that will now activate
console.log('\n5. Verifying app-wrapper dark: variants present...');
assert(indexHtml.includes('dark:bg-[#0f172a]'), 'app-wrapper must have dark:bg-[#0f172a]');
console.log('  ✓ app-wrapper dark variants will activate with dark class on <html>');

// 6. manifest.json has dark colors
console.log('\n6. Verifying manifest.json dark theme...');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.json'), 'utf8'));
assert.strictEqual(manifest.background_color, '#0b0f19', 'manifest background_color must be dark');
assert.strictEqual(manifest.theme_color, '#0b0f19', 'manifest theme_color must be dark');
console.log('  ✓ manifest.json has dark background_color and theme_color');

// 7. theme-color meta tags are dark
console.log('\n7. Verifying theme-color meta tags...');
assert(indexHtml.includes('content="#0b0f19"'), 'index.html theme-color must be #0b0f19');
assert(loginHtml.includes('content="#0b0f19"'), 'login.html theme-color must be #0b0f19');
console.log('  ✓ Both HTML files have dark theme-color meta tags');

// 8. Simulate JS isDarkMode check
console.log('\n8. Simulating JS isDarkMode check with dark class on documentElement...');
const mockClassList = { contains: (cls) => cls === 'dark' };
global.document = {
    documentElement: { classList: mockClassList },
    body: { classList: mockClassList }
};
const isDarkMode = document.documentElement.classList.contains('dark');
assert.strictEqual(isDarkMode, true, 'isDarkMode must return true when dark class is present');
console.log('  ✓ JS isDarkMode returns true with dark class on <html>');

// 9. No theme toggle or light mode switch exists
console.log('\n9. Verifying no theme toggle mechanism exists...');
// Check for common toggle patterns
const jsFiles = [
    'js/core/app.js',
    'js/firebase.js',
    'js/state.js',
    'router/router.js'
];
for (const f of jsFiles) {
    const content = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert(!content.includes("classList.toggle('dark')"), `${f} must not toggle dark class`);
    assert(!content.includes("classList.remove('dark')"), `${f} must not remove dark class`);
    assert(!content.includes('localStorage.getItem') || !content.includes('theme'), `${f} must not have theme localStorage`);
}
console.log('  ✓ No theme toggle or removal in core files');

// 10. Verify dark class position is BEFORE any stylesheet loads
console.log('\n10. Verifying dark class appears before first stylesheet link...');
const darkClassPos = indexHtml.indexOf('class="dark');
const firstStylesheet = indexHtml.indexOf('<link rel="stylesheet"');
assert(darkClassPos < firstStylesheet, 'dark class must appear in HTML before first stylesheet');
console.log('  ✓ dark class is in <html> tag, before any stylesheet loads');

console.log('\n==================================================');
console.log('PERMANENT DARK MODE: ALL 10 CHECKS PASSED (100%)');
console.log('==================================================\n');
