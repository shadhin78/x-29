const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../js/features/targets/monthlyTargets.js');
let content = fs.readFileSync(filePath, 'utf8');

const normalize = s => s.replace(/\r\n/g, '\n');
let norm = normalize(content);

// 0. Add safeGetEl at top of IIFE
const iifeStart = '(function (global) {\n    \'use strict\';';
const safeGetElDecl = `(function (global) {
    'use strict';

    const safeGetEl = (typeof window !== 'undefined' && typeof window.safeGetEl === 'function')
        ? window.safeGetEl
        : (typeof global !== 'undefined' && typeof global.safeGetEl === 'function'
            ? global.safeGetEl
            : (id => (typeof document !== 'undefined' ? document.getElementById(id) : null)));`;

if (!norm.includes(iifeStart)) {
    console.error('IIFE start not found!');
    process.exit(1);
}
norm = norm.replace(iifeStart, safeGetElDecl);

// 1. populateMonthlyProgramsList: batch container.innerHTML
const oldLoc1 = `    container.innerHTML = '';
    activeProgs.forEach(prog => {`;
const newLoc1 = `    let cardsHtml = '';
    activeProgs.forEach(prog => {`;
norm = norm.replace(oldLoc1, newLoc1);

const oldLoc1End = `        container.innerHTML += cardHtml;
    });

    window.handleMonthlyProgramToggle();`;
const newLoc1End = `        cardsHtml += cardHtml;
    });
    container.innerHTML = cardsHtml;

    window.handleMonthlyProgramToggle();`;
norm = norm.replace(oldLoc1End, newLoc1End);

// 2. updateMonthlyTargetSubjectDropdown: batch container.innerHTML
const oldLoc2 = `    container.innerHTML = '';
    let totalSubsRendered = 0;`;
const newLoc2 = `    let cardsHtml = '';
    let totalSubsRendered = 0;`;
norm = norm.replace(oldLoc2, newLoc2);

const oldLoc2End = `            container.innerHTML += cardHtml;
        });
    });

    if (totalSubsRendered === 0) {`;
const newLoc2End = `            cardsHtml += cardHtml;
        });
    });
    container.innerHTML = cardsHtml;

    if (totalSubsRendered === 0) {`;
norm = norm.replace(oldLoc2End, newLoc2End);

// 3. updateMonthlyTargetChapterDropdown: batch container.innerHTML
const oldLoc3 = `    container.innerHTML = '';
    renderedSubjects.forEach(subObj => {`;
const newLoc3 = `    let groupsHtml = '';
    renderedSubjects.forEach(subObj => {`;
norm = norm.replace(oldLoc3, newLoc3);

const oldLoc3End = `        container.innerHTML += groupHtml;
    });

    if (typeof window.updateChapterMultiWeekBadges === 'function') {`;
const newLoc3End = `        groupsHtml += groupHtml;
    });
    container.innerHTML = groupsHtml;

    if (typeof window.updateChapterMultiWeekBadges === 'function') {`;
norm = norm.replace(oldLoc3End, newLoc3End);

// 4. populateMonthlyTargetWeeksAndDays: batch weekSelect
const oldLoc4 = `        weekSelect.innerHTML = '<option value="">-- None (Only Monthly Target) --</option>';
        weeks.forEach(w => {
            weekSelect.innerHTML += \`<option value="\${w.key}">\${w.label}</option>\`;
        });`;
const newLoc4 = `        weekSelect.innerHTML = '<option value="">-- None (Only Monthly Target) --</option>' + weeks.map(w => \`<option value="\${w.key}">\${w.label}</option>\`).join('');`;
norm = norm.replace(oldLoc4, newLoc4);

// 5. populateMonthlyTargetWeeksAndDays: batch bulkDaySelect
const oldLoc5 = `        bulkDaySelect.innerHTML = '<option value="">-- Choose Start Date --</option>';
        days.forEach(d => {
            bulkDaySelect.innerHTML += \`<option value="\${d.key}">\${d.label}</option>\`;
        });`;
const newLoc5 = `        bulkDaySelect.innerHTML = '<option value="">-- Choose Start Date --</option>' + days.map(d => \`<option value="\${d.key}">\${d.label}</option>\`).join('');`;
norm = norm.replace(oldLoc5, newLoc5);

// 6. populateMonthlyTargetWeeksAndDays: batch daySelect
const oldLoc6 = `        daySelect.innerHTML = '<option value="">-- None (Not Assigned to Day) --</option>';
        days.forEach(d => {
            daySelect.innerHTML += \`<option value="\${d.key}">\${d.label}</option>\`;
        });`;
const newLoc6 = `        daySelect.innerHTML = '<option value="">-- None (Not Assigned to Day) --</option>' + days.map(d => \`<option value="\${d.key}">\${d.label}</option>\`).join('');`;
norm = norm.replace(oldLoc6, newLoc6);

// 7. updateMonthlyTargetDaysDropdown: batch daySelect
const oldLoc7 = `    daySelect.innerHTML = '<option value="">-- None (Not Assigned to Day) --</option>';
    days.forEach(d => {
        daySelect.innerHTML += \`<option value="\${d.key}">\${d.label}</option>\`;
    });`;
const newLoc7 = `    daySelect.innerHTML = '<option value="">-- None (Not Assigned to Day) --</option>' + days.map(d => \`<option value="\${d.key}">\${d.label}</option>\`).join('');`;
norm = norm.replace(oldLoc7, newLoc7);

// 8. renderMonthlyTargets: batch monthSelectEl
const oldLoc8 = `    monthSelectEl.innerHTML = '';
    allMonths.forEach(mk => {
        monthSelectEl.innerHTML += \`<option value="\${mk}">\${mk}</option>\`;
    });`;
const newLoc8 = `    monthSelectEl.innerHTML = allMonths.map(mk => \`<option value="\${mk}">\${mk}</option>\`).join('');`;
norm = norm.replace(oldLoc8, newLoc8);

// 9. renderMonthlyTargets: batch progDropdown
const oldLoc9 = `            progDropdown.innerHTML = '';
            activeProgs.forEach(p => {
                progDropdown.innerHTML += \`<option value="\${p}">\${p}</option>\`;
            });`;
const newLoc9 = `            progDropdown.innerHTML = activeProgs.map(p => \`<option value="\${p}">\${p}</option>\`).join('');`;
norm = norm.replace(oldLoc9, newLoc9);

// 10. renderMonthlyTargets: batch listContainer
const oldLoc10 = `    listContainer.innerHTML = '';
    const targetsList = window.monthlyTargetsDatabase[activeMonthKey] || [];

    let totalTargets = targetsList.length;
    let completedTargets = 0;

    targetsList.forEach((target, idx) => {`;
const newLoc10 = `    let itemsHtml = '';
    const targetsList = window.monthlyTargetsDatabase[activeMonthKey] || [];

    let totalTargets = targetsList.length;
    let completedTargets = 0;

    targetsList.forEach((target, idx) => {`;
norm = norm.replace(oldLoc10, newLoc10);

const oldLoc10End = `        listContainer.innerHTML += itemHtml;
    });

    if (totalTargets === 0) {`;
const newLoc10End = `        itemsHtml += itemHtml;
    });
    listContainer.innerHTML = itemsHtml;

    if (totalTargets === 0) {`;
norm = norm.replace(oldLoc10End, newLoc10End);

// 11. populateMtdbFilters: batch monthFilter
const oldLoc11 = `    monthFilter.innerHTML = '<option value="all">All Months</option>';
    allMonths.forEach(mk => {
        monthFilter.innerHTML += \`<option value="\${mk}">\${mk}</option>\`;
    });`;
const newLoc11 = `    monthFilter.innerHTML = '<option value="all">All Months</option>' + allMonths.map(mk => \`<option value="\${mk}">\${mk}</option>\`).join('');`;
norm = norm.replace(oldLoc11, newLoc11);

// 12. populateMtdbFilters: batch progFilter
const oldLoc12 = `    progFilter.innerHTML = '<option value="all">All Programs</option>';
    activeProgs.forEach(p => {
        progFilter.innerHTML += \`<option value="\${p}">\${p}</option>\`;
    });`;
const newLoc12 = `    progFilter.innerHTML = '<option value="all">All Programs</option>' + activeProgs.map(p => \`<option value="\${p}">\${p}</option>\`).join('');`;
norm = norm.replace(oldLoc12, newLoc12);

// 13. populateMtdbFilters: batch subFilter
const oldLoc13 = `    subFilter.innerHTML = '<option value="all">All Subjects</option>';
    window.getAllSubjects().forEach(s => {
        subFilter.innerHTML += \`<option value="\${s.subject}">\${s.subject}</option>\`;
    });`;
const newLoc13 = `    subFilter.innerHTML = '<option value="all">All Subjects</option>' + window.getAllSubjects().map(s => \`<option value="\${s.subject}">\${s.subject}</option>\`).join('');`;
norm = norm.replace(oldLoc13, newLoc13);

// 14. renderMtdbList: batch tbody
const oldLoc14 = `    tbody.innerHTML = '';
    let matchedCount = 0;

    filteredMonths.forEach(monthKey => {`;
const newLoc14 = `    let rowsHtml = '';
    let matchedCount = 0;

    filteredMonths.forEach(monthKey => {`;
norm = norm.replace(oldLoc14, newLoc14);

const oldLoc14End = `            tbody.innerHTML += row;
        });
    });

    if (matchedCount === 0) {`;
const newLoc14End = `            rowsHtml += row;
        });
    });
    tbody.innerHTML = rowsHtml;

    if (matchedCount === 0) {`;
norm = norm.replace(oldLoc14End, newLoc14End);

// 15. renderMtdbMonthView: batch tbody
const oldLoc15 = `    tbody.innerHTML = '';
    const monthsList = window.calculateMonthWiseMonthlyTargets();

    const tableList = [...monthsList].reverse();

    tableList.forEach(m => {`;
const newLoc15 = `    const monthsList = window.calculateMonthWiseMonthlyTargets();
    const tableList = [...monthsList].reverse();
    let rowsHtml = '';

    tableList.forEach(m => {`;
norm = norm.replace(oldLoc15, newLoc15);

const oldLoc15End = `        tbody.innerHTML += row;
    });

    if (monthsList.length === 0) {`;
const newLoc15End = `        rowsHtml += row;
    });
    tbody.innerHTML = rowsHtml;

    if (monthsList.length === 0) {`;
norm = norm.replace(oldLoc15End, newLoc15End);

// Replace document.getElementById with safeGetEl across monthlyTargets.js
norm = norm.replace(/document\.getElementById\(/g, 'safeGetEl(');

// Save with CRLF
const crlf = norm.replace(/\n/g, '\r\n');
fs.writeFileSync(filePath, crlf, 'utf8');
console.log('Successfully updated monthlyTargets.js with batched innerHTML and safeGetEl caching!');
