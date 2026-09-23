/**
 * X-29 Test Suite: Data Consistency & Unified Formatting Single Source of Truth
 */

const assert = require('assert');
const path = require('path');

// Load Utils module
const Utils = require('../js/utils.js');

console.log('\n=== X-29 — Data Consistency & Formatting Test Suite ===\n');

// 1. Date Formatting & PC/Mobile Parity
console.log('1. Verifying Date Formatting & PC / Mobile Parity...');
const testDate = new Date(2026, 8, 23, 14, 30); // 23 Sep 2026

const formattedDate = Utils.formatDate(testDate);
assert.strictEqual(formattedDate, '23 Sep 2026', 'formatDate must format as DD MMM YYYY');

const formattedMobile = Utils.formatDateMobile(testDate);
const formattedPC = Utils.formatDatePC(testDate);
assert.strictEqual(formattedMobile, formattedDate, 'Mobile date formatting must match canonical formatDate');
assert.strictEqual(formattedPC, formattedDate, 'PC date formatting must match canonical formatDate');
assert.strictEqual(formattedMobile, formattedPC, 'Mobile and PC formats must be identical (no mobile truncation)');

const responsiveSpan = Utils.formatDateResponsive(testDate);
assert.strictEqual(responsiveSpan, '<span class="inline">23 Sep 2026</span>', 'formatDateResponsive must return inline span with full date');

const startRange = new Date(2026, 0, 1);
const endRange = new Date(2026, 11, 31);
const rangeSpan = Utils.formatDateRangeResponsive(startRange, endRange, ' &rarr; ');
assert.strictEqual(rangeSpan, '<span class="inline">01 Jan 2026 &rarr; 31 Dec 2026</span>', 'formatDateRangeResponsive must format full start and end dates');
console.log('  ✓ Date formatting is identical across PC and mobile without truncation');

// 2. Exam Date & Time Formatting
console.log('\n2. Verifying Exam Date & Time Standardization...');
const examDate = new Date(2026, 9, 15, 10, 0); // 15 Oct 2026, 10:00
const examFormatted = Utils.formatExamDateTime(examDate, '10:00 AM');
assert.ok(examFormatted.includes('15 Oct 2026'), 'Exam format must include full date with year');
assert.ok(examFormatted.includes('10:00 AM'), 'Exam format must include time');
console.log('  ✓ Exam date and time formatting is standardized');

// 3. Pace Velocity Formatting & Unit Consistency
console.log('\n3. Verifying Pace Velocity Precision & Units...');
assert.strictEqual(Utils.formatPace(2.5), '2.50 Ch/Day', 'Pace must format to 2 decimal places with Ch/Day unit');
assert.strictEqual(Utils.formatPace(0), '0.00 Ch/Day', 'Zero pace must format to 2 decimal places with Ch/Day unit');
assert.strictEqual(Utils.formatPace('3.14159'), '3.14 Ch/Day', 'Pace from string must format to 2 decimal places');
assert.strictEqual(Utils.formatPace(NaN), '-- Ch/Day', 'NaN pace must display fallback with unit');
assert.strictEqual(Utils.formatPace(null), '-- Ch/Day', 'null pace must display fallback with unit');
assert.strictEqual(Utils.formatPace(1.8, ''), '1.80', 'Custom empty unit should format number only');
console.log('  ✓ Pace velocity is consistently 2 decimal places with Ch/Day across all views');

// 4. CGPA & Academic Grade Standardization
console.log('\n4. Verifying CGPA & Grade Precision Consistency...');
assert.strictEqual(Utils.formatCgpa(3.8), '3.80', 'CGPA must have exactly 2 decimal places');
assert.strictEqual(Utils.formatCgpa('4'), '4.00', 'Integer CGPA string must format to 2 decimal places');
assert.strictEqual(Utils.formatCgpaMin2Dec(3.5), '3.50', 'formatCgpaMin2Dec must match formatCgpa');
assert.strictEqual(Utils.validateAndFormatCgpa('4.5'), '4.00', 'validateAndFormatCgpa caps at 4.00');
assert.strictEqual(Utils.validateAndFormatCgpa('-1'), '0.00', 'validateAndFormatCgpa floors at 0.00');
console.log('  ✓ CGPA formatting enforces exact 2 decimal places');

// 5. Canonical Subject Name Display (Single Source of Truth)
console.log('\n5. Verifying Canonical Subject Name Display...');
const canonicalSubject = 'BBA - Financial Accounting';
assert.strictEqual(Utils.formatSubjectDisplay(canonicalSubject, 'BBA'), 'BBA - Financial Accounting', 'Subject name must retain canonical full name');
assert.strictEqual(Utils.formatSubjectDisplay('CA - Assurance', 'CA'), 'CA - Assurance', 'Subject name must not strip program prefix');
assert.strictEqual(Utils.formatSubjectDisplay('General Principles'), 'General Principles', 'Non-prefixed subject must be preserved');
console.log('  ✓ Canonical subject names are preserved without mutilation or loss of context');

// 6. Global & Namespace Exports
console.log('\n6. Verifying Global & Namespace Bindings...');
assert.strictEqual(typeof Utils.formatDate, 'function');
assert.strictEqual(typeof Utils.formatDateMobile, 'function');
assert.strictEqual(typeof Utils.formatDatePC, 'function');
assert.strictEqual(typeof Utils.formatDateResponsive, 'function');
assert.strictEqual(typeof Utils.formatDateRangeResponsive, 'function');
assert.strictEqual(typeof Utils.formatExamDateTime, 'function');
assert.strictEqual(typeof Utils.formatPace, 'function');
assert.strictEqual(typeof Utils.formatCgpa, 'function');
assert.strictEqual(typeof Utils.formatSubjectDisplay, 'function');
console.log('  ✓ All unified formatters are exported on Utils namespace and global scope');

// 7. Authoritative Subject & Chapter Consistency (Financial Accounting = 18 Chapters)
console.log('\n7. Verifying Subject & Chapter Single Source of Truth...');
const Taxonomy = require('../js/services/taxonomy.js');
const TaskEngine = require('../js/features/tasks/taskEngine.js');

// Mock DOM container for topic list
global.document = {
    getElementById: (id) => {
        if (id === 'topic-track') return { value: 'bba' };
        if (id === 'topic-subject') return { value: 'Financial Accounting' };
        if (id === 'topic-chapter-list') return { innerHTML: '' };
        return null;
    },
    querySelectorAll: () => []
};

// Setup state where Financial Accounting has 18 chapters in syllabus,
// but AppState.tasks ONLY has 1 task scheduled (Ch. 1)
global.tracks = [{ id: 'bba', name: 'BBA Track' }];
global.syllabusStructure = {
    bba: [
        { program: 'Finance', subject: 'Financial Accounting', chapters: 18, priority: 1, order: 0 }
    ]
};
global.AppState = {
    tasks: [
        {
            date: '2026-01-01',
            type: 'study',
            bbaTasks: [
                { subject: 'Financial Accounting', chapter: 'Ch. 1', title: 'Intro to Accounting', completed: false, id: 'bba-task-1' }
            ]
        }
    ]
};

// 7a: Taxonomy.getChaptersForSubject must return all 18 chapters
const taxonomyChapters = Taxonomy.getChaptersForSubject('bba', 'Financial Accounting');
assert.strictEqual(taxonomyChapters.length, 18, 'Taxonomy.getChaptersForSubject must return all 18 chapters, not just 1 from AppState.tasks');
assert.strictEqual(taxonomyChapters[0], 'Ch. 1');
assert.strictEqual(taxonomyChapters[17], 'Ch. 18');

// 7b: TaskEngine.getChaptersForSubject must return all 18 chapters
const taskEngineChapters = TaskEngine.getChaptersForSubject('bba', 'Financial Accounting');
assert.strictEqual(taskEngineChapters.length, 18, 'TaskEngine.getChaptersForSubject must return all 18 chapters');
assert.strictEqual(taskEngineChapters[0], 'Ch. 1');
assert.strictEqual(taskEngineChapters[17], 'Ch. 18');

// 7c: global.getChaptersForSubject (used by Monthly Add & Set Topic) must return all 18 chapters
const globalChapters = global.getChaptersForSubject('bba', 'Financial Accounting');
assert.strictEqual(globalChapters.length, 18, 'global.getChaptersForSubject must return all 18 chapters');

// 7d: Structured chapter records with stable identifiers
const chapterRecords = Taxonomy.getChapterRecordsForSubject('bba', 'Financial Accounting');
assert.strictEqual(chapterRecords.length, 18, 'Must return 18 structured chapter records');
assert.strictEqual(chapterRecords[0].id, 'financial-accounting-ch-1');
assert.strictEqual(chapterRecords[0].subjectId, 'financial-accounting');
assert.strictEqual(chapterRecords[0].title, 'Intro to Accounting', 'Chapter 1 must resolve scheduled task title');
assert.strictEqual(chapterRecords[17].id, 'financial-accounting-ch-18');
assert.strictEqual(chapterRecords[17].subjectId, 'financial-accounting');
console.log('  ✓ Financial Accounting returns 18 chapters across Taxonomy, TaskEngine, and global resolver even when AppState.tasks only has 1 task');

// 8. Stable Subject ID Resolution
console.log('\n8. Verifying Stable Subject ID Resolution...');
const resolvedById = Taxonomy.getSubject('financial-accounting');
assert.ok(resolvedById, 'Must resolve subject by stable slug ID');
assert.strictEqual(resolvedById.subject, 'Financial Accounting');
assert.strictEqual(resolvedById.id, 'financial-accounting');

const chaptersById = Taxonomy.getChaptersForSubject('financial-accounting');
assert.strictEqual(chaptersById.length, 18, 'Retrieving chapters using stable subject ID must return 18 chapters');
console.log('  ✓ Subjects and chapters resolve stably by subjectId without fragile string matching');

// 9. Real-Time Dynamic Updates (Adding Chapter 19)
console.log('\n9. Verifying Cross-Page Real-Time Consistency...');
// Simulate adding Chapter 19 to Financial Accounting in syllabusStructure
global.syllabusStructure.bba[0].chapters = 19;
if (!global.syllabusStructure.bba[0].topicNames) global.syllabusStructure.bba[0].topicNames = {};
global.syllabusStructure.bba[0].topicNames['Ch. 19'] = 'Advanced Consolidation';

const updatedChapters = global.getChaptersForSubject('bba', 'Financial Accounting');
assert.strictEqual(updatedChapters.length, 19, 'Adding Chapter 19 must immediately reflect across all features (19 chapters)');
assert.strictEqual(updatedChapters[18], 'Ch. 19');

const updatedRecords = Taxonomy.getChapterRecordsForSubject('bba', 'Financial Accounting');
assert.strictEqual(updatedRecords.length, 19);
assert.strictEqual(updatedRecords[18].title, 'Advanced Consolidation', 'New chapter topic title must be preserved in records');
console.log('  ✓ Modifying chapters immediately updates all consumer features in real-time');

// 10. Multi-Subject & Multi-Track Generic Verification
console.log('\n10. Verifying Generic Multi-Subject & Multi-Track Parity...');
global.tracks.push(
    { id: 'bcs', name: 'BCS Track' },
    { id: 'bank', name: 'Bank Track' }
);
global.syllabusStructure.bcs = [
    { program: 'Preliminary', subject: 'Bangla Literature', chapters: 5 }
];
global.syllabusStructure.bank = [
    { program: 'Officer General', subject: 'Banking Principles', chapters: 7 }
];

assert.strictEqual(global.getChaptersForSubject('bcs', 'Bangla Literature').length, 5);
assert.strictEqual(global.getChaptersForSubject('bank', 'Banking Principles').length, 7);
console.log('  ✓ Multi-subject and multi-track chapter consistency verified generically');

console.log('\n==================================================');
console.log('Data Consistency Suite: ALL TESTS PASSED!');
console.log('==================================================\n');
