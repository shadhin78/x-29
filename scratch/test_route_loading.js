const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Setup mock browser environment
class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.children = [{ id: 'child', tagName: 'DIV' }];
    this.innerHTML = '<div>Mock Content</div>';
    this.classList = {
      _classes: new Set(),
      add(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains(c) { return this._classes.has(c); },
      toggle(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    };
  }
  hasChildNodes() { return true; }
  addEventListener() {}
  dispatchEvent() { return true; }
}

const elements = new Map();
function getEl(id, tag = 'div') {
  if (!elements.has(id)) elements.set(id, new MockElement(id, tag));
  return elements.get(id);
}

const allRoutes = [
  'dashboard',
  'spectra-analytics',
  'timer',
  'daily-actions',
  'schedule',
  'monthly-target-setup',
  'subjects',
  'paces-management',
  'master-config',
  'outcome',
  'exam'
];

allRoutes.forEach(r => {
  const p = getEl('page-' + r);
  p.classList.add('hidden');
  getEl('btn-nav-' + r);
});
getEl('main-content-panel');

const appendedScripts = [];

global.document = {
  getElementById: (id) => elements.get(id) || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => new MockElement('', tag),
  head: { appendChild: () => {} },
  body: {
    appendChild: (el) => {
      if (el.tagName === 'SCRIPT') {
        appendedScripts.push(el.src);
        elements.set(el.id, el);
        // Simulate execution
        if (typeof el.onload === 'function') el.onload();
      }
    }
  },
  addEventListener: () => {},
  readyState: 'complete'
};

global.fetch = async (url) => ({
  ok: true,
  text: async () => '<div>Mock Fetch HTML</div>'
});

global.window = {
  document: global.document,
  innerWidth: 1024,
  requestAnimationFrame: (cb) => cb(),
  requestIdleCallback: (cb) => cb(),
  setTimeout: (cb) => { cb(); return 1; },
  clearTimeout: () => {},
  scrollTo: () => {}
};

// Evaluate router.js
const routerCode = fs.readFileSync('router/router.js', 'utf8');
eval(routerCode);

const Router = window.Router;

async function testAllRoutes() {
  console.log('Testing dynamic route code-splitting for all 11 routes...');

  // Dashboard is pre-loaded via head
  elements.set('route-dashboard-js', new MockElement('route-dashboard-js', 'script'));

  // Wait 100ms for any background preload queue to settle
  await new Promise(r => setTimeout(r, 100));

  for (const routeId of allRoutes) {
    const route = Router.routes[routeId];
    assert(route, 'Route definition must exist for ' + routeId);
    
    // First navigation
    await Router.loadPage(routeId);
    assert.strictEqual(Router.activePageId, routeId);
    assert.strictEqual(elements.get('page-' + routeId).classList.contains('hidden'), false);

    const cleanUrl = encodeURI(decodeURI(route.jsUrl));
    assert.strictEqual(Router.jsLoaded[cleanUrl], true, 'Script must be marked as loaded: ' + cleanUrl);
    console.log('  ✓ Route', routeId.padEnd(22), 'mounted cleanly. Script:', route.jsUrl);

    // Second navigation -> should use cached script without appending duplicate for THIS script
    const countForScriptBefore = appendedScripts.filter(s => s === cleanUrl).length;
    await Router.loadPage('dashboard');
    await Router.loadPage(routeId);
    const countForScriptAfter = appendedScripts.filter(s => s === cleanUrl).length;
    assert.strictEqual(countForScriptBefore, countForScriptAfter, 'Duplicate script for ' + routeId + ' must NOT be appended on repeat navigation');
  }

  console.log('\nAll 11 routes verified! Each route script is loaded once and deduplicated on repeat visits.');
}

testAllRoutes().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
