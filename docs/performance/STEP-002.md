# Step 002 — Implementation Plan & Report: Font Loading & Resource Hint Optimization

**Step ID:** Step 002  
**Title:** Font Loading & Resource Hint Optimization  
**Priority:** High  
**Status:** COMPLETED  

---

## 1. EXACT BOTTLENECK
In `index.html` and `login.html`, Google Fonts stylesheets are loaded as synchronous, render-blocking `<link rel="stylesheet">` tags in `<head>`. The browser halts initial layout and rendering until the external CSS from `fonts.googleapis.com` is completely downloaded, parsed, and evaluated.

## 2. ROOT CAUSE
Standard static Google Fonts embed snippets block the critical rendering path. On mobile connections or high-latency networks, this adds 100-300ms to First Contentful Paint (FCP) and delays the initial display of the application shell.

## 3. CURRENT IMPLEMENTATION
* `index.html`:
  - `preconnect` to `https://fonts.googleapis.com`
  - `preconnect` to `https://fonts.gstatic.com` with `crossorigin`
  - Synchronous `<link rel="stylesheet">` requesting 6 font families (`Inter`, `Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`, `Rajdhani`, `Chakra Petch`) with `display=swap`.
* `login.html`:
  - Synchronous `<link rel="stylesheet">` requesting `Inter` and `Outfit` with `display=swap`.

## 4. PROPOSED OPTIMIZATION
1. Add `dns-prefetch` alongside `preconnect` for both `fonts.googleapis.com` and `fonts.gstatic.com` to guarantee early socket connection across all browser engines.
2. Convert the synchronous stylesheet `<link>` in both `index.html` and `login.html` to the standard asynchronous preload with media switch:
   - `<link rel="preload" as="style" href="...">`
   - `<link rel="stylesheet" href="..." media="print" onload="this.media='all'">`
   - `<noscript><link rel="stylesheet" href="..."></noscript>`
3. Maintain the exact same query parameters, font weights, and `display=swap` parameter so zero typography, font definitions, or layouts change.

## 5. EXACT FILES AFFECTED
* `index.html`
* `login.html`

## 6. IMPLEMENTATION SEQUENCE
1. Update `index.html` Google Fonts block with `dns-prefetch`, `preconnect`, and asynchronous non-blocking stylesheet loader.
2. Update `login.html` Google Fonts block with the same pattern.
3. Validate markup and run automated test suites (`npm test` and `node tests/full-regression.test.js`).
4. Validate typography rendering and verify zero visual layout shifts (CLS: 0).

## 7. SAFETY CONSIDERATIONS
* `display=swap` is preserved, guaranteeing text remains visible immediately using fallback fonts (`Inter, system-ui, -apple-system, sans-serif`).
* `<noscript>` fallback guarantees font styles apply even if JavaScript is disabled.
* 0 typography or styling rules modified.

## 8. VALIDATION PROCEDURE
* Run `npm test` and `node tests/full-regression.test.js`.
* Inspect `index.html` and `login.html` to confirm syntactically valid HTML tags.
* Verify font classes (`font-sans`, `font-display`, `font-outfit`, `font-tech`, `font-rajdhani`, `font-countdown`) render cleanly.

## 9. EXPECTED RESULT
* Google Fonts stylesheet is completely removed from the critical render-blocking path.
* Faster First Contentful Paint (FCP) by eliminating network blocking on external font CSS.
