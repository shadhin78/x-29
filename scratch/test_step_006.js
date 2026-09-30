/**
 * Test Suite: Step 006 Verification
 * Route View In-Memory DOM Retention & Re-render Prevention (AppState._dataVersion)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== Testing Step 006 (Route View In-Memory DOM Retention & Re-render Prevention) ===\n');

// 1. Mock Environment
global.window = global;
global.document = {
    getElementById: (id) => ({
        id,
        classList: { remove: () => {}, add: () => {}, contains: () => false },
        innerHTML: '',
        children: []
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
};

// Load state.js
require('../js/state.js');
const AppState = global.AppState;

assert(typeof AppState.getDataVersion === 'function', 'AppState.getDataVersion must be a function');
assert(typeof AppState.incrementDataVersion === 'function', 'AppState.incrementDataVersion must be a function');

const v0 = AppState.getDataVersion();
const v1 = AppState.incrementDataVersion();
assert.strictEqual(v1, v0 + 1, 'incrementDataVersion must advance data version');
console.log('  ✓ AppState.getDataVersion and incrementDataVersion operational');

// 2. Test DashboardPage In-Memory DOM Retention
const dbPath = path.join(__dirname, '../pages/Dashboard/Dashboard.js');
eval(fs.readFileSync(dbPath, 'utf8'));

let dbRenderCount = 0;
window.renderDashboardDailyChecklist = () => { dbRenderCount++; };
window.renderDashboardWeeklyChecklist = () => {};
window.renderDashboardMonthlyChecklist = () => {};
window.renderDashboardOutcomeCard = () => {};
window.renderDashboardUpcomingExamCard = () => {};
window.renderDashboardPassedSubjectsCard = () => {};
window.updateTrendsBar = () => {};

// First mount (Cold)
window.DashboardPage._hasRendered = false;
window.DashboardPage._renderedDataVersion = null;
window.DashboardPage.mount();
assert.strictEqual(dbRenderCount, 1, 'Cold mount must execute render');
assert.strictEqual(window.DashboardPage._renderedDataVersion, AppState.getDataVersion());
console.log('  ✓ DashboardPage: Initial cold mount performs complete render');

// Second mount (Warm Revisit - NO data change)
window.DashboardPage.mount();
assert.strictEqual(dbRenderCount, 1, 'Warm revisit without data change MUST retain in-memory DOM (0ms)');
console.log('  ✓ DashboardPage: Warm revisit retains DOM in memory (0ms DOM reconstruction)');

// Mutate data
AppState.incrementDataVersion();

// Third mount (Warm Revisit - WITH data change)
window.DashboardPage.mount();
assert.strictEqual(dbRenderCount, 2, 'Revisit after data mutation MUST trigger fresh re-render');
assert.strictEqual(window.DashboardPage._renderedDataVersion, AppState.getDataVersion());
console.log('  ✓ DashboardPage: Revisit after state mutation accurately updates view to fresh data');

// 3. Test DailyActionsPage In-Memory DOM Retention
const daPath = path.join(__dirname, '../pages/Daily Actions/Daily Actions.js');
eval(fs.readFileSync(daPath, 'utf8'));

let daTrackerRenders = 0;
window.renderDailyTracker = () => { daTrackerRenders++; };
window.renderDailyLogs = () => {};
window.renderMonthlyTargets = () => {};
window.renderWeeklyTargets = () => {};
window.renderDailyTargets = () => {};

// Cold mount
window.DailyActionsPage._hasRendered = false;
window.DailyActionsPage._renderedDataVersion = null;
window.DailyActionsPage.mount();
assert.strictEqual(daTrackerRenders, 1);

// Warm revisit without data change
window.DailyActionsPage.mount();
assert.strictEqual(daTrackerRenders, 1, 'DailyActionsPage retains in-memory DOM when version unchanged');
console.log('  ✓ DailyActionsPage: Retains in-memory DOM when data version matches');

// Mutate data and revisit
AppState.incrementDataVersion();
window.DailyActionsPage.mount();
assert.strictEqual(daTrackerRenders, 2, 'DailyActionsPage re-renders after state mutation');
console.log('  ✓ DailyActionsPage: Re-renders when data revision advances');

// 4. Test SubjectsPage In-Memory DOM Retention
const subPath = path.join(__dirname, '../pages/Subjects/Subjects.js');
eval(fs.readFileSync(subPath, 'utf8'));

let subNavRenders = 0;
window.renderSubjectNavigation = () => { subNavRenders++; };
window.renderSubjectProgress = () => {};
window.renderTaskList = () => {};
window.updateMetrics = () => {};

window.SubjectsPage._hasRendered = false;
window.SubjectsPage._renderedDataVersion = null;
window.SubjectsPage.mount();
assert.strictEqual(subNavRenders, 1);

// Warm revisit without data change
window.SubjectsPage.mount();
assert.strictEqual(subNavRenders, 1, 'SubjectsPage retains in-memory DOM when version unchanged');
console.log('  ✓ SubjectsPage: Retains in-memory DOM when data version matches');

// Mutate data and revisit
AppState.incrementDataVersion();
window.SubjectsPage.mount();
assert.strictEqual(subNavRenders, 2, 'SubjectsPage re-renders after state mutation');
console.log('  ✓ SubjectsPage: Re-renders when data revision advances');

console.log('\n==================================================');
console.log('ALL STEP 006 TESTS PASSED SUCCESSFULLY!');
console.log('==================================================');
