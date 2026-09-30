/**
 * Verification test script for Step 007:
 * Mobile Navigation Responsiveness & Touch Latency Optimization
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== X-29 — Step 007: Mobile Navigation & Touch Latency Test Suite ===\n');

// 1. Verify CSS styles in css/style.css
console.log('1. Verifying Mobile Touch & Hardware-Acceleration CSS Rules...');
const styleCss = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

assert(styleCss.includes('touch-action: manipulation;'), 'css/style.css must define touch-action: manipulation');
assert(styleCss.includes('#sidebar-container'), 'css/style.css must have #sidebar-container rule');
assert(styleCss.includes('will-change: transform;'), 'css/style.css must set will-change: transform on #sidebar-container');
assert(styleCss.includes('-webkit-overflow-scrolling: touch;'), 'css/style.css must set -webkit-overflow-scrolling: touch');
assert(styleCss.includes('will-change: opacity;'), 'css/style.css must set will-change: opacity on #sidebar-backdrop');
assert(styleCss.includes('[data-switch-page]'), 'css/style.css must target [data-switch-page]');
assert(styleCss.includes('#mobile-sidebar-toggle'), 'css/style.css must target #mobile-sidebar-toggle');
assert(styleCss.includes('#sidebar-backdrop'), 'css/style.css must target #sidebar-backdrop');

console.log('  ✓ Touch manipulation and GPU compositing rules verified in css/style.css');

// 2. Verify sidebar.js logic and passive touchstart listener
console.log('\n2. Verifying Mobile Sidebar Coordinator...');
const sidebarJs = fs.readFileSync(path.join(__dirname, '../js/shared/sidebar.js'), 'utf8');

assert(sidebarJs.includes('touchstart'), 'sidebar.js must have touchstart listener');
assert(sidebarJs.includes('{ passive: true }'), 'sidebar.js touch listener must be passive: true');
assert(sidebarJs.includes('toggleMobileSidebar'), 'sidebar.js must export toggleMobileSidebar');
assert(sidebarJs.includes('closeMobileSidebar'), 'sidebar.js must export closeMobileSidebar');

console.log('  ✓ Passive touch listener and drawer controls verified in sidebar.js');

// 3. Test Drawer State Transitions in Mock DOM
console.log('\n3. Testing Drawer State Transitions in Mock DOM...');

const classSet = (initial) => {
    const classes = new Set(initial ? initial.split(' ') : []);
    return {
        add: (...names) => names.forEach(n => classes.add(n)),
        remove: (...names) => names.forEach(n => classes.delete(n)),
        contains: (name) => classes.has(name),
        get list() { return Array.from(classes); }
    };
};

const mockElements = {
    'sidebar-container': { classList: classSet('-translate-x-full') },
    'sidebar-backdrop': { 
        classList: classSet('opacity-0 pointer-events-none'),
        listeners: {},
        addEventListener: function(event, cb, opts) {
            this.listeners[event] = { cb, opts };
        }
    },
    'mobile-sidebar-toggle': {
        listeners: {},
        addEventListener: function(event, cb) { this.listeners[event] = cb; }
    }
};

global.document = {
    readyState: 'complete',
    getElementById: (id) => mockElements[id] || null,
    addEventListener: () => {}
};
global.window = {
    innerWidth: 375, // mobile viewport
    document: global.document
};

// Evaluate sidebar.js in this sandbox
eval(sidebarJs);

const Sidebar = global.Sidebar || window.Sidebar;
assert(Sidebar, 'Sidebar module must be initialized');

// Test Open
Sidebar.toggleMobileSidebar();
assert(mockElements['sidebar-container'].classList.contains('translate-x-0'), 'Drawer must open with translate-x-0');
assert(mockElements['sidebar-backdrop'].classList.contains('opacity-100'), 'Backdrop must have opacity-100');

// Test Close
Sidebar.closeMobileSidebar();
assert(mockElements['sidebar-container'].classList.contains('-translate-x-full'), 'Drawer must close with -translate-x-full');
assert(mockElements['sidebar-backdrop'].classList.contains('opacity-0'), 'Backdrop must have opacity-0');
assert(mockElements['sidebar-backdrop'].classList.contains('pointer-events-none'), 'Backdrop must be pointer-events-none');

console.log('  ✓ Drawer open/close transition classes verified');

// 4. Test Router Mobile Integration
console.log('\n4. Testing Router Mobile Auto-Dismissal...');
const routerCode = fs.readFileSync(path.join(__dirname, '../router/router.js'), 'utf8');

assert(routerCode.includes('window.closeMobileSidebar()'), 'Router must invoke closeMobileSidebar on mobile navigation');
console.log('  ✓ Router auto-dismissal verified');

console.log('\n==================================================');
console.log('STEP 007 VERIFICATION: ALL CHECKS PASSED (100%)');
console.log('==================================================\n');
