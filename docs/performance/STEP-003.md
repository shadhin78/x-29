# Step 003 — Implementation Plan & Report: Defer Head Scripts & Eliminate Parser-Blocking

**Step ID:** Step 003  
**Title:** Defer Non-Critical Head Scripts & Eliminate Dual-Mode Execution  
**Priority:** High  
**Status:** COMPLETED  

---

## 1. EXACT BOTTLENECK
In `index.html`, 58 external `<script src="...">` tags reside in `<head>` without the `defer` attribute. When the browser encounters each synchronous script tag during HTML parsing, it completely halts DOM construction, waiting to download and execute each script one after another.

## 2. ROOT CAUSE
Legacy single-file decomposition migrated script tags into the `<head>` of `index.html` without asynchronous or deferred scheduling attributes. As a consequence, 58 sequential network and execution pauses block the initial parsing of the document body.

## 3. CURRENT IMPLEMENTATION
* All application feature scripts, service scripts, Chart.js, Firebase compat libraries, and modular route scripts are linked in `<head>` as synchronous blocking tags (`<script src="...">`).
* Total synchronous blocking script count: 58 scripts.

## 4. PROPOSED OPTIMIZATION
1. Add `defer` attribute to all 58 non-module external scripts in `<head>` of `index.html`.
2. Preserves execution order: According to HTML5 specification, deferred scripts download in parallel during HTML streaming and execute in exact sequential document order once the document is fully parsed, right before `DOMContentLoaded`.
3. Leaves `<script type="module" src="/js/core/app.js"></script>` deferred by spec, allowing `App.init()` to boot cleanly after all dependencies are initialized.
4. Preserves all global assignments (`window.AppState`, `window.FirebaseService`, `window.Router`, etc.) for inline HTML event handlers.

## 5. EXACT FILES AFFECTED
* `index.html`

## 6. IMPLEMENTATION SEQUENCE
1. Apply `defer` attribute to all 58 external script tags in `index.html`.
2. Verify HTML syntax and attribute formatting.
3. Run the full automated test battery (`npm test` and `node tests/full-regression.test.js`).
4. Validate that DOM parsing is unblocked and application boots cleanly.

## 7. SAFETY CONSIDERATIONS
* Deferred scripts guarantee exact in-order sequential execution.
* Inline handlers on dynamic elements rely on event delegation (which occurs after DOMContentLoaded).
* All tests continue to execute identically in Node.js test environment.

## 8. VALIDATION PROCEDURE
* Run `npm test` (all 12 test suites).
* Run `node tests/full-regression.test.js` (all 57 checks).
* Run `node tests/navigation-performance.test.js`.
* Run `node tests/modals.test.js`.

## 9. EXPECTED RESULT
* 58 synchronous render-blocking pauses eliminated from initial HTML parsing.
* HTML parser reaches and renders `#auth-loading` shell in frame 1 without delay.
