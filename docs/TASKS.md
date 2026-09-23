# X-29 ADVANCE — TECHNICAL MODERNIZATION ROADMAP (TASKS)

> **Document Version:** 1.0.0  
> **Status:** Active / Comprehensive Modernization Roadmap  
> **Rule:** Implement only ONE phase when instructed. Update checkboxes upon completion.

---

## Modernization Phases Summary

* [x] **PHASE 0 — Full Audit** (Current Status: COMPLETED)
* [ ] **PHASE 1 — Baseline & Safety Checkpoints**
* [ ] **PHASE 2 — Next.js Foundation**
* [ ] **PHASE 3 — Clean Routing**
* [ ] **PHASE 4 — React Component Architecture**
* [ ] **PHASE 5 — TypeScript Migration**
* [ ] **PHASE 6 — Shared UI Architecture**
* [ ] **PHASE 7 — Zustand State Architecture**
* [ ] **PHASE 8 — Firebase / Firestore Architecture**
* [ ] **PHASE 9 — IndexedDB / Local-first Layer**
* [ ] **PHASE 10 — Page-by-Page Migration**
* [ ] **PHASE 11 — Large File Elimination**
* [ ] **PHASE 12 — Client JavaScript Reduction**
* [ ] **PHASE 13 — Performance Optimization**
* [ ] **PHASE 14 — Mobile Optimization**
* [ ] **PHASE 15 — Responsive Optimization**
* [ ] **PHASE 16 — Accessibility**
* [ ] **PHASE 17 — PWA / Service Worker**
* [ ] **PHASE 18 — Production Optimization**
* [ ] **PHASE 19 — Final Regression Testing**
* [ ] **PHASE 20 — Final Cleanup**

---

## Detailed Phase Workflows

---

### PHASE 0 — Full Audit
* **Goal:** Perform complete, non-destructive inspection of all code, files, dependencies, database rules, tests, and styles. Create permanent AI Project Memory.
* **Reason:** Ensure total contextual understanding before touching any functional code.
* **Dependencies:** None.
* **Files involved:** Entire repository; `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, `docs/DESIGN.md`, `docs/TASKS.md`, `docs/MEMORY.md`.
* **Tasks:**
  - [x] Run directory tree and file size audit across entire workspace.
  - [x] Identify top large files and modules.
  - [x] Inspect and run automated regression test suites (`npm test`).
  - [x] Inspect Firestore security rules (`firestore.rules`) and document schema.
  - [x] Create and populate all 6 permanent AI memory documents in `docs/`.
* **Risks:** None (Read-only operations).
* **Validation:** All 6 documents created; all existing test suites passing (57/57 passed).
* **Expected result:** Complete permanent context established.
* **Status:** COMPLETED.

---

### PHASE 1 — Baseline & Safety Checkpoints
* **Goal:** Establish immutable verification points, backup snapshots, and local server baseline metrics.
* **Reason:** Guarantee a zero-risk rollback path before introducing framework files.
* **Dependencies:** Phase 0.
* **Files involved:** `scripts/backup.js`, `scripts/verify-backup.js`, `docs/PERFORMANCE-BASELINE.md`.
* **Tasks:**
  - [ ] Execute read-only cloud backup: `node scripts/backup.js`.
  - [ ] Execute deep backup verification: `node scripts/verify-backup.js`.
  - [ ] Record Lighthouse and Core Web Vitals baseline scores on current codebase.
  - [ ] Commit Git checkpoint: `chore: establish pre-modernization safety checkpoint`.
* **Risks:** Network timeout during backup.
* **Validation:** Backup written and verified; Git working tree clean.
* **Expected result:** Verified local backup and baseline metrics documented.
* **Status:** PENDING.

---

### PHASE 2 — Next.js Foundation
* **Goal:** Initialize Next.js 16 (App Router) + TypeScript build pipeline in the workspace alongside existing code without breaking the existing static setup.
* **Reason:** Create the modern build and bundling engine capable of Server Components, tree-shaking, and code-splitting.
* **Dependencies:** Phase 1.
* **Files involved:** `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`.
* **Tasks:**
  - [ ] Install Next.js 16, React 19, React DOM, and TypeScript dependencies.
  - [ ] Configure `tsconfig.json` with strict path aliases (`@/*`).
  - [ ] Configure `next.config.ts` for standalone deployment and clean routing.
  - [ ] Create root `app/layout.tsx` loading Google Fonts (Outfit, Inter, JetBrains Mono) via `next/font`.
  - [ ] Verify `npm run build` succeeds cleanly.
* **Risks:** Dependency version conflicts with existing `firebase` package.
* **Validation:** Next.js build passes with zero TypeScript or bundling errors.
* **Expected result:** Clean Next.js foundation ready for progressive component migration.
* **Status:** PENDING.

---

### PHASE 3 — Clean Routing
* **Goal:** Establish unified Next.js App Router hierarchy with route groups matching exact public URL paths.
* **Reason:** Eliminate client-side HTML fetch/injection (`router/router.js`) while maintaining clean single-domain URLs.
* **Dependencies:** Phase 2.
* **Files involved:** `app/(auth)/login/`, `app/(main)/layout.tsx`, `app/(main)/dashboard/`, `app/(main)/analytics/`, etc.
* **Tasks:**
  - [ ] Create route group `app/(auth)/login/page.tsx` for clean `/login` route.
  - [ ] Create route group `app/(main)/layout.tsx` for authenticated shell (sidebar + header).
  - [ ] Create clean route pages: `/dashboard`, `/analytics`, `/focus`, `/daily-actions`, `/schedule`, `/targets`, `/subjects`, `/pace`, `/settings`, `/outcome`, `/exam`.
  - [ ] Configure root `app/(main)/page.tsx` to redirect cleanly to `/dashboard`.
  - [ ] Ensure route groups never leak into URL paths.
* **Risks:** Routing mismatches or broken navigation links.
* **Validation:** All 11 public URLs resolve correctly in local browser.
* **Expected result:** Full URL structure matches clean single-domain requirements.
* **Status:** PENDING.

---

### PHASE 4 — React Component Architecture
* **Goal:** Establish core reusable React component hierarchy preserving exact X-29 visual language.
* **Reason:** Eliminate raw HTML string concatenations and enable declarative component composition.
* **Dependencies:** Phase 3.
* **Files involved:** `components/navigation/`, `components/feedback/`, `components/ui/`.
* **Tasks:**
  - [ ] Build `Sidebar` component reproducing desktop sidebar and mobile off-canvas drawer.
  - [ ] Build `Header` component with Tabular countdown timer and live sync badge.
  - [ ] Build `LoadingOverlay` reproducing animated logo and shimmer progress bar.
  - [ ] Build `Toast` and `Confetti` notification components.
  - [ ] Verify exact visual parity against `index.html` shell.
* **Risks:** Visual drift from original CSS classes.
* **Validation:** Side-by-side visual comparison matches 100%.
* **Expected result:** Shell UI faithfully rendered in modular React.
* **Status:** PENDING.

---

### PHASE 5 — TypeScript Migration
* **Goal:** Create complete TypeScript domain types matching all X-29 data models.
* **Reason:** Enforce end-to-end type safety across state, calculations, and database operations.
* **Dependencies:** Phase 4.
* **Files involved:** `types/appState.ts`, `types/task.ts`, `types/track.ts`, `types/targets.ts`, `types/timer.ts`.
* **Tasks:**
  - [ ] Define `Task`, `Track`, `Program`, `Subject`, `Chapter` types.
  - [ ] Define `MonthlyTarget`, `WeeklyTarget`, `DailyTarget` database schemas.
  - [ ] Define `TimerLog`, `ActiveTimerState`, and `FocusSession` interfaces.
  - [ ] Define complete `FullAppState` type matching all 48 Firestore keys.
  - [ ] Validate types against existing `tests/*.test.js` fixtures.
* **Risks:** Undocumented legacy data properties causing type errors.
* **Validation:** Strict `tsc --noEmit` passes with zero errors.
* **Expected result:** 100% typed domain layer.
* **Status:** PENDING.

---

### PHASE 6 — Shared UI Architecture
* **Goal:** Wrap Radix UI accessible primitives with exact X-29 CSS styling for modals, dropdowns, and tabs.
* **Reason:** Replace monolithic 40-modal DOM footprint with on-demand portal dialogs.
* **Dependencies:** Phase 5.
* **Files involved:** `components/ui/dialog.tsx`, `components/ui/dropdown.tsx`, `components/ui/tabs.tsx`.
* **Tasks:**
  - [ ] Implement `Modal` primitive using Radix Dialog retaining `.glass-card` and animations.
  - [ ] Implement `Dropdown` primitive with program/track optgroup styling.
  - [ ] Implement `Tabs` primitive with active pill indicators.
  - [ ] Wire modal open/close actions to on-demand rendering.
* **Risks:** Backdrop click or escape key handling inconsistencies.
* **Validation:** Modal opens smoothly with identical slide/scale transition; DOM unmounts on close.
* **Expected result:** Clean, accessible primitives with zero residual modal DOM overhead when closed.
* **Status:** PENDING.

---

### PHASE 7 — Zustand State Architecture
* **Goal:** Migrate `window.AppState` into modular Zustand stores with granular selectors.
* **Reason:** Eliminate global variable pollution and prevent unnecessary whole-application re-renders.
* **Dependencies:** Phase 6.
* **Files involved:** `stores/useAppStore.ts`, `stores/useTimerStore.ts`, `stores/useTargetsStore.ts`.
* **Tasks:**
  - [ ] Implement `useAppStore` for tracks, tasks, syllabus, and dashboard configs.
  - [ ] Implement `useTimerStore` for active focus stopwatch/alarm state.
  - [ ] Implement `useTargetsStore` for MTDB, WTDB, and DTDB cascades.
  - [ ] Implement `useAuthStore` for session state and user identity.
  - [ ] Preserve fast synchronous local storage persistence.
* **Risks:** State synchronization lag between stores.
* **Validation:** State updates trigger only subscribed components; unit tests pass.
* **Expected result:** High-performance reactive state management.
* **Status:** PENDING.

---

### PHASE 8 — Firebase / Firestore Architecture
* **Goal:** Migrate Firebase services to Modular SDK v11 and preserve conflict resolution engine.
* **Reason:** Eliminate legacy Compat library footprint (saving 200KB+ JS) while preserving data integrity.
* **Dependencies:** Phase 7.
* **Files involved:** `services/firebase.ts`, `services/auth.ts`, `services/sync.ts`.
* **Tasks:**
  - [ ] Initialize Firebase Modular SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`).
  - [ ] Migrate `AuthService` with email/password login and `ris2k29@gmail.com` admin guard.
  - [ ] Port `onSnapshot` real-time listener with `syncGeneration` and self-echo suppression.
  - [ ] Port array reconciliation logic (`reconcileArrays`) and tombstone tracking (`_tombstones`).
  - [ ] Verify cloud writes match `firestore.rules` schema byte-for-byte.
* **Risks:** Breaking Firestore snapshot merge logic during real-time updates.
* **Validation:** Run full regression cloud sync tests; verify live document in `x-2k-29`.
* **Expected result:** Modernized modular Firebase service with 100% data integrity.
* **Status:** PENDING.

---

### PHASE 9 — IndexedDB / Local-first Layer
* **Goal:** Integrate IndexedDB via `idb` for multi-megabyte offline storage and session history.
* **Reason:** Overcome 5MB `localStorage` limitations and provide true local-first responsiveness.
* **Dependencies:** Phase 8.
* **Files involved:** `services/storage/idb.ts`, `stores/useAppStore.ts`.
* **Tasks:**
  - [ ] Create IndexedDB stores for `appState`, `timerLogs`, and `offlineQueue`.
  - [ ] Implement transparent fallback to `localStorage` when IndexedDB is unavailable.
  - [ ] Implement background offline mutation queue with auto-sync on reconnect.
* **Risks:** Asynchronous storage hydration delays during initial boot.
* **Validation:** Offline mutations persist across reloads and sync to cloud when reconnected.
* **Expected result:** Robust local-first storage capable of holding years of focus logs.
* **Status:** PENDING.

---

### PHASE 10 — Page-by-Page Migration
* **Goal:** Migrate all 11 application feature pages to React Server/Client components with 100% visual and functional parity.
* **Reason:** Transform monolithic page scripts into clean, maintainable feature components.
* **Dependencies:** Phase 9.
* **Sub-Tasks:**
  - [ ] **10.1 Login Page:** Port `login.html` form, validation, and error banner.
  - [ ] **10.2 Dashboard:** Port Totals KPIs, Checklists (Daily, Weekly, Monthly), Success Score.
  - [ ] **10.3 Focus & Timer:** Port Chronograph dial, stopwatch engine, fullscreen mode.
  - [ ] **10.4 Targets Setup:** Port Monthly Target Setup, Batch Allocator, Auto-Spread.
  - [ ] **10.5 Daily Actions:** Port Habits tracker, streaks, and action cards.
  - [ ] **10.6 Daily Schedule:** Port Schedule blocks and Routine Sets.
  - [ ] **10.7 Subjects:** Port Curriculum navigator, progress bars, and revision mode.
  - [ ] **10.8 Pace Management:** Port Pace estimators, candle charts, deadline goals.
  - [ ] **10.9 Master Config:** Port Track creator, priority queue, and syllabus editor.
  - [ ] **10.10 Outcome:** Port Results tracking, celebration configs, confetti triggers.
  - [ ] **10.11 Exam Routine:** Port Exam countdowns, routines, session logs.
  - [ ] **10.12 Spectra Analytics:** Port Chart.js pace curves, 365-day heatmaps.
* **Risks:** Visual discrepancies or missing edge-case handlers.
* **Validation:** Verify visual parity page-by-page against original running version.
* **Expected result:** All 11 pages fully modernized in React.
* **Status:** PENDING.

---

### PHASE 11 — Large File Elimination
* **Goal:** Break down all files exceeding 500 lines into single-responsibility submodules.
* **Reason:** Eliminate technical debt and guarantee long-term maintainability.
* **Dependencies:** Phase 10.
* **Files involved:** `monthlyTargets.js` (282KB), `timerService.js` (118KB), `dashboard.js` (102KB), `taskEngine.js` (95KB), etc.
* **Tasks:**
  - [ ] Split `monthlyTargets` into `allocator.ts`, `autoSpread.ts`, `mtdbTable.ts`, `views/`.
  - [ ] Split `timerService` into `clockEngine.ts`, `fullscreen.ts`, `sessionLogger.ts`, `audio.ts`.
  - [ ] Split `dashboard` into `kpiWidgets/`, `dailyChecklist/`, `weeklyChecklist/`, `trendBars/`.
  - [ ] Split `taskEngine` into `studyPlan.ts`, `taskToggle.ts`, `editModal.ts`, `revision.ts`.
* **Risks:** Broken internal imports or cyclical dependencies.
* **Validation:** All submodules $\le$ 300 lines; zero circular dependencies in import graph.
* **Expected result:** Clean, highly modular feature architecture.
* **Status:** PENDING.

---

### PHASE 12 — Client JavaScript Reduction
* **Goal:** Audit and eliminate unused client-side JavaScript; convert static sections to Server Components.
* **Reason:** Drastically reduce browser CPU load and memory consumption.
* **Dependencies:** Phase 11.
* **Tasks:**
  - [ ] Audit all components for unnecessary `"use client"` directives.
  - [ ] Move static layouts and text containers to Server Components.
  - [ ] Remove unused legacy polyfills and utility functions.
* **Risks:** Attempting to render interactive hooks in Server Components.
* **Validation:** Next.js build manifest shows minimal client bundle sizes per route.
* **Expected result:** Client bundle reduced by > 60%.
* **Status:** PENDING.

---

### PHASE 13 — Performance Optimization
* **Goal:** Optimize loading, runtime rendering, and memory lifecycle.
* **Reason:** Achieve target Core Web Vitals (FCP < 1.5s, LCP < 2.5s, TBT < 150ms).
* **Dependencies:** Phase 12.
* **Tasks:**
  - [ ] Dynamically import heavy Chart.js components using `next/dynamic` (`ssr: false`).
  - [ ] Replace CDN Tailwind with compiled Tailwind CSS at build time.
  - [ ] Optimize images (`logo-sticker.png` converted to modern WebP / AVIF).
  - [ ] Implement memoization (`React.memo`, `useMemo`, `useCallback`) on checklist items and clock hands.
* **Risks:** Chart re-rendering flickering on tab switch.
* **Validation:** Run automated Lighthouse audit; verify Performance Score $\ge$ 90.
* **Expected result:** Blazing fast load times and silky 60fps animations.
* **Status:** PENDING.

---

### PHASE 14 — Mobile Optimization
* **Goal:** Ensure smooth execution and low memory consumption on Android mobile devices.
* **Reason:** Prevent mobile browser crashes or sluggishness during long study sessions.
* **Dependencies:** Phase 13.
* **Tasks:**
  - [ ] Audit touch targets and button spacing across mobile widths.
  - [ ] Optimize SVG clock needle rendering using CSS `will-change: transform`.
  - [ ] Test background timer execution with CPU throttling enabled (4x slowdown).
* **Risks:** Mobile browser sleeping background timers.
* **Validation:** Mobile Chrome DevTools audit passes without frame drops.
* **Expected result:** Native-app feel on mobile devices.
* **Status:** PENDING.

---

### PHASE 15 — Responsive Optimization
* **Goal:** Perfect layout responsiveness across small phones (360px), tablets (768px), and wide monitors (1920px).
* **Reason:** Eliminate horizontal scrolling, clipping, or misaligned cards.
* **Dependencies:** Phase 14.
* **Tasks:**
  - [ ] Fix table overflow on Monthly and Weekly Target databases.
  - [ ] Refine grid columns from 1-column (mobile) to 4-column (desktop).
  - [ ] Verify drawer sidebar backdrop and close behavior across orientations.
* **Risks:** Layout breaks on intermediate viewport widths (e.g. 600px - 720px).
* **Validation:** Responsive resize test across 320px, 375px, 768px, 1024px, 1440px.
* **Expected result:** Flawless fluid layout across all devices.
* **Status:** PENDING.

---

### PHASE 16 — Accessibility (a11y)
* **Goal:** Elevate Accessibility score to $\ge$ 95/100.
* **Reason:** Ensure clear keyboard navigation, ARIA landmarks, and focus management.
* **Dependencies:** Phase 15.
* **Tasks:**
  - [ ] Add explicit `aria-label` attributes to icon buttons.
  - [ ] Ensure proper heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
  - [ ] Implement focus trapping on modal dialogs.
* **Risks:** High-contrast overrides clashing with dark theme aesthetic.
* **Validation:** Lighthouse Accessibility score passes $\ge$ 95.
* **Expected result:** Fully accessible technical operating system.
* **Status:** PENDING.

---

### PHASE 17 — PWA / Service Worker
* **Goal:** Implement production-grade Service Worker for offline asset caching and PWA installation.
* **Reason:** Complete missing baseline PWA functionality without stale data risks.
* **Dependencies:** Phase 16.
* **Files involved:** `public/sw.js`, `manifest.json`.
* **Tasks:**
  - [ ] Configure Serwist / Workbox Service Worker.
  - [ ] Precaching static assets (HTML, CSS, JS bundles, fonts, icons).
  - [ ] Implement Network-First with Cache Fallback for API and Firestore endpoints.
  - [ ] Wire PWA `beforeinstallprompt` event to `#pwa-install-btn`.
* **Risks:** Aggressive caching serving stale study or targets data.
* **Validation:** Application loads fully in Chrome with "Offline" network throttling.
* **Expected result:** Fully installable, resilient offline PWA.
* **Status:** PENDING.

---

### PHASE 18 — Production Optimization
* **Goal:** Prepare production build for Vercel deployment with optimal headers, caching, and compression.
* **Reason:** Ensure production performance and security compliance.
* **Dependencies:** Phase 17.
* **Tasks:**
  - [ ] Configure `vercel.json` with security headers (CSP, HSTS, X-Frame-Options).
  - [ ] Configure asset caching headers (`Cache-Control: public, max-age=31536000, immutable`).
  - [ ] Verify production bundle analyzer report.
* **Risks:** Strict CSP blocking Firebase Auth or Google Fonts.
* **Validation:** Successful production build and test deployment on Vercel preview.
* **Expected result:** Production-grade deployment configuration.
* **Status:** PENDING.

---

### PHASE 19 — Final Regression Testing
* **Goal:** Execute end-to-end regression validation comparing original vs modernized versions.
* **Reason:** Guarantee 100% functional, mathematical, and visual parity.
* **Dependencies:** Phase 18.
* **Tasks:**
  - [ ] Run all automated unit and integration suites (`full-regression.test.js`).
  - [ ] Perform side-by-side visual parity checks across all 11 pages.
  - [ ] Verify task toggling, target cascade, focus timer session logging, and Firestore sync.
  - [ ] Test backup and restore compatibility against live database.
* **Risks:** Uncovered edge cases in target calculation propagation.
* **Validation:** 100% test pass rate, zero console errors, zero visual regression.
* **Expected result:** Certified modernized X-29 Advance.
* **Status:** PENDING.

---

### PHASE 20 — Final Cleanup
* **Goal:** Safely decommission legacy scripts and archive unneeded files with verified rollback checkpoint.
* **Reason:** Deliver a spotless, modern codebase without residual dead files.
* **Dependencies:** Phase 19.
* **Tasks:**
  - [ ] Archive legacy scripts into `archive/` or remove verified redundant files.
  - [ ] Finalize documentation in `docs/MEMORY.md`.
  - [ ] Create permanent release Git tag: `v2.0.0-modernized`.
* **Risks:** Accidentally deleting a file needed by CLI backup scripts.
* **Validation:** `npm test` and backup scripts run cleanly post-cleanup.
* **Expected result:** Clean, high-performance, maintainable X-29 codebase.
* **Status:** PENDING.
