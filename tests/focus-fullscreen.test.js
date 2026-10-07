/**
 * Focus Timer Fullscreen Unit Tests (tests/focus-fullscreen.test.js)
 */

const assert = require('assert');
const fs = require('fs');

const focusJs = fs.readFileSync('pages/Focus/Focus.js', 'utf8');
const timerServiceJs = fs.readFileSync('shared/services/timerService.js', 'utf8');
const focusCss = fs.readFileSync('pages/Focus/Focus.css', 'utf8');

describe('Focus Timer Fullscreen Functionality', () => {

    describe('Static Code Analysis', () => {
        test('toggleTimerFullscreen is exposed on window', () => {
            assert.ok(focusJs.includes('window.toggleTimerFullscreen'));
        });

        test('_exitTimerFsCleanup is exposed on window', () => {
            assert.ok(focusJs.includes('window._exitTimerFsCleanup'));
        });

        test('exitTimerFullscreen is exposed on window', () => {
            assert.ok(focusJs.includes('window.exitTimerFullscreen'));
        });

        test('Escape key listener registered in Focus.js', () => {
            assert.ok(focusJs.includes("if (e.key === 'Escape' && window._timerFsActive)"));
        });

        test('toggleTimerFullscreen calls _exitTimerFsCleanup directly on exit', () => {
            assert.ok(focusJs.includes('_exitTimerFsCleanup();'));
        });

        test('Focus.css styles #timer-fs-btn-exit', () => {
            assert.ok(focusCss.includes('#timer-fs-btn-exit'));
        });

        test('Focus.css enforces pointer cursor on fullscreen buttons', () => {
            assert.ok(focusCss.includes('cursor: pointer !important;'));
        });

        test('timerService uses window._exitTimerFsCleanup safely', () => {
            assert.ok(timerServiceJs.includes("typeof window._exitTimerFsCleanup === 'function'"));
        });

        test('Focus.js applies timer-fs-expanding class during open', () => {
            assert.ok(focusJs.includes("'timer-fullscreen', 'timer-fs-expanding'"));
        });

        test('Focus.js applies timer-fs-collapsing class during close', () => {
            assert.ok(focusJs.includes("'timer-fs-collapsing'"));
        });

        test('Focus.js manages timer-panel-placeholder for layout shift', () => {
            assert.ok(focusJs.includes("'timer-panel-placeholder'"));
        });
    });

    describe('Behavioral DOM Simulation', () => {
        let panelMock, btnFsMock, btnExitMock, originalParentMock, placeholderMock;

        beforeAll(() => {
            jest.useFakeTimers();

            originalParentMock = {
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

            panelMock = {
                id: 'timer-active-panel',
                parentNode: originalParentMock,
                nextSibling: null,
                offsetHeight: 400,
                classList: {
                    classes: new Set(),
                    add(...args) { args.forEach(c => this.classes.add(c)); },
                    remove(...args) { args.forEach(c => this.classes.delete(c)); },
                    contains(c) { return this.classes.has(c); },
                    toggle(c, val) { if (val) this.classes.add(c); else this.classes.delete(c); }
                }
            };

            placeholderMock = {
                id: 'timer-panel-placeholder',
                style: {},
                classList: {
                    classes: new Set(['hidden']),
                    add(...args) { args.forEach(c => this.classes.add(c)); },
                    remove(...args) { args.forEach(c => this.classes.delete(c)); },
                    contains(c) { return this.classes.has(c); },
                    toggle(c, val) { if (val) this.classes.add(c); else this.classes.delete(c); }
                }
            };

            btnFsMock = {
                id: 'timer-btn-fullscreen',
                innerHTML: '',
                title: '',
                setAttribute: () => {}
            };

            btnExitMock = {
                id: 'timer-fs-btn-exit',
                innerHTML: '',
                title: ''
            };

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
                    if (id === 'timer-panel-placeholder') return placeholderMock;
                    return null;
                },
                readyState: 'complete'
            };

            global.matchMedia = () => ({ matches: true });

            // Evaluate Focus.js in this sandbox
            eval(focusJs);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        test('Initial state: _timerFsActive is false', () => {
            assert.strictEqual(window._timerFsActive, false);
        });

        test('Open fullscreen sets correct state and classes', () => {
            window.toggleTimerFullscreen();
            assert.strictEqual(window._timerFsActive, true);
            assert.ok(panelMock.classList.contains('timer-fullscreen'), 'panel has timer-fullscreen class');
            assert.ok(panelMock.classList.contains('timer-fs-expanding'), 'panel has timer-fs-expanding class during animation');
            assert.ok(global.document.body.classList.contains('timer-fullscreen-active'), 'body has timer-fullscreen-active class');
            assert.strictEqual(btnFsMock.title, 'Exit Fullscreen', 'Fullscreen button title updated');
            // Placeholder should be shown
            assert.ok(!placeholderMock.classList.contains('hidden'), 'placeholder is visible to prevent layout shift');
        });

        test('Expanding class is removed after animation timeout', () => {
            jest.advanceTimersByTime(350);
            assert.ok(!panelMock.classList.contains('timer-fs-expanding'), 'timer-fs-expanding removed after timeout');
        });

        test('Close fullscreen applies transition classes and cleans up', () => {
            window.toggleTimerFullscreen();
            assert.ok(panelMock.classList.contains('timer-fs-exiting'), 'panel has timer-fs-exiting transition class');
            assert.ok(panelMock.classList.contains('timer-fs-collapsing'), 'panel has timer-fs-collapsing class');

            // Advance past the cleanup timeout
            jest.advanceTimersByTime(250);

            assert.strictEqual(window._timerFsActive, false, '_timerFsActive reset to false');
            assert.ok(!panelMock.classList.contains('timer-fullscreen'), 'timer-fullscreen class removed');
            assert.ok(!panelMock.classList.contains('timer-fs-collapsing'), 'timer-fs-collapsing class removed');
            assert.ok(!global.document.body.classList.contains('timer-fullscreen-active'), 'timer-fullscreen-active removed from body');
            assert.strictEqual(btnFsMock.title, 'Toggle Fullscreen', 'Fullscreen button title restored');
            assert.strictEqual(panelMock.parentNode, originalParentMock, 'panel restored to original parent');
            // Placeholder should be hidden again
            assert.ok(placeholderMock.classList.contains('hidden'), 'placeholder hidden after exit');
        });
    });
});
