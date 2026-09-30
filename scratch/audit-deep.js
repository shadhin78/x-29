const fs = require('fs');
const path = require('path');

function analyzeFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    return { path: filePath, size: stat.size, lines };
}

// 1. Analyze HTML structure
const indexHtml = fs.readFileSync('index.html', 'utf8');
const indexLines = indexHtml.split('\n');

const scripts = [];
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
    scripts.push({
        src: srcMatch ? srcMatch[1] : '(inline)',
        id: idMatch ? idMatch[1] : null,
        type: typeMatch ? typeMatch[1] : null,
        inlineLength: match[2].trim().length
    });
}

const stylesheets = [];
const linkRegex = /<link\b([^>]*)>/gi;
while ((match = linkRegex.exec(indexHtml)) !== null) {
    const attrs = match[1];
    if (attrs.includes('stylesheet')) {
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
        const idMatch = attrs.match(/id=["']([^"']+)["']/i);
        stylesheets.push({
            href: hrefMatch ? hrefMatch[1] : null,
            id: idMatch ? idMatch[1] : null
        });
    }
}

// Containers
const pageContainers = [];
const pageRegex = /id=["'](page-[^"']+)["']/gi;
while ((match = pageRegex.exec(indexHtml)) !== null) {
    pageContainers.push(match[1]);
}

// Modals
const modals = [];
const modalRegex = /id=["']([^"']*(?:modal|dialog)[^"']*)["']/gi;
while ((match = modalRegex.exec(indexHtml)) !== null) {
    modals.push(match[1]);
}

// SVG icons count
const svgCount = (indexHtml.match(/<svg\b/gi) || []).length;

// Check sizes of JS and CSS files
function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walkDir(fullPath, fileList);
            }
        } else {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const allFiles = walkDir('.');
const jsFiles = allFiles.filter(f => f.endsWith('.js') && !f.includes('node_modules') && !f.includes('scratch'));
const cssFiles = allFiles.filter(f => f.endsWith('.css') && !f.includes('node_modules'));
const htmlFiles = allFiles.filter(f => f.endsWith('.html') && !f.includes('node_modules'));

let totalJsBytes = 0;
const jsBreakdown = jsFiles.map(f => {
    const stat = fs.statSync(f);
    totalJsBytes += stat.size;
    return { file: f.replace(/\\/g, '/'), size: stat.size, kb: (stat.size / 1024).toFixed(1) };
}).sort((a, b) => b.size - a.size);

let totalCssBytes = 0;
const cssBreakdown = cssFiles.map(f => {
    const stat = fs.statSync(f);
    totalCssBytes += stat.size;
    return { file: f.replace(/\\/g, '/'), size: stat.size, kb: (stat.size / 1024).toFixed(1) };
}).sort((a, b) => b.size - a.size);

const auditReport = {
    indexHtml: {
        totalBytes: fs.statSync('index.html').size,
        totalLines: indexLines.length,
        svgCount,
        pageContainers,
        modalsCount: modals.length,
        scriptsCount: scripts.length,
        stylesheetsCount: stylesheets.length,
        scripts,
        stylesheets
    },
    totalJsBytes,
    totalJsKb: (totalJsBytes / 1024).toFixed(1),
    totalCssBytes,
    totalCssKb: (totalCssBytes / 1024).toFixed(1),
    top15LargestJs: jsBreakdown.slice(0, 15),
    allCss: cssBreakdown
};

console.log(JSON.stringify(auditReport, null, 2));
