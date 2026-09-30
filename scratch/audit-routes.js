const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const routes = [
  { id: 'dashboard', pageId: 'page-dashboard', js: 'pages/Dashboard/Dashboard.js', css: 'pages/Dashboard/Dashboard.css', html: 'pages/Dashboard/Dashboard.html', featureJs: 'js/features/dashboard/dashboard.js' },
  { id: 'spectra-analytics', pageId: 'page-spectra-analytics', js: 'pages/Analytics/Analytics.js', css: 'pages/Analytics/Analytics.css', html: 'pages/Analytics/Analytics.html', featureJs: 'js/features/analytics/spectra.js' },
  { id: 'timer', pageId: 'page-timer', js: 'pages/Focus/Focus.js', css: 'pages/Focus/Focus.css', html: 'pages/Focus/Focus.html', featureJs: 'shared/services/timerService.js' },
  { id: 'daily-actions', pageId: 'page-daily-actions', js: 'pages/Daily Actions/Daily Actions.js', css: 'pages/Daily Actions/Daily Actions.css', html: 'pages/Daily Actions/Daily Actions.html', featureJs: 'js/features/habits/dailyTracker.js' },
  { id: 'schedule', pageId: 'page-schedule', js: 'pages/Daily Schedule/Daily Schedule.js', css: 'pages/Daily Schedule/Daily Schedule.css', html: 'pages/Daily Schedule/Daily Schedule.html', featureJs: 'js/features/schedule/scheduleRoutine.js' },
  { id: 'monthly-target-setup', pageId: 'page-monthly-target-setup', js: 'pages/Daily Actions/monthly target setup/monthly target setup.js', css: 'pages/Daily Actions/monthly target setup/monthly target setup.css', html: 'pages/Daily Actions/monthly target setup/monthly target setup.html', featureJs: 'js/features/targets/monthlyTargets.js' },
  { id: 'subjects', pageId: 'page-subjects', js: 'pages/Subjects/Subjects.js', css: 'pages/Subjects/Subjects.css', html: 'pages/Subjects/Subjects.html', featureJs: 'js/features/tasks/taskEngine.js' },
  { id: 'paces-management', pageId: 'page-paces-management', js: 'pages/Pace Management/Pace Management.js', css: 'pages/Pace Management/Pace Management.css', html: 'pages/Pace Management/Pace Management.html', featureJs: 'js/features/pace/paceManager.js' },
  { id: 'master-config', pageId: 'page-master-config', js: 'pages/Master Config/Master Config.js', css: 'pages/Master Config/Master Config.css', html: 'pages/Master Config/Master Config.html', featureJs: '' },
  { id: 'outcome', pageId: 'page-outcome', js: 'pages/Outcome/Outcome.js', css: 'pages/Outcome/Outcome.css', html: 'pages/Outcome/Outcome.html', featureJs: 'js/features/outcome/outcomeResults.js' },
  { id: 'exam', pageId: 'page-exam', js: 'pages/Exam Routine/Exam Routine.js', css: 'pages/Exam Routine/Exam Routine.css', html: 'pages/Exam Routine/Exam Routine.html', featureJs: 'js/features/exam/examRoutine.js' }
];

console.log('=== ROUTE ASSET AUDIT ===');
let totalJs = 0, totalCss = 0, totalHtml = 0, totalFeatureJs = 0;
routes.forEach(r => {
  const inIndex = indexHtml.includes(`id="${r.pageId}"`);
  const jsSize = fs.existsSync(r.js) ? fs.statSync(r.js).size : 0;
  const cssSize = fs.existsSync(r.css) ? fs.statSync(r.css).size : 0;
  const htmlSize = fs.existsSync(r.html) ? fs.statSync(r.html).size : 0;
  const featSize = r.featureJs && fs.existsSync(r.featureJs) ? fs.statSync(r.featureJs).size : 0;
  
  totalJs += jsSize;
  totalCss += cssSize;
  totalHtml += htmlSize;
  totalFeatureJs += featSize;
  
  console.log(
    r.id.padEnd(22),
    'DOM in index.html:', String(inIndex).padEnd(5),
    '| Route JS:', (jsSize/1024).toFixed(1).padStart(5)+'KB',
    '| Feature JS:', (featSize/1024).toFixed(1).padStart(5)+'KB',
    '| CSS:', (cssSize/1024).toFixed(1).padStart(4)+'KB',
    '| HTML frag:', (htmlSize/1024).toFixed(1).padStart(4)+'KB'
  );
});

console.log('------------------------------------------------------------');
console.log('Total Route JS:   ', (totalJs/1024).toFixed(1) + ' KB (' + totalJs + ' bytes)');
console.log('Total Feature JS: ', (totalFeatureJs/1024).toFixed(1) + ' KB (' + totalFeatureJs + ' bytes)');
console.log('Total Route CSS:  ', (totalCss/1024).toFixed(1) + ' KB (' + totalCss + ' bytes)');
console.log('Total Route HTML: ', (totalHtml/1024).toFixed(1) + ' KB (' + totalHtml + ' bytes)');

// Also inspect script tags in index.html
const scriptMatches = indexHtml.match(/<script\b[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('\nTotal <script> tags in index.html:', scriptMatches.length);

const linkMatches = indexHtml.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
console.log('Total stylesheet <link> tags in index.html:', linkMatches.length);
