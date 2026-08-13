/**
 * X-29 State Module
 * Established in window.AppState namespace as the single source of truth.
 */

// Initialize Date variables for PLAN_START_DATE and PLAN_END_DATE
var initPlanStartDate = new Date();
initPlanStartDate.setHours(0, 0, 0, 0);

var initPlanEndDate = new Date();
initPlanEndDate.setMonth(initPlanEndDate.getMonth() + 10);
initPlanEndDate.setHours(23, 59, 59, 999);


window.AppState = {
    appState: {},
    tracks: [],
    timerLogs: [],
    dailyFocusHoursTarget: 0,
    dailyFocusHoursTargetDate: "",
    dailyFocusHoursTargetHistory: [],
    timerAnalyticsRange: 180,
    timerAnalyticsGrouping: 'daily',
    timerAnalyticsChartStyle: 'combo',
    spectraHeatmapRange: 365,
    sessionHistoryFilter: 'all',
    activeTimerState: {
        isRunning: false,
        mode: 'stopwatch',
        startTime: null,
        elapsedBeforeStart: 0,
        targetDuration: 0,
        selectedSubject: 'General Study'
    },
    timerInterval: null,
    db: undefined,
    isSyncing: false,
    isAppInitialized: false,
    tasks: [],
    progressChart: undefined,
    masterLineChart: undefined,
    localDataJSON: "",
    saveTimeout: null,
    isSaving: false,
    needsSave: false,
    activeRoutineSet: 1,
    subjectFocusTargets: {},

    mainChartPrograms: null,
    monthlyChartActions: null,
    yearlyChartActions: null,
    paceTrendChartInstance: null,
    spectraPaceTrendChartInstance: null,
    globalPaceTrendChartInstance: null,
    dbProgressChartInstance: null,
    revisionTrendChartInstance: null,
    globalHistoryChartInstance: null,
    dadbTrendChartInstance: null,
    resultsTrendChartInstance: null,
    latestPaceData: null,
    activeTrendGoalId: null,
    activeSingleSubjectTrend: null,

    chartVisibility: { prog: {}, monthly: {}, yearly: {}, subjects: {}, revSubjects: {} },
    latestChartStats: { prog: {}, monthly: {}, yearly: {}, subjects: {}, revSubjects: {} },
    editingTask: null,
    editingPaceId: null,
    trendTimeFilter: 'ALL',
    subjectTimeLinks: {},
    subjectDetailsState: {},
    currentDadbTab: 'date',
    hasShownCongrats: false,
    successResults: [],
    editingResultId: null,
    trendDatasetVisibility: { actual: true, target: true },

    dashboardConfig: {
        topTag: "X-29",
        mainTitle: "X-29 Dashboard",
        subTitle: "",
        trendStartDate: "",
        trendEndDate: "",
        showDaysRemaining: false,
        independentPaces: { tracks: {}, programs: {}, subjects: {} }
    },

    passedItems: { programs: [], subjects: [] },
    revisionData: { active: [], progress: {} },


    subjectColors: {},
    twColors: {
        indigo: { hex: '#6366f1', border: 'border-indigo-500', btn: 'bg-indigo-500', bgLt: 'bg-indigo-50 dark:bg-indigo-900/20', borderLt: 'border-indigo-100 dark:border-indigo-800/50', text: 'text-indigo-600 dark:text-indigo-400', iconBg: 'bg-indigo-100 dark:bg-indigo-500/10', iconColor: 'text-indigo-500' },
        violet: { hex: '#8b5cf6', border: 'border-violet-500', btn: 'bg-violet-500', bgLt: 'bg-violet-50 dark:bg-violet-900/20', borderLt: 'border-violet-100 dark:border-violet-800/50', text: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-100 dark:bg-violet-500/10', iconColor: 'text-indigo-500' },
        orange: { hex: '#f97316', border: 'border-orange-500', btn: 'bg-orange-500', bgLt: 'bg-orange-50 dark:bg-orange-900/20', borderLt: 'border-orange-100 dark:border-orange-800/50', text: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-100 dark:bg-orange-500/10', iconColor: 'text-orange-500' },
        purple: { hex: '#a855f7', border: 'border-purple-500', btn: 'bg-purple-500', bgLt: 'bg-purple-50 dark:bg-purple-900/20', borderLt: 'border-purple-100 dark:border-purple-800/50', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-500/10', iconColor: 'text-purple-500' },
        emerald: { hex: '#10b981', border: 'border-emerald-500', btn: 'bg-emerald-500', bgLt: 'bg-emerald-50 dark:bg-emerald-900/20', borderLt: 'border-emerald-100 dark:border-emerald-800/50', text: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-500/10', iconColor: 'text-emerald-500' },
        rose: { hex: '#f43f5e', border: 'border-rose-500', btn: 'bg-rose-500', bgLt: 'bg-rose-50 dark:bg-rose-900/20', borderLt: 'border-rose-100 dark:border-rose-800/50', text: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-100 dark:bg-rose-500/10', iconColor: 'text-rose-500' },
        cyan: { hex: '#06b6d4', border: 'border-cyan-500', btn: 'bg-cyan-500', bgLt: 'bg-cyan-50 dark:bg-cyan-900/20', borderLt: 'border-cyan-100 dark:border-cyan-800/50', text: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-100 dark:bg-cyan-500/10', iconColor: 'text-cyan-500' },
        amber: { hex: '#f59e0b', border: 'border-amber-500', btn: 'bg-amber-500', bgLt: 'bg-amber-50 dark:bg-amber-900/20', borderLt: 'border-amber-100 dark:border-amber-800/50', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-500/10', iconColor: 'text-amber-505' }
    },
    customActions: [],
    paceGoals: [],
    globalStartDate: null,
    globalEndDate: null,
    dynamicLineColors: ['#6366f1', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#0ea5e9', '#ec4899', '#14b8a6'],
    isInitialLoad: true,
    currentFilter: 'All',
    PLAN_START_DATE: initPlanStartDate,
    PLAN_END_DATE: initPlanEndDate,
    showSync: false,
    serverTimeOffset: 0,
    fiscalLedger: { transactions: [], budgets: [], vaults: [] },
    examSessions: [],
    examRoutine: [],
    selectedCountdownExamId: 'auto',
    syllabusStructure: {},
    customSyllabus: {},
    customPrograms: {},
    programVisibility: {},
    weeklyTargetsDatabase: {},
    dailyTargetsDatabase: {},
    scheduleBlocks: [],
    scheduleBlocks2: [],
    scheduleGroups: [],
    hasLoadedFromCloud: false,
    cloudDocumentExists: null
};

// Define transparent properties on window to alias AppState keys
const stateKeys = [
    'appState', 'tracks', 'timerLogs', 'dailyFocusHoursTarget', 'dailyFocusHoursTargetDate', 'dailyFocusHoursTargetHistory', 'timerAnalyticsRange', 'timerAnalyticsGrouping', 'timerAnalyticsChartStyle', 'spectraHeatmapRange', 'sessionHistoryFilter', 'activeTimerState', 'timerInterval', 'db',
    'subjectFocusTargets',
    'isSyncing', 'isAppInitialized', 'tasks', 'progressChart', 'masterLineChart',
    'localDataJSON', 'saveTimeout', 'isSaving', 'needsSave', 'activeRoutineSet',
    'mainChartPrograms', 'monthlyChartActions', 'yearlyChartActions',
    'paceTrendChartInstance', 'spectraPaceTrendChartInstance', 'globalPaceTrendChartInstance',
    'dbProgressChartInstance', 'revisionTrendChartInstance', 'globalHistoryChartInstance',
    'dadbTrendChartInstance', 'resultsTrendChartInstance', 'latestPaceData', 'activeTrendGoalId',
    'activeSingleSubjectTrend', 'chartVisibility', 'latestChartStats', 'editingTask',
    'editingPaceId', 'trendTimeFilter', 'subjectTimeLinks', 'subjectDetailsState',
    'currentDadbTab', 'hasShownCongrats', 'successResults', 'editingResultId',
    'trendDatasetVisibility', 'dashboardConfig', 'passedItems', 'revisionData',
    'currentGhmTab', 'subjectColors', 'twColors', 'customActions', 'paceGoals',
    'globalStartDate', 'globalEndDate', 'dynamicLineColors', 'isInitialLoad',
    'currentFilter', 'PLAN_START_DATE', 'PLAN_END_DATE', 'showSync', 'serverTimeOffset',
    'fiscalLedger', 'examSessions', 'examRoutine', 'selectedCountdownExamId',
    'syllabusStructure', 'customSyllabus', 'customPrograms', 'programVisibility', 'weeklyTargetsDatabase',
    'dailyTargetsDatabase', 'scheduleBlocks', 'scheduleBlocks2', 'scheduleGroups',
    'hasLoadedFromCloud', 'cloudDocumentExists'
];

stateKeys.forEach(key => {
    Object.defineProperty(window, key, {
        get: () => window.AppState[key],
        set: (val) => {
            window.AppState[key] = val;
            if (key === 'fiscalLedger' && typeof window.renderDashboardFiscalSummary === 'function') {
                window.renderDashboardFiscalSummary();
            }
        },
        configurable: true
    });
});

/**
 * Safe Hydration Guard
 * Ensures authoritative Firestore cloud payloads (including empty arrays and objects representing deletions) are applied cleanly to AppState.
 */
window.shouldHydrateField = function(key, cloudValue, currentLocalValue, isExplicitWipe = false) {
    return true;
};

window.applyFullAppState = function(data, saveCloud = true, isExplicitWipe = false) {
    if (!data || typeof data !== 'object') return false;
    delete data._metadata;

    let rejectedAnyField = false;

    if (data.tasks !== undefined) {
        if (window.shouldHydrateField('tasks', data.tasks, AppState.tasks, isExplicitWipe)) {
            AppState.tasks = data.tasks;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.tracks !== undefined) {
        if (window.shouldHydrateField('tracks', data.tracks, AppState.tracks, isExplicitWipe)) {
            AppState.tracks = data.tracks;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.customSyllabus !== undefined || data.syllabusStructure !== undefined) {
        const syl = data.syllabusStructure || data.customSyllabus;
        if (window.shouldHydrateField('syllabusStructure', syl, AppState.syllabusStructure, isExplicitWipe)) {
            AppState.syllabusStructure = syl;
            AppState.customSyllabus = syl;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.customPrograms !== undefined) {
        if (window.shouldHydrateField('customPrograms', data.customPrograms, AppState.customPrograms, isExplicitWipe)) {
            AppState.customPrograms = data.customPrograms;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.customActions !== undefined) {
        if (window.shouldHydrateField('customActions', data.customActions, AppState.customActions, isExplicitWipe)) {
            AppState.customActions = data.customActions;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.paceGoals !== undefined) {
        if (window.shouldHydrateField('paceGoals', data.paceGoals, AppState.paceGoals, isExplicitWipe)) {
            AppState.paceGoals = data.paceGoals;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.passedItems !== undefined) {
        if (window.shouldHydrateField('passedItems', data.passedItems, AppState.passedItems, isExplicitWipe)) {
            AppState.passedItems = {
                programs: Array.isArray(data.passedItems.programs) ? data.passedItems.programs : [],
                subjects: Array.isArray(data.passedItems.subjects) ? data.passedItems.subjects : []
            };
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.revisionData !== undefined) {
        if (window.shouldHydrateField('revisionData', data.revisionData, AppState.revisionData, isExplicitWipe)) {
            AppState.revisionData = data.revisionData;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.programVisibility !== undefined) AppState.programVisibility = data.programVisibility;
    if (data.subjectTimeLinks !== undefined) AppState.subjectTimeLinks = data.subjectTimeLinks;

    if (data.successResults !== undefined) {
        if (window.shouldHydrateField('successResults', data.successResults, AppState.successResults, isExplicitWipe)) {
            AppState.successResults = data.successResults;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.timerLogs !== undefined) {
        if (window.shouldHydrateField('timerLogs', data.timerLogs, AppState.timerLogs, isExplicitWipe)) {
            AppState.timerLogs = data.timerLogs;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.dailyFocusHoursTarget !== undefined) AppState.dailyFocusHoursTarget = data.dailyFocusHoursTarget;
    if (data.dailyFocusHoursTargetDate !== undefined) AppState.dailyFocusHoursTargetDate = data.dailyFocusHoursTargetDate;
    if (data.dailyFocusHoursTargetHistory !== undefined) AppState.dailyFocusHoursTargetHistory = data.dailyFocusHoursTargetHistory;
    if (data.timerAnalyticsRange !== undefined) AppState.timerAnalyticsRange = data.timerAnalyticsRange;
    if (data.timerAnalyticsGrouping !== undefined) AppState.timerAnalyticsGrouping = data.timerAnalyticsGrouping;
    if (data.timerAnalyticsChartStyle !== undefined) AppState.timerAnalyticsChartStyle = data.timerAnalyticsChartStyle;
    if (data.spectraHeatmapRange !== undefined) AppState.spectraHeatmapRange = data.spectraHeatmapRange;
    if (data.sessionHistoryFilter !== undefined) AppState.sessionHistoryFilter = data.sessionHistoryFilter;
    if (data.subjectFocusTargets !== undefined) AppState.subjectFocusTargets = data.subjectFocusTargets;
    if (data.dashboardConfig !== undefined) AppState.dashboardConfig = data.dashboardConfig;
    if (data.weeklyTargetsDatabase !== undefined) AppState.weeklyTargetsDatabase = data.weeklyTargetsDatabase;
    if (data.dailyTargetsDatabase !== undefined) AppState.dailyTargetsDatabase = data.dailyTargetsDatabase;

    if (data.scheduleBlocks !== undefined) {
        if (window.shouldHydrateField('scheduleBlocks', data.scheduleBlocks, AppState.scheduleBlocks, isExplicitWipe)) {
            AppState.scheduleBlocks = data.scheduleBlocks;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.scheduleBlocks2 !== undefined) {
        if (window.shouldHydrateField('scheduleBlocks2', data.scheduleBlocks2, AppState.scheduleBlocks2, isExplicitWipe)) {
            AppState.scheduleBlocks2 = data.scheduleBlocks2;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.scheduleGroups !== undefined) {
        if (window.shouldHydrateField('scheduleGroups', data.scheduleGroups, AppState.scheduleGroups, isExplicitWipe)) {
            AppState.scheduleGroups = data.scheduleGroups;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.fiscalLedger !== undefined) {
        if (window.shouldHydrateField('fiscalLedger', data.fiscalLedger, AppState.fiscalLedger, isExplicitWipe)) {
            AppState.fiscalLedger = data.fiscalLedger;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.examSessions !== undefined) {
        if (window.shouldHydrateField('examSessions', data.examSessions, AppState.examSessions, isExplicitWipe)) {
            AppState.examSessions = data.examSessions;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.examRoutine !== undefined) {
        if (window.shouldHydrateField('examRoutine', data.examRoutine, AppState.examRoutine, isExplicitWipe)) {
            AppState.examRoutine = data.examRoutine;
        } else {
            rejectedAnyField = true;
        }
    }

    if (data.selectedCountdownExamId !== undefined) AppState.selectedCountdownExamId = data.selectedCountdownExamId;
    if (data.activeTimerState !== undefined) AppState.activeTimerState = data.activeTimerState;
    if (data.activeRoutineSet !== undefined) AppState.activeRoutineSet = data.activeRoutineSet;
    if (data.subjectColors !== undefined) AppState.subjectColors = data.subjectColors;

    if (typeof window.updateTimerAnalyticsControls === 'function') window.updateTimerAnalyticsControls();
    if (typeof window.renderTimerAnalyticsChart === 'function') window.renderTimerAnalyticsChart();
    if (typeof window.setSpectraHeatmapRangeUI === 'function') window.setSpectraHeatmapRangeUI(AppState.spectraHeatmapRange);
    else if (typeof window.renderSpectraFocusHeatmap === 'function') window.renderSpectraFocusHeatmap();
    if (typeof window.setSessionHistoryFilterUI === 'function') window.setSessionHistoryFilterUI(AppState.sessionHistoryFilter);

    if (typeof window.recalculateTotals === 'function') window.recalculateTotals();
    if (typeof window.renderUI === 'function') window.renderUI();
    return !rejectedAnyField;
};

window.DEFAULT_COMMITMENT_LABELS = ['Action 1', 'Action 2', 'Action 3', 'Action 4', 'Action 5', 'Action 6', 'Action 7'];

window.getServerTime = function() {
    return Date.now() + (window.serverTimeOffset || 0);
};

/**
 * Returns a clean initial AppState payload representing a fresh, empty workspace.
 */
window.getDefaultAppState = function() {
    return {
        tasks: [],
        tracks: [],
        customSyllabus: {},
        syllabusStructure: {},
        customPrograms: {},
        customActions: [],
        paceGoals: [],
        passedItems: { programs: [], subjects: [] },
        revisionData: { active: [], progress: {} },
        programVisibility: {},
        subjectTimeLinks: {},
        successResults: [],
        timerLogs: [],
        dailyFocusHoursTarget: 0,
        dailyFocusHoursTargetDate: "",
        dailyFocusHoursTargetHistory: [],
        timerAnalyticsRange: 180,
        timerAnalyticsGrouping: 'daily',
        timerAnalyticsChartStyle: 'combo',
        spectraHeatmapRange: 365,
        sessionHistoryFilter: 'all',
        subjectFocusTargets: {},
        dashboardConfig: {
            topTag: "X-29",
            mainTitle: "X-29 Dashboard",
            subTitle: "",
            trendStartDate: new Date().toISOString().split('T')[0],
            trendEndDate: "",
            showDaysRemaining: false,
            independentPaces: { tracks: {}, programs: {}, subjects: {} }
        },
        weeklyTargetsDatabase: {},
        dailyTargetsDatabase: {},
        scheduleBlocks: [],
        scheduleBlocks2: [],
        scheduleGroups: [],
        fiscalLedger: { transactions: [], budgets: [], vaults: [] },
        examSessions: [],
        examRoutine: [],
        selectedCountdownExamId: 'auto',
        activeTimerState: {
            isRunning: false,
            mode: 'stopwatch',
            startTime: null,
            elapsedBeforeStart: 0,
            targetDuration: 0,
            selectedSubject: 'General Study'
        },
        activeRoutineSet: 1,
        subjectColors: {}
    };
};


