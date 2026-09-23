# X-29 ADVANCE — PRODUCT REQUIREMENTS DOCUMENT (PRD)

> **Document Version:** 1.0.0  
> **Status:** Active / Permanent Baseline Reference  
> **Project Identity:** X-29 Advance (Dynamic Multi-Track Execution & Tracking Dashboard)  
> **Repository:** `d:\X-29 Project\X-29\X-29-code`  
> **Live Project ID:** `x-2k-29`

---

## 1. Project Purpose & Executive Summary

**X-29 Advance** is an intensive, high-precision personal engineering and academic execution operating system. Designed for rigorous multi-track study, syllabus execution, habit discipline, and milestone tracking, X-29 combines:
1. **Dynamic Multi-Track Curriculum Execution:** Structuring complex curricula into Tracks, Programs, Subjects, and Chapters with granular completion states, automatic sequential date allocation, and revision schedules.
2. **Tri-Tier Targets System:** A strict hierarchical cascade linking Monthly Targets $\rightarrow$ Weekly Targets $\rightarrow$ Daily Targets $\rightarrow$ Study Plan Tasks with bi-directional synchronization.
3. **High-Precision Focus Chronograph & Timer:** Hardware-accelerated stopwatch and countdown timer tracking subject-level focus sessions, recording historical logs, and measuring daily target hours.
4. **Spectra Analytics & Heatmaps:** GitHub-style chronological heatmaps, program progression curves, burn-up pace estimations, and habit compliance matrices.
5. **Private Administrative Access:** Single-user private authentication boundary bound strictly to `ris2k29@gmail.com` with real-time cloud persistence on Google Cloud Firestore (`x-2k-29`).

---

## 2. Target Users & Access Boundary

* **Primary Operator:** Single administrator and private learner (`ris2k29@gmail.com`).
* **Security Clearance:** Private, single-tenant access. Public registration is permanently disallowed. Any unauthenticated session is rejected and redirected to `login.html`.
* **Hardware Profiles:**
  * **Desktop Workstation:** High-resolution monitors, multi-column data views, keyboard navigation, persistent live chronographs.
  * **Mobile & Tablet Devices:** Android smartphones and tablets running touch-optimized standalone PWA, responsive drawer navigation, and offline execution capabilities.

---

## 3. Main Use Cases & Workflows

1. **Daily Execution Routine:**
   * Launch application $\rightarrow$ Authenticate $\rightarrow$ Hydrate from Firestore $\rightarrow$ Land on Dashboard.
   * View Today's Checklist, countdown to critical exam milestones, daily focus progress bar, and overdue tasks.
   * Complete study tasks $\rightarrow$ Optimistic UI updates $\rightarrow$ Auto-sync across Daily/Weekly/Monthly targets $\rightarrow$ Debounced Firestore write.
2. **Deep Focus Session Tracking:**
   * Navigate to Focus page $\rightarrow$ Select study subject from track/program optgroups $\rightarrow$ Select mode (Stopwatch, Countdown Timer, Alarm).
   * Enter Fullscreen Mode for distraction-free execution with high-contrast chronograph dial $\rightarrow$ Complete session $\rightarrow$ Auto-save session log $\rightarrow$ Update daily focus targets $\rightarrow$ Sync to cloud.
3. **Target Planning & Propagation:**
   * Enter Monthly Target Setup $\rightarrow$ Allocate chapter quotas across multi-week periods using Batch Allocator or Auto-Spread $\rightarrow$ Auto-generate weekly breakdowns $\rightarrow$ Propagate down to daily task checklists.
4. **Pace & Outcome Engineering:**
   * Evaluate subject-level completion rates against target exam deadlines $\rightarrow$ Mark passed subjects $\rightarrow$ Trigger celebration confetti and outcome metrics $\rightarrow$ Dynamically re-estimate daily chapter velocities.
5. **Syllabus & Master Configuration:**
   * Modify syllabus structures, create custom tracks (e.g. Core, Secondary, Revision), reorder priority queues, adjust custom actions, and tune color palettes without breaking historic data records.

---

## 4. Application Pages & Views

The application shell operates 11 primary feature pages dynamically managed by `Router` (`router/router.js`):

| Route ID | Container ID | Source Files | Primary Purpose & Responsibilities |
| :--- | :--- | :--- | :--- |
| `dashboard` | `page-dashboard` | `pages/Dashboard/Dashboard.{html,css,js}` | Central command hub: Totals KPIs, Success Score, Countdown Timer, Daily/Weekly/Monthly Checklists, Passed Subjects overview, Trend Bar charts. |
| `spectra-analytics` | `page-spectra-analytics` | `pages/Analytics/Analytics.{html,css,js}` | Visual intelligence: Multi-track pace trends, chapter burn-up curves, GitHub-style 365-day heatmaps, session history breakdown. |
| `focus` / `timer` | `page-timer` | `pages/Focus/Focus.{html,css,js}` | High-performance focus engine: Analog chronograph clock dial, digital display, stopwatch/countdown/alarm modes, fullscreen mode, focus targets. |
| `daily-actions` | `page-daily-actions` | `pages/Daily Actions/Daily Actions.{html,css,js}` | Habit & daily discipline tracker: Daily habits checklist, date-based progress cards, habit streaks, custom daily action items. |
| `daily-schedule` / `schedule` | `page-schedule` | `pages/Daily Schedule/Daily Schedule.{html,css,js}` | Time-blocking routine: Day schedule blocks, routine sets (Routine Set 1 & Set 2), schedule group management, time slots. |
| `monthly-target-setup` | `page-monthly-target-setup` | `pages/Daily Actions/monthly target setup/monthly target setup.{html,css,js}` | Target planning engine: Batch allocator, auto-spread algorithms, multi-week chapter quotas, Monthly Target Database (MTDB). |
| `subjects` | `page-subjects` | `pages/Subjects/Subjects.{html,css,js}` | Curriculum navigator: Track and Program pill filters, subject progress bars, chapter completion status badges, revision mode toggling. |
| `paces-management` | `page-paces-management` | `pages/Pace Management/Pace Management.{html,css,js}` | Velocity manager: Subject target deadlines, chapter completion velocity calculation, required daily pace, candle charts. |
| `master-config` | `page-master-config` | `pages/Master Config/Master Config.{html,css,js}` | Administrative settings: Track creator/editor, priority reordering, syllabus hierarchy editor, topic name mappings. |
| `outcome` | `page-outcome` | `pages/Outcome/Outcome.{html,css,js}` | Achievement milestone center: Program and subject pass/fail records, outcome celebration configurations, exam outcome projections. |
| `exam` / `exam-routine` | `page-exam` | `pages/Exam Routine/Exam Routine.{html,css,js}` | Exam schedule manager: Exam session records, target dates, countdown selector, subject exam routines. |
| *(External)* `login` | N/A | `login.html`, `js/pages/login/login.js` | Dedicated authentication gateway: Email/password form, glassmorphic card, error notifications, credential persistence. |

---

## 5. Core Feature Specifications

### 5.1 Dashboard Functionality
* **Global KPI Metrics:** Real-time calculation of Total Chapters, Completed Chapters, Remaining Chapters, Overall Completion Percentage, Success Score (weighted by passed subjects), and Days Remaining to primary exam.
* **Dynamic Checklists:** 
  * *Daily Checklist:* Today's pending and overdue tasks, direct toggle checkboxes with strike-through animations.
  * *Weekly Checklist:* Active week's allocated chapters and progress bars.
  * *Monthly Checklist:* Current calendar month's aggregated target completion status.
* **Quick Stats Widgets:** Passed subjects carousel, upcoming exam countdown widget, daily focus hour progress vs. daily goal.

### 5.2 Targets Cascade Architecture
* **Monthly Targets Database (MTDB):** Stores monthly chapter allocations keyed by month format (`YYYY-MM`). Provides batch distribution presets (Equal, Front-loaded, Back-loaded, Custom fractions).
* **Weekly Targets Database (WTDB):** Automatically derived from monthly targets or manually scheduled, keyed by ISO week identifiers.
* **Daily Targets Database (DTDB):** Daily chapter assignments directly feeding into study task execution.
* **Bi-directional Synchronization:** Marking a chapter complete in `taskEngine.js` automatically cascades status updates to DTDB, WTDB, and MTDB, preserving target progress without data inconsistency.

### 5.3 Focus Chronograph & Timer
* **Operating Modes:** Stopwatch (count-up with lap markers), Countdown Timer (preset intervals: 25m, 45m, 60m, 90m, 120m, or custom duration), and Alarm (target time).
* **Visual Presentation:** Dual-theme Flat Chronograph ("Painted-on-the-Wall") SVG dial with major/minor tick marks, sub-dials, animated smooth needle sweep, and digital milliseconds readout.
* **Fullscreen Distraction-Free Mode:** Hardware-accelerated (`transform: translate3d(0,0,0)`) immersive view displaying only the clock dial, current subject badge, toggle/save buttons, and exit trigger.
* **Persistence & Audio:** Active state survives backgrounding, tab switches, and reloads via `activeTimerState` local caching; plays Web Audio chime on countdown completion.

### 5.4 Spectra Analytics & Visualizations
* **Burn-Up & Pace Estimation:** Chart.js visualizations calculating actual chapter burn-up vs. ideal linear progression to target deadlines.
* **Chronological Heatmap:** 365-day activity grid displaying daily study density, session counts, and focus hours with custom color shading.
* **Program Progression Matrix:** Multi-line visual progression comparisons across different academic and technical programs.

### 5.5 Syllabus & Study Plan Engine
* **Automated Schedule Generation:** Generates comprehensive study schedules allocating chapters to specific calendar dates based on track priority, holidays, and available weekly study days.
* **Revision System:** Completed subjects or deleted tasks can be converted into active revision slots (`revisionData`), ensuring continuous knowledge retention without altering core syllabus definitions.

---

## 6. Data Synchronization & Persistence

### 6.1 Firestore Architecture (`x-2k-29`)
* **Single Monolithic Document:** All user state is consolidated under path `/users/{userId}` where `userId == request.auth.uid`.
* **State Keys:** Exactly 48 authorized top-level keys managed in `firestore.rules` (including `tasks`, `tracks`, `monthlyTargetsDatabase`, `timerLogs`, `examSessions`, `_tombstones`, `_lastWriteId`).
* **Conflict Resolution Engine:**
  * Realtime `onSnapshot` listener with generation tokens (`syncGeneration`) and session tracking (`syncSessionId`).
  * Self-echo write suppression (`_lastWriteId` matching).
  * Array reconciliation using tombstone markers (`_tombstones`) to handle offline deletions gracefully across devices.
  * Local mutations are debounced (180ms) and cached synchronously to `localStorage` (`local_app_state`, `appState`) prior to cloud commit.

### 6.2 Backup & Verification Infrastructure
* Dedicated Node.js CLI backup scripts (`scripts/backup.js`, `scripts/verify-backup.js`, `scripts/restore.js`).
* Automated scheduled tasks (`setup-task.ps1`, `backup-auto.bat`) persisting immutable JSON snapshots to `D:\X-29 Project\X-29\X-29-backup\`.

---

## 7. Non-Functional Requirements & Performance Goals

| Metric | Current Baseline (2026-09-05) | Modernization Target | Rationale |
| :--- | :--- | :--- | :--- |
| **First Contentful Paint (FCP)** | 14.6 s | **< 1.5 s** | Eliminate render-blocking CDNs and monolithic script parsing in `<head>`. |
| **Largest Contentful Paint (LCP)** | 29.9 s | **< 2.5 s** | Transition from massive initial DOM hydration to Server Components and route-level code splitting. |
| **Time to Interactive (TTI)** | 30.0 s | **< 2.8 s** | Reduce initial JavaScript execution and eliminate monolithic event listener binding. |
| **Total Blocking Time (TBT)** | 750 ms | **< 150 ms** | Offload data processing, remove synchronous JSON parsing loops on main thread. |
| **Lighthouse Performance Score** | 37 / 100 | **> 90 / 100** | Full compliance with modern Core Web Vitals. |
| **Initial JS Transferred** | 2.54 MB uncompressed | **< 250 KB** | Route-level lazy loading, modular bundling, tree-shaking. |
| **Initial DOM Size** | 294.7 KB (3,891 lines) | Minimal shell (< 30 KB) | Dynamic component rendering, on-demand modal mounting. |

---

## 8. What Must NOT Change (Permanent Invariants)

1. **Visual Identity & Design:** Colors, backgrounds (`#0b0f19`, `#0f172a`), typography (Outfit, Inter, Plus Jakarta Sans, JetBrains Mono, Rajdhani, Chakra Petch), spacing, padding, borders, shadows, and glassmorphic card styles must remain pixel-equivalent.
2. **Business Logic & Calculations:** Formulae for Success Score, Countdown calculations, Pace Estimates, Chapter Completion percentages, and Target Spreading must yield identical numerical results.
3. **Target Hierarchy:** The strict cascade of `MonthlyTargetsDatabase` $\rightarrow$ `WeeklyTargetsDatabase` $\rightarrow$ `DailyTargetsDatabase` $\rightarrow$ `Tasks` must be preserved.
4. **Firestore Document Schema:** The field structure of `/users/{userId}` must remain compatible with existing backup snapshots and `firestore.rules`.
5. **Clean Single-Domain Routing:** Public URLs must remain clean (`/`, `/dashboard`, `/analytics`, `/focus`, `/login`). Route groups like `(main)` must never leak into public URLs.

---

## 9. Acceptance Criteria for Technical Modernization

```text
[✓] Same core features: All 11 pages, timers, targets, analytics, and settings operational.
[✓] Same user workflows: Task toggling, timer execution, target setup, and configs function identically.
[✓] Same visual identity: Modernized UI is indistinguishable from the baseline design.
[✓] Same data integrity: Zero data loss during Firestore synchronization; backup system fully compatible.
[✓] Same domain structure: Unified domain without internal routing paths leaked.
[✓] Faster load speed: Sub-2 second initial load on desktop and mobile.
[✓] Better responsiveness: Fluid layout adaptation without horizontal overflow or tap delays.
[✓] Better maintainability: Modular React/TypeScript architecture replacing 1,000+ line scripts.
[✓] Better mobile performance: Smooth 60fps interaction on low-to-mid-tier Android devices.
```
