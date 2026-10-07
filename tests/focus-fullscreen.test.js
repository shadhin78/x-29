/**
 * Focus Timer Fullscreen Unit Tests (tests/focus-fullscreen.test.js)
 */

const assert = require('assert');
const fs = require('fs');

console.log('================================================================');
console.log('  TEST SUITE: Focus Timer Fullscreen Functionality              ');
console.log('================================================================\n');

// 1. Verify code structure
const focusJs = fs.readFileSync('pages/Focus/Focus.js', 'utf8');
const timerServiceJs = fs.readFileSync('shared/services/timerService.js', 'utf8');
const focusCss = fs.readFileSync('pages/Focus/Focus.css', 'utf8');

console.log('1. Static Code Analysis:');
assert.ok(focusJs.includes('window.toggleTimerFullscreen'), 'toggleTimerFullscreen is exposed on window');
assert.ok(focusJs.includes('window._exitTimerFsCleanup'), '_exitTimerFsCleanup is exposed on window');
assert.ok(focusJs.includes('window.exitTimerFullscreen'), 'exitTimerFullscreen is exposed on window');
assert.ok(focusJs.includes("if (e.key === 'Escape' && window._timerFsActive)"), 'Escape key listener registered in Focus.js');
assert.ok(focusJs.includes('_exitTimerFsCleanup();'), 'toggleTimerFullscreen calls _exitTimerFsCleanup directly on exit');
assert.ok(focusCss.includes('#timer-fs-btn-exit'), 'Focus.css styles #timer-fs-btn-exit');
assert.ok(focusCss.includes('cursor: pointer !important;'), 'Focus.css enforces pointer cursor on fullscreen buttons');
assert.ok(!timerServiceJs.includes('\n                    _exitTimerFsCleanup();\n'), 'timerService does not call undefined _exitTimerFsCleanup');
console.log('  ✓ Static code assertions passed.\n');

// 2. Behavioral Simulation with DOM Mock
console.log('2. Behavioral DOM Simulation:');

// Setup mock DOM environment
global.window = global;
global.document = {
    fullscreenElement: null,
    webkitFullscreenElement: null,
    exitFullscreen: async () => {
        global.document.fullscreenElement = null;
    },
    documentElement: {
        classList: { contains: () => true },
        requestFullscreen: async () => {
            global.document.fullscreenElement = panelMock;
        }
    },
    body: {
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
        },
        appendChild(el) {
            panelMock.parentNode = global.document.body;
        }
    },
    addEventListener: () => {},
    querySelector: (sel) => {
        if (sel.includes('page-timer')) return originalParentMock;
        return null;
    },
    getElementById: (id) => {
        if (id === 'timer-active-panel') return panelMock;
        if (id === 'timer-btn-fullscreen') return btnFsMock;
        if (id === 'timer-fs-btn-exit') return btnExitMock;
        return null;
    }
};

global.matchMedia = () => ({ matches: true });

const originalParentMock = {
    isConnected: true,
    children: [],
    insertBefore(node, ref) {
        this.children.push(node);
        node.parentNode = this;
    },
    prepend(node) {
        this.children.unshift(node);
        node.parentNode = this;
    }
};

const panelMock = {
    id: 'timer-active-panel',
    parentNode: originalParentMock,
    nextSibling: null,
    classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(...args) { args.forEach(c => this.classes.delete(c)); },
        contains(c) { return this.classes.has(c); },
        toggle(c, val) { if (val) this.classes.add(c); else this.classes.delete(c); }
    }
};

const btnFsMock = {
    id: 'timer-btn-fullscreen',
    innerHTML: '',
    title: '',
    setAttribute: () => {}
};

const btnExitMock = {
    id: 'timer-fs-btn-exit',
    innerHTML: '',
    title: ''
};

// Evaluate Focus.js in this sandbox
eval(focusJs);

assert.strictEqual(window._timerFsActive, false, 'Initial state: _timerFsActive is false');

// Step A: Open Fullscreen
console.log('  Testing: Open fullscreen...');
window.toggleTimerFullscreen();
assert.strictEqual(window._timerFsActive, true, '_timerFsActive set to true');
assert.ok(panelMock.classList.contains('timer-fullscreen'), 'panel has timer-fullscreen class');
assert.ok(global.document.body.classList.contains('timer-fullscreen-active'), 'body has timer-fullscreen-active class');
assert.strictEqual(btnFsMock.title, 'Exit Fullscreen', 'Fullscreen button title updated to Exit Fullscreen');
console.log('  ✓ Open fullscreen successful.');

// Step B: Close Fullscreen
console.log('  Testing: Close fullscreen...');
window.toggleTimerFullscreen();
assert.ok(panelMock.classList.contains('timer-fs-exiting'), 'panel has timer-fs-exiting transition class');

// Wait for setTimeout in _exitTimerFsCleanup
setTimeout(() => {
    assert.strictEqual(window._timerFsActive, false, '_timerFsActive reset to false');
    assert.ok(!panelMock.classList.contains('timer-fullscreen'), 'timer-fullscreen class removed');
    assert.ok(!global.document.body.classList.contains('timer-fullscreen-active'), 'timer-fullscreen-active removed from body');
    assert.strictEqual(btnFsMock.title, 'Toggle Fullscreen', 'Fullscreen button title restored');
    assert.strictEqual(panelMock.parentNode, originalParentMock, 'panel restored to original parent');
    console.log('  ✓ Close fullscreen cleanup successful.');
    console.log('\n================================================================');
    console.log('ALL FOCUS FULLSCREEN TESTS PASSED! (100% OK)');
    console.log('================================================================');
}, 250);
