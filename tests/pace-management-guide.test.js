const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PaceEstimator = require('../js/features/pace/paceEstimator.js');
const PaceEngine = PaceEstimator.PaceEngine;

console.log('=== Verifying Pace Management Guide Specification ===\n');

// 1. Verify PaceEngine Universal Engine
console.log('1. Verifying PaceEngine calculation engine...');
assert.ok(PaceEngine, 'PaceEngine must be defined and exported');
assert.strictEqual(typeof PaceEngine.calculateStats, 'function', 'PaceEngine.calculateStats must be a function');

const testGoal = {
    id: 'test_goal_1',
    type: 'bundle',
    target: 'Midterm Scope',
    startDate: '2026-09-01',
    deadline: '2026-11-15',
    totalUnits: 100,
    completedUnits: 45
};

const stats = PaceEngine.calculateStats(testGoal, new Date('2026-10-15'));
assert.strictEqual(stats.total, 100);
assert.strictEqual(stats.completed, 45);
assert.strictEqual(stats.remaining, 55);
assert.strictEqual(stats.percentage, 45);
assert.ok(stats.totalDays > 0);
assert.ok(stats.daysElapsed > 0);
assert.ok(stats.daysRemaining > 0);
assert.ok(typeof stats.reqPace === 'number');
assert.ok(typeof stats.curPace === 'number');
assert.ok(['finished', 'on-track', 'behind', 'overdue', 'future', 'no-data'].includes(stats.status));
assert.ok(typeof stats.isBehind === 'boolean');
assert.ok(stats.finishDisplay !== '');
assert.ok(stats.countdownText.includes('Days Left'));
console.log('✓ PaceEngine.calculateStats verified successfully with 100% field compliance');

// 2. Verify HTML Structure in pages/Pace Management/Pace Management.html
console.log('\n2. Verifying pages/Pace Management/Pace Management.html layout...');
const paceHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages', 'Pace Management', 'Pace Management.html'), 'utf8');

const requiredIds = [
    'pace-stats-section',
    'pace-timeline-info',
    'target-pace-stat',
    'global-target-total-days',
    'target-status-label',
    'target-req-pace',
    'global-days-left',
    'current-pace-stat',
    'global-days-passed',
    'btn-open-pace-trend-modal',
    'projected-finish',
    'global-days-needed',
    'pace-management-section',
    'add-pace-bundle-type',
    'add-pace-name-container',
    'add-pace-name',
    'add-pace-start',
    'add-pace-date',
    'add-pace-checklist-section',
    'add-pace-checklist-label',
    'add-pace-subjects-container',
    'btn-add-pace-goal',
    'active-timelines-heading',
    'pace-goals-container'
];

requiredIds.forEach(id => {
    assert.ok(paceHtml.includes(`id="${id}"`), `Missing expected id="${id}" in Pace Management.html`);
});
console.log(`✓ All ${requiredIds.length} required element IDs present in Pace Management.html`);

// 3. Verify 4-Card KPI Banner Structure
console.log('\n3. Verifying 4-Card KPI Grid layout...');
assert.ok(paceHtml.includes('grid grid-cols-2 lg:grid-cols-4'), 'Pace Management.html must use 4-card grid');
assert.ok(paceHtml.includes('Global Velocity'), 'Card 1 must be Global Velocity Target');
assert.ok(paceHtml.includes('To Hit Target'), 'Card 2 must be Required Pace To Hit Target');
assert.ok(paceHtml.includes('Current Performance'), 'Card 3 must be Actual Pace Current Performance');
assert.ok(paceHtml.includes('Trend Forecast'), 'Card 4 must be Est. Finish Trend Forecast');
console.log('✓ 4-Card KPI Grid verified with correct semantic roles and labels');

// 4. Verify Parity in index.html and pace/index.html
console.log('\n4. Verifying parity in index.html and pace/index.html...');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const paceIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'pace', 'index.html'), 'utf8');

requiredIds.forEach(id => {
    assert.ok(indexHtml.includes(`id="${id}"`), `Missing expected id="${id}" in index.html`);
    assert.ok(paceIndexHtml.includes(`id="${id}"`), `Missing expected id="${id}" in pace/index.html`);
});
console.log('✓ Full 100% parity across index.html and pace/index.html');

console.log('\n🎉 ALL PACE MANAGEMENT SPECIFICATION CHECKS PASSED! 🎉\n');
