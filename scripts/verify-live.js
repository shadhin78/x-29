const https = require('https');

const routes = [
  '/',
  '/timer',
  '/subjects',
  '/schedule',
  '/analytics',
  '/exam',
  '/pace',
  '/master-config',
  '/outcome',
  '/daily-actions',
  '/daily-actions/monthly-setup',
  '/login'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    }).on('error', reject);
  });
}

async function verifyLive() {
  console.log('=== VERIFYING LIVE VERCEL DEPLOYMENT (https://x-29.vercel.app/) ===\n');
  
  // 1. Check style.css
  const cssRes = await fetchUrl('https://x-29.vercel.app/css/style.css?v=1.2.1');
  console.log('CSS Status:', cssRes.status, 'Length:', cssRes.body.length);
  const hasMotionStagger = cssRes.body.includes('.motion-stagger-container');
  const hasRestrainedModal = cssRes.body.includes('[id$="-modal"] [id$="-content"].scale-95');
  const hasButtonScale = cssRes.body.includes('scale(0.98)');
  const hasCardHover = cssRes.body.includes('transform: translateY(-2px)');
  console.log('CSS Checks:', { hasMotionStagger, hasRestrainedModal, hasButtonScale, hasCardHover });
  
  // 2. Check each route
  let allPass = true;
  for (const route of routes) {
    const res = await fetchUrl('https://x-29.vercel.app' + route);
    const hasVersion = res.body.includes('v=1.2.1');
    const isPace = route === '/pace';
    const paceHasContainer = !isPace || res.body.includes('id="page-paces-management"');
    const paceHasAnimation = !isPace || res.body.includes('animate-page-enter');
    const ok = res.status === 200 && hasVersion && paceHasContainer && paceHasAnimation;
    console.log(`Route ${route.padEnd(30)}: ${ok ? 'PASS' : 'FAIL'} (status: ${res.status}, v1.2.1: ${hasVersion})`);
    if (!ok) allPass = false;
  }
  
  // 3. Service Worker
  const swRes = await fetchUrl('https://x-29.vercel.app/sw.js');
  const swHasCache = swRes.body.includes('x29-static-v1.2.1');
  console.log('Service Worker v1.2.1:', swHasCache ? 'PASS' : 'FAIL');
  if (!swHasCache) allPass = false;

  console.log('\nAll checks verified live:', allPass ? 'PASSED (100%)' : 'FAILED');
  process.exit(allPass ? 0 : 1);
}

verifyLive().catch(err => {
  console.error(err);
  process.exit(1);
});
