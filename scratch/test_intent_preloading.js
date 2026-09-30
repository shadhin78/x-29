const fs = require('fs');
const assert = require('assert');

// Mock DOM
class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.children = [{ id: 'c', tagName: 'DIV' }];
    this.classList = {
      _classes: new Set(),
      add(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains(c) { return this._classes.has(c); }
    };
  }
  getAttribute(name) { return this[name] || null; }
  setAttribute(name, v) { this[name] = v; }
  closest(sel) {
    if (sel.includes('data-switch-page') && this['data-switch-page']) return this;
    return null;
  }
}

const elements = new Map();
function getEl(id, tag = 'div') {
  if (!elements.has(id)) elements.set(id, new MockElement(id, tag));
  return elements.get(id);
}

const listeners = {};
const loadedUrls = [];

global.document = {
  getElementById: (id) => elements.get(id) || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => new MockElement('', tag),
  head: { appendChild: (el) => { loadedUrls.push(el.href); if (el.onload) el.onload(); } },
  body: { appendChild: (el) => { loadedUrls.push(el.src); if (el.onload) el.onload(); } },
  addEventListener: (ev, cb) => {
    listeners[ev] = listeners[ev] || [];
    listeners[ev].push(cb);
  },
  readyState: 'complete'
};

const conn = { saveData: false, effectiveType: '4g' };
try {
  Object.defineProperty(global.navigator, 'connection', {
    value: conn,
    configurable: true,
    writable: true
  });
} catch (e) {
  global.navigator = { connection: conn };
}

global.window = {
  document: global.document,
  navigator: global.navigator,
  innerWidth: 1024,
  requestAnimationFrame: (cb) => cb(),
  requestIdleCallback: (cb) => cb(),
  setTimeout: (cb) => { cb(); return 1; },
  clearTimeout: () => {},
  scrollTo: () => {}
};

global.fetch = async () => ({ ok: true, text: async () => '<div>HTML</div>' });

// Load router
const routerCode = fs.readFileSync('router/router.js', 'utf8');
eval(routerCode);

const Router = window.Router;

console.log('=== Testing Predictive Preloading & Bandwidth Awareness ===');

// 1. Test normalizePageId
assert.strictEqual(Router.normalizePageId('analytics'), 'spectra-analytics');
assert.strictEqual(Router.normalizePageId('Subjects'), 'subjects');
assert.strictEqual(Router.normalizePageId('daily-schedule'), 'schedule');
console.log('  ✓ normalizePageId correctly canonicalizes route aliases');

// 2. Test preloadRoute
Router.preloadRoute('schedule');
assert.strictEqual(Router.jsLoaded[encodeURI('pages/Daily Schedule/Daily Schedule.js')], true);
assert.strictEqual(Router.cssCache[encodeURI('pages/Daily Schedule/Daily Schedule.css')], true);
console.log('  ✓ preloadRoute preloads target route assets without mounting');

// 3. Test intent listener on pointerenter
assert(listeners['pointerenter'], 'pointerenter listener should be registered');
const mockNavBtn = new MockElement('btn-nav-exam', 'button');
mockNavBtn['data-switch-page'] = 'exam';

listeners['pointerenter'].forEach(cb => {
  cb({ target: mockNavBtn });
});
assert.strictEqual(Router.jsLoaded[encodeURI('pages/Exam Routine/Exam Routine.js')], true);
assert.strictEqual(Router.cssCache[encodeURI('pages/Exam Routine/Exam Routine.css')], true);
console.log('  ✓ Hover/pointerenter intent listener triggers predictive preloading');

// 4. Test saveData bypass
Router._hasPreloadedRoutes = false;
conn.saveData = true;
Router.preloadAllRoutes();
assert.strictEqual(Router._preloadBypassed, true, 'Preload must set _preloadBypassed when saveData is true');
console.log('  ✓ Bandwidth awareness cleanly bypasses background preloading on Save-Data');

console.log('\nAll intent preloading & bandwidth awareness tests PASSED!\n');
