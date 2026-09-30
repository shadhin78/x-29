# X-29 — Deployment Path Conflict Resolution: api/config

**Document Version:** 1.0.0  
**Timestamp:** 2026-10-01T02:35:00+06:00  
**Status:** RESOLVED & VERIFIED  

---

## Conflict

During Vercel production deployment and route path validation, the build engine raised a collision error:

```text
Error: Two or more files have conflicting paths or names.
Please make sure path segments and filenames, without their extension, are unique.

The path "api/config.js" has conflicts with "api/config" and "api/config.json".
```

---

## Root Cause

1. **Vercel Serverless Function & Route Path Normalization**:
   * Vercel treats JavaScript and TypeScript files in the `api/` directory (e.g. `api/config.js`) as Serverless Functions exposed at `/api/<filename-without-extension>`.
   * For `api/config.js`, Vercel assigns the endpoint path `/api/config`.
2. **Accidental Duplicate Static Fallbacks**:
   * In commit `535603b` (`Thu Oct 1 02:15:05 2026`), two duplicate static files were committed directly into the `api/` directory:
     * `api/config` (extensionless static JSON text)
     * `api/config.json` (static JSON file)
   * These files were created as static fallbacks for mock/IDE preview environments.
3. **Route Collision**:
   * Because Vercel normalizes path segments without extensions, `api/config.js`, `api/config`, and `api/config.json` all stripped down to the single route identifier `api/config`.
   * Vercel's route compiler halted the build to prevent ambiguous routing between the serverless lambda and the static files.

---

## Files Found

During the full project audit, the following files under `api/` were inspected:

| File Path | File Type | Purpose | Size | Status in Deployment |
|---|---|---|---|---|
| `api/config.js` | Node.js Serverless Function | Dynamic Vercel API endpoint returning environment-configured Firebase credentials and server headers | 851 bytes | **Kept as Canonical API Route** |
| `api/config` | Extensionless Static File | Hardcoded static duplicate of Firebase credentials created in commit `535603b` | 247 bytes | **Removed (Duplicate/Conflict)** |
| `api/config.json` | Static JSON File | Hardcoded static duplicate of Firebase credentials created in commit `535603b` | 247 bytes | **Removed (Duplicate/Conflict)** |

---

## File Kept

* **`api/config.js`**:
  * Authentically implemented since the initial repository commit (`f54ee01a`).
  * Exports standard Vercel serverless request handler `module.exports = function handler(req, res)`.
  * Dynamically populates credentials from environment variables (`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, etc.).
  * Sends required HTTP headers (`Cache-Control: no-cache, no-store, must-revalidate`).

---

## Files Renamed/Removed

* `api/config` — Removed.
* `api/config.json` — Removed.

No conflicting files remain under `api/`. The sole file in `api/` is now `api/config.js`.

---

## References Updated

* **Codebase Audit for `api/config.json`**:
  * Grepped the entire workspace for `api/config.json` and `config.json`.
  * Zero references found across `js/`, `pages/`, `css/`, `scripts/`, and `tests/`.
* **Codebase Audit for `api/config`**:
  * `js/firebase.js` line 249: Calls `fetch('/api/config')`. This is an HTTP network request to the API route, which resolves directly to `api/config.js` in Vercel production.
  * `js/dev-server.js` line 52: Evaluates `if (url === '/api/config')` and serves the JSON response dynamically in memory. It does not read `api/config` from disk.
  * `ROUTE-AUDIT.md`: Updated references to reflect single canonical serverless endpoint.

---

## Why The Fix Is Safe

1. **Exact Endpoint Parity**:
   * The production endpoint URL requested by client JavaScript (`fetch('/api/config')`) remains identically `/api/config`.
   * Vercel maps `api/config.js` to `/api/config` without path conflict.
2. **Local Development Parity**:
   * `js/dev-server.js` continues to intercept `/api/config` and returns environmental configurations with 200 OK.
3. **Offline / Fallback Resilience**:
   * `js/firebase.js` (lines 243-264) initializes with synchronous in-memory `firebaseConfig` and catches background fetch errors gracefully.
4. **Zero Impact on App Shell & Data**:
   * No UI, layouts, styles, data synchronization, Firebase rules, or tests depended on the removed duplicate files.

---

## Build Result

* **CSS Build**: `npm run build:css` — Passed (Done in 1.36s).
* **Route Synchronization**: `npm run sync:routes` — 18/18 route entry points synchronized.
* **Path Uniqueness**: `Get-ChildItem -Path "api"` returns only `config.js` (0 collisions).

---

## Validation Result

* **Automated Unit & Integration Test Suite (`npm test`)**: **14 of 14 Suites Passed (100%)**.
  * `tests/auth-service.test.js`: PASS
  * `tests/config-tracks.test.js`: PASS
  * `tests/pace-outcome.test.js`: PASS
  * `tests/analytics-visualization.test.js`: PASS
  * `tests/daily-targets.test.js`: PASS
  * `tests/weekly-targets.test.js`: PASS
  * `tests/monthly-targets.test.js`: PASS
  * `tests/tasks-metrics-dashboard.test.js`: PASS
  * `tests/app-core.test.js`: PASS
  * `tests/modals.test.js`: PASS
  * `tests/data-consistency.test.js`: PASS
  * `tests/navigation-performance.test.js`: PASS
  * `tests/route-requirements.test.js`: PASS
* **Full Regression Suite (`node tests/full-regression.test.js`)**: **58 of 58 Checks Passed**.

---

## Status

**RESOLVED & READY FOR DEPLOYMENT**  
- `NO api/config PATH CONFLICT`: VERIFIED  
- `BUILD SUCCESS`: VERIFIED  
- `NO FUNCTIONAL REGRESSION`: VERIFIED  
