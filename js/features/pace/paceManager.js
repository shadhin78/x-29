/**
 * X-29 Module: features/pace/paceManager.js
 * Pace goal configuration & target editor:
 * - Pace goal CRUD (add, edit, delete, request delete)
 * - Timeline bundle configuration & dynamic target checklists
 * - Day allocation & Goal details modal inspection
 * - Pace trend line charts (required vs actual pace curves)
 * - Pace candlestick charts (daily completion & velocity interval candles)
 * - Dashboard header pace toggles & independent pace switches
 * - Pace Management page lifecycle coordinator
 */
(function (global) {
    'use strict';

    /**
     * Page Lifecycle & Manager
     */
    const PaceManagementPage = {
        isMounted: false,

        init: function () {
            this.mount();
        },

        mount: function () {
            this.isMounted = true;

            // 1. Sync global baseline & pace metrics if available
            if (typeof global.updateMetrics === 'function') {
                global.updateMetrics();
            }

            // 2. Initialize Add Goal form state and checklist
            if (typeof global.togglePaceBundleType === 'function') {
                global.togglePaceBundleType();
            }

            // 3. Render active timelines
            if (typeof global.renderPaceGoals === 'function') {
                const subjectStats = global.lastSubjectStats || (typeof global.updateMetrics === 'function' ? (global.updateMetrics(), global.lastSubjectStats) : {});
                global.renderPaceGoals(subjectStats || {});
            }
        },

        destroy: function () {
            this.isMounted = false;

            // Safely close any pace-related modals if open when navigating away
            if (typeof global.closeModal === 'function') {
                const modals = ['edit-pace-modal', 'pace-trend-modal', 'goal-details-modal', 'pace-candle-modal', 'edit-trends-pace-modal'];
                modals.forEach(m => {
                    const el = document.getElementById(m);
                    if (el && !el.classList.contains('hidden')) {
                        global.closeModal(m);
                    }
                });
            }
        }
    };

    /**
     * Renders active pace goals grid.
     *
     * @param {Object} [subjectStats]
     */
    function renderPaceGoals(subjectStats) {
        const container = document.getElementById('pace-goals-container');
        if (!container) return;

        const paceGoalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
        if (!paceGoalsList || paceGoalsList.length === 0) {
            container.innerHTML = '<div class="col-span-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl"><span class="text-2xl mb-2 grayscale opacity-50">🎯</span><p class="text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">No custom pace goals set. Add one below to track specific deadlines.</p></div>';
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const currentFilter = (AppStateRef && AppStateRef.currentFilter) || 'All';
        const formatDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.formatDateResponsive === 'function')
            ? global.Utils.formatDateResponsive
            : (d => d ? new Date(d).toLocaleDateString('en-GB') : '');

        let html = '';
        paceGoalsList.forEach(goal => {
            const stats = typeof global.calculatePaceGoalStats === 'function'
                ? global.calculatePaceGoalStats(goal, subjectStats)
                : null;
            if (!stats) return;

            const {
                total, completed, remaining, percentage,
                startDate, targetDate,
                reqPaceVal, curPaceVal, reqPace, curPace,
                finishDisplay, timeGoalCountdownStr, estDaysNeededStr,
                diffDaysTG, daysElapsed, daysRemaining
            } = stats;

            const isBehind = stats.isBehind !== undefined ? stats.isBehind : (remaining > 0 && today >= startDate && curPaceVal < reqPaceVal);
            const statusKey = stats.status || (remaining <= 0 ? 'finished' : (curPaceVal <= 0 ? (today < startDate ? 'future' : (today > targetDate ? 'overdue' : 'no-data')) : (today > targetDate ? 'overdue' : (curPaceVal >= reqPaceVal ? 'on-track' : 'behind'))));

            const reqColor = isBehind ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400';
            const reqBg = isBehind ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/40' : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/40';

            let isActiveFilter = false;
            if (currentFilter !== 'All') {
                const allSubs = typeof global.getAllSubjects === 'function' ? global.getAllSubjects() : [];
                const sObj = allSubs.find(s => s.subject === currentFilter);
                const filterProg = sObj ? sObj.program : currentFilter;

                if (goal.type === 'bundle') {
                    if (goal.subjects && (goal.subjects.includes(currentFilter) || goal.program === currentFilter)) isActiveFilter = true;
                    if (goal.programs && (goal.programs.includes(currentFilter) || goal.programs.includes(filterProg))) isActiveFilter = true;
                } else if (goal.type === 'program' && goal.target === currentFilter) {
                    isActiveFilter = true;
                } else if (goal.type === 'subject' && goal.target === currentFilter) {
                    isActiveFilter = true;
                } else if (goal.type === 'global') {
                    isActiveFilter = true;
                }
            } else if (goal.type === 'global') {
                isActiveFilter = true;
            }

            let dotColor = 'bg-orange-500';
            let scopeLabel = 'BUNDLE GOAL';
            if (goal.type === 'global') {
                dotColor = 'bg-blue-500';
                scopeLabel = 'GLOBAL GOAL';
            } else if (goal.type === 'program') {
                dotColor = 'bg-violet-500';
                scopeLabel = 'PROGRAM GOAL';
            } else if (goal.type === 'subject') {
                dotColor = 'bg-cyan-500';
                scopeLabel = 'SUBJECT GOAL';
            }

            let subText = '';
            if (goal.type === 'bundle') {
                if (goal.subjects && goal.subjects.length > 0) subText = goal.subjects.join(', ');
                else if (goal.programs && goal.programs.length > 0) subText = goal.programs.join(', ');
            } else if (goal.type === 'program') {
                subText = `All modules in ${goal.target}`;
            } else if (goal.type === 'subject') {
                subText = goal.target;
            } else if (goal.type === 'global') {
                const isManual = Boolean((goal.subjects && goal.subjects.length > 0) || (goal.secondaryPaces && goal.secondaryPaces.length > 0));
                if (isManual) {
                    const subCount = (goal.subjects && goal.subjects.length) || 0;
                    const secCount = (goal.secondaryPaces && goal.secondaryPaces.length) || 0;
                    if (subCount > 0 && secCount > 0) {
                        subText = `${subCount} Subjects + ${secCount} Secondary Paces`;
                    } else if (subCount > 0) {
                        subText = `${subCount} Selected Subjects`;
                    } else if (secCount > 0) {
                        subText = `${secCount} Linked Secondary Paces`;
                    } else {
                        subText = `Manual Global Target`;
                    }
                } else {
                    subText = `All subjects & active curriculum`;
                }
            }

            const formatLongDate = (d) => {
                if (!d) return '';
                const dt = (d instanceof Date && !isNaN(d)) ? d : new Date(d);
                return !isNaN(dt) ? dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
            };

            const reqIsWarning = isBehind || statusKey === 'overdue' || (remaining > 0 && curPaceVal < reqPaceVal);
            const reqBoxBg = reqIsWarning ? 'bg-[#29131d] border-rose-500/40' : 'bg-[#0b2424] border-emerald-500/40';
            const reqTextCls = reqIsWarning ? 'text-rose-500' : 'text-emerald-400';
            const reqUnitCls = reqIsWarning ? 'text-rose-500/80' : 'text-emerald-500/80';

            const safeDiffDaysTG = diffDaysTG !== undefined ? diffDaysTG : (daysRemaining !== undefined ? daysRemaining : Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
            const safeDaysElapsed = daysElapsed !== undefined ? daysElapsed : Math.max(0, Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1);

            let countdownTextUpper = '--';
            if (remaining <= 0) {
                countdownTextUpper = 'COMPLETED';
            } else if (today < startDate) {
                const daysToStart = Math.max(1, Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)));
                countdownTextUpper = `STARTS IN ${daysToStart} DAYS`;
            } else if (safeDiffDaysTG > 0) {
                countdownTextUpper = `${safeDiffDaysTG} DAYS LEFT`;
            } else if (safeDiffDaysTG === 0) {
                countdownTextUpper = 'DUE TODAY';
            } else {
                countdownTextUpper = `${Math.abs(safeDiffDaysTG)} DAYS OVERDUE`;
            }

            let daysPassedUpper = '--';
            if (today < startDate) {
                daysPassedUpper = 'NOT STARTED';
            } else {
                const elapsedDays = Math.max(0, safeDaysElapsed);
                const passedFmt = (typeof global.Utils !== 'undefined' && typeof global.Utils.formatDaysPassed === 'function')
                    ? global.Utils.formatDaysPassed(elapsedDays)
                    : `${elapsedDays} Days`;
                daysPassedUpper = `${passedFmt.toUpperCase()} PASSED`;
            }

            let cleanDaysNeededStr = '--';
            let finishDateFormatted = '--';
            if (total === 0) {
                cleanDaysNeededStr = 'No Target';
                finishDateFormatted = 'No Target';
            } else if (remaining <= 0) {
                cleanDaysNeededStr = '0 Days Needed';
                finishDateFormatted = 'Finished';
            } else if (curPaceVal <= 0) {
                cleanDaysNeededStr = today < startDate ? 'Future' : 'No Data';
                finishDateFormatted = today < startDate ? 'Future' : 'No Data';
            } else {
                const daysNeededVal = Math.ceil(remaining / curPaceVal);
                cleanDaysNeededStr = `${daysNeededVal} Days Needed`;
                if (stats.projectedDate instanceof Date && !isNaN(stats.projectedDate)) {
                    finishDateFormatted = stats.projectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
                } else {
                    finishDateFormatted = finishDisplay || '--';
                }
            }

            html += `
                <div class="bg-[#131b2e] p-5 sm:p-6 rounded-3xl ${isActiveFilter ? 'border-2 border-orange-500 shadow-xl ring-2 ring-orange-500/20 shadow-orange-500/10' : 'border border-slate-700/60 hover:border-slate-600 shadow-lg'} flex flex-col justify-between relative group transition-all">
                    ${isActiveFilter ? '<div class="absolute -top-3 right-6 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded shadow-sm">ACTIVE TIMELINE</div>' : ''}
                    
                    <!-- Header: Badges & Action Buttons -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <div class="flex items-center">
                                <span class="inline-block w-2.5 h-2.5 rounded-full ${dotColor} mr-2"></span>
                                <span class="text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-400">${scopeLabel}</span>
                            </div>
                            <div class="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onclick="window.openPaceTrendModal('${goal.id}')" class="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95" title="View Burn-Up Trajectory Chart">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
                                </button>
                                <button onclick="window.openPaceCandleChartModal('${goal.id}')" class="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95" title="View Velocity Candlestick Chart">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                </button>
                                <button onclick="window.openGoalDetailsModal('${goal.id}')" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95" title="View Target Details">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                </button>
                                <button onclick="window.openEditPaceModal('${goal.id}')" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95" title="Edit Goal">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                                </button>
                                <button onclick="window.requestDeletePaceGoal('${goal.id}')" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95" title="Remove Goal">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </div>

                        <h4 class="font-black text-xl sm:text-2xl text-white truncate tracking-tight mt-2">${goal.target}</h4>
                        <p class="text-xs font-bold text-slate-400 tracking-wider mt-1">
                            Timeline: <span class="text-blue-400 font-bold">${formatLongDate(startDate)}</span> - <span class="text-orange-400 font-bold">${formatLongDate(targetDate)}</span>
                        </p>
                        ${subText ? `<p class="text-[11px] font-bold text-blue-400/90 truncate mt-1" title="${subText}">${subText}</p>` : ''}
                    </div>

                    <!-- Progress Bar & Redesigned Velocity / Required / Est Part -->
                    <div class="mt-4 sm:mt-5">
                        <div class="flex justify-between items-end mb-1.5 text-xs font-bold">
                            <span class="text-slate-300 font-bold">${Math.round(completed)} / ${total} Ch</span>
                            <span class="text-slate-400 font-bold">${percentage}%</span>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50 mb-4">
                            <div class="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-500 to-amber-500" style="width: ${percentage}%;"></div>
                        </div>

                        <!-- 2-Tier Velocity / Required / Est Noticeable Section -->
                        <div class="grid grid-cols-2 gap-3 mb-3">
                            <!-- REQ PACE Box -->
                            <div class="p-3.5 sm:p-4 rounded-2xl border ${reqBoxBg} flex flex-col justify-between">
                                <div>
                                    <span class="block text-[9px] md:text-[10px] font-black uppercase tracking-wider ${reqTextCls}">REQ PACE</span>
                                    <div class="text-xl sm:text-2xl font-black ${reqTextCls} mt-1">${reqPace} <span class="text-[10px] sm:text-xs font-bold ${reqUnitCls}">ch/d</span></div>
                                </div>
                                <div class="text-[9px] md:text-[10px] font-black uppercase tracking-wider ${reqTextCls} mt-2.5 sm:mt-3">${countdownTextUpper}</div>
                            </div>

                            <!-- CUR PACE Box -->
                            <div class="p-3.5 sm:p-4 rounded-2xl border border-slate-700/60 bg-[#162033] flex flex-col justify-between">
                                <div>
                                    <span class="block text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400">CUR PACE</span>
                                    <div class="text-xl sm:text-2xl font-black text-white mt-1">${curPace} <span class="text-[10px] sm:text-xs font-bold text-slate-400">ch/d</span></div>
                                </div>
                                <div class="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-emerald-400 mt-2.5 sm:mt-3">${daysPassedUpper}</div>
                            </div>
                        </div>

                        <!-- EST. FINISH Box (Full Width) -->
                        <div class="p-3.5 sm:p-4 rounded-2xl border border-slate-700/60 bg-[#162033] flex items-center justify-between">
                            <div>
                                <span class="block text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400">EST. FINISH</span>
                                <span class="block text-[11px] sm:text-xs font-black text-amber-500 mt-0.5">${cleanDaysNeededStr}</span>
                            </div>
                            <div class="text-sm sm:text-base font-black text-white text-right">${finishDateFormatted}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    /**
     * Toggles bundle configuration mode (programs vs subjects vs global) in Add Pace Goal form.
     */
    function togglePaceBundleType() {
        const bundleTypeSelect = document.getElementById('add-pace-bundle-type');
        const bundleProgsRadio = document.getElementById('pace-bundle-type-progs');
        const container = document.getElementById('add-pace-subjects-container') || document.getElementById('pace-bundle-items-container');
        if (!container) return;

        const checklistSection = document.getElementById('add-pace-checklist-section');
        const checklistLabel = document.getElementById('add-pace-checklist-label');
        const nameContainer = document.getElementById('add-pace-name-container') || document.getElementById('pace-bundle-name-container');
        const nameLabel = nameContainer ? nameContainer.querySelector('label') : null;
        const nameInput = document.getElementById('add-pace-name') || document.getElementById('pace-bundle-name');

        let mode = 'subjects';
        if (bundleTypeSelect) {
            mode = bundleTypeSelect.value || 'subjects';
        } else if (bundleProgsRadio) {
            mode = bundleProgsRadio.checked ? 'programs' : 'subjects';
        }

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const tracksList = global.tracks || (AppStateRef && AppStateRef.tracks) || [];
        const customPrograms = global.customPrograms || (AppStateRef && AppStateRef.customPrograms) || {};
        const syllabusStructure = global.syllabusStructure || (AppStateRef && AppStateRef.syllabusStructure) || {};
        const passedItems = global.passedItems || (AppStateRef && AppStateRef.passedItems) || { programs: [], subjects: [] };

        if (mode === 'global') {
            if (nameContainer) nameContainer.classList.remove('hidden');
            if (nameLabel) nameLabel.innerHTML = 'Goal Name <span class="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span>';
            if (nameInput) nameInput.placeholder = 'e.g. Global Overall Goal (Optional)';
            if (checklistSection) checklistSection.classList.remove('hidden');
            if (checklistLabel) checklistLabel.textContent = 'Configure Global Pace (Subjects & Secondary Paces)';

            let html = `
                <!-- Part 1: All Subjects inside Program Dropdowns -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm"></span>
                            <h5 class="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Part 1: Subjects Inside Program Dropdowns</h5>
                        </div>
                        <span class="text-[9px] font-bold text-orange-500 uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200/40 dark:border-orange-800/40">Subject-Wise</span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">Expand programs to pick specific subjects to include in this global pace target.</p>
                    <div class="space-y-2 w-full">
            `;

            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    customPrograms[track.id].forEach(prog => {
                        const progName = prog.name || prog;
                        const subs = (syllabusStructure[track.id] || []).filter(s => s.program === progName);
                        if (subs.length > 0) {
                            html += `
                                <details class="bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm group overflow-hidden transition-all duration-150 mb-2">
                                    <summary class="cursor-pointer font-black text-[11px] md:text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 p-3 outline-none select-none list-none flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors duration-75 [&::-webkit-details-marker]:hidden">
                                        <div class="flex items-center space-x-2.5">
                                            <svg class="w-3.5 h-3.5 text-orange-500 group-open:rotate-90 transition-transform duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                                            <span class="font-black text-slate-800 dark:text-slate-100">${progName}</span>
                                            <span class="bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black px-2 py-0.5 rounded-md text-[9px] border border-orange-500/20">${subs.length} Subs</span>
                                        </div>
                                        <span class="text-[9px] font-bold text-slate-400 group-open:text-orange-500 transition-colors">Expand</span>
                                    </summary>
                                    <div class="p-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/40">
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            `;
                            subs.forEach(s => {
                                let displaySub = s.subject.replace(progName + ' - ', '').replace(progName + ' ', '');
                                const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(s.subject)) || (passedItems.programs && passedItems.programs.includes(progName)));
                                if (isPassed) {
                                    html += `
                                        <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${s.subject} (Passed - cannot be added to pace)">
                                            <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                <input type="checkbox" value="${s.subject}" disabled class="pace-bundle-cb pace-global-subject-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                                <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${s.subject}">${displaySub}</del>
                                            </div>
                                            <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                        </label>`;
                                } else {
                                    html += `
                                        <label class="flex items-center space-x-2 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500/50 active:scale-95 transition-all shadow-sm">
                                            <input type="checkbox" value="${s.subject}" class="pace-bundle-cb pace-global-subject-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all">
                                            <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${s.subject}">${displaySub}</span>
                                        </label>`;
                                }
                            });
                            html += `</div></div></details>`;
                        }
                    });
                }
            });
            html += `</div></div>`;

            // Part 2: Secondary Paces
            html += `
                <div class="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm"></span>
                            <h5 class="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Part 2: Secondary Paces</h5>
                        </div>
                        <span class="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200/40 dark:border-indigo-800/40">Link Timelines</span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-3">Optionally link existing pace goals. You can set global pace by subjects above, by secondary paces here, or combine both.</p>
            `;

            const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
            const otherGoals = goalsList.filter(g => g.type !== 'global');

            if (otherGoals.length > 0) {
                html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">`;
                otherGoals.forEach(g => {
                    const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
                        ? global.Utils.parseDateSafe
                        : (d => new Date(d));
                    const deadlineStr = g.deadline ? (parseDate(g.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })) : '';
                    html += `
                        <label class="flex items-center justify-between space-x-2.5 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 active:scale-95 transition-all shadow-sm group">
                            <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                                <input type="checkbox" value="${g.id}" class="pace-sec-cb form-checkbox h-4 w-4 text-indigo-500 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-500 transition-all">
                                <div class="flex flex-col min-w-0">
                                    <span class="text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-400 transition-colors" title="${g.target}">${g.target}</span>
                                    ${deadlineStr ? `<span class="text-[9px] text-slate-400 font-bold truncate">Due: ${deadlineStr}</span>` : ''}
                                </div>
                            </div>
                            <span class="text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">${g.type || 'Pace'}</span>
                        </label>`;
                });
                html += `</div>`;
            } else {
                html += `
                    <div class="p-3.5 bg-slate-100/60 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/70 text-center">
                        <span class="text-xs mb-1 block">📌</span>
                        <p class="text-[10px] font-bold text-slate-400">No other timeline goals created yet. You can set this global pace using subjects above, and link secondary paces later if needed.</p>
                    </div>`;
            }
            html += `</div>`;
            container.innerHTML = html;
            return;
        }

        if (mode === 'programs') {
            if (nameContainer) nameContainer.classList.remove('hidden');
            if (nameLabel) nameLabel.innerHTML = 'Goal Name';
            if (nameInput) nameInput.placeholder = 'e.g. Phase 1 Year Target';
            if (checklistSection) checklistSection.classList.remove('hidden');
            if (checklistLabel) checklistLabel.textContent = 'Select Programs to Include';

            let html = `<div class="grid grid-cols-2 gap-2 w-full">`;
            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    customPrograms[track.id].forEach(p => {
                        const pName = p.name || p;
                        const isPassed = Boolean(passedItems.programs && passedItems.programs.includes(pName));
                        if (isPassed) {
                            html += `
                                <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${pName} (Passed - cannot be added to pace)">
                                    <div class="flex items-center space-x-2 min-w-0 flex-1">
                                        <input type="checkbox" value="${pName}" disabled class="pace-bundle-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                        <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${pName}">${pName}</del>
                                    </div>
                                    <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                </label>`;
                        } else {
                            html += `
                                <label class="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm">
                                    <input type="checkbox" value="${pName}" class="pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all">
                                    <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${pName}">${pName}</span>
                                </label>`;
                        }
                    });
                }
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            // mode === 'subjects'
            if (nameContainer) nameContainer.classList.remove('hidden');
            if (nameLabel) nameLabel.innerHTML = 'Goal Name';
            if (nameInput) nameInput.placeholder = 'e.g. Phase 1 Year Target';
            if (checklistSection) checklistSection.classList.remove('hidden');
            if (checklistLabel) checklistLabel.textContent = 'Select Subjects to Include (Grouped by Program)';

            let html = `<div class="space-y-2 w-full">`;
            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    customPrograms[track.id].forEach(prog => {
                        const progName = prog.name || prog;
                        const subs = (syllabusStructure[track.id] || []).filter(s => s.program === progName);
                        if (subs.length > 0) {
                            html += `
                                <details class="bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm group overflow-hidden transition-all duration-150 mb-2">
                                    <summary class="cursor-pointer font-black text-[11px] md:text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 p-3 outline-none select-none list-none flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors duration-75 [&::-webkit-details-marker]:hidden">
                                        <div class="flex items-center space-x-2.5">
                                            <svg class="w-3.5 h-3.5 text-orange-500 group-open:rotate-90 transition-transform duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                                            <span class="font-black text-slate-800 dark:text-slate-100">${progName}</span>
                                            <span class="bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black px-2 py-0.5 rounded-md text-[9px] border border-orange-500/20">${subs.length} Subs</span>
                                        </div>
                                        <span class="text-[9px] font-bold text-slate-400 group-open:text-orange-500 transition-colors">Expand</span>
                                    </summary>
                                    <div class="p-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/40">
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            `;
                            subs.forEach(s => {
                                let displaySub = s.subject.replace(progName + ' - ', '').replace(progName + ' ', '');
                                const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(s.subject)) || (passedItems.programs && passedItems.programs.includes(progName)));
                                if (isPassed) {
                                    html += `
                                        <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${s.subject} (Passed - cannot be added to pace)">
                                            <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                <input type="checkbox" value="${s.subject}" disabled class="pace-bundle-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                                <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${s.subject}">${displaySub}</del>
                                            </div>
                                            <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                        </label>`;
                                } else {
                                    html += `
                                        <label class="flex items-center space-x-2 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500/50 active:scale-95 transition-all shadow-sm">
                                            <input type="checkbox" value="${s.subject}" class="pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all">
                                            <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${s.subject}">${displaySub}</span>
                                        </label>`;
                                }
                            });
                            html += `</div></div></details>`;
                        }
                    });
                }
            });
            html += `</div>`;
            container.innerHTML = html;
        }
    }

    /**
     * Updates pace target selection input based on type selection.
     */
    function updatePaceSubjects() {
        const typeSelect = document.getElementById('pace-type') || document.getElementById('add-pace-bundle-type');
        const targetSelect = document.getElementById('pace-target');
        const singleContainer = document.getElementById('pace-single-target-container');
        const bundleContainer = document.getElementById('pace-bundle-container');
        const nameContainer = document.getElementById('pace-bundle-name-container') || document.getElementById('add-pace-name-container');

        if (!typeSelect) return;
        const type = typeSelect.value;

        if (type === 'bundle' || type === 'subjects' || type === 'programs' || type === 'global') {
            if (singleContainer) singleContainer.classList.add('hidden');
            if (bundleContainer) bundleContainer.classList.remove('hidden');
            if (nameContainer) nameContainer.classList.remove('hidden');
            togglePaceBundleType();
            return;
        }

        if (singleContainer) singleContainer.classList.remove('hidden');
        if (bundleContainer) bundleContainer.classList.add('hidden');
        if (nameContainer) nameContainer.classList.add('hidden');

        if (!targetSelect) return;
        let html = '';

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const tracksList = global.tracks || (AppStateRef && AppStateRef.tracks) || [];
        const customPrograms = global.customPrograms || (AppStateRef && AppStateRef.customPrograms) || {};
        const syllabusStructure = global.syllabusStructure || (AppStateRef && AppStateRef.syllabusStructure) || {};
        const passedItems = global.passedItems || (AppStateRef && AppStateRef.passedItems) || { programs: [], subjects: [] };

        if (type === 'subject') {
            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    customPrograms[track.id].forEach(prog => {
                        const progName = prog.name || prog;
                        const subs = (syllabusStructure[track.id] || []).filter(s => s.program === progName);
                        if (subs.length > 0) {
                            html += `<optgroup label="${track.name} - ${progName}">`;
                            subs.forEach(s => {
                                const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(s.subject)) || (passedItems.programs && passedItems.programs.includes(progName)));
                                if (isPassed) {
                                    html += `<option value="${s.subject}" disabled>${s.subject} (Passed)</option>`;
                                } else {
                                    html += `<option value="${s.subject}">${s.subject}</option>`;
                                }
                            });
                            html += `</optgroup>`;
                        }
                    });
                }
            });
        } else if (type === 'program') {
            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    html += `<optgroup label="${track.name}">`;
                    customPrograms[track.id].forEach(p => {
                        const pName = p.name || p;
                        const isPassed = Boolean(passedItems.programs && passedItems.programs.includes(pName));
                        if (isPassed) {
                            html += `<option value="${pName}" disabled>${pName} (Passed)</option>`;
                        } else {
                            html += `<option value="${pName}">${pName}</option>`;
                        }
                    });
                    html += `</optgroup>`;
                }
            });
        }
        targetSelect.innerHTML = html;
    }

    /**
     * Creates and adds a new pace goal from form inputs.
     */
    function addPaceGoal() {
        const typeSelect = (document.getElementById('add-pace-bundle-type') && document.getElementById('add-pace-bundle-type').value)
            ? document.getElementById('add-pace-bundle-type')
            : (document.getElementById('pace-type') || document.getElementById('add-pace-bundle-type'));
        const rawType = (typeSelect && typeSelect.value) ? typeSelect.value : 'subjects';

        const deadlineInput = (document.getElementById('add-pace-date') && document.getElementById('add-pace-date').value)
            ? document.getElementById('add-pace-date')
            : (document.getElementById('pace-deadline') || document.getElementById('add-pace-date'));

        const startDateInput = (document.getElementById('add-pace-start') && document.getElementById('add-pace-start').value)
            ? document.getElementById('add-pace-start')
            : (document.getElementById('pace-start-date') || document.getElementById('add-pace-start'));

        const toast = (typeof global.showToast === 'function') ? global.showToast : console.log;

        if (!deadlineInput || !deadlineInput.value) {
            toast('Please choose a valid deadline date!', 'error');
            return;
        }
        const deadline = deadlineInput.value;

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const defaultPlanStart = (AppStateRef && AppStateRef.PLAN_START_DATE) ? AppStateRef.PLAN_START_DATE : '2026-01-01';
        let startDate = (startDateInput && startDateInput.value) ? startDateInput.value : defaultPlanStart;

        const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
            ? global.Utils.parseDateSafe
            : (d => new Date(d));

        if (parseDate(startDate) >= parseDate(deadline)) {
            toast('Start date must be before the deadline!', 'error');
            return;
        }

        let type = 'bundle';
        let target = '';
        let bundlePrograms = null;
        let bundleSubjects = null;
        let secondaryPaces = null;

        const nameInput = (document.getElementById('add-pace-name') && document.getElementById('add-pace-name').value)
            ? document.getElementById('add-pace-name')
            : (document.getElementById('pace-bundle-name') || document.getElementById('add-pace-name'));

        if (rawType === 'subjects') {
            type = 'bundle';
            const bundleName = nameInput ? nameInput.value.trim() : '';
            if (!bundleName) {
                toast('Please enter a name for this timeline goal!', 'error');
                return;
            }
            target = bundleName;
            const checkedBoxes = Array.from(document.querySelectorAll('.pace-bundle-cb:checked'));
            if (checkedBoxes.length === 0) {
                toast('Please select at least one subject for the bundle!', 'error');
                return;
            }
            bundleSubjects = checkedBoxes.map(cb => cb.value);
        } else if (rawType === 'programs') {
            type = 'bundle';
            const bundleName = nameInput ? nameInput.value.trim() : '';
            if (!bundleName) {
                toast('Please enter a name for this timeline goal!', 'error');
                return;
            }
            target = bundleName;
            const checkedBoxes = Array.from(document.querySelectorAll('.pace-bundle-cb:checked'));
            if (checkedBoxes.length === 0) {
                toast('Please select at least one program for the bundle!', 'error');
                return;
            }
            bundlePrograms = checkedBoxes.map(cb => cb.value);
        } else if (rawType === 'global') {
            type = 'global';
            const bundleName = nameInput ? nameInput.value.trim() : '';
            if (bundleName) {
                target = bundleName;
            } else {
                let defaultName = 'Global Overall Goal';
                let counter = 2;
                while (global.paceGoals && global.paceGoals.some(g => g.type === 'global' && g.target === defaultName)) {
                    defaultName = `Global Overall Goal ${counter++}`;
                }
                target = defaultName;
            }
            const checkedBoxes = Array.from(document.querySelectorAll('.pace-global-subject-cb:checked, .pace-bundle-cb:checked'));
            if (checkedBoxes.length > 0) {
                bundleSubjects = Array.from(new Set(checkedBoxes.map(cb => cb.value)));
            }
            const checkedSecs = Array.from(document.querySelectorAll('.pace-sec-cb:checked'));
            if (checkedSecs.length > 0) {
                secondaryPaces = Array.from(new Set(checkedSecs.map(cb => cb.value)));
            }
        } else if (rawType === 'bundle') {
            type = 'bundle';
            const bundleName = nameInput ? nameInput.value.trim() : '';
            if (!bundleName) {
                toast('Please enter a name for this bundled timeline!', 'error');
                return;
            }
            target = bundleName;
            const progsRadio = document.getElementById('pace-bundle-type-progs');
            const isProgMode = progsRadio ? progsRadio.checked : true;
            const checkedBoxes = Array.from(document.querySelectorAll('.pace-bundle-cb:checked'));
            if (checkedBoxes.length === 0) {
                toast(`Please select at least one ${isProgMode ? 'program' : 'subject'} for the bundle!`, 'error');
                return;
            }
            if (isProgMode) {
                bundlePrograms = checkedBoxes.map(cb => cb.value);
            } else {
                bundleSubjects = checkedBoxes.map(cb => cb.value);
            }
        } else {
            type = rawType;
            const targetSelect = document.getElementById('pace-target');
            if (targetSelect && targetSelect.value) {
                target = targetSelect.value;
            } else if (nameInput && nameInput.value) {
                target = nameInput.value.trim();
            } else {
                toast('Please choose a valid target!', 'error');
                return;
            }
        }

        if (!global.paceGoals) global.paceGoals = [];

        // Check duplicates
        const exists = global.paceGoals.some(g => g.type === type && g.target === target);
        if (exists) {
            toast('A pace goal for this target already exists!', 'warning');
            return;
        }

        const newGoal = {
            id: 'pace_' + Date.now(),
            type: type,
            target: target,
            deadline: deadline,
            startDate: startDate
        };

        if (bundlePrograms && bundlePrograms.length > 0) newGoal.programs = bundlePrograms;
        if (bundleSubjects && bundleSubjects.length > 0) newGoal.subjects = bundleSubjects;
        if (secondaryPaces && secondaryPaces.length > 0) newGoal.secondaryPaces = secondaryPaces;

        global.paceGoals.push(newGoal);
        if (AppStateRef) AppStateRef.paceGoals = global.paceGoals;

        if (global.FirebaseService && typeof global.FirebaseService.saveToCloud === 'function') {
            global.FirebaseService.saveToCloud();
        }

        if (typeof global.updateMetrics === 'function') {
            global.updateMetrics();
        }
        renderPaceGoals(global.lastSubjectStats || {});

        // Reset inputs
        const dl1 = document.getElementById('add-pace-date');
        const dl2 = document.getElementById('pace-deadline');
        if (dl1) dl1.value = '';
        if (dl2) dl2.value = '';

        const nm1 = document.getElementById('add-pace-name');
        const nm2 = document.getElementById('pace-bundle-name');
        if (nm1) nm1.value = '';
        if (nm2) nm2.value = '';
        togglePaceBundleType();

        toast(`Pace goal "${target}" successfully added!`, 'success');
    }

    /**
     * Confirms deletion of a pace goal.
     *
     * @param {string} id
     */
    function requestDeletePaceGoal(id) {
        if (typeof global.openConfirmModal === 'function') {
            global.openConfirmModal('Remove Pace Goal', 'Are you sure you want to remove this custom pace target?', () => {
                deletePaceGoal(id);
            });
        } else {
            if (confirm('Are you sure you want to remove this custom pace target?')) {
                deletePaceGoal(id);
            }
        }
    }

    /**
     * Deletes a pace goal by ID.
     *
     * @param {string} id
     */
    function deletePaceGoal(id) {
        if (typeof global.recordItemDeletion === 'function') {
            global.recordItemDeletion('paceGoal', id);
        }
        if (!global.paceGoals) return;
        global.paceGoals = global.paceGoals.filter(g => g.id !== id);

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        if (AppStateRef) AppStateRef.paceGoals = global.paceGoals;

        if (global.FirebaseService && typeof global.FirebaseService.saveToCloud === 'function') {
            global.FirebaseService.saveToCloud();
        }

        if (typeof global.updateMetrics === 'function') {
            global.updateMetrics();
        }
        renderPaceGoals(global.lastSubjectStats || {});

        const toast = (typeof global.showToast === 'function') ? global.showToast : console.log;
        toast('Pace goal removed.', 'info');
    }

    /**
     * Opens edit modal for an existing pace goal.
     *
     * @param {string} goalId
     */
    function openEditPaceModal(goalId) {
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
        const goal = goalsList.find(g => g.id === goalId);
        if (!goal) return;
        global.editingPaceId = goalId;

        const nameContainer = document.getElementById('epm-name-container');
        const checklistSection = document.getElementById('epm-checklist-section');
        const nameInput = document.getElementById('edit-pace-name');
        const subjectsContainer = document.getElementById('edit-pace-subjects-container');
        const deadlineInput = document.getElementById('edit-pace-date') || document.getElementById('edit-pace-deadline');
        const startInput = document.getElementById('edit-pace-start') || document.getElementById('edit-pace-start-date');

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const tracksList = global.tracks || (AppStateRef && AppStateRef.tracks) || [];
        const customPrograms = global.customPrograms || (AppStateRef && AppStateRef.customPrograms) || {};
        const syllabusStructure = global.syllabusStructure || (AppStateRef && AppStateRef.syllabusStructure) || {};
        const passedItems = global.passedItems || (AppStateRef && AppStateRef.passedItems) || { programs: [], subjects: [] };

        const nameLabel = nameContainer ? nameContainer.querySelector('label') : null;

        if (goal.type === 'global') {
            if (nameContainer) nameContainer.classList.remove('hidden');
            if (nameLabel) nameLabel.innerHTML = 'Target Name <span class="text-slate-400 font-normal normal-case tracking-normal">(Optional)</span>';
            if (checklistSection) checklistSection.classList.remove('hidden');
            if (nameInput) {
                nameInput.value = goal.target || '';
                nameInput.placeholder = 'e.g. Global Overall Goal (Optional)';
            }

            let html = `
                <!-- Part 1: All Subjects inside Program Dropdowns -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm"></span>
                            <h5 class="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Part 1: Subjects Inside Program Dropdowns</h5>
                        </div>
                        <span class="text-[9px] font-bold text-orange-500 uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200/40 dark:border-orange-800/40">Subject-Wise</span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">Expand programs to pick or adjust specific subjects for this global target.</p>
                    <div class="space-y-2 w-full">
            `;

            tracksList.forEach(track => {
                if (customPrograms[track.id]) {
                    customPrograms[track.id].forEach(prog => {
                        const progName = prog.name || prog;
                        const subs = (syllabusStructure[track.id] || []).filter(s => s.program === progName);
                        if (subs.length > 0) {
                            const hasCheckedSub = subs.some(s => goal.subjects && goal.subjects.includes(s.subject));
                            html += `
                                <details class="bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm group overflow-hidden transition-all duration-150 mb-2" ${hasCheckedSub ? 'open' : ''}>
                                    <summary class="cursor-pointer font-black text-[11px] md:text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 p-3 outline-none select-none list-none flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors duration-75 [&::-webkit-details-marker]:hidden">
                                        <div class="flex items-center space-x-2.5">
                                            <svg class="w-3.5 h-3.5 text-orange-500 group-open:rotate-90 transition-transform duration-150 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                                            <span class="font-black text-slate-800 dark:text-slate-100">${progName}</span>
                                            <span class="bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black px-2 py-0.5 rounded-md text-[9px] border border-orange-500/20">${subs.length} Subs</span>
                                        </div>
                                        <span class="text-[9px] font-bold text-slate-400 group-open:text-orange-500 transition-colors">Expand</span>
                                    </summary>
                                    <div class="p-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/40">
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            `;
                            subs.forEach(s => {
                                const isChecked = (goal.subjects && goal.subjects.includes(s.subject)) ? 'checked' : '';
                                let displaySub = s.subject.replace(progName + ' - ', '').replace(progName + ' ', '');
                                const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(s.subject)) || (passedItems.programs && passedItems.programs.includes(progName)));
                                const isAlreadyInGoal = Boolean(goal.subjects && goal.subjects.includes(s.subject));

                                if (isPassed && !isAlreadyInGoal) {
                                    html += `
                                        <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${s.subject} (Passed - cannot be added to pace)">
                                            <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                <input type="checkbox" value="${s.subject}" disabled class="edit-pace-subject-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                                <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${s.subject}">${displaySub}</del>
                                            </div>
                                            <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                        </label>`;
                                } else if (isPassed && isAlreadyInGoal) {
                                    html += `
                                        <label class="flex items-center justify-between space-x-2 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 active:scale-95 transition-all shadow-sm pace-passed-included-item" title="${s.subject} (Passed - currently included in this pace)">
                                            <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                <input type="checkbox" value="${s.subject}" class="edit-pace-subject-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" checked>
                                                <del class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate line-through" title="${s.subject}">${displaySub}</del>
                                            </div>
                                            <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                        </label>`;
                                } else {
                                    html += `
                                        <label class="flex items-center space-x-2 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500/50 active:scale-95 transition-all shadow-sm">
                                            <input type="checkbox" value="${s.subject}" class="edit-pace-subject-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" ${isChecked}>
                                            <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${s.subject}">${displaySub}</span>
                                        </label>`;
                                }
                            });
                            html += `</div></div></details>`;
                        }
                    });
                }
            });
            html += `</div></div>`;

            // Part 2: Secondary Paces
            html += `
                <div class="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm"></span>
                            <h5 class="text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Part 2: Secondary Paces</h5>
                        </div>
                        <span class="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200/40 dark:border-indigo-800/40">Linked Timelines</span>
                    </div>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 mb-3">Link or unlink other pace goals to include in this global target.</p>
            `;
            const otherGoals = goalsList.filter(g => g.id !== goal.id && g.type !== 'global');
            if (otherGoals.length > 0) {
                html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">`;
                otherGoals.forEach(g => {
                    const isChecked = (goal.secondaryPaces && goal.secondaryPaces.includes(g.id)) ? 'checked' : '';
                    const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
                        ? global.Utils.parseDateSafe
                        : (d => new Date(d));
                    const deadlineStr = g.deadline ? (parseDate(g.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })) : '';
                    html += `
                        <label class="flex items-center justify-between space-x-2.5 cursor-pointer bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 active:scale-95 transition-all shadow-sm group">
                            <div class="flex items-center space-x-2.5 min-w-0 flex-1">
                                <input type="checkbox" value="${g.id}" class="edit-pace-sec-cb form-checkbox h-4 w-4 text-indigo-500 rounded border-slate-300 focus:ring-indigo-500 accent-indigo-500 transition-all" ${isChecked}>
                                <div class="flex flex-col min-w-0">
                                    <span class="text-[11px] md:text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-400 transition-colors" title="${g.target}">${g.target}</span>
                                    ${deadlineStr ? `<span class="text-[9px] text-slate-400 font-bold truncate">Due: ${deadlineStr}</span>` : ''}
                                </div>
                            </div>
                            <span class="text-[8px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50 shrink-0">${g.type || 'Pace'}</span>
                        </label>`;
                });
                html += `</div>`;
            } else {
                html += `
                    <div class="p-3 bg-slate-100/60 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/70 text-center">
                        <span class="text-xs mb-1 block">📌</span>
                        <p class="text-[10px] font-bold text-slate-400">No other timeline goals available to link.</p>
                    </div>`;
            }
            html += `</div>`;

            if (subjectsContainer) subjectsContainer.innerHTML = html;
        } else {
            if (nameContainer) nameContainer.classList.remove('hidden');
            if (nameLabel) nameLabel.innerHTML = 'Target Name';
            if (checklistSection) checklistSection.classList.remove('hidden');
            if (nameInput) {
                nameInput.value = goal.target;
                nameInput.placeholder = 'e.g. Phase 1 Year Target';
            }

            let html = '';
            const isProgramTarget = goal.type === 'program' || (goal.type === 'bundle' && goal.programs);

            if (isProgramTarget) {
                html += `<div class="grid grid-cols-2 gap-2 w-full">`;
                const selectedProgs = goal.programs || (goal.type === 'program' ? [goal.target] : []);
                tracksList.forEach(track => {
                    if (customPrograms[track.id]) {
                        customPrograms[track.id].forEach(p => {
                            const pName = p.name || p;
                            const isChecked = selectedProgs.some(sp => (sp.name || sp) === pName) ? 'checked' : '';
                            const isPassed = Boolean(passedItems.programs && passedItems.programs.includes(pName));
                            const isAlreadyInGoal = isChecked === 'checked';

                            if (isPassed && !isAlreadyInGoal) {
                                html += `
                                    <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${pName} (Passed - cannot be added to pace)">
                                        <div class="flex items-center space-x-2 min-w-0 flex-1">
                                            <input type="checkbox" value="${pName}" disabled class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                            <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${pName}">${pName}</del>
                                        </div>
                                        <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                    </label>`;
                            } else if (isPassed && isAlreadyInGoal) {
                                html += `
                                    <label class="flex items-center justify-between space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 active:scale-95 transition-all shadow-sm pace-passed-included-item" title="${pName} (Passed - currently included in this pace)">
                                        <div class="flex items-center space-x-2 min-w-0 flex-1">
                                            <input type="checkbox" value="${pName}" class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" checked>
                                            <del class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate line-through" title="${pName}">${pName}</del>
                                        </div>
                                        <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                    </label>`;
                            } else {
                                html += `
                                    <label class="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm">
                                        <input type="checkbox" value="${pName}" class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" ${isChecked}>
                                        <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${pName}">${pName}</span>
                                    </label>`;
                            }
                        });
                    }
                });
                html += `</div>`;
            } else {
                html += `<div class="space-y-3 w-full">`;
                const selectedSubs = goal.subjects || (goal.type === 'subject' ? [goal.target] : []);
                tracksList.forEach(track => {
                    if (customPrograms[track.id]) {
                        customPrograms[track.id].forEach(prog => {
                            const progName = prog.name || prog;
                            const subs = (syllabusStructure[track.id] || []).filter(s => s.program === progName);
                            if (subs.length > 0) {
                                html += `<div><div class="text-[10px] font-black uppercase text-slate-400 mb-1 pl-1">${progName}</div><div class="grid grid-cols-2 gap-2">`;
                                subs.forEach(s => {
                                    const isChecked = selectedSubs.includes(s.subject) ? 'checked' : '';
                                    let displaySub = s.subject.replace(progName + ' - ', '').replace(progName + ' ', '');
                                    const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(s.subject)) || (passedItems.programs && passedItems.programs.includes(progName)));
                                    const isAlreadyInGoal = isChecked === 'checked';

                                    if (isPassed && !isAlreadyInGoal) {
                                        html += `
                                            <label class="flex items-center justify-between space-x-2 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 bg-slate-100/60 dark:bg-slate-900/30 opacity-60 cursor-not-allowed shadow-none pace-passed-item" title="${s.subject} (Passed - cannot be added to pace)">
                                                <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                    <input type="checkbox" value="${s.subject}" disabled class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-slate-400 rounded border-slate-300 dark:border-slate-600 cursor-not-allowed">
                                                    <del class="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 truncate line-through" title="${s.subject}">${displaySub}</del>
                                                </div>
                                                <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                            </label>`;
                                    } else if (isPassed && isAlreadyInGoal) {
                                        html += `
                                            <label class="flex items-center justify-between space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 active:scale-95 transition-all shadow-sm pace-passed-included-item" title="${s.subject} (Passed - currently included in this pace)">
                                                <div class="flex items-center space-x-2 min-w-0 flex-1">
                                                    <input type="checkbox" value="${s.subject}" class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" checked>
                                                    <del class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate line-through" title="${s.subject}">${displaySub}</del>
                                                </div>
                                                <span class="text-[8px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">Passed</span>
                                            </label>`;
                                    } else {
                                        html += `
                                            <label class="flex items-center space-x-2 cursor-pointer bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm">
                                                <input type="checkbox" value="${s.subject}" class="edit-pace-bundle-cb form-checkbox h-4 w-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500 accent-orange-500 transition-all" ${isChecked}>
                                                <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title="${s.subject}">${displaySub}</span>
                                            </label>`;
                                    }
                                });
                                html += `</div></div>`;
                            }
                        });
                    }
                });
                html += `</div>`;
            }

            if (subjectsContainer) subjectsContainer.innerHTML = html;
        }

        const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
            ? global.Utils.parseDateSafe
            : (d => new Date(d));

        const defaultPlanStart = (AppStateRef && AppStateRef.PLAN_START_DATE) ? AppStateRef.PLAN_START_DATE : '2026-01-01';
        const startDt = goal.startDate ? parseDate(goal.startDate) : new Date(defaultPlanStart);
        const endDt = goal.deadline ? parseDate(goal.deadline) : new Date();

        const startIso = startDt.toISOString().split('T')[0];
        const endIso = endDt.toISOString().split('T')[0];

        if (startInput) startInput.value = startIso;
        if (deadlineInput) deadlineInput.value = endIso;

        const startFallback = document.getElementById('edit-pace-start-date');
        const deadlineFallback = document.getElementById('edit-pace-deadline');
        if (startFallback && startFallback !== startInput) startFallback.value = startIso;
        if (deadlineFallback && deadlineFallback !== deadlineInput) deadlineFallback.value = endIso;

        if (typeof global.openModal === 'function') {
            global.openModal('edit-pace-modal');
        }
    }

    /**
     * Saves changes from the edit pace modal.
     */
    function savePaceEdit() {
        if (!global.editingPaceId) return;
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
        const goal = goalsList.find(g => g.id === global.editingPaceId);
        if (!goal) return;

        const deadlineEl = (document.getElementById('edit-pace-deadline') && document.getElementById('edit-pace-deadline').value)
            ? document.getElementById('edit-pace-deadline')
            : document.getElementById('edit-pace-date');
        const startEl = (document.getElementById('edit-pace-start-date') && document.getElementById('edit-pace-start-date').value)
            ? document.getElementById('edit-pace-start-date')
            : document.getElementById('edit-pace-start');

        const deadline = deadlineEl ? deadlineEl.value : '';
        const startDate = startEl ? startEl.value : '';
        const toast = (typeof global.showToast === 'function') ? global.showToast : console.log;

        if (!deadline || !startDate) {
            toast('Please enter both a start date and a deadline!', 'error');
            return;
        }

        const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
            ? global.Utils.parseDateSafe
            : (d => new Date(d));

        if (parseDate(startDate) >= parseDate(deadline)) {
            toast('Start date must be before deadline!', 'error');
            return;
        }

        goal.deadline = deadline;
        goal.startDate = startDate;

        if (goal.type === 'global') {
            const checkedSubs = Array.from(document.querySelectorAll('.edit-pace-subject-cb:checked')).map(cb => cb.value);
            const checkedSecs = Array.from(document.querySelectorAll('.edit-pace-sec-cb:checked')).map(cb => cb.value);
            const newNameInput = document.getElementById('edit-pace-name');
            if (newNameInput) {
                const trimmed = newNameInput.value.trim();
                goal.target = trimmed || goal.target || 'Global Overall Goal';
            }
            if (checkedSubs.length > 0) {
                goal.subjects = Array.from(new Set(checkedSubs));
            } else {
                delete goal.subjects;
            }
            if (checkedSecs.length > 0) {
                goal.secondaryPaces = Array.from(new Set(checkedSecs));
            } else {
                delete goal.secondaryPaces;
            }
        } else {
            const newNameInput = document.getElementById('edit-pace-name');
            if (newNameInput) {
                const newName = newNameInput.value.trim();
                if (newName) goal.target = newName;
            }
            const allBoxes = Array.from(document.querySelectorAll('.edit-pace-bundle-cb'));
            const checkedItems = Array.from(document.querySelectorAll('.edit-pace-bundle-cb:checked')).map(cb => cb.value);
            if (allBoxes.length > 0 && checkedItems.length === 0) {
                toast('Please keep at least one item selected for this timeline!', 'error');
                return;
            }
            if (checkedItems.length > 0) {
                if (goal.programs || goal.type === 'program') {
                    goal.programs = checkedItems;
                } else if (goal.subjects || goal.type === 'subject') {
                    goal.subjects = checkedItems;
                }
            }
        }

        if (global.FirebaseService && typeof global.FirebaseService.saveToCloud === 'function') {
            global.FirebaseService.saveToCloud();
        }

        if (typeof global.updateMetrics === 'function') {
            global.updateMetrics();
        }
        renderPaceGoals(global.lastSubjectStats || {});

        if (typeof global.closeModal === 'function') {
            global.closeModal('edit-pace-modal');
        }

        toast('Pace goal dates updated!', 'success');
    }

    /**
     * Opens details modal showing daily breakdown and day allocation for a goal.
     *
     * @param {string} goalId
     */
    function openGoalDetailsModal(goalId) {
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
        const goal = (goalId ? goalsList.find(g => g.id === goalId) : null) || (goalsList.length > 0 ? goalsList[0] : null);
        if (!goal) return;

        if (!global.lastSubjectStats && typeof global.updateMetrics === 'function') {
            global.updateMetrics();
        }
        const subjectStats = global.lastSubjectStats || {};
        let stats = null;
        try {
            stats = typeof global.calculatePaceGoalStats === 'function'
                ? global.calculatePaceGoalStats(goal, subjectStats)
                : null;
        } catch (err) {
            console.warn('calculatePaceGoalStats failed in openGoalDetailsModal:', err);
        }
        if (!stats) return;

        const {
            total, completed, remaining, percentage,
            startDate, targetDate, reqPaceVal, curPaceVal
        } = stats;

        let scopeHtml = '';
        if (goal.type === 'global') {
            const isManual = Boolean((goal.subjects && goal.subjects.length > 0) || (goal.secondaryPaces && goal.secondaryPaces.length > 0));
            if (isManual) {
                const subCount = (goal.subjects && goal.subjects.length) || 0;
                const secCount = (goal.secondaryPaces && goal.secondaryPaces.length) || 0;
                let detailText = '';
                if (subCount > 0 && secCount > 0) {
                    detailText = `Manually configured with ${subCount} explicit Subject(s) and ${secCount} Secondary Pace(s).`;
                } else if (subCount > 0) {
                    detailText = `Manually configured with ${subCount} explicit Subject(s).`;
                } else {
                    detailText = `Manually linked with ${secCount} Secondary Pace(s).`;
                }
                scopeHtml = `<div class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl shadow-sm">${detailText}</div>`;
            } else {
                scopeHtml = `<div class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-xl shadow-sm">Comprehensive target encompassing all subjects in the active curriculum.</div>`;
            }
        } else if (goal.type === 'bundle') {
            if (goal.subjects && goal.subjects.length > 0) {
                scopeHtml = `<div class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 p-3 rounded-xl shadow-sm">Custom explicit selection of ${goal.subjects.length} subjects.</div>`;
            } else if (goal.programs && goal.programs.length > 0) {
                let pList = goal.programs.join(', ');
                scopeHtml = `<div class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 p-3 rounded-xl shadow-sm">Programs Scoped: <span class="text-violet-600 dark:text-violet-400">${pList}</span></div>`;
            }
        } else if (goal.type === 'program') {
            scopeHtml = `<div class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 p-3 rounded-xl shadow-sm">Program Scoped: <span class="text-violet-600 dark:text-violet-400">${goal.target}</span></div>`;
        }

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const passedItems = global.passedItems || (AppStateRef && AppStateRef.passedItems) || { programs: [], subjects: [] };

        const targetedSubjects = stats.targetedSubjects || (typeof global.getTargetedSubjectsForGoal === 'function' ? global.getTargetedSubjectsForGoal(goal) : new Set());
        const targetedSet = targetedSubjects instanceof Set ? targetedSubjects : new Set(targetedSubjects || []);

        let subjectsListHtml = '<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">';
        const allSubs = typeof global.getAllSubjects === 'function' ? global.getAllSubjects() : [];

        targetedSet.forEach(sub => {
            const sObj = allSubs.find(s => s && s.subject === sub);
            const subStat = (subjectStats && subjectStats[sub]) || { totalChapters: sObj ? (sObj.chapters || 0) : 0, effectiveChapters: 0 };
            const sChTotal = subStat.totalChapters || (sObj ? sObj.chapters : 0) || 0;
            const sChDone = Math.round(subStat.effectiveChapters || 0);
            const sPct = sChTotal > 0 ? Math.round((sChDone / sChTotal) * 100) : 0;
            const color = typeof global.getSubjectColor === 'function' ? global.getSubjectColor(sub) : '#10b981';
            const progName = sObj ? sObj.program : '';
            const displaySub = sub.replace(progName + ' - ', '').replace(progName + ' ', '');

            subjectsListHtml += `
                <div class="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-1.5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                    <div class="flex justify-between items-start mb-0.5">
                        <div class="flex flex-col pr-2 min-w-0">
                            <span class="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5 truncate">${progName || 'General'}</span>
                            <span class="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight truncate" title="${sub}">
                                <div class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 mb-[1px]" style="background-color: ${color}"></div>${displaySub}
                            </span>
                        </div>
                        <span class="text-[9px] md:text-[10px] font-black text-slate-500 shrink-0 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">${sChDone} / ${sChTotal}</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-auto">
                        <div class="h-full rounded-full transition-all duration-700 shadow-sm" style="width: ${sPct}%; background-color: ${color}"></div>
                    </div>
                </div>`;
        });
        subjectsListHtml += '</div>';

        if (targetedSet.size === 0) {
            subjectsListHtml = '<div class="p-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl"><p class="text-xs font-bold text-slate-400">No subjects currently mapped or active in this scope.</p></div>';
        }

        // Set values on elements
        const titleEl = document.getElementById('gdm-title');
        if (titleEl) titleEl.textContent = goal.target || 'Target Breakdown';
        if (typeof global.safeSetText === 'function') global.safeSetText('gdm-title', goal.target || 'Target Breakdown');

        const startStr = startDate ? (startDate instanceof Date ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : String(startDate)) : '';
        const endStr = targetDate ? (targetDate instanceof Date ? targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : String(targetDate)) : '';
        const timelineText = (startStr && endStr) ? `Timeline: ${startStr} - ${endStr}` : 'Timeline Dates';

        const datesEl = document.getElementById('gdm-dates');
        if (datesEl) datesEl.textContent = timelineText;
        if (typeof global.safeSetText === 'function') global.safeSetText('gdm-dates', timelineText);

        const reqValText = (typeof reqPaceVal === 'number') ? reqPaceVal.toFixed(2) : (stats.reqPace || '--');
        const statReqEl = document.getElementById('gdm-stat-req');
        if (statReqEl) statReqEl.textContent = reqValText;
        if (typeof global.safeSetText === 'function') global.safeSetText('gdm-stat-req', reqValText);

        const curValText = (typeof curPaceVal === 'number') ? curPaceVal.toFixed(2) : (stats.curPace || '--');
        const statCurEl = document.getElementById('gdm-stat-cur');
        if (statCurEl) statCurEl.textContent = curValText;
        if (typeof global.safeSetText === 'function') global.safeSetText('gdm-stat-cur', curValText);

        const remValText = (typeof remaining === 'number') ? remaining.toFixed(1) : (stats.remaining || '--');
        const statRemEl = document.getElementById('gdm-stat-rem');
        if (statRemEl) statRemEl.textContent = remValText;
        if (typeof global.safeSetText === 'function') global.safeSetText('gdm-stat-rem', remValText);

        const scopeListEl = document.getElementById('gdm-scope-list');
        if (scopeListEl) {
            scopeListEl.innerHTML = scopeHtml + subjectsListHtml;
        }

        // Legacy and automated test environment fallback elements
        const targetEl = document.getElementById('gdm-target');
        const totalChEl = document.getElementById('gdm-total-ch');
        const doneChEl = document.getElementById('gdm-done-ch');
        const remChEl = document.getElementById('gdm-rem-ch');
        const pctEl = document.getElementById('gdm-pct');
        const daysPassedEl = document.getElementById('gdm-days-passed');
        const daysRemEl = document.getElementById('gdm-days-rem');
        const curPaceEl = document.getElementById('gdm-cur-pace');
        const reqPaceEl = document.getElementById('gdm-req-pace');
        const estFinishEl = document.getElementById('gdm-est-finish');

        if (targetEl) targetEl.textContent = goal.target;
        if (totalChEl) totalChEl.textContent = stats.total;
        if (doneChEl) doneChEl.textContent = Math.round(stats.completed);
        if (remChEl) remChEl.textContent = Math.round(stats.remaining);
        if (pctEl) pctEl.textContent = `${stats.percentage}%`;
        if (daysPassedEl) daysPassedEl.textContent = `${Math.max(0, stats.daysElapsed)} Days`;
        if (daysRemEl) daysRemEl.textContent = `${stats.daysRemaining} Days`;
        if (curPaceEl) curPaceEl.textContent = `${stats.curPace} ch/day`;
        if (reqPaceEl) reqPaceEl.textContent = `${stats.reqPace} ch/day`;
        if (estFinishEl) estFinishEl.innerHTML = stats.finishDisplay;

        const tbody = document.getElementById('gdm-subjects-tbody');
        if (tbody) {
            let trs = '';
            targetedSet.forEach(sub => {
                const subStat = subjectStats[sub] || {};
                const tot = subStat.totalChapters || 0;
                const done = Math.round(subStat.effectiveChapters || 0);
                const pct = tot > 0 ? Math.round((done / tot) * 100) : 0;
                const isPassed = Boolean((passedItems.subjects && passedItems.subjects.includes(sub)));

                trs += `
                    <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td class="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-200 text-xs">${sub}</td>
                        <td class="py-2.5 px-3 text-center text-xs font-semibold text-slate-500">${tot}</td>
                        <td class="py-2.5 px-3 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">${done}</td>
                        <td class="py-2.5 px-3 text-center text-xs font-black text-slate-700 dark:text-slate-200">${pct}%</td>
                        <td class="py-2.5 px-3 text-center">
                            <span class="inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isPassed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/40' : (pct === 100 ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40' : 'bg-slate-100 text-slate-500 dark:bg-slate-800')}">
                                ${isPassed ? 'Passed' : (pct === 100 ? 'Done' : 'Active')}
                            </span>
                        </td>
                    </tr>
                `;
            });
            tbody.innerHTML = trs || '<tr><td colspan="5" class="py-4 text-center text-slate-400 text-xs">No subjects targeted.</td></tr>';
        }

        if (typeof global.openModal === 'function') {
            global.openModal('goal-details-modal');
        }
    }

    /**
     * Opens Pace Trend Chart modal.
     *
     * @param {string} goalId
     */
    function openPaceTrendModal(goalId) {
        global.activeTrendGoalId = goalId;
        renderPaceTrendChart(goalId);
        if (typeof global.openModal === 'function') {
            global.openModal('pace-trend-modal');
        }
    }
    /**
     * Universal Dataset Builder for Burn-up Pace Trend Charts.
     * Accurately tracks daily completed chapters (weighted and baseline) and seamless projections.
     */
    function buildPaceChartDatasets(paceData) {
        if (!paceData) return null;
        const { total, completed, start, end, today, reqPace, curPace, projectedDate, subjects } = paceData;

        const msPerDay = 1000 * 60 * 60 * 24;
        const startDate = new Date(start); startDate.setHours(0, 0, 0, 0);
        const targetDate = new Date(end); targetDate.setHours(0, 0, 0, 0);
        const todayDate = new Date(today); todayDate.setHours(0, 0, 0, 0);
        const projDt = projectedDate ? new Date(projectedDate) : new Date(0); projDt.setHours(0, 0, 0, 0);

        const subjectStats = global.lastSubjectStats || {};
        const subsList = Array.isArray(subjects) ? subjects : (typeof global.getAllSubjects === 'function' ? global.getAllSubjects().map(s => s.subject) : []);

        const dailyCompletedMap = new Map();
        let baselineCompleted = 0;

        const passedItems = global.passedItems || (typeof global.AppState !== 'undefined' && global.AppState.passedItems) || { programs: [], subjects: [] };
        if (passedItems) {
            subsList.forEach(sub => {
                const sObj = typeof global.getAllSubjects === 'function' ? global.getAllSubjects().find(s => s.subject === sub) : null;
                const isFrozen = (passedItems.subjects && passedItems.subjects.includes(sub)) ||
                                 (passedItems.programs && sObj && passedItems.programs.includes(sObj.program));
                if (isFrozen && subjectStats[sub]) {
                    baselineCompleted += (subjectStats[sub].totalChapters || 0);
                }
            });
        }

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const tasksList = (AppStateRef && Array.isArray(AppStateRef.tasks)) ? AppStateRef.tasks : [];
        const tracksList = global.tracks || (AppStateRef && AppStateRef.tracks) || [];

        const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
            ? global.Utils.parseDateSafe
            : (d => new Date(d));
        const getTaskDateFn = (typeof global.getTaskDate === 'function')
            ? global.getTaskDate
            : (t => parseDate(t.date));

        tasksList.forEach(t => {
            if (t.type !== 'study') return;
            const taskDate = getTaskDateFn(t);
            tracksList.forEach(track => {
                const key = track.id + 'Tasks';
                if (Array.isArray(t[key])) {
                    t[key].forEach(b => {
                        if (b.completed && subsList.includes(b.subject)) {
                            const sObj = typeof global.getAllSubjects === 'function' ? global.getAllSubjects().find(s => s.subject === b.subject) : null;
                            const isFrozen = (passedItems.subjects && passedItems.subjects.includes(b.subject)) ||
                                             (passedItems.programs && sObj && passedItems.programs.includes(sObj.program));
                            if (isFrozen) return;

                            let weight = 1;
                            const prog = (typeof global.getChapterWeeklyTargetProgress === 'function')
                                ? global.getChapterWeeklyTargetProgress(track.id, b.subject, b.chapter)
                                : null;
                            if (prog && prog.isSizeBased && prog.total > 0) {
                                weight = Math.min(1, prog.completed / prog.total);
                            }

                            let compDate = b.completedAt ? parseDate(b.completedAt) : taskDate;
                            if (!compDate || isNaN(compDate.getTime())) compDate = taskDate;
                            if (!compDate || isNaN(compDate.getTime())) compDate = new Date(todayDate);

                            const dayDate = new Date(compDate.getFullYear(), compDate.getMonth(), compDate.getDate());
                            const timeKey = dayDate.getTime();

                            dailyCompletedMap.set(timeKey, (dailyCompletedMap.get(timeKey) || 0) + weight);
                        }
                    });
                }
            });
        });

        let loopStart = new Date(Math.min(startDate.getTime(), todayDate.getTime()));
        loopStart.setHours(0, 0, 0, 0);

        let maxDt = new Date(targetDate);
        if (projDt.getTime() > 0 && projDt > maxDt) maxDt = new Date(projDt);
        if (todayDate > maxDt) maxDt = new Date(todayDate);

        const capDt = new Date(targetDate);
        capDt.setFullYear(capDt.getFullYear() + 1);
        if (maxDt > capDt) maxDt = new Date(capDt);

        let daysBuffer = Math.ceil((maxDt - loopStart) / msPerDay * 0.05);
        maxDt.setDate(maxDt.getDate() + Math.max(3, daysBuffer));

        const totalDaysTarget = Math.max(1, Math.ceil((targetDate - startDate) / msPerDay));
        const reqPacePerDay = total / totalDaysTarget;

        let cumulativeAct = baselineCompleted;
        dailyCompletedMap.forEach((val, timeKey) => {
            if (timeKey < loopStart.getTime()) {
                cumulativeAct += val;
            }
        });

        let labels = [];
        let reqData = [];
        let actData = [];
        let estData = [];

        let currentDt = new Date(loopStart);
        while (currentDt <= maxDt) {
            labels.push(currentDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            if (currentDt < startDate) {
                reqData.push(0);
            } else if (currentDt >= targetDate) {
                reqData.push(total);
            } else {
                let daysSinceStart = Math.max(0, Math.floor((currentDt - startDate) / msPerDay));
                let rVal = daysSinceStart * reqPacePerDay;
                if (rVal > total) rVal = total;
                reqData.push(rVal);
            }

            if (currentDt <= todayDate) {
                const timeKey = currentDt.getTime();
                cumulativeAct += (dailyCompletedMap.get(timeKey) || 0);

                let plotAct = cumulativeAct;
                if (currentDt.getTime() === todayDate.getTime()) {
                    plotAct = completed;
                } else {
                    plotAct = Math.min(plotAct, completed);
                }
                if (plotAct > total) plotAct = total;
                actData.push(plotAct);

                if (currentDt.getTime() === todayDate.getTime()) {
                    estData.push(plotAct);
                } else {
                    estData.push(null);
                }
            } else {
                actData.push(null);
                let daysFromToday = Math.ceil((currentDt.getTime() - todayDate.getTime()) / msPerDay);
                let eVal = completed + (curPace * daysFromToday);
                if (eVal > total) eVal = total;
                estData.push(eVal);
            }

            currentDt.setDate(currentDt.getDate() + 1);
        }

        return { labels, reqData, actData, estData, total };
    }

    /**
     * Universal Chart.js instance creator for burn-up pace line charts.
     */
    function createOrUpdatePaceChart(canvas, chartData) {
        if (!canvas || !chartData || typeof Chart === 'undefined') return null;
        let chartCtx = canvas.getContext('2d');

        let actGradient = chartCtx.createLinearGradient(0, 0, 0, 450);
        actGradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        actGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
        actGradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        let estGradient = chartCtx.createLinearGradient(0, 0, 0, 450);
        estGradient.addColorStop(0, 'rgba(245, 158, 11, 0.2)');
        estGradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

        const isMobile = (typeof window !== 'undefined' && window.innerWidth < 640);

        return new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Required Target',
                        data: chartData.reqData,
                        borderColor: '#10b981',
                        borderWidth: isMobile ? 2 : 2.5,
                        borderDash: [8, 6],
                        pointRadius: 0,
                        pointHitRadius: 15,
                        fill: false,
                        tension: 0,
                        z: 2
                    },
                    {
                        label: 'Actual Progression',
                        data: chartData.actData,
                        borderColor: '#6366f1',
                        backgroundColor: actGradient,
                        borderWidth: isMobile ? 3 : 4,
                        pointRadius: 0,
                        pointHoverRadius: 7,
                        pointBackgroundColor: '#6366f1',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#6366f1',
                        pointHoverBorderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        z: 3
                    },
                    {
                        label: 'Estimated Trajectory',
                        data: chartData.estData,
                        borderColor: '#f59e0b',
                        backgroundColor: estGradient,
                        borderWidth: isMobile ? 2 : 2.5,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        pointHitRadius: 15,
                        fill: true,
                        tension: 0.3,
                        z: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        align: isMobile ? 'center' : 'end',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', weight: '800', size: isMobile ? 9 : 11 },
                            usePointStyle: true,
                            boxWidth: isMobile ? 6 : 10,
                            padding: isMobile ? 10 : 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        titleFont: { size: isMobile ? 11 : 13, weight: 'bold' },
                        bodyColor: '#cbd5e1',
                        bodyFont: { size: isMobile ? 10 : 12 },
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                        borderWidth: 1,
                        padding: isMobile ? 10 : 14,
                        cornerRadius: 12,
                        usePointStyle: true,
                        boxPadding: 8,
                        callbacks: {
                            label: c => {
                                if (c.parsed.y === null) return null;
                                return ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)} Ch`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: chartData.total > 0 ? Math.ceil(chartData.total * 1.1) : 10,
                        ticks: {
                            font: { size: isMobile ? 8 : 10, weight: 'bold' },
                            color: '#64748b',
                            padding: isMobile ? 4 : 8
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.08)',
                            drawBorder: false,
                            borderDash: [5, 5]
                        },
                        border: { display: false }
                    },
                    x: {
                        ticks: {
                            font: { size: isMobile ? 8 : 10, weight: 'bold' },
                            color: '#64748b',
                            maxTicksLimit: isMobile ? 5 : 12,
                            maxRotation: 0,
                            padding: isMobile ? 4 : 8
                        },
                        grid: {
                            display: true,
                            color: 'rgba(148, 163, 184, 0.03)',
                            drawBorder: false
                        },
                        border: { display: false }
                    }
                }
            }
        });
    }

    /**
     * Renders burn-up pace trend chart into modal canvas.
     *
     * @param {string} goalId
     */
    function renderPaceTrendChart(goalId) {
        let paceData = null;
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];

        if (goalId && goalsList.length > 0) {
            const goal = goalsList.find(g => g.id === goalId);
            if (goal && typeof global.calculatePaceGoalStats === 'function') {
                const stats = global.calculatePaceGoalStats(goal, global.lastSubjectStats);
                if (stats) {
                    paceData = {
                        total: stats.total,
                        completed: stats.completed,
                        start: stats.startDate,
                        end: stats.targetDate,
                        today: new Date(),
                        reqPace: stats.reqPaceVal,
                        curPace: stats.curPaceVal,
                        projectedDate: stats.projectedDate,
                        subjects: Array.from(stats.targetedSubjects || []),
                        title: goal.target + " Trend",
                        description: "Burn-up comparison of Required vs Actual trajectories for " + goal.target + "."
                    };
                }
            }
        }

        if (!paceData) {
            if (!global.latestPaceData) return;
            paceData = {
                ...global.latestPaceData,
                title: "Pace Trend Analysis",
                description: "Burn-up comparison of Required vs Actual trajectories."
            };
        }

        const ctx = document.getElementById('paceTrendCanvas') || document.getElementById('paceTrendChartCanvas');
        if (!ctx) return;

        const { total, completed, reqPace, curPace, projectedDate, title, description } = paceData;

        if (typeof global.safeSetText === 'function') {
            global.safeSetText('ptm-title', title);
            global.safeSetText('ptm-desc', description);
            global.safeSetText('ptm-req-pace', reqPace.toFixed(2));
            global.safeSetText('ptm-act-pace', curPace.toFixed(2));
        }

        let finishDisplay = '--';
        const finishEl = document.getElementById('ptm-est-finish');
        if (finishEl) {
            finishEl.classList.remove('text-red-500', 'text-orange-700', 'dark:text-orange-400', 'text-emerald-500');
            if (total > 0 && completed >= total) {
                finishEl.classList.add('text-emerald-500');
                finishDisplay = 'Finished';
            } else if (total > 0 && curPace > 0) {
                finishEl.classList.add('text-orange-700', 'dark:text-orange-400');
                finishDisplay = (typeof global.Utils !== 'undefined' && typeof global.Utils.formatDateResponsive === 'function')
                    ? global.Utils.formatDateResponsive(projectedDate)
                    : projectedDate.toLocaleDateString();
            } else {
                finishEl.classList.add('text-red-500');
            }
        }
        if (typeof global.safeSetHtml === 'function') {
            global.safeSetHtml('ptm-est-finish', finishDisplay);
        }

        const chartData = buildPaceChartDatasets(paceData);
        if (!chartData) return;

        if (global.paceTrendChartInstance) global.paceTrendChartInstance.destroy();
        global.paceTrendChartInstance = createOrUpdatePaceChart(ctx, chartData);
    }

    /**
     * Renders spectra pace trend chart.
     */
    function renderSpectraPaceTrendChart(goalId) {
        let paceData = null;
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];

        if (goalId && goalsList.length > 0) {
            const goal = goalsList.find(g => g.id === goalId);
            if (goal && typeof global.calculatePaceGoalStats === 'function') {
                const stats = global.calculatePaceGoalStats(goal, global.lastSubjectStats);
                if (stats) {
                    paceData = {
                        total: stats.total,
                        completed: stats.completed,
                        start: stats.startDate,
                        end: stats.targetDate,
                        today: new Date(),
                        reqPace: stats.reqPaceVal,
                        curPace: stats.curPaceVal,
                        projectedDate: stats.projectedDate,
                        subjects: Array.from(stats.targetedSubjects || []),
                        title: goal.target + " Trend",
                        description: "Burn-up comparison of Required vs Actual trajectories for " + goal.target + "."
                    };
                }
            }
        }

        if (!paceData) {
            if (!global.latestPaceData) return;
            paceData = {
                ...global.latestPaceData,
                title: "Pace Trend Analysis",
                description: "Burn-up comparison of Required vs Actual trajectories."
            };
        }

        const canvas = document.getElementById('spectraPaceTrendCanvas');
        if (!canvas) return;

        const { total, completed, reqPace, curPace, projectedDate, title, description } = paceData;

        if (typeof global.safeSetText === 'function') {
            global.safeSetText('spectra-pace-title', title + ' (X Bar)');
            global.safeSetText('spectra-pace-desc', description);
            global.safeSetText('spectra-pace-req', `${reqPace.toFixed(2)} Ch/Day`);
            global.safeSetText('spectra-pace-act', `${curPace.toFixed(2)} Ch/Day`);
        }

        let finishDisplay = '--';
        if (total > 0 && completed >= total) {
            finishDisplay = 'Finished';
        } else if (total > 0 && curPace > 0) {
            finishDisplay = (typeof global.Utils !== 'undefined' && typeof global.Utils.formatDateResponsive === 'function')
                ? global.Utils.formatDateResponsive(projectedDate)
                : projectedDate.toLocaleDateString();
        }
        if (typeof global.safeSetHtml === 'function') {
            global.safeSetHtml('spectra-pace-finish', finishDisplay);
        }

        const chartData = buildPaceChartDatasets(paceData);
        if (!chartData) return;

        if (global.spectraPaceTrendChartInstance) global.spectraPaceTrendChartInstance.destroy();
        global.spectraPaceTrendChartInstance = createOrUpdatePaceChart(canvas, chartData);
    }

    /**
     * Renders global scope pace trend chart.
     */
    function renderGlobalPaceTrendChart() {
        if (!global.lastSubjectStats || !global.latestPaceData) {
            if (typeof global.updateMetrics === 'function') global.updateMetrics();
        }

        const canvas = document.getElementById('globalPaceTrendCanvas');
        if (!canvas) return;

        const isAnalyticsRouteActive = !global.Router || !global.Router.activePageId || global.Router.activePageId === 'spectra-analytics';
        const pageAnalyticsEl = typeof document !== 'undefined' ? document.getElementById('page-spectra-analytics') : null;
        const isAnalyticsPageVisible = !pageAnalyticsEl || !pageAnalyticsEl.classList.contains('hidden');

        if (!isAnalyticsRouteActive && !isAnalyticsPageVisible) {
            global._globalPaceTrendChartPending = true;
            return;
        }
        global._globalPaceTrendChartPending = false;

        let paceData = global.latestPaceData;
        if (!paceData) return;

        const { total, completed, reqPace, curPace, projectedDate: projDt } = paceData;

        if (typeof global.safeSetText === 'function') {
            global.safeSetText('global-pace-title', "Global Scope Trend");
            global.safeSetText('global-pace-desc', "Burn-up comparison of Required vs Actual trajectories for global scope.");
            global.safeSetText('global-pace-req', `${reqPace.toFixed(2)} Ch/Day`);
            global.safeSetText('global-pace-act', `${curPace.toFixed(2)} Ch/Day`);
        }

        let finishDisplay = '--';
        if (total > 0 && completed >= total) {
            finishDisplay = 'Finished';
        } else if (total > 0 && curPace > 0) {
            finishDisplay = (typeof global.Utils !== 'undefined' && typeof global.Utils.formatDateResponsive === 'function')
                ? global.Utils.formatDateResponsive(projDt)
                : projDt.toLocaleDateString();
        }
        if (typeof global.safeSetHtml === 'function') {
            global.safeSetHtml('global-pace-finish', finishDisplay);
        }

        const chartData = buildPaceChartDatasets(paceData);
        if (!chartData) return;

        if (global.globalPaceTrendChartInstance) global.globalPaceTrendChartInstance.destroy();
        global.globalPaceTrendChartInstance = createOrUpdatePaceChart(canvas, chartData);
    }

    /**
     * Opens modal for Pace Candlestick chart and renders interval candles.
     *
     * @param {string} goalId
     */
    function openPaceCandleChartModal(goalId) {
        const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
        const goal = goalsList.find(g => g.id === goalId);
        if (!goal) return;

        const targetNameEl = document.getElementById('pcm-target-name');
        if (targetNameEl) targetNameEl.textContent = goal.target;

        if (typeof global.openModal === 'function') {
            global.openModal('pace-candle-modal');
        }

        const targetedSubjects = typeof global.getTargetedSubjectsForGoal === 'function'
            ? global.getTargetedSubjectsForGoal(goal)
            : new Set();
        const subsList = Array.from(targetedSubjects);
        const subjectStats = global.lastSubjectStats || {};

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
            ? global.Utils.parseDateSafe
            : (d => new Date(d));

        const defaultPlanStart = (AppStateRef && AppStateRef.PLAN_START_DATE) ? AppStateRef.PLAN_START_DATE : '2026-01-01';
        const startDate = goal.startDate ? parseDate(goal.startDate) : new Date(defaultPlanStart);
        startDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const msPerDay = 1000 * 60 * 60 * 24;
        const daysElapsed = Math.max(1, Math.floor((today - startDate) / msPerDay) + 1);

        const dailyCompletedMap = new Map();
        let baselineCompleted = 0;

        const passedItems = global.passedItems || (AppStateRef && AppStateRef.passedItems) || { programs: [], subjects: [] };
        if (passedItems) {
            subsList.forEach(sub => {
                const sObj = typeof global.getAllSubjects === 'function' ? global.getAllSubjects().find(s => s.subject === sub) : null;
                const isFrozen = (passedItems.subjects && passedItems.subjects.includes(sub)) ||
                                 (passedItems.programs && sObj && passedItems.programs.includes(sObj.program));
                if (isFrozen && subjectStats[sub]) {
                    baselineCompleted += (subjectStats[sub].totalChapters || 0);
                }
            });
        }

        const tasksList = (AppStateRef && Array.isArray(AppStateRef.tasks)) ? AppStateRef.tasks : [];
        const tracksList = global.tracks || (AppStateRef && AppStateRef.tracks) || [];

        tasksList.forEach(t => {
            if (t.type !== 'study') return;
            const taskDate = (typeof global.getTaskDate === 'function') ? global.getTaskDate(t) : (t.date ? parseDate(t.date) : new Date());
            tracksList.forEach(track => {
                const key = track.id + 'Tasks';
                if (Array.isArray(t[key])) {
                    t[key].forEach(b => {
                        if (b.completed && subsList.includes(b.subject)) {
                            const sObj = typeof global.getAllSubjects === 'function' ? global.getAllSubjects().find(s => s.subject === b.subject) : null;
                            const isFrozen = (passedItems.subjects && passedItems.subjects.includes(b.subject)) ||
                                             (passedItems.programs && sObj && passedItems.programs.includes(sObj.program));
                            if (isFrozen) return;

                            let weight = 1;
                            const prog = (typeof global.getChapterWeeklyTargetProgress === 'function')
                                ? global.getChapterWeeklyTargetProgress(track.id, b.subject, b.chapter)
                                : null;
                            if (prog && prog.isSizeBased && prog.total > 0) {
                                weight = Math.min(1, prog.completed / prog.total);
                            }

                            let compDate = b.completedAt ? parseDate(b.completedAt) : taskDate;
                            if (!compDate || isNaN(compDate.getTime())) compDate = taskDate;
                            if (!compDate || isNaN(compDate.getTime())) compDate = new Date(today);

                            const dayDate = new Date(compDate.getFullYear(), compDate.getMonth(), compDate.getDate());
                            const timeKey = dayDate.getTime();

                            dailyCompletedMap.set(timeKey, (dailyCompletedMap.get(timeKey) || 0) + weight);
                        }
                    });
                }
            });
        });

        let cumulativeAct = baselineCompleted;
        dailyCompletedMap.forEach((val, timeKey) => {
            if (timeKey < startDate.getTime()) {
                cumulativeAct += val;
            }
        });

        let dailyPaces = [];
        let currentDt = new Date(startDate);

        for (let i = 1; i <= daysElapsed; i++) {
            let compToday = dailyCompletedMap.get(currentDt.getTime()) || 0;
            cumulativeAct += compToday;
            let pace = cumulativeAct / i;
            dailyPaces.push({
                dayIdx: i,
                dateStr: currentDt.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
                pace: pace,
                completedToday: compToday
            });
            currentDt.setDate(currentDt.getDate() + 1);
        }

        // Group daily stats into intervals if daysElapsed > 15
        let intervals = [];
        let daysPerInterval = 1;
        if (daysElapsed > 15) {
            daysPerInterval = Math.ceil(daysElapsed / 10);
        }

        for (let k = 0; k < daysElapsed; k += daysPerInterval) {
            let chunk = dailyPaces.slice(k, k + daysPerInterval);
            if (chunk.length === 0) continue;

            let prevIdx = k - 1;
            let openVal = prevIdx >= 0 ? dailyPaces[prevIdx].pace : 0;
            let closeVal = chunk[chunk.length - 1].pace;

            let completedInChunk = chunk.reduce((sum, d) => sum + d.completedToday, 0);
            let maxPaceInChunk = Math.max(...chunk.map(d => d.pace));
            let minPaceInChunk = Math.min(...chunk.map(d => d.pace));

            let open = openVal;
            let close = closeVal;
            let high = Math.max(open, close, maxPaceInChunk) + (completedInChunk > 0 ? 0.05 * completedInChunk : 0.01);
            let low = Math.max(0, Math.min(open, close, minPaceInChunk) - (completedInChunk === 0 ? 0.02 : 0.005));

            let dateLabel = chunk[0].dateStr;
            if (chunk.length > 1) {
                dateLabel = `${chunk[0].dateStr} - ${chunk[chunk.length - 1].dateStr}`;
            }

            intervals.push({
                label: dateLabel,
                open: open,
                close: close,
                high: high,
                low: low,
                completed: Math.round(completedInChunk * 10) / 10
            });
        }

        const ctx = document.getElementById('paceCandleCanvas');
        if (!ctx || typeof Chart === 'undefined') return;

        if (global.paceCandleChartInstance) {
            global.paceCandleChartInstance.destroy();
        }

        const canvasCtx = ctx.getContext('2d');
        const isMobile = (typeof window !== 'undefined' && window.innerWidth < 640);

        global.paceCandleChartInstance = new Chart(canvasCtx, {
            type: 'bar',
            data: {
                labels: intervals.map(item => item.label),
                datasets: [
                    {
                        label: 'Wick',
                        data: intervals.map(item => [item.low, item.high]),
                        backgroundColor: 'rgba(148, 163, 184, 0.7)',
                        borderColor: 'rgba(148, 163, 184, 0.7)',
                        borderWidth: 0,
                        barThickness: isMobile ? 1.5 : 2.5,
                        maxBarThickness: isMobile ? 1.5 : 2.5,
                        grouped: false,
                        order: 2
                    },
                    {
                        label: 'Body',
                        data: intervals.map(item => [item.open, item.close]),
                        backgroundColor: intervals.map(item => item.close >= item.open ? '#10b981' : '#ef4444'),
                        borderColor: intervals.map(item => item.close >= item.open ? '#059669' : '#dc2626'),
                        borderWidth: 1.5,
                        borderRadius: isMobile ? 3 : 5,
                        barPercentage: 0.55,
                        maxBarThickness: isMobile ? 12 : 24,
                        grouped: false,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9, weight: 'bold' } }
                    },
                    y: {
                        grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
                        ticks: { font: { size: 9, weight: 'bold' } },
                        title: {
                            display: true,
                            text: 'Pace (Chapters/Day)',
                            font: { size: 10, weight: 'black', family: 'Inter' },
                            color: '#94a3b8'
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    /**
     * Dashboard header pace toggle helper.
     */
    function setPaceToggleState(btn, handle, isChecked) {
        if (!btn || !handle) return;
        btn.dataset.checked = isChecked ? 'true' : 'false';
        if (isChecked) {
            btn.classList.remove('bg-slate-200', 'dark:bg-slate-700');
            btn.classList.add('bg-blue-600');
            handle.classList.remove('translate-x-0');
            handle.classList.add('translate-x-4');
        } else {
            btn.classList.remove('bg-blue-600');
            btn.classList.add('bg-slate-200', 'dark:bg-slate-700');
            handle.classList.remove('translate-x-4');
            handle.classList.add('translate-x-0');
        }
    }

    /**
     * Handles clicking an independent pace switch in header settings modal.
     */
    function togglePaceSwitch(type, rawId) {
        const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const buttonId = `pace-toggle-${type}-${safeId}`;
        const handleId = `pace-handle-${type}-${safeId}`;
        const btn = document.getElementById(buttonId);
        const handle = document.getElementById(handleId);

        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const dashboardConfig = global.dashboardConfig || (AppStateRef && AppStateRef.dashboardConfig) || {};
        if (!dashboardConfig.independentPaces) {
            dashboardConfig.independentPaces = { tracks: {}, programs: {}, subjects: {} };
        }

        const isChecked = btn ? btn.dataset.checked !== 'true' : true;
        if (btn && handle) setPaceToggleState(btn, handle, isChecked);

        if (type === 'track') {
            dashboardConfig.independentPaces.tracks[rawId] = isChecked;
        } else if (type === 'program') {
            dashboardConfig.independentPaces.programs[rawId] = isChecked;
        } else if (type === 'subject') {
            dashboardConfig.independentPaces.subjects[rawId] = isChecked;
        }

        if (global.FirebaseService && typeof global.FirebaseService.saveToCloud === 'function') {
            global.FirebaseService.saveToCloud();
        }
        if (typeof global.updateMetrics === 'function') {
            global.updateMetrics();
        }
    }

    /**
     * Opens modal to edit active trends timeline goal selection.
     */
    function openTrendsSettingsModal() {
        if (typeof global.ensureConfigDefaults === 'function') {
            global.ensureConfigDefaults();
        }

        const timelineContainer = document.getElementById('settings-active-timeline-container') || document.getElementById('etpm-goals-list');
        if (timelineContainer) {
            const goalsList = global.paceGoals || (typeof window !== 'undefined' && window.paceGoals) || [];
            const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
            const dashboardConfig = global.dashboardConfig || (AppStateRef && AppStateRef.dashboardConfig) || {};

            let html = '';
            if (goalsList.length === 0) {
                html = '<span class="text-xs text-slate-400">No active pacing timelines found. Add a goal first to select it.</span>';
            } else {
                goalsList.forEach(goal => {
                    const isChecked = dashboardConfig.activePaceGoalId === goal.id;
                    const safeId = goal.id.replace(/[^a-zA-Z0-9]/g, '_');
                    const parseDate = (typeof global.Utils !== 'undefined' && typeof global.Utils.parseDateSafe === 'function')
                        ? global.Utils.parseDateSafe
                        : (d => new Date(d));
                    const defaultPlanStart = (AppStateRef && AppStateRef.PLAN_START_DATE) ? AppStateRef.PLAN_START_DATE : '2026-01-01';
                    const startDate = goal.startDate ? parseDate(goal.startDate) : new Date(defaultPlanStart);
                    const deadline = parseDate(goal.deadline);

                    html += `
                        <div class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                            <div class="flex flex-col">
                                <span class="text-xs font-bold text-slate-700 dark:text-slate-200">${goal.target} (${(goal.type || '').toUpperCase()})</span>
                                <span class="text-[9px] text-slate-400 font-bold mt-0.5">
                                    Timeline: ${startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${deadline.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <button type="button" onclick="window.selectActivePaceGoal('${goal.id.replace(/'/g, "\\'")}')" 
                                    id="pace-toggle-goal-${safeId}" data-checked="${isChecked}"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}">
                                <span id="pace-handle-goal-${safeId}" aria-hidden="true" 
                                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'}"></span>
                            </button>
                        </div>`;
                });
            }
            timelineContainer.innerHTML = html;
        }

        if (typeof global.openModal === 'function') {
            global.openModal('edit-trends-pace-modal');
        }
    }

    const openEditTrendsPaceModal = openTrendsSettingsModal;

    /**
     * Selects active pace goal for Dashboard trends header display.
     */
    function selectActivePaceGoal(goalId) {
        const AppStateRef = typeof global.AppState !== 'undefined' ? global.AppState : (typeof window !== 'undefined' ? window.AppState : {});
        const dashboardConfig = global.dashboardConfig || (AppStateRef && AppStateRef.dashboardConfig) || {};

        if (dashboardConfig.activePaceGoalId === goalId) {
            dashboardConfig.activePaceGoalId = null;
        } else {
            dashboardConfig.activePaceGoalId = goalId;
        }

        openTrendsSettingsModal();
    }

    /**
     * Saves trends settings and closes edit-trends-pace-modal.
     */
    function saveTrendsSettings() {
        if (global.FirebaseService && typeof global.FirebaseService.saveToCloud === 'function') {
            global.FirebaseService.saveToCloud();
        }
        if (typeof global.renderUI === 'function') {
            global.renderUI();
        }
        if (typeof global.closeModal === 'function') {
            global.closeModal('edit-trends-pace-modal');
        }
        toast("Active pacing timeline updated!", "success");
    }

    // Attach to global scope
    const PaceManager = {
        PaceManagementPage,
        renderPaceGoals,
        togglePaceBundleType,
        updatePaceSubjects,
        addPaceGoal,
        requestDeletePaceGoal,
        deletePaceGoal,
        openEditPaceModal,
        savePaceEdit,
        openGoalDetailsModal,
        openPaceTrendModal,
        renderPaceTrendChart,
        renderSpectraPaceTrendChart,
        renderGlobalPaceTrendChart,
        buildPaceChartDatasets,
        createOrUpdatePaceChart,
        openPaceCandleChartModal,
        setPaceToggleState,
        togglePaceSwitch,
        openEditTrendsPaceModal,
        openTrendsSettingsModal,
        selectActivePaceGoal,
        saveTrendsSettings,
        initPaceEventListeners
    };

    function initPaceEventListeners() {
        if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return;
        if (global._paceListenersInitialized) return;
        global._paceListenersInitialized = true;

        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-open-trends-settings, [data-modal-open="edit-trends-pace-modal"]')) {
                e.preventDefault();
                if (typeof e.stopImmediatePropagation === 'function') {
                    e.stopImmediatePropagation();
                }
                openTrendsSettingsModal();
            } else if (e.target.closest('#btn-save-trends-settings, [data-trends-save]')) {
                e.preventDefault();
                saveTrendsSettings();
            } else if (e.target.closest('#btn-save-pace-edit, [data-pace-save]')) {
                e.preventDefault();
                savePaceEdit();
            } else if (e.target.closest('#btn-open-pace-trend-modal, [data-pace-trend-open]')) {
                e.preventDefault();
                openPaceTrendModal();
            } else if (e.target.closest('#btn-add-pace-goal, [data-pace-add]')) {
                e.preventDefault();
                addPaceGoal();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'add-pace-bundle-type') {
                togglePaceBundleType();
            }
        });
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPaceEventListeners);
        } else {
            initPaceEventListeners();
        }
    }

    global.PaceManager = PaceManager;
    global.PaceManagementPage = PaceManagementPage;
    global.renderPaceGoals = renderPaceGoals;
    global.togglePaceBundleType = togglePaceBundleType;
    global.updatePaceSubjects = updatePaceSubjects;
    global.addPaceGoal = addPaceGoal;
    global.requestDeletePaceGoal = requestDeletePaceGoal;
    global.deletePaceGoal = deletePaceGoal;
    global.openEditPaceModal = openEditPaceModal;
    global.savePaceEdit = savePaceEdit;
    global.openGoalDetailsModal = openGoalDetailsModal;
    global.openPaceTrendModal = openPaceTrendModal;
    global.renderPaceTrendChart = renderPaceTrendChart;
    global.renderSpectraPaceTrendChart = renderSpectraPaceTrendChart;
    global.renderGlobalPaceTrendChart = renderGlobalPaceTrendChart;
    global.buildPaceChartDatasets = buildPaceChartDatasets;
    global.createOrUpdatePaceChart = createOrUpdatePaceChart;
    global.openPaceCandleChartModal = openPaceCandleChartModal;
    global.setPaceToggleState = setPaceToggleState;
    global.togglePaceSwitch = togglePaceSwitch;
    global.openEditTrendsPaceModal = openEditTrendsPaceModal;
    global.openTrendsSettingsModal = openTrendsSettingsModal;
    global.selectActivePaceGoal = selectActivePaceGoal;
    global.saveTrendsSettings = saveTrendsSettings;
    global.initPaceEventListeners = initPaceEventListeners;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PaceManager;
    }
})(typeof window !== 'undefined' ? window : globalThis);

