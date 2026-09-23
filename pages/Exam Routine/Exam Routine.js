/**
 * Exam Routine Page Module (pages/Exam Routine/Exam Routine.js)
 * Router entry point for Exam Routine page.
 * Canonical logic extracted to: js/features/exam/examRoutine.js
 */

(function () {
    'use strict';

    window.ExamRoutinePage = window.ExamRoutinePage || {
        isMounted: false,
        mount: function () {
            this.isMounted = true;
            if (this._hasRendered) return;
            this._hasRendered = true;
            if (typeof window.renderExamPage === 'function') {
                window.renderExamPage();
            }
        },
        destroy: function () {
            this.isMounted = false;
        }
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const pageEl = document.getElementById('page-exam');
        if (pageEl && !pageEl.classList.contains('hidden')) {
            window.ExamRoutinePage.mount();
        }
    }
})();
