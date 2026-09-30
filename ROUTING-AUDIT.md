# X-29 — ROUTING AUDIT & REAL URL ROUTING SPECIFICATION

**Document Version:** 2.0.0  
**Timestamp:** 2026-10-01T03:06:00+06:00  
**Status:** IMPLEMENTED & FULLY VERIFIED  

---

## 1. Executive Summary

This audit establishes the comprehensive root-cause analysis, architecture, and verification of genuine URL routing across the X-29 application.

Every existing page in the project now has its own **real, clean canonical route**. When users navigate between pages (e.g. Dashboard → Timer → Subjects), the browser address bar dynamically and instantly updates to the canonical URL (`/timer`, `/subjects`, etc.). Direct visits and page refreshes (`F5`) preserve the exact route and pre-render the active container in permanent dark mode without flickering, 404 errors, or bouncing back to `/`.

---

## 2. Root Cause Analysis

### Investigation Findings
1. **Client-Side Internal State Switching (Original Mechanism):**
   * The application was originally constructed as a single-page DOM visibility switcher.
   * `router/router.js` explicitly defined its primary role as:
     `"1. Internal application state switching (NO URL routing, NO pushState, NO page reload)."`
   * When a user clicked navigation buttons (`data-switch-page="..."` or `window.switchPage(...)`), the router simply toggled the CSS `hidden` class on `<div id="page-*">` containers inside `#main-content-panel`.
   * Because `window.history.pushState` was not called during page transitions, the browser address bar remained frozen at `https://x-29.vercel.app/` (or `http://localhost:3000/`).

2. **Server-Side Directory & Trailing Slash Collisions:**
   * When static route directories (`/timer/index.html`, `/dashboard/index.html`) were generated, standard web servers and local preview servers redirected `/timer` to `/timer/` (HTTP 301/302).
   * This broke parity with clean route URLs and caused trailing slash discrepancies between local development and production.

3. **Lack of Static Route Pre-Rendering:**
   * Generated static route files were initially identical clones of `index.html` where `page-dashboard` was displayed by default and other pages were set to `class="hidden"`.
   * On direct visits to `/timer`, the browser would briefly flash the Dashboard before JavaScript parsed and hydrated the Timer view.

4. **Initial Boot Overwrite:**
   * On initial page load, `Router.init()` previously forced `this.loadPage('dashboard')` or pushed `/dashboard` over `/`, destroying the distinction between Home (`/`) and Dashboard (`/dashboard`).

---

## 3. Route-by-Route Specification

### Route 1: Home
* **Route:** `/`
* **Page:** Dashboard (Home Landing)
* **Local URL:** `http://127.0.0.1:3000/`
* **Production URL:** `https://x-29.vercel.app/`
* **Current Behavior:** Loads root `index.html`, displays Dashboard view, keeps `/` in address bar.
* **Expected Behavior:** Directly addressable landing route displaying the dashboard workspace at `/`.
* **Root Cause:** Default root entry point.
* **Implementation:** `index.html` configured with `<base href="/">`, permanent dark mode, and `page-dashboard` visible.
* **Status:** PASS

### Route 2: Dashboard
* **Route:** `/dashboard`
* **Page:** Dashboard
* **Local URL:** `http://127.0.0.1:3000/dashboard`
* **Production URL:** `https://x-29.vercel.app/dashboard`
* **Current Behavior:** Directly addressable at `/dashboard`; updates address bar to `/dashboard` upon navigation.
* **Expected Behavior:** Address bar displays `/dashboard` on direct open, navigation, and refresh.
* **Root Cause:** Original router stayed at `/`.
* **Implementation:** `Router.getPathForPageId('dashboard')` returns `/dashboard`. `dashboard/index.html` pre-rendered with active container.
* **Status:** PASS

### Route 3: Timer
* **Route:** `/timer`
* **Page:** Focus / Timer
* **Local URL:** `http://127.0.0.1:3000/timer`
* **Production URL:** `https://x-29.vercel.app/timer`
* **Current Behavior:** Displays Focus/Timer interface, address bar displays `/timer`.
* **Expected Behavior:** Address bar displays `/timer` on direct open, navigation, and refresh.
* **Root Cause:** Nav clicks toggled `page-timer` DOM visibility without updating `history.pushState`.
* **Implementation:** `CANONICAL_PATH_MAP['timer'] = '/timer'`. `timer/index.html` pre-rendered with `page-timer` active and `#btn-nav-timer` highlighted.
* **Status:** PASS

### Route 4: Subjects
* **Route:** `/subjects`
* **Page:** Subjects
* **Local URL:** `http://127.0.0.1:3000/subjects`
* **Production URL:** `https://x-29.vercel.app/subjects`
* **Current Behavior:** Displays Subjects interface, address bar displays `/subjects`.
* **Expected Behavior:** Address bar displays `/subjects` on direct open, navigation, and refresh.
* **Root Cause:** Single-URL state switching; legacy alias `/subject`.
* **Implementation:** `CANONICAL_PATH_MAP['subjects'] = '/subjects'`. `subjects/index.html` pre-rendered with `page-subjects` active.
* **Status:** PASS

### Route 5: Daily Schedule
* **Route:** `/schedule`
* **Page:** Daily Schedule
* **Local URL:** `http://127.0.0.1:3000/schedule`
* **Production URL:** `https://x-29.vercel.app/schedule`
* **Current Behavior:** Displays Daily Schedule interface, address bar displays `/schedule`.
* **Expected Behavior:** Address bar displays `/schedule` on direct open, navigation, and refresh.
* **Root Cause:** Legacy alias `/daily-schedule` and absence of URL pushState.
* **Implementation:** `CANONICAL_PATH_MAP['schedule'] = '/schedule'`. `schedule/index.html` pre-rendered with `page-schedule` active.
* **Status:** PASS

### Route 6: Analytics
* **Route:** `/analytics`
* **Page:** Analytics (Spectra Analytics)
* **Local URL:** `http://127.0.0.1:3000/analytics`
* **Production URL:** `https://x-29.vercel.app/analytics`
* **Current Behavior:** Displays Analytics interface, address bar displays `/analytics`.
* **Expected Behavior:** Address bar displays `/analytics` on direct open, navigation, and refresh.
* **Root Cause:** Internal container named `page-spectra-analytics`; lack of canonical URL mapping.
* **Implementation:** Both `analytics` and `spectra-analytics` canonically resolve to `/analytics`. `analytics/index.html` pre-rendered with `page-spectra-analytics` active.
* **Status:** PASS

### Route 7: Exam Routine
* **Route:** `/exam`
* **Page:** Exam Routine
* **Local URL:** `http://127.0.0.1:3000/exam`
* **Production URL:** `https://x-29.vercel.app/exam`
* **Current Behavior:** Displays Exam Routine interface, address bar displays `/exam`.
* **Expected Behavior:** Address bar displays `/exam` on direct open, navigation, and refresh.
* **Root Cause:** Legacy alias `/exam-routine` and lack of address bar synchronization.
* **Implementation:** `CANONICAL_PATH_MAP['exam'] = '/exam'`. `exam/index.html` pre-rendered with `page-exam` active.
* **Status:** PASS

### Route 8: Pace Management
* **Route:** `/pace`
* **Page:** Pace Management
* **Local URL:** `http://127.0.0.1:3000/pace`
* **Production URL:** `https://x-29.vercel.app/pace`
* **Current Behavior:** Displays Pace Management interface, address bar displays `/pace`.
* **Expected Behavior:** Address bar displays `/pace` on direct open, navigation, and refresh.
* **Root Cause:** Internal container named `page-paces-management`; lack of canonical slug mapping.
* **Implementation:** Both `pace` and `paces-management` resolve to `/pace`. `pace/index.html` pre-rendered with `page-paces-management` active.
* **Status:** PASS

### Route 9: Master Config
* **Route:** `/master-config`
* **Page:** Master Config
* **Local URL:** `http://127.0.0.1:3000/master-config`
* **Production URL:** `https://x-29.vercel.app/master-config`
* **Current Behavior:** Displays Master Config interface, address bar displays `/master-config`.
* **Expected Behavior:** Address bar displays `/master-config` on direct open, navigation, and refresh.
* **Root Cause:** Multi-word naming variations and missing URL routing.
* **Implementation:** Clean canonical slug `/master-config`. `master-config/index.html` pre-rendered with active container.
* **Status:** PASS

### Route 10: Outcome
* **Route:** `/outcome`
* **Page:** Outcome
* **Local URL:** `http://127.0.0.1:3000/outcome`
* **Production URL:** `https://x-29.vercel.app/outcome`
* **Current Behavior:** Displays Outcome interface, address bar displays `/outcome`.
* **Expected Behavior:** Address bar displays `/outcome` on direct open, navigation, and refresh.
* **Root Cause:** DOM state toggling without pushState.
* **Implementation:** `CANONICAL_PATH_MAP['outcome'] = '/outcome'`. `outcome/index.html` pre-rendered with `page-outcome` active.
* **Status:** PASS

### Route 11: Daily Actions
* **Route:** `/daily-actions`
* **Page:** Daily Actions
* **Local URL:** `http://127.0.0.1:3000/daily-actions`
* **Production URL:** `https://x-29.vercel.app/daily-actions`
* **Current Behavior:** Displays Daily Actions interface, address bar displays `/daily-actions`.
* **Expected Behavior:** Address bar displays `/daily-actions` on direct open, navigation, and refresh.
* **Root Cause:** Spaced route keys (`'daily actions'`) and absence of History API calls.
* **Implementation:** Strictly sanitized canonical slug `/daily-actions`. `daily-actions/index.html` pre-rendered with active container.
* **Status:** PASS

### Route 12: Monthly Target Setup
* **Route:** `/monthly-target-setup`
* **Page:** Monthly Target Setup
* **Local URL:** `http://127.0.0.1:3000/monthly-target-setup`
* **Production URL:** `https://x-29.vercel.app/monthly-target-setup`
* **Current Behavior:** Displays Monthly Target Setup interface, address bar displays `/monthly-target-setup`.
* **Expected Behavior:** Address bar displays `/monthly-target-setup` on direct open, navigation, and refresh.
* **Root Cause:** Spaced dictionary entries (`'monthly target setup'`) and absence of History API sync.
* **Implementation:** Canonical slug `/monthly-target-setup`. `monthly-target-setup/index.html` pre-rendered with active container.
* **Status:** PASS

### Route 13: Login
* **Route:** `/login`
* **Page:** Login Authentication
* **Local URL:** `http://127.0.0.1:3000/login`
* **Production URL:** `https://x-29.vercel.app/login`
* **Current Behavior:** Clean authentication portal, address bar displays `/login`.
* **Expected Behavior:** Clean `/login` URL on direct visit, redirects, and post-auth navigation.
* **Root Cause:** Direct references to `login.html`.
* **Implementation:** Vercel rewrite `{ "source": "/login", "destination": "/login.html" }` and dev server clean URL handling.
* **Status:** PASS

---

## 4. Route Verification Table

| Route | Local | Production | Direct Open | Refresh | Navigation | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Home** | `http://127.0.0.1:3000/` | `https://x-29.vercel.app/` | PASS | PASS | PASS | VERIFIED |
| **Dashboard** | `http://127.0.0.1:3000/dashboard` | `https://x-29.vercel.app/dashboard` | PASS | PASS | PASS | VERIFIED |
| **Timer** | `http://127.0.0.1:3000/timer` | `https://x-29.vercel.app/timer` | PASS | PASS | PASS | VERIFIED |
| **Subjects** | `http://127.0.0.1:3000/subjects` | `https://x-29.vercel.app/subjects` | PASS | PASS | PASS | VERIFIED |
| **Schedule** | `http://127.0.0.1:3000/schedule` | `https://x-29.vercel.app/schedule` | PASS | PASS | PASS | VERIFIED |
| **Analytics** | `http://127.0.0.1:3000/analytics` | `https://x-29.vercel.app/analytics` | PASS | PASS | PASS | VERIFIED |
| **Exam** | `http://127.0.0.1:3000/exam` | `https://x-29.vercel.app/exam` | PASS | PASS | PASS | VERIFIED |
| **Pace** | `http://127.0.0.1:3000/pace` | `https://x-29.vercel.app/pace` | PASS | PASS | PASS | VERIFIED |
| **Master Config** | `http://127.0.0.1:3000/master-config` | `https://x-29.vercel.app/master-config` | PASS | PASS | PASS | VERIFIED |
| **Outcome** | `http://127.0.0.1:3000/outcome` | `https://x-29.vercel.app/outcome` | PASS | PASS | PASS | VERIFIED |
| **Daily Actions** | `http://127.0.0.1:3000/daily-actions` | `https://x-29.vercel.app/daily-actions` | PASS | PASS | PASS | VERIFIED |
| **Monthly Target** | `http://127.0.0.1:3000/monthly-target-setup` | `https://x-29.vercel.app/monthly-target-setup` | PASS | PASS | PASS | VERIFIED |
| **Login** | `http://127.0.0.1:3000/login` | `https://x-29.vercel.app/login` | PASS | PASS | PASS | VERIFIED |

---

## 5. Technical Implementation Details

### 1. SPA Router (`router/router.js`)
* **Strict Canonical Mapping:** `Router.canonicalRoutes` strictly defines valid clean slugs.
* **History Synchronization:** `loadPage()` calls `history.pushState({ pageId }, '', targetPath)` on every user navigation.
* **Popstate Traversal:** `window.addEventListener('popstate')` restores previous page views cleanly with `{ updateHistory: false }`, allowing normal browser Back and Forward traversal.
* **Dynamic Tab Title:** Updates `document.title` on page change to match the active route.

### 2. Static Route Pre-Rendering (`scripts/sync-routes.js`)
* Automatically generates all 18 route entry points (`dashboard`, `timer`, `focus`, `subjects`, `subject`, `schedule`, `daily-schedule`, `analytics`, `spectra-analytics`, `exam`, `exam-routine`, `pace`, `paces-management`, `master-config`, `outcome`, `daily-actions`, `monthly-target-setup`, `login`).
* Pre-renders the target container as visible and marks all other containers with `class="hidden"`.
* Synchronously sets the active styling on the corresponding sidebar button.
* Includes `<base href="/">` to guarantee seamless relative asset loading.

### 3. Server Configuration & Dev Server
* **Vercel (`vercel.json`):**
  * `"cleanUrls": true`
  * `"trailingSlash": false`
  * SPA rewrite fallback: `{ "source": "/((?!api/|.*\\..*).*)", "destination": "/index.html" }`
* **Local Dev Server (`js/dev-server.js`):**
  * Serves pre-rendered route files for clean requests (e.g. `/timer` serves `timer/index.html`).
  * Normalizes trailing slashes (`/timer/` -> `/timer` via 301 redirect).
  * Direct route SPA fallback to `index.html`.
  * Environmental API response for `/api/config`.

### 4. Permanent Dark Mode
* Both `index.html`, `login.html`, and all 18 route files enforce:
  * `<html lang="en" class="dark scroll-smooth" style="background-color: #0f172a; color-scheme: dark;">`
  * Dark body styling (`bg-[#0f172a] text-slate-100`).
  * Zero light-mode flash during direct visits, refreshes, or page transitions.
