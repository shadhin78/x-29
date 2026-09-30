const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const headMatch = indexHtml.match(/<head[\s\S]*?<\/head>/i)[0];
const scripts = [];
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let m;
while ((m = scriptRegex.exec(headMatch)) !== null) {
  const attrs = m[1];
  const srcMatch = attrs.match(/src=["']([^"']+)["']/);
  const src = srcMatch ? srcMatch[1] : '(inline)';
  const isDefer = /\bdefer\b/i.test(attrs);
  const isModule = /type=["']module["']/i.test(attrs);
  const isRoute = src.startsWith('pages/');
  
  let size = 0;
  if (src && !src.startsWith('http') && src !== '(inline)') {
    const cleanSrc = src.split('?')[0].replace(/^\//, '');
    if (fs.existsSync(cleanSrc)) {
      size = fs.statSync(cleanSrc).size;
    }
  }
  scripts.push({ src, isDefer, isModule, isRoute, size });
}

console.log('Total scripts in <head>:', scripts.length);
const routeScripts = scripts.filter(s => s.isRoute);
console.log('Route-specific scripts in <head>:', routeScripts.length);
const totalRouteSize = routeScripts.reduce((acc, s) => acc + s.size, 0);
console.log('Total route-specific script size in <head>:', (totalRouteSize/1024).toFixed(1), 'KB (', totalRouteSize, 'bytes)');
routeScripts.forEach(s => {
  console.log('  -', s.src.padEnd(65), (s.size/1024).toFixed(1) + ' KB');
});

const nonRouteScripts = scripts.filter(s => !s.isRoute);
const totalNonRouteSize = nonRouteScripts.reduce((acc, s) => acc + s.size, 0);
console.log('\nCore/Feature scripts in <head>:', nonRouteScripts.length, '| Size:', (totalNonRouteSize/1024).toFixed(1), 'KB');

// Now check stylesheets in <head>
const links = [];
const linkRegex = /<link\b([^>]*)>/gi;
while ((m = linkRegex.exec(headMatch)) !== null) {
  const attrs = m[1];
  if (!attrs.includes('rel="stylesheet"')) continue;
  const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
  const href = hrefMatch ? hrefMatch[1] : '';
  const isRoute = href.startsWith('pages/');
  let size = 0;
  if (href && !href.startsWith('http')) {
    const cleanHref = href.split('?')[0].replace(/^\//, '');
    if (fs.existsSync(cleanHref)) {
      size = fs.statSync(cleanHref).size;
    }
  }
  links.push({ href, isRoute, size });
}

console.log('\nTotal stylesheets in <head>:', links.length);
const routeLinks = links.filter(l => l.isRoute);
console.log('Route-specific stylesheets in <head>:', routeLinks.length);
const totalRouteCssSize = routeLinks.reduce((acc, l) => acc + l.size, 0);
console.log('Total route-specific CSS size in <head>:', (totalRouteCssSize/1024).toFixed(1), 'KB (', totalRouteCssSize, 'bytes)');
routeLinks.forEach(l => {
  console.log('  -', l.href.padEnd(65), (l.size/1024).toFixed(1) + ' KB');
});
