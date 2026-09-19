/**
 * X-29 - Topic Name Configuration Module
 * File: js/features/config/topicNameConfig.js
 *
 * Provides:
 * - Topic Name Tab: Cascading dropdowns (Track → Program → Subject)
 * - Dynamic Chapter List Renderer with editable topic name inputs
 * - Bulk Save: Updates the `title` field across all matching task entries
 */

(function (global) {
    'use strict';

    // ==========================================
    // CASCADING DROPDOWN LINKERS
    // ==========================================

    /**
     * Populates the program dropdown based on the selected track,
     * then cascades to subjects.
     */
    function updateTopicProgDropdown() {
        const trackSelect = document.getElementById('topic-track');
        const progSelect = document.getElementById('topic-program');
        if (!trackSelect || !progSelect) return;

        const track = trackSelect.value;
        progSelect.innerHTML = '';

        if (window.customPrograms && window.customPrograms[track]) {
            window.customPrograms[track].forEach(p => {
                const pName = p.name || p;
                progSelect.innerHTML += `<option value="${pName}">${pName}</option>`;
            });
        }

        updateTopicSubjDropdown();
    }

    /**
     * Populates the subject dropdown based on the selected track & program,
     * then triggers chapter list rendering.
     */
    function updateTopicSubjDropdown() {
        const trackSelect = document.getElementById('topic-track');
        const progSelect = document.getElementById('topic-program');
        const subjSelect = document.getElementById('topic-subject');
        if (!trackSelect || !progSelect || !subjSelect) return;

        const track = trackSelect.value;
        const prog = progSelect.value;
        subjSelect.innerHTML = '';

        const syllabusStructure = window.syllabusStructure || {};
        const subs = (syllabusStructure[track] || [])
            .filter(s => s.program === prog)
            .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));

        subs.forEach(s => {
            subjSelect.innerHTML += `<option value="${s.subject}">${s.subject}</option>`;
        });

        if (subs.length === 0) {
            subjSelect.innerHTML = '<option value="">No subjects found</option>';
        }

        renderTopicChapterList();
    }

    /**
     * Called when the track dropdown changes.
     * Cascades: Track → Program → Subject → Chapter List.
     */
    function updateTopicTrackDropdown() {
        updateTopicProgDropdown();
    }

    // ==========================================
    // CHAPTER LIST RENDERER
    // ==========================================

    /**
     * Scans AppState.tasks for all chapters of the selected subject,
     * then renders an editable row for each chapter with its current topic name.
     */
    function renderTopicChapterList() {
        const container = document.getElementById('topic-chapter-list');
        if (!container) return;

        const trackSelect = document.getElementById('topic-track');
        const subjSelect = document.getElementById('topic-subject');
        if (!trackSelect || !subjSelect) return;

        const track = trackSelect.value;
        const subject = subjSelect.value;

        if (!track || !subject) {
            container.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 font-bold py-6 text-center">Select a subject to view its chapters.</p>';
            return;
        }

        // Collect all unique chapters for this subject and their current titles
        const key = track + 'Tasks';
        const chapterMap = new Map(); // chapter string → { title, chNum }

        if (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks)) {
            AppState.tasks.forEach(t => {
                if (t.type !== 'study') return;
                if (!Array.isArray(t[key])) return;
                t[key].forEach(b => {
                    if (b.subject === subject && b.chapter && b.chapter !== 'Rev') {
                        if (!chapterMap.has(b.chapter)) {
                            chapterMap.set(b.chapter, {
                                title: b.title || '',
                                chNum: parseInt(b.chapter.replace(/\D/g, ''), 10) || 0
                            });
                        }
                    }
                });
            });
        }

        // Fallback: if no chapters found in tasks, generate from syllabusStructure
        if (chapterMap.size === 0) {
            const syllabusStructure = window.syllabusStructure || {};
            const sObj = (syllabusStructure[track] || []).find(s => s.subject === subject);
            if (sObj && sObj.chapters > 0) {
                for (let i = 1; i <= sObj.chapters; i++) {
                    chapterMap.set(`Ch. ${i}`, { title: '', chNum: i });
                }
            }
        }

        if (chapterMap.size === 0) {
            container.innerHTML = '<p class="text-xs text-slate-400 dark:text-slate-500 font-bold py-6 text-center">No chapters found for this subject.</p>';
            return;
        }

        // Sort by chapter number
        const sortedChapters = Array.from(chapterMap.entries())
            .sort((a, b) => a[1].chNum - b[1].chNum);

        let html = `
            <div class="flex items-center justify-between mb-3 mt-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    ${sortedChapters.length} Chapter${sortedChapters.length !== 1 ? 's' : ''} Found
                </p>
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    ${subject}
                </span>
            </div>
            <div class="max-h-[400px] overflow-y-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
        `;

        sortedChapters.forEach(([chKey, data], idx) => {
            const chNumPadded = String(data.chNum).padStart(2, '0');
            const escapedTitle = (data.title || '').replace(/"/g, '&quot;');
            const rowBg = idx % 2 === 0
                ? 'bg-white dark:bg-slate-800/50'
                : 'bg-slate-50/80 dark:bg-slate-800/30';

            html += `
                <div class="flex items-center gap-3 px-4 py-2.5 ${rowBg} border-b border-slate-100 dark:border-slate-700/40 last:border-b-0 transition-colors">
                    <span class="text-xs font-black text-blue-600 dark:text-blue-400 whitespace-nowrap min-w-[52px] select-none">
                        Ch. ${chNumPadded}
                    </span>
                    <input type="text"
                        data-topic-ch="${chKey}"
                        value="${escapedTitle}"
                        placeholder="Enter topic name..."
                        class="topic-name-input flex-1 bg-transparent border-0 border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 text-xs text-slate-800 dark:text-slate-200 font-semibold py-1.5 px-1 outline-none transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600">
                </div>
            `;
        });

        html += `</div>`;

        container.innerHTML = html;
    }

    // ==========================================
    // BULK SAVE
    // ==========================================

    /**
     * Reads all topic name inputs and updates the `title` field
     * in every matching chapter entry across all task days.
     */
    function saveAllTopicNames() {
        const trackSelect = document.getElementById('topic-track');
        const subjSelect = document.getElementById('topic-subject');
        if (!trackSelect || !subjSelect) return;

        const track = trackSelect.value;
        const subject = subjSelect.value;

        if (!track || !subject) {
            if (typeof showToast === 'function') showToast("Please select a subject first.", "error");
            return;
        }

        const inputs = document.querySelectorAll('#topic-chapter-list .topic-name-input');
        if (inputs.length === 0) {
            if (typeof showToast === 'function') showToast("No chapters to update.", "error");
            return;
        }

        // Build a map of chapter → new title from the inputs
        const titleUpdates = new Map();
        inputs.forEach(input => {
            const ch = input.getAttribute('data-topic-ch');
            const newTitle = input.value.trim();
            if (ch) {
                titleUpdates.set(ch, newTitle);
            }
        });

        // Apply updates across all task days
        const key = track + 'Tasks';
        let updateCount = 0;

        if (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks)) {
            AppState.tasks.forEach(t => {
                if (t.type !== 'study') return;
                if (!Array.isArray(t[key])) return;
                t[key].forEach(b => {
                    if (b.subject === subject && titleUpdates.has(b.chapter)) {
                        const newTitle = titleUpdates.get(b.chapter);
                        if (b.title !== newTitle) {
                            b.title = newTitle;
                            updateCount++;
                        }
                    }
                });
            });
        }

        // Persist
        if (window.FirebaseService && typeof window.FirebaseService.saveToCloud === 'function') {
            window.FirebaseService.saveToCloud();
        }

        if (typeof renderUI === 'function') renderUI();

        if (typeof showToast === 'function') {
            showToast(
                updateCount > 0
                    ? `${updateCount} topic name${updateCount !== 1 ? 's' : ''} updated successfully!`
                    : "No changes detected.",
                updateCount > 0 ? "success" : "info"
            );
        }
    }

    // ==========================================
    // GLOBAL EXPORTS
    // ==========================================

    global.updateTopicTrackDropdown = updateTopicTrackDropdown;
    global.updateTopicProgDropdown = updateTopicProgDropdown;
    global.updateTopicSubjDropdown = updateTopicSubjDropdown;
    global.renderTopicChapterList = renderTopicChapterList;
    global.saveAllTopicNames = saveAllTopicNames;

    // CommonJS / module export compatibility
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            updateTopicTrackDropdown,
            updateTopicProgDropdown,
            updateTopicSubjDropdown,
            renderTopicChapterList,
            saveAllTopicNames
        };
    }

})(typeof window !== 'undefined' ? window : this);
