/**
 * X-29 Service Module: Curriculum Taxonomy (taxonomy.js)
 *
 * Responsibilities:
 * 1. Global Subjects Taxonomy Resolution (getAllSubjects):
 *    - Aggregates subjects across all tracks defined in window.tracks & syllabusStructure.
 *    - Applies hierarchical sorting: priority ASC (default 3), then order ASC (default 999).
 * 2. Global Programs Taxonomy Resolution (getAllPrograms):
 *    - Aggregates custom programs across all tracks defined in window.tracks & window.customPrograms.
 *    - Enriches programs with _trackId and _trackName.
 *    - Applies hierarchical sorting: priority ASC (default 999), then order ASC (default 999).
 * 3. Track-Specific Sorting & Filtering:
 *    - getSortedPrograms(track): Resolves programs for a specific track.
 *    - sortAllSubjects(subjects, track): Sorts an array of subject definitions.
 *    - getSortedTrackSubjects(track): Resolves subjects for a specific track.
 *
 * State & Compatibility:
 * - Reads window.tracks, window.syllabusStructure, window.customPrograms.
 * - Exposes methods on Taxonomy namespace, window, global, and module.exports.
 */

(function (global) {
    'use strict';

    const window = global;

    /**
     * Generates a stable unique slug ID for a subject.
     */
    function generateSubjectId(subjectName, trackId = null) {
        if (!subjectName) return '';
        const clean = String(subjectName)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return clean || 'subject';
    }

    /**
     * Resolves a subject object authoritatively by stable ID or name.
     */
    function getSubject(identifier, trackId = null) {
        if (!identifier) return null;
        const all = getAllSubjects();
        // 1. Direct ID match
        let found = all.find(s => s.id === identifier);
        if (found) return found;

        // 2. Track + name match
        if (trackId) {
            found = all.find(s => (s.track === trackId || s.trackId === trackId) && (s.subject === identifier || s.id === identifier));
            if (found) return found;
        }

        // 3. Subject name match (exact or case-insensitive)
        found = all.find(s => s.subject === identifier || (s.subject && s.subject.toLowerCase() === String(identifier).toLowerCase()));
        if (found) return found;

        // 4. Slugified name match
        const slug = generateSubjectId(identifier);
        found = all.find(s => s.id === slug || generateSubjectId(s.subject) === slug);
        return found || null;
    }

    /**
     * Aggregates and sorts all subjects across all configured tracks
     */
    function getAllSubjects() {
        const tracks = (typeof window !== 'undefined' && window.tracks)
            || (typeof global !== 'undefined' && global.tracks)
            || [];
        const syllabus = (typeof window !== 'undefined' && window.syllabusStructure)
            || (typeof global !== 'undefined' && global.syllabusStructure)
            || (typeof syllabusStructure !== 'undefined' ? syllabusStructure : {});

        let all = [];
        tracks.forEach(t => {
            if (t && t.id && syllabus[t.id]) {
                syllabus[t.id].forEach(s => {
                    if (!s.id && s.subject) {
                        s.id = generateSubjectId(s.subject, t.id);
                    }
                    all.push({
                        ...s,
                        id: s.id || generateSubjectId(s.subject, t.id),
                        track: t.id,
                        trackId: t.id,
                        _trackName: t.name,
                        name: s.subject
                    });
                });
            }
        });

        return all.sort((a, b) => {
            const pA = a.priority !== undefined ? a.priority : 3;
            const pB = b.priority !== undefined ? b.priority : 3;
            if (pA !== pB) return pA - pB;
            const oA = a.order !== undefined ? a.order : 999;
            const oB = b.order !== undefined ? b.order : 999;
            return oA - oB;
        });
    }

    /**
     * Authoritatively retrieves all chapters for a given subject.
     * Guaranteed to return all chapters from syllabusStructure regardless
     * of how many daily tasks are currently scheduled in AppState.tasks.
     */
    function getChaptersForSubject(trackOrSubjectId, subjectName = null) {
        let track = null;
        let subName = null;

        if (subjectName !== null && subjectName !== undefined) {
            track = trackOrSubjectId;
            subName = subjectName;
        } else {
            subName = trackOrSubjectId;
        }

        const sObj = getSubject(subName, track);
        const resolvedTrack = track || (sObj ? (sObj.track || sObj.trackId) : null);
        const canonicalSubName = sObj ? sObj.subject : subName;

        const chaptersSet = new Set();

        // 1. Authoritative syllabus structure chapters
        if (sObj) {
            if (Array.isArray(sObj.chapters)) {
                sObj.chapters.forEach(ch => {
                    if (ch) chaptersSet.add(typeof ch === 'string' ? ch : `Ch. ${ch}`);
                });
            } else if (typeof sObj.chapters === 'number' && sObj.chapters > 0) {
                for (let i = 1; i <= sObj.chapters; i++) {
                    chaptersSet.add(`Ch. ${i}`);
                }
            }
        }

        // 2. Merge any custom chapters present in AppState.tasks (without losing unscheduled chapters)
        const appTasks = (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks))
            ? AppState.tasks
            : ((typeof global !== 'undefined' && global.AppState && Array.isArray(global.AppState.tasks)) ? global.AppState.tasks : []);

        if (appTasks.length > 0 && resolvedTrack) {
            const key = resolvedTrack + 'Tasks';
            appTasks.forEach(t => {
                if (t.type === 'study' && Array.isArray(t[key])) {
                    t[key].forEach(b => {
                        if (b.subject === canonicalSubName && b.chapter && b.chapter !== 'Rev') {
                            chaptersSet.add(b.chapter);
                        }
                    });
                }
            });
        }

        // 3. Fallback: if subject was not in syllabusStructure and no tasks found yet, check all tracks in tasks
        if (chaptersSet.size === 0 && appTasks.length > 0) {
            const tracks = (typeof window !== 'undefined' && window.tracks)
                || (typeof global !== 'undefined' && global.tracks)
                || [];
            appTasks.forEach(t => {
                if (t.type !== 'study') return;
                tracks.forEach(trackObj => {
                    const key = trackObj.id + 'Tasks';
                    if (Array.isArray(t[key])) {
                        t[key].forEach(b => {
                            if (b.subject === canonicalSubName && b.chapter && b.chapter !== 'Rev') {
                                chaptersSet.add(b.chapter);
                            }
                        });
                    }
                });
            });
        }

        const chapters = Array.from(chaptersSet);
        chapters.sort((a, b) => {
            const numA = parseInt(String(a).replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(String(b).replace(/\D/g, ''), 10) || 0;
            return numA - numB;
        });

        return chapters;
    }

    /**
     * Authoritatively retrieves structured chapter records with stable identifiers,
     * chapter numbers, and topic titles for a given subject.
     */
    function getChapterRecordsForSubject(trackOrSubjectId, subjectName = null) {
        let track = null;
        let subName = null;

        if (subjectName !== null && subjectName !== undefined) {
            track = trackOrSubjectId;
            subName = subjectName;
        } else {
            subName = trackOrSubjectId;
        }

        const sObj = getSubject(subName, track);
        const resolvedTrack = track || (sObj ? (sObj.track || sObj.trackId) : null);
        const canonicalSubName = sObj ? sObj.subject : subName;
        const subjectId = sObj ? sObj.id : generateSubjectId(canonicalSubName, resolvedTrack);

        const chapters = getChaptersForSubject(resolvedTrack, canonicalSubName);
        const appTasks = (typeof AppState !== 'undefined' && Array.isArray(AppState.tasks))
            ? AppState.tasks
            : ((typeof global !== 'undefined' && global.AppState && Array.isArray(global.AppState.tasks)) ? global.AppState.tasks : []);

        const key = resolvedTrack ? resolvedTrack + 'Tasks' : null;

        return chapters.map((chKey, idx) => {
            const chNum = parseInt(String(chKey).replace(/\D/g, ''), 10) || (idx + 1);
            let title = '';

            // Check authoritative subject topicNames dictionary
            if (sObj && sObj.topicNames && sObj.topicNames[chKey]) {
                title = sObj.topicNames[chKey];
            } else if (sObj && Array.isArray(sObj.topics) && sObj.topics[idx]) {
                title = sObj.topics[idx];
            } else if (key && appTasks.length > 0) {
                // Search in scheduled tasks
                for (const t of appTasks) {
                    if (t.type === 'study' && Array.isArray(t[key])) {
                        const match = t[key].find(b => b.subject === canonicalSubName && b.chapter === chKey && b.title);
                        if (match) {
                            title = match.title;
                            break;
                        }
                    }
                }
            }

            return {
                id: `${subjectId}-ch-${chNum}`,
                subjectId: subjectId,
                subject: canonicalSubName,
                track: resolvedTrack,
                chapter: chKey,
                chNum: chNum,
                title: title || ''
            };
        });
    }

    /**
     * Aggregates and sorts all custom programs across all configured tracks
     */
    function getAllPrograms() {
        const tracks = (typeof window !== 'undefined' && window.tracks)
            || (typeof global !== 'undefined' && global.tracks)
            || [];
        const programs = (typeof window !== 'undefined' && window.customPrograms)
            || (typeof global !== 'undefined' && global.customPrograms)
            || (typeof customPrograms !== 'undefined' ? customPrograms : {});

        let all = [];
        tracks.forEach(t => {
            if (t && t.id && programs[t.id]) {
                programs[t.id].forEach(p => {
                    all.push({ ...p, _trackId: t.id, _trackName: t.name });
                });
            }
        });

        return all.sort((a, b) => {
            const pA = a.priority !== undefined ? a.priority : 999;
            const pB = b.priority !== undefined ? b.priority : 999;
            if (pA !== pB) return pA - pB;
            const oA = a.order !== undefined ? a.order : 999;
            const oB = b.order !== undefined ? b.order : 999;
            return oA - oB;
        });
    }

    /**
     * Resolves sorted programs for a specific track ID
     */
    function getSortedPrograms(track) {
        const programs = (typeof window !== 'undefined' && window.customPrograms)
            || (typeof global !== 'undefined' && global.customPrograms)
            || (typeof customPrograms !== 'undefined' ? customPrograms : {});

        if (!programs || !programs[track]) return [];
        return [...programs[track]];
    }

    /**
     * Sorts an arbitrary array of subjects by priority and order
     */
    function sortAllSubjects(subjects, track) {
        if (!Array.isArray(subjects)) return [];
        return [...subjects].sort((a, b) => {
            const pA = a.priority !== undefined ? a.priority : 3;
            const pB = b.priority !== undefined ? b.priority : 3;
            if (pA !== pB) return pA - pB;
            const oA = a.order !== undefined ? a.order : 999;
            const oB = b.order !== undefined ? b.order : 999;
            return oA - oB;
        });
    }

    /**
     * Resolves sorted subjects for a specific track ID
     */
    function getSortedTrackSubjects(track) {
        const syllabus = (typeof window !== 'undefined' && window.syllabusStructure)
            || (typeof global !== 'undefined' && global.syllabusStructure)
            || (typeof syllabusStructure !== 'undefined' ? syllabusStructure : {});

        if (!syllabus || !syllabus[track]) return [];
        return [...syllabus[track]];
    }

    const Taxonomy = {
        generateSubjectId,
        getSubject,
        getAllSubjects,
        getChaptersForSubject,
        getChapterRecordsForSubject,
        getAllPrograms,
        getSortedPrograms,
        sortAllSubjects,
        getSortedTrackSubjects
    };

    // Global environment compatibility
    if (typeof window !== 'undefined') {
        window.Taxonomy = Taxonomy;
        window.generateSubjectId = generateSubjectId;
        window.getSubject = getSubject;
        window.getAllSubjects = getAllSubjects;
        window.getChaptersForSubject = getChaptersForSubject;
        window.getChapterRecordsForSubject = getChapterRecordsForSubject;
        window.getAllPrograms = getAllPrograms;
        window.getSortedPrograms = getSortedPrograms;
        window.sortAllSubjects = sortAllSubjects;
        window.getSortedTrackSubjects = getSortedTrackSubjects;
    }
    if (typeof global !== 'undefined') {
        global.Taxonomy = Taxonomy;
        global.generateSubjectId = generateSubjectId;
        global.getSubject = getSubject;
        global.getAllSubjects = getAllSubjects;
        global.getChaptersForSubject = getChaptersForSubject;
        global.getChapterRecordsForSubject = getChapterRecordsForSubject;
        global.getAllPrograms = getAllPrograms;
        global.getSortedPrograms = getSortedPrograms;
        global.sortAllSubjects = sortAllSubjects;
        global.getSortedTrackSubjects = getSortedTrackSubjects;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Taxonomy;
    }

})(typeof window !== 'undefined' ? window : global);
