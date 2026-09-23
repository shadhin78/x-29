# X-29 ADVANCE — PERSISTENT AI PROJECT MEMORY

> **Document Version:** 1.0.0  
> **Last Updated:** 2026-09-23  
> **Status:** Active Memory Ledger  
> **Current Phase:** Phase 0 (Full Audit & AI Project Memory Initialization) — Completed  
> **Next Recommended Phase:** Phase 1 (Baseline & Safety Checkpoints)

---

## 1. Migration Phase & Progress Ledger

* **Active Phase:** Phase 0 — Full Audit & Contextual Initialization.
* **Completed Milestones:**
  * Complete repository inspection: all folders, modules, pages, configurations, and assets indexed.
  * Dependency graph and large file profiling completed.
  * Automated regression test suite executed (57/57 tests passing in `tests/full-regression.test.js`).
  * Firestore security rules (`firestore.rules`) and document schema analyzed.
  * AI Project Memory files initialized in `docs/`:
    * `docs/PRD.md` — Real product requirements, use cases, and non-negotiables.
    * `docs/ARCHITECTURE.md` — Current baseline vs. target Next.js 16/React/TypeScript architecture.
    * `docs/RULES.md` — Strict governance, zero-redesign rule, security, and performance standards.
    * `docs/DESIGN.md` — Complete documentation of existing visual language, typography, and components.
    * `docs/TASKS.md` — 21-phase comprehensive modernization roadmap with validation criteria.
    * `docs/MEMORY.md` — Persistent cross-session knowledge base.

---

## 2. Latest Architectural Discoveries & Decisions

1. **Monolithic Firestore Document (`/users/{userId}`):**
   * The live database (`x-2k29`) stores the entire user workspace inside a single document.
   * `firestore.rules` enforces a strict whitelist of 48 top-level keys.
   * *Architectural Decision:* Any modernization must preserve the schema of this monolithic document byte-for-byte to maintain 100% compatibility with existing backups and the Node.js backup/restore tools (`scripts/backup.js`, `scripts/restore.js`).
2. **Conflict Resolution & Array Reconciliation:**
   * A sophisticated sync engine is already implemented in `js/firebase.js` using `_lastWriteId` matching, `syncGeneration` tokens, `syncSessionId`, and `_tombstones` tracking.
   * *Architectural Decision:* When migrating to React/Zustand, this conflict resolution engine must be ported directly to avoid data corruption during multi-device or offline use.
3. **Target Cascade Hierarchy:**
   * The multi-tier targets hierarchy (`monthlyTargetsDatabase` $\rightarrow$ `weeklyTargetsDatabase` $\rightarrow$ `dailyTargetsDatabase` $\rightarrow$ `tasks`) is tightly coupled. Toggling a task in `taskEngine.js` triggers optimistic updates, metrics recalculation, and bi-directional target reconciliation.
   * *Architectural Decision:* Target models must not be changed. The cascade logic will be preserved in a dedicated `useTargetsStore` and `useTasksStore`.
4. **40 Inline Modals in Shell:**
   * `index.html` currently carries 40 distinct modal dialog markups loaded upfront.
   * *Architectural Decision:* Replace this massive static DOM payload with accessible Radix UI dialog primitives rendered conditionally on demand.
5. **Absent Service Worker:**
   * Although `manifest.json` and PWA icons exist, `sw.js` is not implemented in the current baseline.
   * *Architectural Decision:* Implement a robust Workbox/Serwist Service Worker with a conservative Network-First caching strategy to prevent serving stale study data.

---

## 3. Top Large Files & Refactoring Targets

| File | Size | Responsibility | Modernization Strategy |
| :--- | :--- | :--- | :--- |
| `index.html` | 294.7 KB | SPA shell + 40 modals | Next.js App Router shell + on-demand portal modals |
| `js/features/targets/monthlyTargets.js` | 282.0 KB | MTDB, auto-spread, batch allocator | Split into allocator, auto-spread, and MTDB view components |
| `pages/Daily Actions/monthly target setup/monthly target setup.js` | 194.2 KB | Target setup view | Eliminate duplication; consume shared target store |
| `shared/services/timerService.js` | 118.8 KB | Focus clock, alarms, logs, sessions | Split into clock engine, fullscreen modal, and logger |
| `js/features/targets/weeklyTargets.js` | 112.7 KB | WTDB, ISO week allocations | Modularize weekly target cascade into discrete hooks |
| `js/features/analytics/spectra.js` | 112.6 KB | Spectra charts & heatmaps | Dynamically imported React Chart.js components |
| `js/features/outcome/outcomeResults.js` | 111.4 KB | Results, passing grades, celebration | Deconstruct HTML strings into typed React components |
| `js/features/pace/paceManager.js` | 107.7 KB | Velocity estimation & deadlines | Pure TypeScript math functions + UI components |
| `js/features/dashboard/dashboard.js` | 102.8 KB | Dashboard checklists & KPI cards | Split into KPI cards, Daily Checklist, and Trend widgets |
| `js/features/tasks/taskEngine.js` | 94.9 KB | Task scheduling, toggling, dates | Split into study plan generator, task toggle, and edit modal |

---

## 4. Known Technical Problems & Gotchas

1. **Render-Blocking CDNs:**
   * `<head>` loads Tailwind JIT CDN (`cdn.tailwindcss.com`), Chart.js CDN, and Firebase Compat libraries. These explain the 14.6s FCP and 29.9s LCP recorded in the performance baseline.
2. **Circular Invocation Risks:**
   * Past development encountered reentrancy loops between `handleTaskToggle()`, `updateMetrics()`, `renderTaskList()`, and `renderUI()`.
   * *Safety Guard:* Reentrancy flags (`isUpdatingMetrics`, `isRenderingUI`) are currently present. When refactoring to Zustand/React, reactive unidirectional data flow will eliminate the need for manual reentrancy flags.
3. **Startup Null Reference Guard:**
   * Baseline audit noted: `updateManageDropdown()` historically threw a TypeError on startup if the Master Config DOM fragment was not yet injected. The current code guards against this, but component-based scoping will permanently eliminate cross-page DOM lookup errors.
4. **Desktop Fullscreen vs. Mobile Navigation:**
   * The Focus Timer fullscreen mode uses strict hardware acceleration (`transform: translate3d(0, 0, 0)`) and fixed viewport overrides. When porting to React, ensure browser fullscreen and CSS fullscreen states remain properly isolated.

---

## 5. Performance Baseline Summary (2026-09-05)

* **Performance Score:** 37 / 100
* **Accessibility Score:** 80 / 100
* **Best Practices:** 96 / 100
* **SEO:** 91 / 100
* **First Contentful Paint (FCP):** 14.6 s
* **Largest Contentful Paint (LCP):** 29.9 s
* **Time to Interactive (TTI):** 30.0 s
* **Total Blocking Time (TBT):** 750 ms
* **Cumulative Layout Shift (CLS):** 0
* **Total Network Transferred:** 5.02 MB across 47 requests
* **Total Project JS:** 2.54 MB across 25 scripts

---

## 6. Last Verified State & Git Checkpoint

* **Branch:** `main`
* **Commit:** `21d935b` (feat: add master configuration module and UI pages)
* **Automated Tests:** 57 / 57 passing (`node tests/full-regression.test.js`)
* **Working Tree:** Clean (all documentation committed or ready for checkpoint).

---

## 7. Next Recommended Task

When instructed by the user to proceed:
1. **Initiate Phase 1:** Run `node scripts/backup.js` and `node scripts/verify-backup.js` to ensure a verified live cloud snapshot is recorded in `D:\X-29 Project\X-29\X-29-backup\`.
2. **Create Git Checkpoint:** Commit the documentation suite before modifying project infrastructure.
3. **Await instruction to begin Phase 2 (Next.js Foundation).**
