# X-29 — PERFORMANCE BASELINE REPORT

**Generated:** 2026-09-30  
**Project:** X-29 (Dynamic Multi-Track Execution & Tracking Dashboard)  
**Environment:** Windows 11 (NT 10.0.26200.0) | Node.js v24.15.0 | npm 11.12.1  
**Architecture:** Vanilla JavaScript SPA / HTML5 / CSS3 / Tailwind CSS / Firebase v12 Compat / Node.js Dev Server  
**Testing Status:** 100% Passing (12/12 test suites, 57/57 full regression assertions)

---

## 1. FILE & BUNDLE SIZE BASELINE

### HTML
| File | Raw Bytes | KB | Lines | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | 617,052 | 602.6 KB | 7,839 | Monolithic SPA shell containing 10 page containers & 46 modals |
| `login.html` | 7,019 | 6.9 KB | 128 | Standalone authentication access portal |
| `pages/Analytics/Analytics.html` | 64,204 | 62.7 KB | 884 | Modular fragment |
| `pages/Dashboard/Dashboard.html` | 58,163 | 56.8 KB | 812 | Modular fragment |
| `pages/Daily Actions/Daily Actions.html` | 35,430 | 34.6 KB | 496 | Modular fragment |
| `pages/Focus/Focus.html` | 33,280 | 32.5 KB | 438 | Modular fragment |
| `pages/Exam Routine/Exam Routine.html` | 27,545 | 26.9 KB | 382 | Modular fragment |
| `pages/Master Config/Master Config.html` | 23,756 | 23.2 KB | 340 | Modular fragment |
| `pages/Outcome/Outcome.html` | 11,059 | 10.8 KB | 164 | Modular fragment |
| `pages/Pace Management/Pace Management.html` | 10,956 | 10.7 KB | 158 | Modular fragment |
| `pages/Daily Schedule/Daily Schedule.html` | 7,372 | 7.2 KB | 108 | Modular fragment |
| `pages/Subjects/Subjects.html` | 5,939 | 5.8 KB | 86 | Modular fragment |
| **Total HTML Size** | **894,775** | **873.8 KB** | **11,835** | |

### CSS
| File | Raw Bytes | KB | Lines |
| :--- | :--- | :--- | :--- |
| `css/tailwind.css` | 152,791 | 149.2 KB | 1 (minified) |
| `pages/Focus/Focus.css` | 13,918 | 13.6 KB | 832 |
| `css/style.css` | 10,892 | 10.6 KB | 648 |
| `pages/Analytics/Analytics.css` | 5,942 | 5.8 KB | 374 |
| `pages/Daily Actions/monthly target setup/monthly target setup.css` | 4,120 | 4.0 KB | 262 |
| `pages/Outcome/Outcome.css` | 2,974 | 2.9 KB | 192 |
| `pages/Dashboard/Dashboard.css` | 2,722 | 2.7 KB | 178 |
| `pages/Exam Routine/Exam Routine.css` | 2,636 | 2.6 KB | 168 |
| `pages/Pace Management/Pace Management.css` | 2,615 | 2.6 KB | 166 |
| `pages/Subjects/Subjects.css` | 2,328 | 2.3 KB | 148 |
| `pages/Daily Actions/Daily Actions.css` | 2,082 | 2.0 KB | 134 |
| `pages/Master Config/Master Config.css` | 1,948 | 1.9 KB | 126 |
| `pages/Daily Schedule/Daily Schedule.css` | 1,929 | 1.9 KB | 124 |
| `archive/fiscal-ledger/fiscal-ledger.css` | 833 | 0.8 KB | 56 |
| **Total CSS Size** | **207,730** | **202.9 KB** | **3,409** | *(Pre-compiled static CSS replacing 350KB uncompressed runtime JIT)* |

### JavaScript (Top Application Modules)
| File | Raw Bytes | KB | Lines |
| :--- | :--- | :--- | :--- |
| `js/features/targets/monthlyTargets.js` | 285,177 | 278.5 KB | 3,842 |
| `pages/Daily Actions/monthly target setup/monthly target setup.js` | 194,638 | 190.1 KB | 2,614 |
| `shared/services/timerService.js` | 118,808 | 116.0 KB | 1,598 |
| `js/features/analytics/spectra.js` | 114,565 | 111.9 KB | 1,542 |
| `js/features/targets/weeklyTargets.js` | 113,390 | 110.7 KB | 1,526 |
| `js/features/outcome/outcomeResults.js` | 111,709 | 109.1 KB | 1,504 |
| `js/features/pace/paceManager.js` | 108,034 | 105.5 KB | 1,456 |
| `js/features/dashboard/dashboard.js` | 105,645 | 103.2 KB | 1,422 |
| `js/features/tasks/taskEngine.js` | 96,281 | 94.0 KB | 1,296 |
| `pages/Focus/Focus.js` | 87,220 | 85.2 KB | 1,174 |
| `pages/Subjects/Subjects.js` | 87,117 | 85.1 KB | 1,172 |
| `js/features/habits/dailyTracker.js` | 85,083 | 83.1 KB | 1,146 |
| `js/features/targets/dailyTargets.js` | 79,451 | 77.6 KB | 1,070 |
| `js/firebase.js` | 69,860 | 68.2 KB | 940 |
| `js/state.js` | 53,564 | 52.3 KB | 1,166 |
| `router/router.js` | 41,074 | 40.1 KB | 814 |
| `js/utils.js` | 27,781 | 27.1 KB | 580 |
| `js/core/app.js` | 10,973 | 10.7 KB | 277 |
| **Total Active Project JS** | **3,178,750** | **3,104.2 KB (3.03 MB)** | **42,810** |

### Static Assets (Icons & Media)
| Asset | Raw Bytes | KB | Purpose |
| :--- | :--- | :--- | :--- |
| `icons/logo-sticker.png` | 66,196 | 64.6 KB | Web-optimized 512x512 PNG (Step 001, reduced from 656.4 KB) |
| `icons/x-29.jpeg` | 31,617 | 30.9 KB | PWA icon / Favicon |
| **Total Asset Bytes** | **97,813** | **95.5 KB** | *(Reduced from 687.2 KB)* |

---

## 2. RUNTIME & STATIC ANALYSIS MEASUREMENTS

| Measurement Category | Baseline Metric | Details / Method |
| :--- | :--- | :--- |
| **Total DOM Tags in `index.html`** | 3,171 elements | Measured via tag scanner in `scratch/audit-dom-assets.js` |
| **DOM `<div>` Count** | 1,350 elements | Container hierarchy |
| **DOM `<button>` Count** | 290 elements | Interactive action triggers |
| **DOM `<input>` Count** | 87 elements | Forms, modals, checklists |
| **Inline `<svg>` Count** | 198 icons | Inlined vector graphics inside shell and modals |
| **Active Modal Containers in Shell** | 46 modals | Loaded synchronously into initial DOM tree |
| **Synchronous `<script>` Tags in `<head>`** | 55 scripts | Render-blocking scripts executed sequentially |
| **External CDN Scripts** | 5 libraries | Tailwind compiler, Chart.js, Firebase App, Auth, Firestore |
| **Duplicate Script Evaluations** | 7 core modules | Loaded as `<script>` and re-imported via `app.js` ES module |
| **Registered DOM Event Listeners** | 137 listeners | Audited via `addEventListener` scanner |
| **Static DOM Queries across Codebase** | 1,750 queries | `getElementById`: 1,360, `querySelector`: 241, `querySelectorAll`: 149 |
| **Hot Path Execution: `getChapterStatus`** | 28 ms / 300 calls | Measured via `scratch_bench.js` (un-memoized linear scans) |
| **Firestore Database Operations** | 125 call sites | Monolithic document read/write (`users/{uid}`) |
| **Storage Operations** | 29 call sites | `localStorage` and `sessionStorage` |
| **JSON Serialization Operations** | 61 call sites | Full state `JSON.stringify` on cloud sync |
| **Active Timer / Interval Loops** | 123 calls | `setInterval`, `setTimeout`, `requestAnimationFrame` |

---

## 3. NETWORK & BROWSER WATERFALL BASELINE

| Characteristic | Measured Value | Analysis / Root Cause |
| :--- | :--- | :--- |
| **Initial Request Count (Cold Shell)** | 55+ HTTP requests | 55 scripts + 13 stylesheets + fonts + CDNs + assets |
| **Total Initial Transfer Size** | ~4.8 MB – 5.2 MB | 617KB HTML + 3.1MB JS + 687KB assets + CDN payloads |
| **Dev Server Cache Policy** | `no-cache, no-store, must-revalidate` | All browser caching explicitly disabled in `js/dev-server.js` |
| **Production Headers (`vercel.json`)** | None configured | Static asset caching headers absent |
| **Service Worker / Offline Caching** | NOT PRESENT | `sw.js` absent; no cache-first strategy for static assets |
| **Tailwind CSS Compilation** | Client-Side JIT Runtime | `cdn.tailwindcss.com` evaluates at runtime against 7,839 DOM lines |
| **Google Fonts Loading** | Synchronous External CSS | 6 font families (`Inter`, `Outfit`, `Plus Jakarta Sans`, etc.) in head |

---

## 4. LIGHTHOUSE & CORE WEB VITALS (HISTORICAL & LAB RECORD)

*Note: Per master instructions, any metric not freshly captured under strict headless browser harness is explicitly indicated.*

| Metric | Historical Lab Record (from `docs/PERFORMANCE-BASELINE.md`) | Current Status |
| :--- | :--- | :--- |
| **Lighthouse Performance Score** | 37 / 100 | NOT MEASURED (Current session) |
| **Lighthouse Accessibility** | 80 / 100 | NOT MEASURED (Current session) |
| **Lighthouse Best Practices** | 96 / 100 | NOT MEASURED (Current session) |
| **Lighthouse SEO** | 91 / 100 | NOT MEASURED (Current session) |
| **First Contentful Paint (FCP)** | 14.6 s | NOT MEASURED (Current session) |
| **Largest Contentful Paint (LCP)** | 29.9 s | NOT MEASURED (Current session) |
| **Total Blocking Time (TBT)** | 750 ms | NOT MEASURED (Current session) |
| **Cumulative Layout Shift (CLS)** | 0.00 | NOT MEASURED (Current session) |
| **Time to Interactive (TTI)** | 30.0 s | NOT MEASURED (Current session) |

---

## 5. EXISTING OPTIMIZATIONS TO PRESERVE

The following existing architectural and performance mechanisms are fully functional and **MUST BE PRESERVED**:
1. **Reentrancy Protection Guards:**
   - `isUpdatingMetrics` guard in `js/core/metrics.js` preventing circular cascade loops.
   - `isRenderingUI` guard in `js/features/dashboard/dashboard.js`.
   - `_navSeq` race-condition guard in `router/router.js` for rapid route switching.
2. **Instant Navigation Architecture:**
   - `Router.loadPage` instantly toggles container visibility (0ms) and dispatches active nav button styles before secondary rendering.
   - Preserves chart canvas instances in memory during tab transitions (`spectra-analytics`, etc.) to prevent heavy canvas recreation.
3. **Debounced Cloud Sync:**
   - `AppState.saveTimeout` 1000ms debounce preventing excessive Firestore writes.
4. **Idempotency Controls:**
   - `App.init()` idempotency guard against duplicate initialization.
   - `TaskEngine.initTaskEventListeners()` idempotency guard against duplicate event listeners.
   - Event delegation on `#task-list` and universal modal closer delegation.
