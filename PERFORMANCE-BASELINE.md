# X-29 — PERFORMANCE BASELINE REPORT

**Generated:** 2026-09-30  
**Phase:** Ultra-Fast Page / Route Performance Optimization (Route Audit)  
**Project:** X-29 (Dynamic Multi-Track Execution & Tracking Dashboard)  
**Environment:** Windows 11 | Node.js v24.15.0 | npm 11.12.1  
**Architecture:** Vanilla JavaScript SPA / HTML5 / Pre-compiled CSS / Tailwind CSS / Firebase v12 Compat  
**Testing Status:** 100% Passing (12/12 test suites, 58/58 full regression checkpoints)

---

## 1. ROUTE & PAGE ASSET MATRIX

Detailed audit of all 11 application routes, their container bindings, route-specific JavaScript modules, route-specific stylesheets, and HTML template fragments.

| Route Key | Target Container ID | Route JS Module | JS Size | Route Stylesheet | CSS Size | HTML Fragment | HTML Size | In Shell DOM? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `dashboard` | `page-dashboard` | `pages/Dashboard/Dashboard.js` | 5.3 KB | `pages/Dashboard/Dashboard.css` | 2.7 KB | `pages/Dashboard/Dashboard.html` | 56.8 KB | **Yes** (Embedded) |
| `spectra-analytics` | `page-spectra-analytics` | `pages/Analytics/Analytics.js` | 6.6 KB | `pages/Analytics/Analytics.css` | 5.8 KB | `pages/Analytics/Analytics.html` | 62.7 KB | **Yes** (Embedded) |
| `timer` (`focus`) | `page-timer` | `pages/Focus/Focus.js` | 85.2 KB | `pages/Focus/Focus.css` | 13.6 KB | `pages/Focus/Focus.html` | 32.5 KB | **Yes** (Embedded) |
| `daily-actions` | `page-daily-actions` | `pages/Daily Actions/Daily Actions.js` | 3.7 KB | `pages/Daily Actions/Daily Actions.css` | 2.0 KB | `pages/Daily Actions/Daily Actions.html` | 34.6 KB | **Yes** (Embedded) |
| `schedule` | `page-schedule` | `pages/Daily Schedule/Daily Schedule.js` | 1.3 KB | `pages/Daily Schedule/Daily Schedule.css` | 1.9 KB | `pages/Daily Schedule/Daily Schedule.html` | 7.2 KB | **Yes** (Embedded) |
| `monthly-target-setup`| `page-monthly-target-setup`| `pages/Daily Actions/monthly target setup/monthly target setup.js` | 190.1 KB | `pages/Daily Actions/monthly target setup/monthly target setup.css` | 4.0 KB | `pages/Daily Actions/monthly target setup/monthly target setup.html` | 41.5 KB | **Yes** (Embedded) |
| `subjects` | `page-subjects` | `pages/Subjects/Subjects.js` | 85.1 KB | `pages/Subjects/Subjects.css` | 2.3 KB | `pages/Subjects/Subjects.html` | 5.8 KB | **Yes** (Embedded) |
| `paces-management` | `page-paces-management` | `pages/Pace Management/Pace Management.js` | 2.3 KB | `pages/Pace Management/Pace Management.css` | 2.6 KB | `pages/Pace Management/Pace Management.html` | 10.7 KB | **Yes** (Embedded) |
| `master-config` | `page-master-config` | `pages/Master Config/Master Config.js` | 7.3 KB | `pages/Master Config/Master Config.css` | 1.9 KB | `pages/Master Config/Master Config.html` | 23.2 KB | **Yes** (Embedded) |
| `outcome` | `page-outcome` | `pages/Outcome/Outcome.js` | 7.0 KB | `pages/Outcome/Outcome.css` | 2.9 KB | `pages/Outcome/Outcome.html` | 10.8 KB | **Yes** (Embedded) |
| `exam` | `page-exam` | `pages/Exam Routine/Exam Routine.js` | 0.9 KB | `pages/Exam Routine/Exam Routine.css` | 2.6 KB | `pages/Exam Routine/Exam Routine.html` | 26.9 KB | **Yes** (Embedded) |
| **TOTALS** | **11 Routes** | **11 Scripts** | **394.8 KB** | **11 Stylesheets** | **42.2 KB** | **11 Fragments** | **312.6 KB** | **11/11 in Shell** |

---

## 2. COLD STARTUP ROUTE OVERHEAD BASELINE

### JavaScript Payload in `<head>`
* **Total `<script>` Tags in `<head>`:** 59
* **Route-Specific `<script>` Tags in `<head>`:** 11
* **Cold Weight of Inactive Route Scripts:** **394.8 KB (404,294 bytes)**
* **Heaviest Inactive Route Modules Downloaded & Evaluated on Cold Boot:**
  1. `monthly target setup.js`: 190.1 KB (2,614 lines) — 48.1% of route JS
  2. `Focus.js`: 85.2 KB (1,174 lines) — 21.6% of route JS
  3. `Subjects.js`: 85.1 KB (1,172 lines) — 21.5% of route JS
  * *Top 3 Inactive Route Modules represent 360.4 KB (91.2%) of upfront route JavaScript!*

### CSSOM Construction in `<head>`
* **Total Stylesheet `<link>` Tags in `<head>`:** 15
* **Route-Specific `<link>` Tags in `<head>`:** 11
* **Cold Weight of Inactive Route Stylesheets:** **42.2 KB (43,214 bytes)**
* **Impact:** The browser's HTML parser must construct CSSOM nodes and calculate style cascades for 11 distinct route stylesheets upfront before painting the initial active view.

---

## 3. URL ROUTING & NAVIGATION BEHAVIOR BASELINE

| Capability | Current State | Defect / Bottleneck |
| :--- | :--- | :--- |
| **Route State Switching** | Handled internally in `Router.loadPage()` | Operates via DOM class toggling (`hidden` vs `animate-page-enter`) |
| **Address Bar Synchronization** | **None** (`pushState` / `replaceState` disabled) | URL remains static (`/` or `/index.html`) regardless of active page |
| **Direct Deep-Linking** | **Fails (404 Not Found)** | Navigating directly to `x.vercel.app/subjects` or `localhost:3000/subjects` returns 404 |
| **Vercel Production Rewrites** | Only `/login` rewritten to `/login.html` | No SPA fallback rewrite rule for routes in `vercel.json` |
| **Local Dev-Server Rewrites** | Only `/login` rewritten to `/login.html` | `dev-server.js` fails with 404 on clean route paths |
| **Browser Back/Forward Buttons** | **Inoperable** | Browser back/forward navigation does not trigger route transitions |
| **Predictive Preloading** | **None on hover / touch** | Zero prefetching occurs during the 100-300ms hover-to-click user window |
| **Background Preload Loop** | Eager unguided loop in `preloadAllRoutes()` | Sequentially attempts to load all 10 routes, consuming mobile bandwidth |

---

## 4. MAIN-THREAD ROUTE TRANSITION LATENCY BASELINE

Measurements of synchronous execution time and DOM operations when switching between routes:

| Route Transition | Synchronous Mount Operations in `onMount()` | Main-Thread Work Profile | Perceived Transition Quality |
| :--- | :--- | :--- | :--- |
| **Dashboard → Daily Actions** | Calls `renderDailyTracker()`, `renderDailyLogs()`, `renderMonthlyTargets()`, `renderWeeklyTargets()`, `renderDailyTargets()` | High: 5 multi-section render loops synchronously executed; heavy HTML string generation | Micro-stutter / dropped frame during slide-up |
| **Dashboard → Subjects** | Calls `renderSubjectNavigation()`, `renderSubjectProgress()`, `renderTaskList()`, `updateMetrics()` | High: Full syllabus scan across 365 daily task objects, hundreds of checkbox nodes generated synchronously | 40-90ms synchronous main-thread block |
| **Dashboard → Analytics** | Re-instantiates or resizes 5 Chart.js instances | Medium: Canvas pixel re-projections and Chart.js layout computations | Mild canvas stutter |
| **Dashboard → Master Config** | Re-populates track dropdowns and builds priority table | Low-Medium: Synchronous table DOM injection | Fast |
| **Dashboard → Exam** | Initializes exam countdown and routine table | Low: Lightweight DOM updates | Smooth |
| **Dashboard → Focus/Timer** | Initializes dial svg and session history list | Low-Medium: Chronograph dial DOM setup | Smooth |

---

## 5. MOBILE & TOUCH PERFORMANCE BASELINE

* **Viewport Configuration:** Present (`<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`).
* **Tap Latency:** Nav buttons lack explicit `touch-action: manipulation`, risking 300ms double-tap delay on certain mobile webviews.
* **Drawer Dismissal:** Mobile drawer close (`window.closeMobileSidebar()`) executes synchronously on the same thread as route mounting, competing for animation frames and causing drawer stutter.
* **Mobile Bandwidth Awareness:** Background route preloading does not check `navigator.connection.saveData` or `effectiveType`, potentially wasting data on metered 3G/4G connections.

---

## 6. PHASE 1 FOUNDATIONAL OPTIMIZATIONS (COMPLETED)

Before this Route Performance Audit, Phase 1 established the following performance achievements:
1. **Asset Compression:** `icons/logo-sticker.png` reduced from 656.4 KB to 64.6 KB (-90.15%).
2. **Font Deferral:** Google Fonts made asynchronous (0 render-blocking font links).
3. **Script Deferral:** 58 synchronous head scripts converted to `defer`.
4. **Tailwind Pre-compilation:** Runtime JIT compiler replaced with 149 KB static CSS (-150 to -400ms startup CPU).
5. **Memoization Engine:** O(1) Map chapter status cache in `taskEngine.js` (>99% faster warm lookups).
6. **KPI Indexing:** Single-pass KPI metrics engine (-76.8% runtime).
7. **DOM Query Caching:** Cached element lookups in `monthlyTargets.js` and `dom.js`.
8. **Chart Deferral:** Off-screen chart initialization deferred (-99.6% idle CPU).
9. **SVG Sprite:** Modular modal SVG sprite reduced payload by 84 KB.
10. **Cloud Serialization:** Coalesced cloud sync and revision-indexed serialization (-73% serialization time).
11. **Cache Headers:** Tiered immutable/ETag caching in `vercel.json` and `dev-server.js`.
12. **Service Worker:** Offline PWA caching via `sw.js` (58/58 test checkpoints passing).

---

## 7. TARGET PERFORMANCE METRICS FOR ROUTE OPTIMIZATION

* **Initial Route JavaScript:** Reduce cold route JS from **394.8 KB to ~5.3 KB** (-98.6% reduction in cold route scripts).
* **Initial Route CSS:** Reduce cold route CSS from **42.2 KB to ~2.7 KB** (-93.6% reduction in cold route CSS).
* **Click-to-Transition Latency:** **< 16 ms** (Frame 1 instant feedback for active nav state & view visibility).
* **Route Switching Frame Rate:** **Steady 60 fps** during slide-up animations (`.animate-page-enter`).
* **Deep-Link Route Resolution:** **100% PASS** on `/dashboard`, `/subjects`, `/schedule`, `/analytics`, `/exam`, etc.
* **Mobile Tap Response:** Immediate (< 50 ms) touch feedback and simultaneous smooth drawer slide-out.
