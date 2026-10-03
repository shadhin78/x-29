/**
 * Router Module (router/router.js)
 * High-performance Vanilla JavaScript SPA Router for X-29.
 *
 * Responsibilities:
 * 1. Genuine URL route synchronization with History API (pushState, replaceState, popstate).
 * 2. Real canonical paths: /dashboard, /timer, /subjects, /schedule, /analytics, /exam, /pace, /master-config, /outcome, /daily-actions, /monthly-target-setup.
 * 3. Deep-link resolution, direct URL loading, and F5 refresh persistence.
 * 4. Modular page lifecycle management (mount, render, destroy) with 0ms transition.
 * 5. Complete preservation of persistent application shell and permanent dark mode.
 */

(function () {
    'use strict';

    const Router = {
        ASSET_VERSION: '1.1.0',
        activePageId: 'dashboard',
        htmlCache: {},
        cssCache: {},
        jsLoaded: {},
        isNavigating: false,

        routes: {
            'dashboard': {
                containerId: 'page-dashboard',
                htmlUrl: 'pages/Dashboard/Dashboard.html',
                cssUrl: 'pages/Dashboard/Dashboard.css',
                jsUrl: 'pages/Dashboard/Dashboard.js',
                cssId: 'route-dashboard-css',
                jsId: 'route-dashboard-js',
                onMount: function () {
                    if (window.DashboardPage && typeof window.DashboardPage.mount === 'function') {
                        window.DashboardPage.mount();
                    } else if (typeof window.renderApp === 'function') {
                        window.renderApp();
                    }
                },
                onDestroy: function () {
                    if (window.DashboardPage && typeof window.DashboardPage.destroy === 'function') {
                        window.DashboardPage.destroy();
                    }
                }
            },
            'spectra-analytics': {
                containerId: 'page-spectra-analytics',
                htmlUrl: 'pages/Analytics/Analytics.html',
                cssUrl: 'pages/Analytics/Analytics.css',
                jsUrl: 'pages/Analytics/Analytics.js',
                cssId: 'route-analytics-css',
                jsId: 'route-analytics-js',
                onMount: function () {
                    if (window.AnalyticsPage && typeof window.AnalyticsPage.mount === 'function') {
                        window.AnalyticsPage.mount();
                    }
                },
                onDestroy: function () {
                    // Fast tab switching: keep Chart.js instances and SVG elements in memory!
                    // Only dismiss open tooltips / popups when navigating away
                    if (typeof window.hideSpectraChapterTooltip === 'function') window.hideSpectraChapterTooltip();
                    if (typeof window.hideCommitmentTooltip === 'function') window.hideCommitmentTooltip();
                    const menu = document.getElementById('spectra-filter-dropdown-menu');
                    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
                }
            },
            'analytics': {
                containerId: 'page-spectra-analytics',
                htmlUrl: 'pages/Analytics/Analytics.html',
                cssUrl: 'pages/Analytics/Analytics.css',
                jsUrl: 'pages/Analytics/Analytics.js',
                cssId: 'route-analytics-css',
                jsId: 'route-analytics-js',
                onMount: function () {
                    if (window.AnalyticsPage && typeof window.AnalyticsPage.mount === 'function') {
                        window.AnalyticsPage.mount();
                    }
                },
                onDestroy: function () {
                    if (typeof window.hideSpectraChapterTooltip === 'function') window.hideSpectraChapterTooltip();
                    if (typeof window.hideCommitmentTooltip === 'function') window.hideCommitmentTooltip();
                    const menu = document.getElementById('spectra-filter-dropdown-menu');
                    if (menu && !menu.classList.contains('hidden')) menu.classList.add('hidden');
                }
            },
            'timer': {
                containerId: 'page-timer',
                htmlUrl: 'pages/Focus/Focus.html',
                cssUrl: 'pages/Focus/Focus.css',
                jsUrl: 'pages/Focus/Focus.js',
                cssId: 'route-focus-css',
                jsId: 'route-focus-js',
                onMount: function () {
                    if (window.FocusPage && typeof window.FocusPage.mount === 'function') {
                        window.FocusPage.mount();
                    } else if (typeof window.renderTimerPage === 'function') {
                        window.renderTimerPage();
                    }
                },
                onDestroy: function () {
                    if (window.FocusPage && typeof window.FocusPage.destroy === 'function') {
                        window.FocusPage.destroy();
                    }
                }
            },
            'focus': {
                containerId: 'page-timer',
                htmlUrl: 'pages/Focus/Focus.html',
                cssUrl: 'pages/Focus/Focus.css',
                jsUrl: 'pages/Focus/Focus.js',
                cssId: 'route-focus-css',
                jsId: 'route-focus-js',
                onMount: function () {
                    if (window.FocusPage && typeof window.FocusPage.mount === 'function') {
                        window.FocusPage.mount();
                    } else if (typeof window.renderTimerPage === 'function') {
                        window.renderTimerPage();
                    }
                },
                onDestroy: function () {
                    if (window.FocusPage && typeof window.FocusPage.destroy === 'function') {
                        window.FocusPage.destroy();
                    }
                }
            },
            'daily-actions': {
                containerId: 'page-daily-actions',
                htmlUrl: 'pages/Daily Actions/Daily Actions.html',
                cssUrl: 'pages/Daily Actions/Daily Actions.css',
                jsUrl: 'pages/Daily Actions/Daily Actions.js',
                cssId: 'route-daily-actions-css',
                jsId: 'route-daily-actions-js',
                onMount: function () {
                    if (window.DailyActionsPage && typeof window.DailyActionsPage.mount === 'function') {
                        window.DailyActionsPage.mount();
                    } else {
                        if (typeof window.renderDailyTracker === 'function') window.renderDailyTracker();
                        if (typeof window.renderDailyLogs === 'function') window.renderDailyLogs();
                        if (typeof window.renderMonthlyTargets === 'function') window.renderMonthlyTargets();
                        if (typeof window.renderWeeklyTargets === 'function') window.renderWeeklyTargets();
                        if (typeof window.renderDailyTargets === 'function') window.renderDailyTargets();
                    }
                },
                onDestroy: function () {
                    if (window.DailyActionsPage && typeof window.DailyActionsPage.destroy === 'function') {
                        window.DailyActionsPage.destroy();
                    }
                }
            },
            'schedule': {
                containerId: 'page-schedule',
                htmlUrl: 'pages/Daily Schedule/Daily Schedule.html',
                cssUrl: 'pages/Daily Schedule/Daily Schedule.css',
                jsUrl: 'pages/Daily Schedule/Daily Schedule.js',
                cssId: 'route-schedule-css',
                jsId: 'route-schedule-js',
                onMount: function () {
                    if (window.DailySchedulePage && typeof window.DailySchedulePage.mount === 'function') {
                        window.DailySchedulePage.mount();
                    } else if (typeof window.renderSchedulePage === 'function') {
                        window.renderSchedulePage();
                    }
                    if (typeof window.updateActiveScheduleSlot === 'function') {
                        window.updateActiveScheduleSlot();
                    }
                },
                onDestroy: function () {
                    if (window.DailySchedulePage && typeof window.DailySchedulePage.destroy === 'function') {
                        window.DailySchedulePage.destroy();
                    }
                }
            },
            'daily-schedule': {
                containerId: 'page-schedule',
                htmlUrl: 'pages/Daily Schedule/Daily Schedule.html',
                cssUrl: 'pages/Daily Schedule/Daily Schedule.css',
                jsUrl: 'pages/Daily Schedule/Daily Schedule.js',
                cssId: 'route-schedule-css',
                jsId: 'route-schedule-js',
                onMount: function () {
                    if (window.DailySchedulePage && typeof window.DailySchedulePage.mount === 'function') {
                        window.DailySchedulePage.mount();
                    } else if (typeof window.renderSchedulePage === 'function') {
                        window.renderSchedulePage();
                    }
                    if (typeof window.updateActiveScheduleSlot === 'function') {
                        window.updateActiveScheduleSlot();
                    }
                },
                onDestroy: function () {
                    if (window.DailySchedulePage && typeof window.DailySchedulePage.destroy === 'function') {
                        window.DailySchedulePage.destroy();
                    }
                }
            },
            'monthly-target-setup': {
                containerId: 'page-monthly-target-setup',
                htmlUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.html',
                cssUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.css',
                jsUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.js',
                cssId: 'route-monthly-target-css',
                jsId: 'route-monthly-target-js',
                onMount: function () {
                    if (window.MonthlyTargetPage && typeof window.MonthlyTargetPage.mount === 'function') {
                        window.MonthlyTargetPage.mount();
                    }
                },
                onDestroy: function () {
                    if (window.MonthlyTargetPage && typeof window.MonthlyTargetPage.destroy === 'function') {
                        window.MonthlyTargetPage.destroy();
                    }
                }
            },
            'daily-actions/monthly-setup': {
                containerId: 'page-monthly-target-setup',
                htmlUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.html',
                cssUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.css',
                jsUrl: 'pages/Daily Actions/monthly target setup/monthly target setup.js',
                cssId: 'route-monthly-target-css',
                jsId: 'route-monthly-target-js',
                onMount: function () {
                    if (window.MonthlyTargetPage && typeof window.MonthlyTargetPage.mount === 'function') {
                        window.MonthlyTargetPage.mount();
                    }
                },
                onDestroy: function () {
                    if (window.MonthlyTargetPage && typeof window.MonthlyTargetPage.destroy === 'function') {
                        window.MonthlyTargetPage.destroy();
                    }
                }
            },
            'subject': {
                containerId: 'page-subjects',
                htmlUrl: 'pages/Subjects/Subjects.html',
                cssUrl: 'pages/Subjects/Subjects.css',
                jsUrl: 'pages/Subjects/Subjects.js',
                cssId: 'route-subjects-css',
                jsId: 'route-subjects-js',
                onMount: function () {
                    if (window.SubjectsPage && typeof window.SubjectsPage.mount === 'function') {
                        window.SubjectsPage.mount();
                    } else {
                        if (typeof window.renderSubjectNavigation === 'function') window.renderSubjectNavigation();
                        if (typeof window.renderSubjectProgress === 'function') window.renderSubjectProgress(window.lastSubjectStats || {});
                        Router.scheduleTransitionTask(() => {
                            if (Router.activePageId !== 'subjects' && Router.activePageId !== 'subject') return;
                            if (typeof window.renderTaskList === 'function') window.renderTaskList();
                            if (typeof window.updateMetrics === 'function') window.updateMetrics();
                        });
                    }
                },
                onDestroy: function () {
                    if (window.SubjectsPage && typeof window.SubjectsPage.destroy === 'function') {
                        window.SubjectsPage.destroy();
                    }
                }
            },
            'subjects': {
                containerId: 'page-subjects',
                htmlUrl: 'pages/Subjects/Subjects.html',
                cssUrl: 'pages/Subjects/Subjects.css',
                jsUrl: 'pages/Subjects/Subjects.js',
                cssId: 'route-subjects-css',
                jsId: 'route-subjects-js',
                onMount: function () {
                    if (window.SubjectsPage && typeof window.SubjectsPage.mount === 'function') {
                        window.SubjectsPage.mount();
                    } else {
                        // Frame 1: Critical Header & Progress Summary (0ms)
                        if (typeof window.renderSubjectNavigation === 'function') window.renderSubjectNavigation();
                        if (typeof window.renderSubjectProgress === 'function') window.renderSubjectProgress(window.lastSubjectStats || {});

                        // Frame 2: Deferred 1,300-row task list & metrics calculation
                        Router.scheduleTransitionTask(() => {
                            if (Router.activePageId !== 'subjects') return;
                            if (typeof window.renderTaskList === 'function') window.renderTaskList();
                            if (typeof window.updateMetrics === 'function') window.updateMetrics();
                        });
                    }
                },
                onDestroy: function () {
                    if (window.SubjectsPage && typeof window.SubjectsPage.destroy === 'function') {
                        window.SubjectsPage.destroy();
                    }
                }
            },
            'paces-management': {
                containerId: 'page-paces-management',
                htmlUrl: 'pages/Pace Management/Pace Management.html',
                cssUrl: 'pages/Pace Management/Pace Management.css',
                jsUrl: 'pages/Pace Management/Pace Management.js',
                cssId: 'route-pace-management-css',
                jsId: 'route-pace-management-js',
                onMount: function () {
                    if (window.PaceManagementPage && typeof window.PaceManagementPage.mount === 'function') {
                        window.PaceManagementPage.mount();
                    } else if (typeof window.renderPaceGoals === 'function') {
                        window.renderPaceGoals(window.lastSubjectStats || (typeof updateMetrics === 'function' ? (updateMetrics(), window.lastSubjectStats) : {}));
                    }
                },
                onDestroy: function () {
                    if (window.PaceManagementPage && typeof window.PaceManagementPage.destroy === 'function') {
                        window.PaceManagementPage.destroy();
                    }
                }
            },
            'pace': {
                containerId: 'page-paces-management',
                htmlUrl: 'pages/Pace Management/Pace Management.html',
                cssUrl: 'pages/Pace Management/Pace Management.css',
                jsUrl: 'pages/Pace Management/Pace Management.js',
                cssId: 'route-pace-management-css',
                jsId: 'route-pace-management-js',
                onMount: function () {
                    if (window.PaceManagementPage && typeof window.PaceManagementPage.mount === 'function') {
                        window.PaceManagementPage.mount();
                    } else if (typeof window.renderPaceGoals === 'function') {
                        window.renderPaceGoals(window.lastSubjectStats || (typeof updateMetrics === 'function' ? (updateMetrics(), window.lastSubjectStats) : {}));
                    }
                },
                onDestroy: function () {
                    if (window.PaceManagementPage && typeof window.PaceManagementPage.destroy === 'function') {
                        window.PaceManagementPage.destroy();
                    }
                }
            },
            'master-config': {
                containerId: 'page-master-config',
                htmlUrl: 'pages/Master Config/Master Config.html',
                cssUrl: 'pages/Master Config/Master Config.css',
                jsUrl: 'pages/Master Config/Master Config.js',
                cssId: 'route-master-config-css',
                jsId: 'route-master-config-js',
                onMount: function () {
                    if (window.MasterConfigPage && typeof window.MasterConfigPage.mount === 'function') {
                        window.MasterConfigPage.mount();
                    } else {
                        if (typeof window.populateTrackDropdowns === 'function') window.populateTrackDropdowns();
                        const activeSysTab = document.querySelector('[id^="sys-tab-"].bg-blue-600');
                        const currentTab = activeSysTab ? activeSysTab.id.replace('sys-tab-', '') : 'chapter';
                        if (typeof window.switchSysTab === 'function') {
                            window.switchSysTab(currentTab);
                        } else {
                            if (typeof window.renderPriorityConfig === 'function') window.renderPriorityConfig();
                            if (typeof window.renderTrackList === 'function') window.renderTrackList();
                        }
                    }
                },
                onDestroy: function () {
                    if (window.MasterConfigPage && typeof window.MasterConfigPage.destroy === 'function') {
                        window.MasterConfigPage.destroy();
                    }
                }
            },
            'outcome': {
                containerId: 'page-outcome',
                htmlUrl: 'pages/Outcome/Outcome.html',
                cssUrl: 'pages/Outcome/Outcome.css',
                jsUrl: 'pages/Outcome/Outcome.js',
                cssId: 'route-outcome-css',
                jsId: 'route-outcome-js',
                onMount: function () {
                    if (window.OutcomePage && typeof window.OutcomePage.mount === 'function') {
                        window.OutcomePage.mount();
                    } else {
                        if (typeof window.renderResults === 'function') window.renderResults();
                        if (typeof window.renderPassConfig === 'function') window.renderPassConfig();
                        if (typeof window.renderCelebrationConfig === 'function') window.renderCelebrationConfig();
                    }
                },
                onDestroy: function () {
                    if (window.OutcomePage && typeof window.OutcomePage.destroy === 'function') {
                        window.OutcomePage.destroy();
                    }
                }
            },
            'exam': {
                containerId: 'page-exam',
                htmlUrl: 'pages/Exam Routine/Exam Routine.html',
                cssUrl: 'pages/Exam Routine/Exam Routine.css',
                jsUrl: 'pages/Exam Routine/Exam Routine.js',
                cssId: 'route-exam-routine-css',
                jsId: 'route-exam-routine-js',
                onMount: function () {
                    if (window.ExamRoutinePage && typeof window.ExamRoutinePage.mount === 'function') {
                        window.ExamRoutinePage.mount();
                    } else if (typeof window.renderExamPage === 'function') {
                        window.renderExamPage();
                    }
                },
                onDestroy: function () {
                    if (window.ExamRoutinePage && typeof window.ExamRoutinePage.destroy === 'function') {
                        window.ExamRoutinePage.destroy();
                    }
                }
            },
            'exam-routine': {
                containerId: 'page-exam',
                htmlUrl: 'pages/Exam Routine/Exam Routine.html',
                cssUrl: 'pages/Exam Routine/Exam Routine.css',
                jsUrl: 'pages/Exam Routine/Exam Routine.js',
                cssId: 'route-exam-routine-css',
                jsId: 'route-exam-routine-js',
                onMount: function () {
                    if (window.ExamRoutinePage && typeof window.ExamRoutinePage.mount === 'function') {
                        window.ExamRoutinePage.mount();
                    } else if (typeof window.renderExamPage === 'function') {
                        window.renderExamPage();
                    }
                },
                onDestroy: function () {
                    if (window.ExamRoutinePage && typeof window.ExamRoutinePage.destroy === 'function') {
                        window.ExamRoutinePage.destroy();
                    }
                }
            }
        },

        allPages: [
            'dashboard',
            'spectra-analytics',
            'timer',
            'daily-actions',
            'schedule',
            'subjects',
            'paces-management',
            'master-config',
            'outcome',
            'exam',
            'monthly-target-setup'
        ],

        buttonStyles: {
            'dashboard': { active: 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-lg', hover: 'hover:border-blue-400' },
            'spectra-analytics': { active: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white border-transparent shadow-lg shadow-fuchsia-500/20', hover: 'hover:border-fuchsia-400' },
            'analytics': { active: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white border-transparent shadow-lg shadow-fuchsia-500/20', hover: 'hover:border-fuchsia-400' },
            'daily-actions': { active: 'bg-orange-500 text-white border-orange-500 shadow-lg', hover: 'hover:border-orange-400' },
            'subjects': { active: 'bg-violet-600 text-white border-violet-600 shadow-lg', hover: 'hover:border-violet-400' },
            'paces-management': { active: 'bg-red-600 text-white border-red-600 shadow-lg', hover: 'hover:border-red-400' },
            'pace': { active: 'bg-red-600 text-white border-red-600 shadow-lg', hover: 'hover:border-red-400' },
            'master-config': { active: 'bg-indigo-600 text-white border-indigo-600 shadow-lg', hover: 'hover:border-indigo-400' },
            'outcome': { active: 'bg-yellow-500 text-white border-yellow-500 shadow-lg', hover: 'hover:border-yellow-400' },
            'timer': { active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg', hover: 'hover:border-emerald-400' },
            'focus': { active: 'bg-emerald-600 text-white border-emerald-600 shadow-lg', hover: 'hover:border-emerald-400' },
            'schedule': { active: 'bg-cyan-600 text-white border-cyan-600 shadow-lg', hover: 'hover:border-cyan-400' },
            'exam': { active: 'bg-rose-600 text-white border-rose-600 shadow-lg', hover: 'hover:border-rose-400' }
        },

        /**
         * Dynamically inject page CSS if not already present.
         * Includes promise deduplication and mock test environment support.
         */
        loadCss: function (url, id) {
            const versionedUrl = url.includes('?v=') ? url : `${url}?v=${this.ASSET_VERSION}`;
            const cleanUrl = encodeURI(decodeURI(versionedUrl));
            const baseCleanUrl = encodeURI(decodeURI(url.split('?')[0]));
            if (this.cssCache[cleanUrl] || this.cssCache[baseCleanUrl] || (id && document.getElementById(id))) {
                this.cssCache[cleanUrl] = true;
                this.cssCache[baseCleanUrl] = true;
                return Promise.resolve();
            }
            if (this._pendingCssPromises && this._pendingCssPromises[cleanUrl]) {
                return this._pendingCssPromises[cleanUrl];
            }
            this._pendingCssPromises = this._pendingCssPromises || {};
            const p = new Promise((resolve) => {
                const link = document.createElement('link');
                if (id) link.id = id;
                link.rel = 'stylesheet';
                link.href = cleanUrl;
                link.onload = () => {
                    this.cssCache[cleanUrl] = true;
                    this.cssCache[baseCleanUrl] = true;
                    if (this._pendingCssPromises) delete this._pendingCssPromises[cleanUrl];
                    resolve();
                };
                link.onerror = () => {
                    console.warn(`[Router] Could not load CSS at ${url}`);
                    if (this._pendingCssPromises) delete this._pendingCssPromises[cleanUrl];
                    resolve(); // Soft fail to not block page rendering
                };
                document.head.appendChild(link);

                // Support mock test environments where appendChild does not load stylesheets
                if (typeof window !== 'undefined' && (!window.navigator || !window.navigator.userAgent) && typeof link.onload === 'function') {
                    link.onload();
                }
            });
            this._pendingCssPromises[cleanUrl] = p;
            return p;
        },

        /**
         * Dynamically inject page JS if not already loaded.
         * Includes promise deduplication and mock test environment support.
         */
        loadJs: function (url, id) {
            const versionedUrl = url.includes('?v=') ? url : `${url}?v=${this.ASSET_VERSION}`;
            const cleanUrl = encodeURI(decodeURI(versionedUrl));
            const baseCleanUrl = encodeURI(decodeURI(url.split('?')[0]));
            if (this.jsLoaded[cleanUrl] || this.jsLoaded[baseCleanUrl] || (id && document.getElementById(id))) {
                this.jsLoaded[cleanUrl] = true;
                this.jsLoaded[baseCleanUrl] = true;
                return Promise.resolve();
            }
            if (this._pendingJsPromises && this._pendingJsPromises[cleanUrl]) {
                return this._pendingJsPromises[cleanUrl];
            }
            this._pendingJsPromises = this._pendingJsPromises || {};
            const p = new Promise((resolve) => {
                const script = document.createElement('script');
                if (id) script.id = id;
                script.src = cleanUrl;
                script.async = false;
                script.onload = () => {
                    this.jsLoaded[cleanUrl] = true;
                    this.jsLoaded[baseCleanUrl] = true;
                    if (this._pendingJsPromises) delete this._pendingJsPromises[cleanUrl];
                    resolve();
                };
                script.onerror = () => {
                    console.error(`[Router] Failed to load script at ${url}`);
                    if (this._pendingJsPromises) delete this._pendingJsPromises[cleanUrl];
                    resolve();
                };
                document.body.appendChild(script);

                // Support mock test environments where appendChild does not load scripts
                if (typeof window !== 'undefined' && (!window.navigator || !window.navigator.userAgent) && typeof script.onload === 'function') {
                    script.onload();
                }
            });
            this._pendingJsPromises[cleanUrl] = p;
            return p;
        },

        /**
         * Fetch and cache page HTML.
         */
        loadHtml: async function (url) {
            const versionedUrl = url.includes('?v=') ? url : `${url}?v=${this.ASSET_VERSION}`;
            const cleanUrl = encodeURI(decodeURI(versionedUrl));
            const baseCleanUrl = encodeURI(decodeURI(url.split('?')[0]));
            if (this.htmlCache[cleanUrl] || this.htmlCache[baseCleanUrl]) {
                return this.htmlCache[cleanUrl] || this.htmlCache[baseCleanUrl];
            }
            try {
                const res = await fetch(cleanUrl);
                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                }
                const html = await res.text();
                this.htmlCache[cleanUrl] = html;
                this.htmlCache[baseCleanUrl] = html;
                return html;
            } catch (err) {
                console.error(`[Router] Error fetching HTML from ${url}:`, err);
                return null;
            }
        },

        /**
         * Update sidebar navigation active states.
         */
        updateNavButtons: function (targetPageId) {
            const canonicalTarget = this.normalizePageId(targetPageId);
            this.allPages.forEach(p => {
                const btn = document.getElementById(`btn-nav-${p}`);
                if (btn && this.buttonStyles[p]) {
                    const baseClass = "w-full border-2 px-4 py-3 rounded-2xl font-black text-xs transition-all duration-300 hover:translate-x-1.5 hover:shadow-md active:scale-98 flex items-center gap-3";
                    const isActive = (p === targetPageId) || (p === canonicalTarget) || (canonicalTarget === 'monthly-target-setup' && p === 'daily-actions');
                    if (isActive) {
                        btn.className = `${baseClass} ${this.buttonStyles[p].active}`;
                    } else {
                        btn.className = `${baseClass} bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 ${this.buttonStyles[p].hover}`;
                    }
                }
            });
        },

        /**
         * Standard canonical route slug dictionary.
         * Enforces 100% path parity across Local Preview and Vercel Production.
         * Every URL resolves to ONE canonical path.
         */
        canonicalRoutes: {
            'dashboard': '/',
            'home': '/',
            'timer': '/timer',
            'focus': '/focus',
            'subjects': '/subjects',
            'subject': '/subjects',
            'schedule': '/schedule',
            'daily-schedule': '/schedule',
            'analytics': '/analytics',
            'spectra-analytics': '/analytics',
            'exam': '/exam',
            'exam-routine': '/exam',
            'pace': '/pace',
            'paces-management': '/pace',
            'master-config': '/master-config',
            'outcome': '/outcome',
            'daily-actions': '/daily-actions',
            'monthly-target-setup': '/daily-actions/monthly-setup',
            'daily-actions/monthly-setup': '/daily-actions/monthly-setup',
            'monthly-setup': '/daily-actions/monthly-setup',
            'login': '/login'
        },

        /**
         * Normalize route ID and aliases to canonical internal identifiers.
         * Strips any trailing/leading slashes, decodes URI components, and removes spaces.
         */
        normalizePageId: function (pageId) {
            if (!pageId) return 'dashboard';
            let id = String(pageId).trim().toLowerCase();
            try {
                id = decodeURIComponent(id);
            } catch (e) {}
            id = id.replace(/^\/+|\/+$/g, '').trim();
            if (id.startsWith('pages/')) {
                id = id.substring(6).trim();
            }
            if (id.endsWith('/index')) {
                id = id.substring(0, id.length - 6).trim();
            } else if (id.endsWith('/index.html')) {
                id = id.substring(0, id.length - 11).trim();
            }

            if (id === '' || id === 'dashboard' || id === 'dashboard-page' || id === 'home') return 'dashboard';
            if (id === 'focus') return 'focus';
            if (id === 'timer') return 'timer';
            if (id === 'subjects' || id === 'subject') return 'subjects';
            if (id === 'schedule' || id === 'daily-schedule' || id === 'daily schedule') return 'schedule';
            if (id === 'analytics' || id === 'spectra-analytics' || id === 'spectra') return 'spectra-analytics';
            if (id === 'exam' || id === 'exam-routine' || id === 'exam routine') return 'exam';
            if (id === 'pace' || id === 'paces' || id === 'paces-management' || id === 'pace-management' || id === 'pace management') return 'paces-management';
            if (id === 'master-config' || id === 'master config' || id === 'master-configuration' || id === 'master configuration') return 'master-config';
            if (id === 'outcome' || id === 'results') return 'outcome';
            if (id === 'daily-actions' || id === 'daily actions' || id === 'daily-action' || id === 'daily action') return 'daily-actions';
            if (id === 'monthly-target-setup' || id === 'daily-actions/monthly-setup' || id === 'monthly-setup' || id === 'monthly target setup' || id === 'monthly-target' || id === 'monthly target' || id === 'add-monthly-target') return 'monthly-target-setup';
            if (id === 'login') return 'login';

            if (id.startsWith('focus')) return 'focus';
            if (id.startsWith('timer')) return 'timer';
            if (id.startsWith('dashboard')) return 'dashboard';
            if (id.startsWith('subject')) return 'subjects';
            if (id.startsWith('schedule')) return 'schedule';
            if (id.startsWith('analytic')) return 'spectra-analytics';
            if (id.startsWith('exam')) return 'exam';
            if (id.startsWith('pace')) return 'paces-management';

            return id.replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '') || 'dashboard';
        },

        /**
         * Map canonical route ID to URL path.
         * Guarantees 100% identical clean URL slugs in local development and production.
         * Clean URLs: /timer, /, /subjects, /schedule, /analytics, /exam, /pace,
         * /master-config, /outcome, /daily-actions, /daily-actions/monthly-setup, /login
         * Never introduces %20, spaces, trailing slashes, query parameters, or hash routes.
         */
        getPathForPageId: function (pageId) {
            const canonical = this.normalizePageId(pageId);
            if (this.canonicalRoutes[canonical]) {
                return this.canonicalRoutes[canonical];
            }
            if (this.canonicalRoutes[pageId]) {
                return this.canonicalRoutes[pageId];
            }
            const cleaned = String(pageId || 'dashboard')
                .toLowerCase()
                .trim()
                .replace(/[\s_]+/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-');
            return cleaned === 'dashboard' ? '/' : ('/' + (cleaned || ''));
        },

        /**
         * Resolve canonical route ID from URL pathname or hash.
         * Handles direct URLs, refreshes, deep-links, aliases, trailing slashes, and encoded URIs.
         */
        getPageIdFromPath: function (pathname) {
            if (!pathname) return 'dashboard';
            let path = pathname;
            if (path.includes('#')) {
                path = path.split('#')[1] || '';
            }
            path = path.split('?')[0];
            try {
                path = decodeURIComponent(path);
            } catch (e) {}
            path = path.replace(/^\/+|\/+$/g, '').trim();
            if (!path || path === 'index.html' || path === 'index' || path === 'dashboard') return 'dashboard';
            if (path === 'daily-actions/monthly-setup' || path === 'monthly-setup' || path === 'monthly-target-setup') return 'monthly-target-setup';
            return this.normalizePageId(path);
        },

        /**
         * Frame-budgeted transition task scheduler.
         * Defers non-critical rendering to the next animation frame,
         * preserving 60 fps slide-up transition animations.
         */
        scheduleTransitionTask: function (fn) {
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                return window.requestAnimationFrame(fn);
            }
            return setTimeout(fn, 0);
        },

        /**
         * Main navigation method.
         * Switches the active page with optional History API address bar synchronization.
         */
        loadPage: async function (pageId, sectionId, options) {
            options = options || {};
            pageId = this.normalizePageId(pageId);

            const previousPageId = this.activePageId;
            const isSamePage = previousPageId === pageId;

            // Synchronize browser address bar via History API (clean SPA navigation & deep-linking)
            if (options.updateHistory !== false && typeof window !== 'undefined' && window.history && typeof window.history.pushState === 'function' && window.location && window.location.protocol !== 'file:') {
                try {
                    const targetPath = this.getPathForPageId(pageId);
                    const currentPath = window.location.pathname;
                    if (options.replace) {
                        window.history.replaceState({ pageId: pageId, sectionId: sectionId }, '', targetPath);
                    } else if (currentPath !== targetPath) {
                        window.history.pushState({ pageId: pageId, sectionId: sectionId }, '', targetPath);
                    }
                } catch (e) {
                    // Safe fallback for restricted iframe / local environments
                }
            }

            // Prevent redundant recursive navigation if already navigating to the same target page
            if (this.isNavigating && isSamePage) {
                return;
            }
            this.isNavigating = true;

            // Increment navigation sequence for superseding rapid clicks
            this._navSeq = (this._navSeq || 0) + 1;
            const currentSeq = this._navSeq;

            // 1. INSTANT NAVIGATION FEEDBACK: Update active nav state & title immediately (0ms)
            this.updateNavButtons(pageId);
            if (typeof document !== 'undefined') {
                const titleMap = {
                    'dashboard': 'Dashboard - X-29',
                    'timer': 'Focus - X-29',
                    'subjects': 'Subjects - X-29',
                    'schedule': 'Daily Schedule - X-29',
                    'spectra-analytics': 'Analytics - X-29',
                    'analytics': 'Analytics - X-29',
                    'exam': 'Exam Routine - X-29',
                    'paces-management': 'Pace Management - X-29',
                    'pace': 'Pace Management - X-29',
                    'master-config': 'Master Config - X-29',
                    'outcome': 'Outcome - X-29',
                    'daily-actions': 'Daily Actions - X-29',
                    'monthly-target-setup': 'Monthly Target Setup - X-29'
                };
                if (titleMap[pageId]) {
                    document.title = titleMap[pageId];
                }
            }

            // 2. Mobile drawer immediate slide-out without blocking UI
            if (typeof window !== 'undefined' && window.innerWidth < 768 && typeof window.closeMobileSidebar === 'function') {
                window.closeMobileSidebar();
            }

            try {
                // 3. Cleanup previous page if navigating away
                if (!isSamePage && this.routes[previousPageId] && typeof this.routes[previousPageId].onDestroy === 'function') {
                    try {
                        this.routes[previousPageId].onDestroy();
                    } catch (e) {
                        console.warn(`[Router] Error in onDestroy for ${previousPageId}:`, e);
                    }
                }

                // 4. Ensure target container exists
                const route = this.routes[pageId];
                let container = route ? document.getElementById(route.containerId) : null;
                if (!container && route) {
                    const mainPanel = document.getElementById('main-content-panel');
                    if (mainPanel) {
                        container = document.createElement('div');
                        container.id = route.containerId;
                        container.className = 'space-y-6 md:space-y-8';
                        mainPanel.prepend(container);
                    }
                }

                // 5. INSTANT VISIBILITY SWITCH: Show target container immediately (0ms)
                this.allPages.forEach(p => {
                    const el = document.getElementById(`page-${p}`);
                    if (el) {
                        if (p === pageId) {
                            el.classList.remove('hidden');
                            if (!isSamePage || options.forceAnimation) {
                                // Force a DOM reflow between remove and re-add so the browser
                                // treats this as a fresh animation start, not a no-op.
                                // Guarantees smooth entrance animation on cold boots and route transitions.
                                el.classList.remove('animate-page-enter');
                                void el.offsetHeight; // trigger reflow
                                el.classList.add('animate-page-enter');
                            }
                        } else {
                            el.classList.add('hidden');
                            el.classList.remove('animate-page-enter');
                        }
                    }
                });
                this.activePageId = pageId;

                // 6. Check if container is empty or needs HTML/CSS/JS injection (fallback for mock/dynamic environments)
                const needsHtml = container && (!container.hasChildNodes() || container.children.length === 0 || container.innerHTML.trim() === '');
                if (needsHtml && route) {
                    const [, htmlContent] = await Promise.all([
                        this.loadCss(route.cssUrl, route.cssId),
                        this.loadHtml(route.htmlUrl)
                    ]);

                    if (currentSeq !== this._navSeq) return; // Superseded by newer click

                    if (htmlContent && container && container.innerHTML.trim() === '') {
                        container.innerHTML = htmlContent;
                    }

                    await this.loadJs(route.jsUrl, route.jsId);
                    if (currentSeq !== this._navSeq) return;
                } else if (route) {
                    this.loadCss(route.cssUrl, route.cssId);
                    if (!this.jsLoaded[encodeURI(decodeURI(route.jsUrl))]) {
                        await this.loadJs(route.jsUrl, route.jsId);
                        if (currentSeq !== this._navSeq) return;
                    }
                }

                // 7. Call mount / render on active route
                if (route && typeof route.onMount === 'function') {
                    try {
                        route.onMount();
                    } catch (e) {
                        console.warn(`[Router] Error mounting ${pageId}:`, e);
                    }
                }

                // 8. Scoped secondary chart & canvas refresh deferred to next animation frame
                if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                    window.requestAnimationFrame(() => {
                        if (this.activePageId === pageId) {
                            this.refreshActivePageCharts(pageId);
                        }
                    });
                } else {
                    this.refreshActivePageCharts(pageId);
                }

                // 9. Handle scroll position
                if (sectionId) {
                    setTimeout(() => {
                        const target = document.getElementById(sectionId);
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 50);
                } else if (!isSamePage) {
                    const contentPanel = document.getElementById('main-content-panel');
                    if (contentPanel) {
                        contentPanel.scrollTop = 0;
                    } else if (typeof window !== 'undefined') {
                        window.scrollTo(0, 0);
                    }
                }
            } finally {
                if (this._navSeq === currentSeq) {
                    this.isNavigating = false;
                }
            }
        },

        /**
         * Scoped chart refresh for active page only.
         * Prevents chart resize thrashing on inactive hidden pages.
         */
        refreshActivePageCharts: function (pageId) {
            try {
                if (pageId === 'dashboard') {
                    if (window.dbProgressChartInstance && typeof window.dbProgressChartInstance.resize === 'function') {
                        window.dbProgressChartInstance.resize();
                        if (typeof window.dbProgressChartInstance.update === 'function') {
                            window.dbProgressChartInstance.update('none');
                        }
                    }
                } else if (pageId === 'spectra-analytics') {
                    if (window._trendChartsPending && typeof window.renderTrendCharts === 'function') {
                        window._trendChartsPending = false;
                        window.renderTrendCharts();
                    }
                    if (window._globalPaceTrendChartPending && typeof window.renderGlobalPaceTrendChart === 'function') {
                        window._globalPaceTrendChartPending = false;
                        window.renderGlobalPaceTrendChart();
                    }
                    const analyticsCharts = [
                        window.mainChartPrograms,
                        window.monthlyChartActions,
                        window.spectraPaceTrendChartInstance,
                        window.globalPaceTrendChartInstance,
                        window.spectraFocusAnalyticsChartInstance
                    ];
                    analyticsCharts.forEach(chart => {
                        if (chart && typeof chart.resize === 'function') {
                            chart.resize();
                            if (typeof chart.update === 'function') {
                                chart.update('none');
                            }
                        }
                    });
                } else if (pageId === 'timer') {
                    if (window.timerAnalyticsChartInstance && typeof window.timerAnalyticsChartInstance.resize === 'function') {
                        window.timerAnalyticsChartInstance.resize();
                        if (typeof window.timerAnalyticsChartInstance.update === 'function') {
                            window.timerAnalyticsChartInstance.update('none');
                        }
                    }
                } else if (pageId === 'subjects') {
                    const canvas = document.getElementById('progressChart');
                    if (canvas && window.AppState && window.AppState.progressChart && typeof window.AppState.progressChart.resize === 'function') {
                        window.AppState.progressChart.resize();
                        if (typeof window.AppState.progressChart.update === 'function') {
                            window.AppState.progressChart.update('none');
                        }
                    }
                } else if (pageId === 'outcome') {
                    if (window.resultsTrendChartInstance && typeof window.resultsTrendChartInstance.resize === 'function') {
                        window.resultsTrendChartInstance.resize();
                    }
                }
            } catch (err) {
                console.warn(`[Router] Error refreshing charts for ${pageId}:`, err);
            }
        },

        /**
         * Safely preload a single route's CSS and JS module in background.
         * Never invokes onMount() or alters active page state.
         */
        preloadRoute: function (pageId) {
            if (!pageId) return;
            pageId = this.normalizePageId(pageId);
            const route = this.routes[pageId];
            if (!route) return;

            // Trigger non-blocking CSS and JS prefetch
            this.loadCss(route.cssUrl, route.cssId);
            this.loadJs(route.jsUrl, route.jsId);
        },

        /**
         * Preload all other registered route HTML, CSS, and JS during browser idle time.
         * Injects HTML into the pre-existing container divs so that future page switches
         * require 0 network requests and execute near-instantly.
         * Includes connection bandwidth awareness (Save-Data and slow connection bypass).
         */
        preloadAllRoutes: function () {
            if (this._hasPreloadedRoutes || typeof document === 'undefined') return;
            this._hasPreloadedRoutes = true;

            // Bandwidth awareness: bypass aggressive preloading on metered or slow mobile connections
            if (typeof navigator !== 'undefined' && navigator.connection) {
                if (navigator.connection.saveData === true) {
                    this._preloadBypassed = true;
                    console.log('[Router] Preload bypassed: Save-Data enabled.');
                    return;
                }
                const et = navigator.connection.effectiveType;
                if (et === 'slow-2g' || et === '2g') {
                    this._preloadBypassed = true;
                    console.log('[Router] Preload bypassed: slow connection (' + et + ').');
                    return;
                }
            }

            const executePreload = async () => {
                // Prioritize high-frequency adjacent routes first
                const priorityKeys = [
                    'daily-actions',
                    'subjects',
                    'schedule',
                    'spectra-analytics',
                    'monthly-target-setup',
                    'timer',
                    'paces-management',
                    'master-config',
                    'outcome',
                    'exam'
                ];

                for (const key of priorityKeys) {
                    const route = this.routes[key];
                    if (!route) continue;

                    try {
                        let container = document.getElementById(route.containerId);
                        if (!container) {
                            const mainPanel = document.getElementById('main-content-panel');
                            if (mainPanel) {
                                container = document.createElement('div');
                                container.id = route.containerId;
                                container.className = 'hidden space-y-6 md:space-y-8 animate-page-enter';
                                mainPanel.appendChild(container);
                            }
                        }

                        // Load CSS in background
                        this.loadCss(route.cssUrl, route.cssId);

                        // Load HTML and populate if container is empty
                        if (container && (!container.hasChildNodes() || container.children.length === 0 || container.innerHTML.trim() === '')) {
                            const html = await this.loadHtml(route.htmlUrl);
                            if (html && container && (!container.hasChildNodes() || container.children.length === 0 || container.innerHTML.trim() === '')) {
                                container.innerHTML = html;
                            }
                        }

                        // Load script module
                        await this.loadJs(route.jsUrl, route.jsId);

                        // NOTE: Do not invoke route.onMount() during background preloading.
                        // Page lifecycle mounting must only execute when the page is actively navigated to via loadPage().
                    } catch (err) {
                        console.warn(`[Router] Preload warning for ${key}:`, err);
                    }
                }
            };

            if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
                window.requestIdleCallback(() => { executePreload(); }, { timeout: 2000 });
            } else {
                setTimeout(executePreload, 250);
            }
        },

        /**
         * Initialize the router and seamlessly mount the initial page.
         */
        init: function () {
            // Bind global switchPage to Router.loadPage
            window.switchPage = (pageId, sectionId) => {
                return this.loadPage(pageId, sectionId);
            };

            // Wire browser Back/Forward navigation via PopState
            if (!this._popStateInitialized && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                this._popStateInitialized = true;
                window.addEventListener('popstate', (e) => {
                    const targetPageId = (e && e.state && e.state.pageId)
                        ? e.state.pageId
                        : this.getPageIdFromPath(window.location ? (window.location.pathname || window.location.hash) : '/');
                    const targetSectionId = (e && e.state) ? e.state.sectionId : null;
                    this.loadPage(targetPageId, targetSectionId, { updateHistory: false });
                });
            }

            // Wire predictive intent preloading on pointerenter, touchstart, and keyboard focus
            if (!this._intentListenersInitialized && typeof document !== 'undefined') {
                this._intentListenersInitialized = true;
                const onIntent = (e) => {
                    const navEl = e.target && e.target.closest ? e.target.closest('[data-switch-page], #header-exam-countdown-compact-mobile') : null;
                    if (navEl) {
                        const targetId = navEl.id === 'header-exam-countdown-compact-mobile'
                            ? 'exam'
                            : navEl.getAttribute('data-switch-page');
                        if (targetId && targetId !== this.activePageId) {
                            this.preloadRoute(targetId);
                        }
                    }
                };
                document.addEventListener('pointerenter', onIntent, { capture: true, passive: true });
                document.addEventListener('touchstart', onIntent, { capture: true, passive: true });
                document.addEventListener('focusin', onIntent, { capture: true, passive: true });
            }

            // Wire click delegation for navigation triggers
            if (!this._navListenersInitialized && typeof document !== 'undefined') {
                this._navListenersInitialized = true;
                document.addEventListener('click', (e) => {
                    const navEl = e.target.closest('[data-switch-page], #header-exam-countdown-compact-mobile');
                    if (navEl) {
                        if (navEl.id === 'header-exam-countdown-compact-mobile') {
                            e.preventDefault();
                            this.loadPage('exam');
                            return;
                        }
                        const pageId = navEl.getAttribute('data-switch-page');
                        const sectionId = navEl.getAttribute('data-nav-section') || null;
                        if (pageId) {
                            e.preventDefault();
                            // INSTANT visual feedback: immediately update nav button styles
                            this.updateNavButtons(pageId);
                            // On mobile, immediately close drawer
                            if (typeof window !== 'undefined' && window.innerWidth < 768 && typeof window.closeMobileSidebar === 'function') {
                                window.closeMobileSidebar();
                            }
                            this.loadPage(pageId, sectionId);
                        }
                    }
                });
            }

            // Resolve initial route from URL path (deep-linking support)
            const currentPath = (typeof window !== 'undefined' && window.location) ? (window.location.pathname || '') : '';
            const isRoot = !currentPath || currentPath === '/' || currentPath === '/index.html' || currentPath === '/index';
            const initialPageId = (typeof window !== 'undefined' && window.location && (window.location.pathname || window.location.hash))
                ? this.getPageIdFromPath(window.location.pathname || window.location.hash)
                : 'dashboard';

            this.activePageId = initialPageId;
            this.updateNavButtons(initialPageId);

            // Replace initial history state so Back button knows the starting entry
            // AND immediately normalizes the browser address bar (strips trailing slashes, %20, aliases)
            // Preserves '/' cleanly when visited at root, while deep links preserve their dedicated route
            if (typeof window !== 'undefined' && window.history && typeof window.history.replaceState === 'function' && window.location && window.location.protocol !== 'file:') {
                try {
                    const canonicalPath = isRoot ? '/' : this.getPathForPageId(initialPageId);
                    window.history.replaceState({ pageId: initialPageId }, '', canonicalPath);
                } catch (e) {
                    // Ignore in sandboxed environments
                }
            }

            // Pre-load and mount the initial page container
            const initialRoute = this.routes[initialPageId];
            const initialContainerId = initialRoute ? initialRoute.containerId : 'page-dashboard';
            if (document.getElementById(initialContainerId) || document.getElementById('page-dashboard')) {
                this.loadPage(initialPageId, null, { updateHistory: false, replace: true, forceAnimation: true }).then(() => {
                    this.preloadAllRoutes();
                });
            } else {
                this.preloadAllRoutes();
            }
        }
    };

    // Expose Router on window
    if (typeof window !== 'undefined') {
        window.Router = Router;
    }

    // Auto-init when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                Router.init();
            });
        } else {
            Router.init();
        }
    }
})();
