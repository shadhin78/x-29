const fs = require('fs');
const path = require('path');

const normalize = s => s.replace(/\r\n/g, '\n');
const toCRLF = s => s.replace(/\n/g, '\r\n');

// 1. In spectra.js: Defer canvas chart instances when spectra-analytics is inactive/hidden
const spectraPath = path.join(__dirname, '../js/features/analytics/spectra.js');
let spectraContent = normalize(fs.readFileSync(spectraPath, 'utf8'));

const oldSpectraBlock = `            const getProgColor = global.getProgramColor || (typeof window !== 'undefined' ? window.getProgramColor : () => '#6366f1');

            if (ctx1) {`;

const newSpectraBlock = `            const getProgColor = global.getProgramColor || (typeof window !== 'undefined' ? window.getProgramColor : () => '#6366f1');

            const isAnalyticsRouteActive = !global.Router || !global.Router.activePageId || global.Router.activePageId === 'spectra-analytics';
            const pageAnalyticsEl = typeof document !== 'undefined' ? document.getElementById('page-spectra-analytics') : null;
            const isAnalyticsPageVisible = !pageAnalyticsEl || !pageAnalyticsEl.classList.contains('hidden');

            if (!isAnalyticsRouteActive && !isAnalyticsPageVisible) {
                global._trendChartsPending = true;
            } else {
                global._trendChartsPending = false;
                if (ctx1) {`;

const oldSpectraEnd = `            if (ctxYearly) {
                const twColors = AppStateRef.twColors || {};
                const sortedActions = [...customActionsRef].sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3) || (a.order ?? 999) - (b.order ?? 999));
                let yDatasets = sortedActions.map(a => {
                    const hex = (twColors[a.color] && twColors[a.color].hex) || '#6366f1';
                    return {
                        label: a.title,
                        data: actCum[a.id],
                        borderColor: hex,
                        backgroundColor: hex + '15',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: hex,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        hidden: !global.chartVisibility.yearly[a.id]
                    };
                });

                if (global.yearlyChartActions && global.yearlyChartActions.canvas === ctxYearly) {
                    global.yearlyChartActions.data.labels = months;
                    global.yearlyChartActions.data.datasets = yDatasets;
                    global.yearlyChartActions.update('none');
                } else {
                    if (global.yearlyChartActions) global.yearlyChartActions.destroy();
                    global.yearlyChartActions = new Chart(ctxYearly.getContext('2d'), { type: 'line', data: { labels: months, datasets: yDatasets }, options: chartOptions });
                }
            }
        }`;

const newSpectraEnd = `            if (ctxYearly) {
                const twColors = AppStateRef.twColors || {};
                const sortedActions = [...customActionsRef].sort((a, b) => (a.priority ?? 3) - (b.priority ?? 3) || (a.order ?? 999) - (b.order ?? 999));
                let yDatasets = sortedActions.map(a => {
                    const hex = (twColors[a.color] && twColors[a.color].hex) || '#6366f1';
                    return {
                        label: a.title,
                        data: actCum[a.id],
                        borderColor: hex,
                        backgroundColor: hex + '15',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: hex,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#fff',
                        fill: true,
                        hidden: !global.chartVisibility.yearly[a.id]
                    };
                });

                if (global.yearlyChartActions && global.yearlyChartActions.canvas === ctxYearly) {
                    global.yearlyChartActions.data.labels = months;
                    global.yearlyChartActions.data.datasets = yDatasets;
                    global.yearlyChartActions.update('none');
                } else {
                    if (global.yearlyChartActions) global.yearlyChartActions.destroy();
                    global.yearlyChartActions = new Chart(ctxYearly.getContext('2d'), { type: 'line', data: { labels: months, datasets: yDatasets }, options: chartOptions });
                }
            }
            }
        }`;

if (!spectraContent.includes(oldSpectraBlock) || !spectraContent.includes(oldSpectraEnd)) {
    console.error('Target blocks not found in spectra.js!');
    process.exit(1);
}
spectraContent = spectraContent.replace(oldSpectraBlock, newSpectraBlock);
spectraContent = spectraContent.replace(oldSpectraEnd, newSpectraEnd);
fs.writeFileSync(spectraPath, toCRLF(spectraContent), 'utf8');
console.log('spectra.js updated successfully!');

// 2. In paceManager.js: Defer globalPaceTrendCanvas chart instantiation
const pacePath = path.join(__dirname, '../js/features/pace/paceManager.js');
let paceContent = normalize(fs.readFileSync(pacePath, 'utf8'));

const oldPaceBlock = `        const canvas = document.getElementById('globalPaceTrendCanvas');
        if (!canvas) return;

        let paceData = global.latestPaceData;`;

const newPaceBlock = `        const canvas = document.getElementById('globalPaceTrendCanvas');
        if (!canvas) return;

        const isAnalyticsRouteActive = !global.Router || !global.Router.activePageId || global.Router.activePageId === 'spectra-analytics';
        const pageAnalyticsEl = typeof document !== 'undefined' ? document.getElementById('page-spectra-analytics') : null;
        const isAnalyticsPageVisible = !pageAnalyticsEl || !pageAnalyticsEl.classList.contains('hidden');

        if (!isAnalyticsRouteActive && !isAnalyticsPageVisible) {
            global._globalPaceTrendChartPending = true;
            return;
        }
        global._globalPaceTrendChartPending = false;

        let paceData = global.latestPaceData;`;

if (!paceContent.includes(oldPaceBlock)) {
    console.error('Target block not found in paceManager.js!');
    process.exit(1);
}
paceContent = paceContent.replace(oldPaceBlock, newPaceBlock);
fs.writeFileSync(pacePath, toCRLF(paceContent), 'utf8');
console.log('paceManager.js updated successfully!');

// 3. In monthlyTargets.js: Defer monthlyMonthMixedChart when modal or month tab is hidden
const mtPath = path.join(__dirname, '../js/features/targets/monthlyTargets.js');
let mtContent = normalize(fs.readFileSync(mtPath, 'utf8'));

const oldMtBlock = `function renderMtdbMonthChart(monthsList) {
    const ctx = safeGetEl('monthlyMonthMixedChart');
    if (!ctx) return;`;

const newMtBlock = `function renderMtdbMonthChart(monthsList) {
    const ctx = safeGetEl('monthlyMonthMixedChart');
    if (!ctx) return;

    const modal = safeGetEl('monthly-targets-db-modal');
    const monthTab = safeGetEl('wtdb-tab-content-month');
    if (modal && modal.classList.contains('hidden')) return;
    if (monthTab && monthTab.classList.contains('hidden')) return;`;

if (!mtContent.includes(oldMtBlock)) {
    console.error('Target block not found in monthlyTargets.js!');
    process.exit(1);
}
mtContent = mtContent.replace(oldMtBlock, newMtBlock);
fs.writeFileSync(mtPath, toCRLF(mtContent), 'utf8');
console.log('monthlyTargets.js updated successfully!');

// 4. In router.js: Trigger deferred charts when spectra-analytics becomes active
const routerPath = path.join(__dirname, '../router/router.js');
let routerContent = normalize(fs.readFileSync(routerPath, 'utf8'));

const oldRouterBlock = `                } else if (pageId === 'spectra-analytics') {
                    const analyticsCharts = [`;

const newRouterBlock = `                } else if (pageId === 'spectra-analytics') {
                    if (window._trendChartsPending && typeof window.renderTrendCharts === 'function') {
                        window._trendChartsPending = false;
                        window.renderTrendCharts();
                    }
                    if (window._globalPaceTrendChartPending && typeof window.renderGlobalPaceTrendChart === 'function') {
                        window._globalPaceTrendChartPending = false;
                        window.renderGlobalPaceTrendChart();
                    }
                    const analyticsCharts = [`;

if (!routerContent.includes(oldRouterBlock)) {
    console.error('Target block not found in router.js!');
    process.exit(1);
}
routerContent = routerContent.replace(oldRouterBlock, newRouterBlock);
fs.writeFileSync(routerPath, toCRLF(routerContent), 'utf8');
console.log('router.js updated successfully!');
