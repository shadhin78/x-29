# X-29 — ROUTE URL MAPPING AUDIT & SPECIFICATION

**Document Version:** 1.0.0  
**Timestamp:** 2026-10-01T02:22:00+06:00  
**Status:** COMPLETE AUDIT & FIX PLAN  

---

## Executive Summary

The purpose of this audit is to resolve all URL routing inconsistencies between Local Development (`http://127.0.0.1:3000/<page>`) and Vercel Production (`https://x-29.vercel.app/<page>`).

All routes in the application must satisfy:
1. **Identical Pathnames**: The pathname after the domain must be 100% identical in local development and production.
2. **Clean URL Slugs**: Only clean lowercase slugs (e.g., `/timer`, `/dashboard`, `/subjects`, `/schedule`, `/analytics`). No spaces, no `%20`, no query routes (`?page=timer`), and no hash routes (`#timer`).
3. **Direct URL Loading**: Direct visits to any route must mount that page directly without 404, without bouncing to `/`, and without losing permanent dark mode.
4. **Browser History & Traversal**: Clean `pushState`, `replaceState`, and `popstate` Back/Forward navigation with 0ms visual switching and 0 page reloads.
5. **Permanent Dark Mode**: No white/light-mode flashes under direct URL load, refresh, or tab switching.

---

## Complete Route Inventory & Audit Table

| # | Route / Page Name | Local URL | Production URL | Canonical Slug | Files Involved | Status |
|---|-------------------|-----------|----------------|----------------|----------------|--------|
| 1 | **Dashboard** | `http://127.0.0.1:3000/dashboard` | `https://x-29.vercel.app/dashboard` | `/dashboard` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 2 | **Timer / Focus** | `http://127.0.0.1:3000/timer` | `https://x-29.vercel.app/timer` | `/timer` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 3 | **Subjects** | `http://127.0.0.1:3000/subjects` | `https://x-29.vercel.app/subjects` | `/subjects` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 4 | **Daily Schedule** | `http://127.0.0.1:3000/schedule` | `https://x-29.vercel.app/schedule` | `/schedule` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 5 | **Analytics** | `http://127.0.0.1:3000/analytics` | `https://x-29.vercel.app/analytics` | `/analytics` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 6 | **Exam Routine** | `http://127.0.0.1:3000/exam` | `https://x-29.vercel.app/exam` | `/exam` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 7 | **Pace Management**| `http://127.0.0.1:3000/pace` | `https://x-29.vercel.app/pace` | `/pace` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 8 | **Master Config** | `http://127.0.0.1:3000/master-config` | `https://x-29.vercel.app/master-config` | `/master-config` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 9 | **Outcome** | `http://127.0.0.1:3000/outcome` | `https://x-29.vercel.app/outcome` | `/outcome` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 10 | **Daily Actions** | `http://127.0.0.1:3000/daily-actions` | `https://x-29.vercel.app/daily-actions` | `/daily-actions` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 11 | **Monthly Target Setup** | `http://127.0.0.1:3000/monthly-target-setup` | `https://x-29.vercel.app/monthly-target-setup` | `/monthly-target-setup` | `router/router.js`, `index.html`, `js/dev-server.js`, `vercel.json` | Audited |
| 12 | **Login** | `http://127.0.0.1:3000/login` | `https://x-29.vercel.app/login` | `/login` | `login.html`, `js/pages/login/login.js`, `vercel.json` | Audited |
| 13 | **Root / Home** | `http://127.0.0.1:3000/` | `https://x-29.vercel.app/` | `/dashboard` | `index.html`, `router/router.js`, `vercel.json` | Audited |

---

## Detailed Route-by-Route Findings

### 1. Route: `/dashboard`
* **Local URL:** `http://127.0.0.1:3000/dashboard`
* **Production URL:** `https://x-29.vercel.app/dashboard`
* **Current Problem:** When accessed with a trailing slash (`/dashboard/`) on local static preview, the trailing slash is displayed unless sanitized by client router.
* **Root Cause:** Standard static HTTP servers redirect directory requests to trailing slashes.
* **Files Involved:** `router/router.js`, `vercel.json`, `js/dev-server.js`
* **Fix:** Enforce clean canonical mapping `/dashboard` in `Router.getPathForPageId()`; sanitize trailing slash on initialization with `history.replaceState()`; add `"trailingSlash": false` in `vercel.json`.
* **Validation:** Direct load, refresh, and internal navigation yield `/dashboard` on both local and production.
* **Status:** Ready for Fix

### 2. Route: `/timer`
* **Local URL:** `http://127.0.0.1:3000/timer`
* **Production URL:** `https://x-29.vercel.app/timer`
* **Current Problem:** 
  1. If accessed via alias `/focus`, `Router.getPathForPageId` preserved `/focus` rather than canonical `/timer`.
  2. If accessed with malformed input (e.g., `/timer%20or%20page`), spaces or `%20` could be reflected into the address bar.
* **Root Cause:** Permissive `if (current && this.normalizePageId(current) === canonical) return '/' + current;` in `router/router.js`.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Replace dynamic `current` reflection with strict canonical mapping `CANONICAL_PATH_MAP['timer'] = '/timer'`. Sanitize any URL with `%20` or spaces to `/timer`.
* **Validation:** Navigating to Focus tab or typing `/timer`, `/focus`, `/timer/`, or `/timer%20or%20page` strictly canonicalizes to `/timer` in both environments.
* **Status:** Ready for Fix

### 3. Route: `/subjects`
* **Local URL:** `http://127.0.0.1:3000/subjects`
* **Production URL:** `https://x-29.vercel.app/subjects`
* **Current Problem:** Alias `/subject` or trailing slash `/subjects/` preserved non-canonical paths.
* **Root Cause:** Lack of strict canonical URL slug enforcement in `getPathForPageId`.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Map `/subject` and `/subjects/` to canonical `/subjects`.
* **Validation:** Both local and production address bars show `/subjects`.
* **Status:** Ready for Fix

### 4. Route: `/schedule`
* **Local URL:** `http://127.0.0.1:3000/schedule`
* **Production URL:** `https://x-29.vercel.app/schedule`
* **Current Problem:** Alias `/daily-schedule` remained in address bar when navigated or refreshed.
* **Root Cause:** `router/router.js` preserved `current` URL when matching alias.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Standardize canonical slug to `/schedule` for all schedule navigation and alias resolution.
* **Validation:** Address bar strictly displays `/schedule`.
* **Status:** Ready for Fix

### 5. Route: `/analytics`
* **Local URL:** `http://127.0.0.1:3000/analytics`
* **Production URL:** `https://x-29.vercel.app/analytics`
* **Current Problem:** Sidebar button contains `data-switch-page="spectra-analytics"`, causing alias `/spectra-analytics` to be preserved if visited directly.
* **Root Cause:** Discrepancy between internal component ID (`spectra-analytics`) and public clean route (`/analytics`).
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Ensure `getPathForPageId('spectra-analytics')` and `getPathForPageId('analytics')` always return canonical `/analytics`.
* **Validation:** Internal navigation and direct deep-linking both display `/analytics`.
* **Status:** Ready for Fix

### 6. Route: `/exam`
* **Local URL:** `http://127.0.0.1:3000/exam`
* **Production URL:** `https://x-29.vercel.app/exam`
* **Current Problem:** Direct navigation to `/exam-routine` preserved the legacy alias.
* **Root Cause:** Dynamic alias preservation in `router/router.js`.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Canonically normalize all exam aliases to `/exam`.
* **Validation:** Direct load and navigation strictly produce `/exam`.
* **Status:** Ready for Fix

### 7. Route: `/pace`
* **Local URL:** `http://127.0.0.1:3000/pace`
* **Production URL:** `https://x-29.vercel.app/pace`
* **Current Problem:** Sidebar button has `data-switch-page="paces-management"`. Direct visit to `/paces-management` preserved that slug.
* **Root Cause:** Internal container naming differs from canonical URL slug `/pace`.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Map `paces-management` and all pace aliases directly to `/pace`.
* **Validation:** Direct load and navigation strictly produce `/pace`.
* **Status:** Ready for Fix

### 8. Route: `/master-config`
* **Local URL:** `http://127.0.0.1:3000/master-config`
* **Production URL:** `https://x-29.vercel.app/master-config`
* **Current Problem:** Multi-word inputs or aliases with spaces (e.g., `Master Config`) could introduce spaces or `%20`.
* **Root Cause:** Permissive normalization.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Enforce clean slug `/master-config`.
* **Validation:** Produces `/master-config` without spaces.
* **Status:** Ready for Fix

### 9. Route: `/outcome`
* **Local URL:** `http://127.0.0.1:3000/outcome`
* **Production URL:** `https://x-29.vercel.app/outcome`
* **Current Problem:** Trailing slash variation between local and production.
* **Root Cause:** Standard static server directory handling.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Enforce canonical slug `/outcome` and trailing-slash normalization.
* **Validation:** Produces `/outcome`.
* **Status:** Ready for Fix

### 10. Route: `/daily-actions`
* **Local URL:** `http://127.0.0.1:3000/daily-actions`
* **Production URL:** `https://x-29.vercel.app/daily-actions`
* **Current Problem:** Route dictionary had variations with spaces (`'daily actions'`), creating potential for `/daily%20actions`.
* **Root Cause:** Unsanitized route keys and permissive route alias matching.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Sanitize all spaces and enforce single canonical slug `/daily-actions`.
* **Validation:** Produces `/daily-actions`.
* **Status:** Ready for Fix

### 11. Route: `/monthly-target-setup`
* **Local URL:** `http://127.0.0.1:3000/monthly-target-setup`
* **Production URL:** `https://x-29.vercel.app/monthly-target-setup`
* **Current Problem:** Route dictionary had keys `'monthly target'` and `'monthly target setup'` with spaces.
* **Root Cause:** Spaces in route table keys in `router/router.js`.
* **Files Involved:** `router/router.js`, `index.html`, `vercel.json`
* **Fix:** Remove spaced keys from route table; ensure `normalizePageId` maps all variants to `'monthly-target-setup'`.
* **Validation:** Address bar strictly displays `/monthly-target-setup`.
* **Status:** Ready for Fix

### 12. Route: `/login`
* **Local URL:** `http://127.0.0.1:3000/login`
* **Production URL:** `https://x-29.vercel.app/login`
* **Current Problem:** Direct access to `login.html` or `/login/` must strictly show `/login`.
* **Root Cause:** Vercel rewrites and static server clean URLs handling.
* **Files Involved:** `vercel.json`, `js/dev-server.js`, `js/pages/login/login.js`
* **Fix:** Add rewrite `{ "source": "/login", "destination": "/login.html" }` in `vercel.json` and sanitize `/login/` or `login.html` via `replaceState` in `login.js`.
* **Validation:** Address bar strictly displays `/login`.
* **Status:** Ready for Fix

---

## Architecture & Configuration Audit

### 1. Vercel Configuration (`vercel.json`)
* **Current Configuration:**
  ```json
  {
    "cleanUrls": true,
    "rewrites": [
      { "source": "/login", "destination": "/login.html" },
      { "source": "/((?!api/|.*\\..*).*)", "destination": "/index.html" }
    ]
  }
  ```
* **Analysis:**
  - `cleanUrls: true` strips `.html` extensions.
  - The fallback rewrite `/((?!api/|.*\\..*).*)` routes all clean paths to `/index.html`.
  - **Missing:** `"trailingSlash": false`. Without this, Vercel may default to redirecting directory requests to `/dir/` instead of keeping `/dir`.
* **Required Fix:** Add `"trailingSlash": false` to `vercel.json`.

### 2. Local Dev Server (`js/dev-server.js`)
* **Current Configuration:**
  - Handles `/api/config`.
  - Direct clean route SPA fallback: serves `index.html` with 200 OK for any non-extension request.
  - Normalizes trailing slashes internally.
* **Improvement:**
  - If a clean request with trailing slash (e.g. `/timer/`) is received, issue a `301 Moved Permanently` redirect to `/timer` to match Vercel's `trailingSlash: false` behavior.

### 3. Client-Side Router (`router/router.js`)
* **Current Problematic Logic:**
  ```javascript
  const current = (window.location.pathname || '').split('?')[0].replace(/^\/+|\/+$/g, '');
  if (current && this.normalizePageId(current) === canonical) {
      return '/' + current;
  }
  ```
* **Required Fix:**
  - Introduce strict, deterministic `CANONICAL_PATH_MAP`.
  - Strip trailing slashes and normalize aliases immediately on startup via `history.replaceState`.
  - Sanitize inputs to prevent `%20` or spaces from ever entering `history.pushState` or `history.replaceState`.
  - Clean up spaced route keys (`'monthly target'`, `'monthly target setup'`).

### 4. Static Entry Point Synchronizer (`scripts/sync-routes.js`)
* **Role:**
  - Ensures each clean route directory (`dashboard`, `timer`, `subjects`, `schedule`, `analytics`, `exam`, `pace`, `master-config`, `outcome`, `daily-actions`, `monthly-target-setup`, `login`) has a synchronized, up-to-date entry point.
  - Synchronizes `<base href="/">` and permanent dark mode styling across all route entry points.

---

## Step-by-Step Implementation Plan

1. **Step 1: Update `vercel.json`**
   - Add `"trailingSlash": false` to enforce non-trailing-slash URL parity on Vercel.

2. **Step 2: Update `router/router.js`**
   - Implement strict `CANONICAL_PATH_MAP`.
   - Update `getPathForPageId` to always return the canonical clean slug without spaces or `%20`.
   - Update `getPageIdFromPath` to decode URIs, handle edge cases, and eliminate potential `%20` or space-containing inputs.
   - Update `normalizePageId` to remove spaced aliases and strictly map to slugified identifiers.
   - Clean up spaced route keys (`'monthly target'`, `'monthly target setup'`) in `Router.routes`.
   - Ensure `Router.init()` immediately normalizes `window.location.pathname` via `history.replaceState` if a trailing slash or alias was present.

3. **Step 3: Update `js/dev-server.js`**
   - Ensure clean URL redirects for trailing slashes (`/timer/` -> `/timer`).

4. **Step 4: Synchronize Route Entry Points**
   - Run `node scripts/sync-routes.js` to ensure all 18 route directories have 100% synchronized entry points with `<base href="/">` and permanent dark mode.

5. **Step 5: Update & Run Test Suites**
   - Update `tests/route-requirements.test.js` to enforce canonical URL resolution for all paths.
   - Run complete test suite (`npm test`).
   - Validate live HTTP response statuses across all routes.
