# COMPLETE PROJECT ARCHITECTURE AUDIT — ZERO-MISS INVENTORY

**Audit Date:** 2026-10-03T20:30 +06:00
**Auditor:** Antigravity (Claude Opus 4.6 Thinking)

---

## 1. PROJECT ROOT

```text
PROJECT ROOT:
e:\Projects\X project\X-2k-29 Project\X-29\X-29-code

Scan starts from this root.
```

---

## 2. ROOT INVENTORY

### ROOT FILES (37 files)

```text
.env
.env.example
.gitignore
FIREBASE_BACKUP_GUIDE.md
ICON-AUDIT.md
PACE_MANAGEMENT_GUIDE.md
PERFORMANCE-BASELINE.md
PERFORMANCE-MASTER-PLAN.md
PERFORMANCE-PROGRESS.md
README.md
ROUTE-AUDIT.md
ROUTE-CONFLICT-FIX.md
backup-auto.bat
backup.bat
check_hierarchy.js
check_structure.js
firebase-service-account.json
firestore.rules
index.html
login.html
manifest.json
package-lock.json
package.json
restore.bat
scratch_modal_dom.js
scratch_probe.js
scratch_test_1920.js
scratch_test_desktop.js
scratch_test_fix.js
scratch_test_modal.js
scratch_test_red.js
scratch_test_red_desktop.js
sw.js
tailwind.config.js
trace_stack.js
vercel.json
verify.bat
```

### ROOT DIRECTORIES (24 directories)

```text
.git/                (Git repository metadata — see Section 9)
analytics/
api/
archive/
css/
daily-actions/
docs/
exam/
focus/
icons/
js/
login/
master-config/
node_modules/        (Generated/dependency directory — see note below)
outcome/
pace/
pages/
router/
schedule/
scripts/
shared/
subjects/
tests/
timer/
```

---

## 3. COMPLETE RECURSIVE FILE/FOLDER TREE

```text
X-29-code/
├── .env                                          (354 B)
├── .env.example                                  (349 B)
├── .git/                                         [Git metadata — see Section 9]
├── .gitignore                                    (504 B)
├── FIREBASE_BACKUP_GUIDE.md                      (6,326 B)
├── ICON-AUDIT.md                                 (37,516 B)
├── PACE_MANAGEMENT_GUIDE.md                      (32,265 B)
├── PERFORMANCE-BASELINE.md                       (9,769 B)
├── PERFORMANCE-MASTER-PLAN.md                    (29,994 B)
├── PERFORMANCE-PROGRESS.md                       (23,483 B)
├── README.md                                     (76 B)
├── ROUTE-AUDIT.md                                (14,354 B)
├── ROUTE-CONFLICT-FIX.md                         (5,566 B)
├── analytics/
│   └── index.html                                (541,829 B)
├── api/
│   └── config.js                                 (851 B)
├── archive/
│   └── fiscal-ledger/
│       ├── README.md                             (1,767 B)
│       ├── fiscal-ledger.css                     (833 B)
│       ├── fiscal-ledger.html                    (117,870 B)
│       └── fiscal-ledger.js                      (191,284 B)
├── backup-auto.bat                               (569 B)
├── backup.bat                                    (471 B)
├── check_hierarchy.js                            (1,346 B)
├── check_structure.js                            (932 B)
├── css/
│   ├── style.css                                 (41,473 B)
│   ├── tailwind-input.css                        (59 B)
│   └── tailwind.css                              (155,095 B)
├── daily-actions/
│   ├── index.html                                (541,811 B)
│   └── monthly-setup/
│       └── index.html                            (541,888 B)
├── docs/
│   ├── ARCHITECTURE.md                           (20,441 B)
│   ├── BACKUP_RESTORE_VERIFY_SYSTEM_REPORT.txt   (42,793 B)
│   ├── DESIGN.md                                 (9,573 B)
│   ├── MEMORY.md                                 (7,435 B)
│   ├── PERFORMANCE-BASELINE.md                   (2,912 B)
│   ├── PRD.md                                    (14,121 B)
│   ├── RULES.md                                  (7,455 B)
│   ├── TASKS.md                                  (20,826 B)
│   ├── backup-system-plan.md                     (5,075 B)
│   └── performance/
│       ├── ROUTE-STEP-001.md                     (3,372 B)
│       ├── ROUTE-STEP-002.md                     (3,196 B)
│       ├── ROUTE-STEP-003.md                     (4,306 B)
│       ├── ROUTE-STEP-004.md                     (4,923 B)
│       ├── ROUTE-STEP-005.md                     (4,504 B)
│       ├── ROUTE-STEP-006.md                     (3,956 B)
│       ├── ROUTE-STEP-007.md                     (4,923 B)
│       ├── STEP-001.md                           (2,799 B)
│       ├── STEP-002.md                           (3,186 B)
│       ├── STEP-003.md                           (2,787 B)
│       ├── STEP-004.md                           (3,078 B)
│       ├── STEP-005.md                           (2,655 B)
│       ├── STEP-006.md                           (2,791 B)
│       ├── STEP-007.md                           (2,786 B)
│       ├── STEP-008.md                           (4,318 B)
│       ├── STEP-009.md                           (3,526 B)
│       ├── STEP-010.md                           (3,598 B)
│       ├── STEP-011.md                           (3,336 B)
│       └── STEP-012.md                           (2,995 B)
├── exam/
│   └── index.html                                (541,802 B)
├── firebase-service-account.json                 (2,360 B)
├── firestore.rules                               (9,573 B)
├── focus/
│   └── index.html                                (541,748 B)
├── icons/
│   ├── logo-sticker.png                          (66,196 B)
│   └── x-29.jpeg                                 (31,617 B)
├── index.html                                    (540,592 B)
├── js/
│   ├── core/
│   │   ├── app.js                                (15,781 B)
│   │   ├── metrics.js                            (59,360 B)
│   │   ├── rollover.js                           (13,380 B)
│   │   ├── scheduleSlot.js                       (241 B)
│   │   └── state.js                              (752 B)
│   ├── dev-server.js                             (8,197 B)
│   ├── features/
│   │   ├── analytics/
│   │   │   ├── chapterMap.js                     (61,328 B)
│   │   │   ├── heatmap.js                        (46,928 B)
│   │   │   ├── history.js                        (34,208 B)
│   │   │   └── spectra.js                        (115,732 B)
│   │   ├── config/
│   │   │   ├── masterConfig.js                   (44,387 B)
│   │   │   ├── priorityConfig.js                 (40,114 B)
│   │   │   ├── topicNameConfig.js                (10,787 B)
│   │   │   └── tracksConfig.js                   (19,422 B)
│   │   ├── dashboard/
│   │   │   └── dashboard.js                      (105,645 B)
│   │   ├── exam/
│   │   │   ├── countdown.js                      (13,744 B)
│   │   │   └── examRoutine.js                    (68,961 B)
│   │   ├── habits/
│   │   │   ├── dadbModal.js                      (20,844 B)
│   │   │   └── dailyTracker.js                   (85,083 B)
│   │   ├── outcome/
│   │   │   ├── outcomeAnalytics.js               (27,929 B)
│   │   │   ├── outcomeCelebration.js             (44,940 B)
│   │   │   ├── outcomePassConfig.js              (25,332 B)
│   │   │   └── outcomeResults.js                 (111,709 B)
│   │   ├── pace/
│   │   │   ├── paceEstimator.js                  (23,824 B)
│   │   │   └── paceManager.js                    (142,462 B)
│   │   ├── schedule/
│   │   │   ├── scheduleRoutine.js                (49,647 B)
│   │   │   └── scheduleSlot.js                   (35,042 B)
│   │   ├── targets/
│   │   │   ├── dailyTargets.js                   (79,451 B)
│   │   │   ├── monthlyTargets.js                 (283,970 B)
│   │   │   └── weeklyTargets.js                  (113,390 B)
│   │   └── tasks/
│   │       ├── subjectGoals.js                   (46,664 B)
│   │       └── taskEngine.js                     (97,626 B)
│   ├── firebase.js                               (72,006 B)
│   ├── pages/
│   │   └── login/
│   │       └── login.js                          (7,605 B)
│   ├── services/
│   │   ├── auth.js                               (17,851 B)
│   │   ├── backup.js                             (6,495 B)
│   │   └── taxonomy.js                           (14,677 B)
│   ├── shared/
│   │   ├── audio.js                              (2,108 B)
│   │   ├── confetti.js                           (3,396 B)
│   │   ├── deletion.js                           (6,091 B)
│   │   ├── modals.js                             (14,659 B)
│   │   ├── sidebar.js                            (4,179 B)
│   │   └── toast.js                              (1,640 B)
│   ├── state.js                                  (54,426 B)
│   ├── utils/
│   │   ├── colors.js                             (5,902 B)
│   │   ├── date.js                               (9,211 B)
│   │   ├── dom.js                                (2,270 B)
│   │   ├── format.js                             (5,309 B)
│   │   ├── id.js                                 (575 B)
│   │   ├── sanitize.js                           (1,748 B)
│   │   └── storage.js                            (2,510 B)
│   └── utils.js                                  (27,781 B)
├── login/
│   └── index.html                                (7,749 B)
├── login.html                                    (7,749 B)
├── manifest.json                                 (714 B)
├── master-config/
│   └── index.html                                (541,811 B)
├── node_modules/                                 [Generated/dependency — 15,425 files, 4,323 folders]
├── outcome/
│   └── index.html                                (541,761 B)
├── pace/
│   └── index.html                                (541,822 B)
├── package-lock.json                             (153,385 B)
├── package.json                                  (1,908 B)
├── pages/
│   ├── Analytics/
│   │   ├── Analytics.css                         (8,092 B)
│   │   ├── Analytics.html                        (64,238 B)
│   │   └── Analytics.js                          (6,749 B)
│   ├── Daily Actions/
│   │   ├── Daily Actions.css                     (4,143 B)
│   │   ├── Daily Actions.html                    (35,411 B)
│   │   ├── Daily Actions.js                      (4,791 B)
│   │   └── monthly target setup/
│   │       ├── monthly target setup.css          (6,156 B)
│   │       ├── monthly target setup.html         (42,500 B)
│   │       └── monthly target setup.js           (194,638 B)
│   ├── Daily Schedule/
│   │   ├── Daily Schedule.css                    (4,710 B)
│   │   ├── Daily Schedule.html                   (7,374 B)
│   │   └── Daily Schedule.js                     (1,674 B)
│   ├── Dashboard/
│   │   ├── Dashboard.css                         (7,482 B)
│   │   ├── Dashboard.html                        (58,162 B)
│   │   └── Dashboard.js                          (5,915 B)
│   ├── Exam Routine/
│   │   ├── Exam Routine.css                      (4,523 B)
│   │   ├── Exam Routine.html                     (27,519 B)
│   │   └── Exam Routine.js                       (1,312 B)
│   ├── Focus/
│   │   ├── Focus.css                             (16,249 B)
│   │   ├── Focus.html                            (33,287 B)
│   │   └── Focus.js                              (87,220 B)
│   ├── Master Config/
│   │   ├── Master Config.css                     (4,505 B)
│   │   ├── Master Config.html                    (23,750 B)
│   │   └── Master Config.js                      (7,827 B)
│   ├── Outcome/
│   │   ├── Outcome.css                           (5,291 B)
│   │   ├── Outcome.html                          (11,054 B)
│   │   └── Outcome.js                            (7,502 B)
│   ├── Pace Management/
│   │   ├── Pace Management.css                   (13,518 B)
│   │   ├── Pace Management.html                  (10,601 B)
│   │   └── Pace Management.js                    (2,739 B)
│   └── Subjects/
│       ├── Subjects.css                          (6,800 B)
│       ├── Subjects.html                         (5,929 B)
│       └── Subjects.js                           (88,116 B)
├── restore.bat                                   (482 B)
├── router/
│   └── router.js                                 (60,946 B)
├── schedule/
│   └── index.html                                (541,804 B)
├── scratch_modal_dom.js                          (2,175 B)
├── scratch_probe.js                              (4,289 B)
├── scratch_test_1920.js                          (2,751 B)
├── scratch_test_desktop.js                       (1,948 B)
├── scratch_test_fix.js                           (2,707 B)
├── scratch_test_modal.js                         (2,175 B)
├── scratch_test_red.js                           (3,003 B)
├── scratch_test_red_desktop.js                   (1,467 B)
├── scripts/
│   ├── backup.js                                 (20,891 B)
│   ├── compare-hosts.js                          (4,809 B)
│   ├── reset-cloud.js                            (2,258 B)
│   ├── restore.js                                (19,167 B)
│   ├── setup-task.ps1                            (973 B)
│   ├── sync-routes.js                            (11,642 B)
│   ├── verify-backup.js                          (63,943 B)
│   └── verify-live.js                            (2,357 B)
├── shared/
│   └── services/
│       └── timerService.js                       (118,808 B)
├── subjects/
│   └── index.html                                (541,768 B)
├── sw.js                                         (4,810 B)
├── tailwind.config.js                            (309 B)
├── tests/
│   ├── analytics-visualization.test.js           (25,578 B)
│   ├── app-core.test.js                          (11,751 B)
│   ├── auth-service.test.js                      (12,379 B)
│   ├── config-tracks.test.js                     (22,226 B)
│   ├── daily-targets.test.js                     (28,480 B)
│   ├── data-consistency.test.js                  (10,947 B)
│   ├── firestore-rules.test.js                   (16,538 B)
│   ├── full-regression.test.js                   (15,067 B)
│   ├── modals.test.js                            (5,048 B)
│   ├── monthly-targets.test.js                   (31,246 B)
│   ├── navigation-performance.test.js            (13,836 B)
│   ├── pace-management-guide.test.js             (4,178 B)
│   ├── pace-outcome.test.js                      (27,186 B)
│   ├── route-requirements.test.js                (30,985 B)
│   ├── tasks-metrics-dashboard.test.js           (33,886 B)
│   └── weekly-targets.test.js                    (25,588 B)
├── timer/
│   └── index.html                                (541,748 B)
├── trace_stack.js                                (2,042 B)
├── vercel.json                                   (4,135 B)
└── verify.bat                                    (504 B)
```

---

## 4. TOTAL COUNTS

```text
TOTAL PROJECT INVENTORY (excluding .git/ and node_modules/)

Folders: 56
Files:   198
Total filesystem items: 254
```

### Generated / Dependency Directories

```text
node_modules/
  Status: Present
  Type:   npm dependency directory (generated)
  Files:  15,425
  Folders: 4,323
  Note:   Not listed individually (generated content)

.git/
  Status: Present
  Type:   Git repository metadata (generated)
  Note:   See Section 9 for details
```

---

## 5. FILE TYPE INVENTORY

```text
FILE TYPE INVENTORY

Extension           Count
─────────────────────────
.js                   103
.md                    37
.html                  26
.css                   15
.json                   5
.bat                    4
.jpeg                   1
.txt                    1
.ps1                    1
.png                    1
.gitignore              1
.example                1
.rules                  1
.env                    1
─────────────────────────
TOTAL                 198

Files with no extension: 0
```

---

## 6. DIRECTORY STATISTICS

```text
DIRECTORY STATISTICS (project-owned only, excluding .git/ and node_modules/)

/                              0 nested folders,  37 files (root level only)
├── analytics/                 0 folders,          1 file
├── api/                       0 folders,          1 file
├── archive/                   1 folder,           0 files
│   └── fiscal-ledger/         0 folders,          4 files
├── css/                       0 folders,          3 files
├── daily-actions/             1 folder,           1 file
│   └── monthly-setup/         0 folders,          1 file
├── docs/                      1 folder,           9 files
│   └── performance/           0 folders,         19 files
├── exam/                      0 folders,          1 file
├── focus/                     0 folders,          1 file
├── icons/                     0 folders,          2 files
├── js/                        6 folders,          4 files
│   ├── core/                  0 folders,          5 files
│   ├── features/             10 folders,          0 files
│   │   ├── analytics/         0 folders,          4 files
│   │   ├── config/            0 folders,          4 files
│   │   ├── dashboard/         0 folders,          1 file
│   │   ├── exam/              0 folders,          2 files
│   │   ├── habits/            0 folders,          2 files
│   │   ├── outcome/           0 folders,          4 files
│   │   ├── pace/              0 folders,          2 files
│   │   ├── schedule/          0 folders,          2 files
│   │   ├── targets/           0 folders,          3 files
│   │   └── tasks/             0 folders,          2 files
│   ├── pages/                 1 folder,           0 files
│   │   └── login/             0 folders,          1 file
│   ├── services/              0 folders,          3 files
│   ├── shared/                0 folders,          6 files
│   └── utils/                 0 folders,          7 files
├── login/                     0 folders,          1 file
├── master-config/             0 folders,          1 file
├── outcome/                   0 folders,          1 file
├── pace/                      0 folders,          1 file
├── pages/                    10 folders,           0 files
│   ├── Analytics/             0 folders,          3 files
│   ├── Daily Actions/         1 folder,           3 files
│   │   └── monthly target setup/  0 folders,     3 files
│   ├── Daily Schedule/        0 folders,          3 files
│   ├── Dashboard/             0 folders,          3 files
│   ├── Exam Routine/          0 folders,          3 files
│   ├── Focus/                 0 folders,          3 files
│   ├── Master Config/         0 folders,          3 files
│   ├── Outcome/               0 folders,          3 files
│   ├── Pace Management/       0 folders,          3 files
│   └── Subjects/              0 folders,          3 files
├── router/                    0 folders,          1 file
├── schedule/                  0 folders,          1 file
├── scripts/                   0 folders,          8 files
├── shared/                    1 folder,           0 files
│   └── services/              0 folders,          1 file
├── subjects/                  0 folders,          1 file
├── tests/                     0 folders,         16 files
└── timer/                     0 folders,          1 file
```

---

## 7. CONFIGURATION FILES

```text
CONFIGURATION FILES FOUND

.env                          — Environment variables (354 B)
.env.example                  — Environment template (349 B)
.gitignore                    — Git ignore rules (504 B)
firebase-service-account.json — Firebase service account credentials (2,360 B)
firestore.rules               — Firestore security rules (9,573 B)
manifest.json                 — PWA manifest (714 B)
package.json                  — npm package config (1,908 B)
package-lock.json             — npm lock file (153,385 B)
tailwind.config.js            — Tailwind CSS configuration (309 B)
vercel.json                   — Vercel deployment config (4,135 B)
api/config.js                 — API configuration (851 B)
```

### Configuration files checked but NOT found:
```text
.env.local                — NOT FOUND
.env.development          — NOT FOUND
.env.production           — NOT FOUND
.gitattributes            — NOT FOUND
.vscode/                  — NOT FOUND
.vercel/                  — NOT FOUND
.github/                  — NOT FOUND
.agents/                  — NOT FOUND
.prettierrc               — NOT FOUND
.eslintrc                 — NOT FOUND
.npmrc                    — NOT FOUND
eslint.config.*           — NOT FOUND
prettier.config.*         — NOT FOUND
postcss.config.*          — NOT FOUND
next.config.*             — NOT FOUND
tsconfig.json             — NOT FOUND
firebase.json             — NOT FOUND
```

---

## 8. ARCHITECTURE OVERVIEW

```text
ARCHITECTURE OVERVIEW

Frontend:
  - Single-page application (SPA) with client-side routing
  - Vanilla HTML/CSS/JavaScript (no framework like React/Vue/Angular)
  - Tailwind CSS for utility styling + custom style.css
  - PWA-enabled (manifest.json + sw.js service worker)

Backend:
  - Firebase (Firestore) as the backend-as-a-service
  - Firebase authentication via js/services/auth.js
  - Firestore security rules in firestore.rules
  - API config in api/config.js

Routing:
  - Custom client-side router in router/router.js (60.9 KB)
  - Route-based HTML shells: analytics/, daily-actions/, exam/, focus/,
    login/, master-config/, outcome/, pace/, schedule/, subjects/, timer/
  - Each route shell is an index.html (~529 KB each — likely containing
    the full SPA shell)

Components / Pages:
  - pages/ directory contains 10 page modules, each with .html, .css, .js:
    Analytics, Daily Actions, Daily Schedule, Dashboard, Exam Routine,
    Focus, Master Config, Outcome, Pace Management, Subjects
  - pages/Daily Actions/monthly target setup/ — nested sub-page

Features (Business Logic):
  - js/features/analytics/   — chapterMap, heatmap, history, spectra
  - js/features/config/      — masterConfig, priorityConfig, topicNameConfig, tracksConfig
  - js/features/dashboard/   — dashboard
  - js/features/exam/        — countdown, examRoutine
  - js/features/habits/      — dadbModal, dailyTracker
  - js/features/outcome/     — outcomeAnalytics, outcomeCelebration, outcomePassConfig, outcomeResults
  - js/features/pace/        — paceEstimator, paceManager
  - js/features/schedule/    — scheduleRoutine, scheduleSlot
  - js/features/targets/     — dailyTargets, monthlyTargets, weeklyTargets
  - js/features/tasks/       — subjectGoals, taskEngine

Core:
  - js/core/app.js           — Application bootstrap
  - js/core/metrics.js       — Metrics engine
  - js/core/rollover.js      — Day rollover logic
  - js/core/scheduleSlot.js  — Schedule slot helper
  - js/core/state.js         — Core state definitions

Services:
  - js/services/auth.js      — Authentication
  - js/services/backup.js    — Backup service
  - js/services/taxonomy.js  — Subject/topic taxonomy

Shared UI:
  - js/shared/audio.js       — Audio playback
  - js/shared/confetti.js    — Celebration animations
  - js/shared/deletion.js    — Deletion confirmation flows
  - js/shared/modals.js      — Modal system
  - js/shared/sidebar.js     — Sidebar navigation
  - js/shared/toast.js       — Toast notifications

Utilities:
  - js/utils.js              — Legacy utilities (27.7 KB)
  - js/utils/colors.js       — Color helpers
  - js/utils/date.js         — Date utilities
  - js/utils/dom.js          — DOM helpers
  - js/utils/format.js       — Formatting
  - js/utils/id.js           — ID generation
  - js/utils/sanitize.js     — Input sanitization
  - js/utils/storage.js      — Storage abstraction

State Management:
  - js/state.js              — Global state (54.4 KB)
  - js/firebase.js           — Firebase integration + state sync (72 KB)

Styles:
  - css/style.css            — Main stylesheet (41.5 KB)
  - css/tailwind.css         — Compiled Tailwind output (155 KB)
  - css/tailwind-input.css   — Tailwind input source (59 B)
  - Per-page CSS in pages/*/

Assets:
  - icons/logo-sticker.png   — Logo sticker (66 KB)
  - icons/x-29.jpeg          — X-29 image (31.6 KB)

Data:
  - firebase-service-account.json — Firebase credentials

Testing:
  - tests/ — 16 test files covering:
    analytics-visualization, app-core, auth-service, config-tracks,
    daily-targets, data-consistency, firestore-rules, full-regression,
    modals, monthly-targets, navigation-performance, pace-management-guide,
    pace-outcome, route-requirements, tasks-metrics-dashboard, weekly-targets

Documentation:
  - README.md
  - FIREBASE_BACKUP_GUIDE.md
  - ICON-AUDIT.md
  - PACE_MANAGEMENT_GUIDE.md
  - PERFORMANCE-BASELINE.md
  - PERFORMANCE-MASTER-PLAN.md
  - PERFORMANCE-PROGRESS.md
  - ROUTE-AUDIT.md
  - ROUTE-CONFLICT-FIX.md
  - docs/ARCHITECTURE.md
  - docs/DESIGN.md
  - docs/MEMORY.md
  - docs/PERFORMANCE-BASELINE.md
  - docs/PRD.md
  - docs/RULES.md
  - docs/TASKS.md
  - docs/backup-system-plan.md
  - docs/BACKUP_RESTORE_VERIFY_SYSTEM_REPORT.txt
  - docs/performance/ — 19 step-by-step performance optimization docs
  - archive/fiscal-ledger/README.md

Scripts / Automation:
  - backup-auto.bat           — Automated backup batch
  - backup.bat                — Manual backup batch
  - restore.bat               — Restore batch
  - verify.bat                — Verification batch
  - scripts/backup.js         — Backup Node.js script
  - scripts/restore.js        — Restore Node.js script
  - scripts/verify-backup.js  — Backup verification
  - scripts/verify-live.js    — Live verification
  - scripts/compare-hosts.js  — Host comparison
  - scripts/reset-cloud.js    — Cloud reset
  - scripts/sync-routes.js    — Route sync script
  - scripts/setup-task.ps1    — PowerShell task setup

Scratch / Debug Files (root):
  - check_hierarchy.js
  - check_structure.js
  - scratch_modal_dom.js
  - scratch_probe.js
  - scratch_test_1920.js
  - scratch_test_desktop.js
  - scratch_test_fix.js
  - scratch_test_modal.js
  - scratch_test_red.js
  - scratch_test_red_desktop.js
  - trace_stack.js

Deployment:
  - vercel.json               — Vercel deployment configuration
  - sw.js                     — Service worker for PWA

Archive:
  - archive/fiscal-ledger/    — Archived fiscal ledger module
```

---

## 9. GIT / VERSION CONTROL

```text
.git/
  Status: Present
  Type: Git repository metadata
  Tracked project files: 185
  Untracked files: 11
  Modified files: 0
  Ignored files: 0 (via git ls-files --ignored; node_modules likely in .gitignore)
```

### Untracked files (11):

```text
check_hierarchy.js
check_structure.js
scratch_modal_dom.js
scratch_probe.js
scratch_test_1920.js
scratch_test_desktop.js
scratch_test_fix.js
scratch_test_modal.js
scratch_test_red.js
scratch_test_red_desktop.js
trace_stack.js
```

---

## 10. POTENTIAL DUPLICATES / SUSPICIOUS STRUCTURE

### Potentially Redundant: Duplicate `index.html` shell files (~529 KB each)

The following directories each contain an `index.html` that is approximately 529 KB — these appear to be near-identical copies of the main SPA shell:

| File | Size |
|------|------|
| `index.html` (root) | 540,592 B |
| `analytics/index.html` | 541,829 B |
| `daily-actions/index.html` | 541,811 B |
| `daily-actions/monthly-setup/index.html` | 541,888 B |
| `exam/index.html` | 541,802 B |
| `focus/index.html` | 541,748 B |
| `master-config/index.html` | 541,811 B |
| `outcome/index.html` | 541,761 B |
| `pace/index.html` | 541,822 B |
| `schedule/index.html` | 541,804 B |
| `subjects/index.html` | 541,768 B |
| `timer/index.html` | 541,748 B |

> **Note:** These are likely generated route shell copies for Vercel/static deployment routing. Total: **~6.35 MB** of near-duplicate content.

### Potentially Redundant: Duplicate `login.html`

```text
login.html       (root)    — 7,749 B
login/index.html           — 7,749 B
```

These are exactly the same size — likely identical copies.

### Potentially Redundant: Duplicate `PERFORMANCE-BASELINE.md`

```text
PERFORMANCE-BASELINE.md       (root)  — 9,769 B
docs/PERFORMANCE-BASELINE.md          — 2,912 B
```

Two files with the same name but different sizes — the root version is larger. Potentially different versions.

### Potentially Redundant: Duplicate `scheduleSlot` naming

```text
js/core/scheduleSlot.js                  — 241 B
js/features/schedule/scheduleSlot.js     — 35,042 B
```

Same filename in different directories. The core version is tiny (241 B) — potentially a stub or re-export.

### Potentially Redundant: Duplicate `backup.js`

```text
js/services/backup.js     — 6,495 B
scripts/backup.js         — 20,891 B
```

Two `backup.js` files — the `scripts/` version is a standalone script; the `services/` version is an in-app service. May be intentional.

### Potentially Redundant: `js/utils.js` vs `js/utils/` directory

```text
js/utils.js               — 27,781 B  (monolithic utility file)
js/utils/                  — 7 modular utility files
```

The monolithic `utils.js` may be a legacy version that is being refactored into the `utils/` directory.

### Potentially Suspicious: Scratch/debug files in project root (untracked)

11 untracked scratch/debug JavaScript files in the project root. These are likely temporary test scripts that were not cleaned up.

### Potentially Suspicious: `firebase-service-account.json` in project root

> [!CAUTION]
> `firebase-service-account.json` (2,360 B) contains Firebase service account credentials. This file is in the project root. Verify it is properly listed in `.gitignore` and is not committed to the repository.

### Potentially Suspicious: `.env` file

> [!CAUTION]
> `.env` (354 B) contains environment variables. Verify it is properly listed in `.gitignore` and is not committed to the repository with secrets.

---

## 11. LARGEST FILES

```text
LARGEST FILES (project-owned, excluding node_modules/ and .git/)

 #  File                                                         Size
───────────────────────────────────────────────────────────────────────
 1  daily-actions/monthly-setup/index.html                    529.19 KB
 2  analytics/index.html                                      529.13 KB
 3  pace/index.html                                           529.12 KB
 4  daily-actions/index.html                                  529.11 KB
 5  master-config/index.html                                  529.11 KB
 6  schedule/index.html                                       529.11 KB
 7  exam/index.html                                           529.10 KB
 8  subjects/index.html                                       529.07 KB
 9  outcome/index.html                                        529.06 KB
10  timer/index.html                                          529.05 KB
11  focus/index.html                                          529.05 KB
12  index.html (root)                                         527.92 KB
13  js/features/targets/monthlyTargets.js                     277.31 KB
14  pages/Daily Actions/monthly target setup/monthly target setup.js  190.08 KB
15  archive/fiscal-ledger/fiscal-ledger.js                    186.80 KB
```

---

## 12. EMPTY DIRECTORIES

```text
EMPTY DIRECTORIES
None found.
```

---

## 13. UNREADABLE / ACCESS-RESTRICTED ITEMS

```text
UNREADABLE / ACCESS-RESTRICTED ITEMS
None encountered. All files and directories were successfully accessed and enumerated.
```

---

## 14. ZERO-MISS VERIFICATION

```text
ZERO-MISS VERIFICATION

[✓] Project root identified: e:\Projects\X project\X-2k-29 Project\X-29\X-29-code
[✓] Entire project recursively scanned (all 56 project directories)
[✓] All normal folders listed (56 project-owned folders)
[✓] All normal files listed (198 project-owned files)
[✓] Hidden files checked (.env, .env.example, .gitignore found; no hidden-attribute files)
[✓] Hidden directories checked (.git/ found; .vscode/.vercel/.github/.agents not present)
[✓] Root files verified (37 files)
[✓] Root directories verified (24 directories)
[✓] File count calculated from filesystem (198 files)
[✓] Folder count calculated from filesystem (56 folders)
[✓] File extensions counted (14 distinct extensions)
[✓] Empty directories checked (none found)
[✓] Large files checked (top 15 listed)
[✓] Unreadable items checked (none)
[✓] Generated/dependency directories identified (node_modules: 15,425 files / 4,323 folders; .git/)
[✓] Second verification pass completed (counts cross-referenced between filesystem scan and tree)
```
