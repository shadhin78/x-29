const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/features/tasks/taskEngine.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. In rebuildTaskDates
content = content.replace(
    'function rebuildTaskDates(shouldSave = true) {\r\n        if (!AppState.tasks',
    'function rebuildTaskDates(shouldSave = true) {\r\n        invalidateChapterStatusCache();\r\n        if (!AppState.tasks'
);

// 2. In generateStudyPlan
content = content.replace(
    'function generateStudyPlan() {\r\n        if (!window.tracks',
    'function generateStudyPlan() {\r\n        invalidateChapterStatusCache();\r\n        if (!window.tracks'
);

// 3. In syncTaskChapterCompletion
content = content.replace(
    'function syncTaskChapterCompletion(track, subject, chapter, isCompleted, completedAt = null) {\r\n        if (!AppState.tasks',
    'function syncTaskChapterCompletion(track, subject, chapter, isCompleted, completedAt = null) {\r\n        invalidateChapterStatusCache();\r\n        if (!AppState.tasks'
);

// 4. Memoization Cache & getChapterStatus
const cacheDecl = `    // Step 005: O(1) Chapter & Task Status Memoization Cache
    let _chapterStatusCache = new Map();

    function invalidateChapterStatusCache(subName = null) {
        if (!subName) {
            _chapterStatusCache.clear();
        } else {
            const prefix = subName + ':';
            for (const key of _chapterStatusCache.keys()) {
                if (key.startsWith(prefix)) {
                    _chapterStatusCache.delete(key);
                }
            }
        }
    }

    function getChapterStatus(subName, chNum, trackId = null) {
        const cacheKey = \`\${subName}:\${chNum}:\${trackId || ''}\`;
        if (_chapterStatusCache.has(cacheKey)) {
            return _chapterStatusCache.get(cacheKey);
        }
        const status = _computeChapterStatus(subName, chNum, trackId);
        _chapterStatusCache.set(cacheKey, status);
        return status;
    }

    function _computeChapterStatus(subName, chNum, trackId = null) {`;

content = content.replace(
    '    function getChapterStatus(subName, chNum, trackId = null) {',
    cacheDecl
);

// 5. In handleTaskToggle: right before "// 1. Optimistic UI update:"
content = content.replace(
    '        // 1. Optimistic UI update: Immediate Card State styling (zero-lag)',
    '        invalidateChapterStatusCache();\r\n\r\n        // 1. Optimistic UI update: Immediate Card State styling (zero-lag)'
);

// 6. In toggleSkipTask: right after AppState.tasks[taskIndex][key][bIdx].skipped = !isSkipped;
content = content.replace(
    'AppState.tasks[taskIndex][key][bIdx].skipped = !isSkipped;',
    'AppState.tasks[taskIndex][key][bIdx].skipped = !isSkipped;\r\n                invalidateChapterStatusCache();'
);

// 7. In saveTaskEdit: before recalculateTotals
content = content.replace(
    'if (typeof window.recalculateTotals === \'function\') window.recalculateTotals();\r\n        if (window.FirebaseService',
    'invalidateChapterStatusCache();\r\n        if (typeof window.recalculateTotals === \'function\') window.recalculateTotals();\r\n        if (window.FirebaseService'
);

// 8. In deleteTask: before recalculateTotals
content = content.replace(
    'if (typeof window.recalculateTotals === \'function\') window.recalculateTotals();\r\n        if (window.FirebaseService && typeof window.FirebaseService.saveToCloud === \'function\') window.FirebaseService.saveToCloud();\r\n        if (typeof window.renderUI === \'function\') window.renderUI();\r\n        if (typeof window.closeModal === \'function\') window.closeModal(\'edit-task-modal\');\r\n        if (typeof window.showToast === \'function\') window.showToast("Task deleted and schedule shifted up.", "success");',
    'invalidateChapterStatusCache();\r\n        if (typeof window.recalculateTotals === \'function\') window.recalculateTotals();\r\n        if (window.FirebaseService && typeof window.FirebaseService.saveToCloud === \'function\') window.FirebaseService.saveToCloud();\r\n        if (typeof window.renderUI === \'function\') window.renderUI();\r\n        if (typeof window.closeModal === \'function\') window.closeModal(\'edit-task-modal\');\r\n        if (typeof window.showToast === \'function\') window.showToast("Task deleted and schedule shifted up.", "success");'
);

// 9. In toggleRevisionChapter: right after progress assignment
content = content.replace(
    'window.revisionData.progress[sub][chNum] = isChecked ? new Date().toISOString() : false;',
    'window.revisionData.progress[sub][chNum] = isChecked ? new Date().toISOString() : false;\r\n        invalidateChapterStatusCache();'
);

// 10. Exports in TaskEngine object
content = content.replace(
    '        getChapterStatus,\r\n        getSubjectSkippedCount,',
    '        getChapterStatus,\r\n        invalidateChapterStatusCache,\r\n        getSubjectSkippedCount,'
);

// 11. Global / window export
content = content.replace(
    '    window.getChapterStatus = getChapterStatus;\r\n    window.getSubjectSkippedCount = getSubjectSkippedCount;',
    '    window.getChapterStatus = getChapterStatus;\r\n    window.invalidateChapterStatusCache = invalidateChapterStatusCache;\r\n    window.getSubjectSkippedCount = getSubjectSkippedCount;'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('taskEngine.js updated successfully!');
