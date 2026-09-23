/**
 * Daily Schedule Page Module (pages/Daily Schedule/Daily Schedule.js)
 * Router entry point for Daily Schedule page.
 * Canonical logic extracted to: js/features/schedule/scheduleRoutine.js
 */

(function () {
    'use strict';

    window.DailySchedulePage = window.DailySchedulePage || {
        isMounted: false,
        mount: function () {
            this.isMounted = true;
            if (this._hasRendered) {
                if (typeof window.updateActiveScheduleSlot === 'function') {
                    window.updateActiveScheduleSlot();
                }
                return;
            }
            this._hasRendered = true;
            if (typeof window.renderSchedulePage === 'function') {
                window.renderSchedulePage();
            }
            if (typeof window.updateActiveScheduleSlot === 'function') {
                window.updateActiveScheduleSlot();
            }
        },
        destroy: function () {
            this.isMounted = false;
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const pageEl = document.getElementById('page-schedule');
        if (pageEl && !pageEl.classList.contains('hidden')) {
            window.DailySchedulePage.mount();
        }
    }
})();
