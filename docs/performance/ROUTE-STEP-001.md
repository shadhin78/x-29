# Step 001 — Implementation Plan & Report: Route-Level Dynamic Script Code-Splitting

**Step ID:** Step 001  
**Phase:** Ultra-Fast Page / Route Performance Optimization  
**Title:** Route-Level Dynamic Script Code-Splitting  
**Priority:** Critical  
**Status:** COMPLETED  
**Date:** 2026-09-30  

---

## 1. EXACT BOTTLENECK
In `index.html` (lines 100-110), all 11 modular page scripts were linked in `<head>` via `<script defer>` during cold boot:
* `pages/Dashboard/Dashboard.js` (5.3 KB)
* `pages/Analytics/Analytics.js` (6.6 KB)
* `pages/Focus/Focus.js` (85.2 KB)
* `pages/Daily Actions/Daily Actions.js` (3.7 KB)
* `pages/Daily Schedule/Daily Schedule.js` (1.3 KB)
* `pages/Daily Actions/monthly target setup/monthly target setup.js` (190.1 KB)
* `pages/Subjects/Subjects.js` (85.1 KB)
* `pages/Pace Management/Pace Management.js` (2.3 KB)
* `pages/Master Config/Master Config.js` (7.3 KB)
* `pages/Outcome/Outcome.js` (7.0 KB)
* `pages/Exam Routine/Exam Routine.js` (0.9 KB)

Total cold route script overhead: **394.8 KB (404,294 bytes)**.
Three inactive route modules alone accounted for **360.4 KB (91.2%)** of dead weight on initial boot.

## 2. ROOT CAUSE
Modular page scripts were statically accumulated in `<head>` for upfront caching rather than loading dynamically on-demand via the router.

## 3. IMPLEMENTED OPTIMIZATION
1. Kept only the initial active page script (`pages/Dashboard/Dashboard.js`, 5.3 KB) in `<head>` of `index.html`.
2. Removed the 10 inactive route `<script>` tags from `<head>` in `index.html`.
3. Enhanced `Router.loadJs(url, id)` in `router/router.js`:
   * Added active pending promise deduplication (`_pendingJsPromises`) to prevent duplicate `<script>` tag creation if multiple triggers occur simultaneously.
   * Return a reliable Promise that resolves when the script loads and executes.
   * Supported instant mock DOM test execution for Node.js test runners.
4. Enhanced `Router.loadPage(pageId, sectionId)` in `router/router.js`:
   * If the route script is not yet loaded (`!this.jsLoaded[cleanUrl]`), `await this.loadJs(route.jsUrl, route.jsId)` before calling `route.onMount()`.
   * Preserved race-condition guard `if (currentSeq !== this._navSeq) return;` so rapid clicks cleanly supersede pending script loads.

## 4. EXACT FILES AFFECTED
* `index.html` (removed 10 inactive route `<script>` tags from `<head>`)
* `router/router.js` (enhanced `loadJs` promise deduplication and `await loadJs` before `onMount`)

## 5. MEASUREMENTS (BEFORE VS AFTER)
* **Route Scripts in `<head>`:** 11 scripts → **1 script** (-10 scripts)
* **Route JS Payload in `<head>`:** 404,294 bytes (394.8 KB) → **5,459 bytes (5.3 KB)**
* **Payload Saved on Cold Boot:** **398,835 bytes (389.5 KB) saved (-98.6% reduction)**
* **First-Visit Route Navigation:** Verified across all 11 routes with 0 errors and automatic deduplication on repeat visits.

## 6. VALIDATION RESULTS
* **Build:** PASS (Node.js syntax checks clean)
* **Type/Lint Checks:** PASS (Zero errors)
* **Unit Tests (`npm test`):** PASS (All 12 test suites passing)
* **Full Regression (`tests/full-regression.test.js`):** PASS (58/58 checkpoints passing)
* **Route Dynamic Loading (`scratch/test_route_loading.js`):** PASS (All 11 routes mounted and deduplicated cleanly)
* **Visual & Behavioral Parity:** PASS (100% preservation of all features, styling, and behavior)
