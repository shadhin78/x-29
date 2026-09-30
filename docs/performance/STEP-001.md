# Step 001 — Implementation Plan & Report: Logo Asset Optimization

**Step ID:** Step 001  
**Title:** Lossless Image Compression & Optimal Sizing for Logo Asset  
**Priority:** High  
**Status:** COMPLETED  

---

## 1. EXACT BOTTLENECK
`icons/logo-sticker.png` is an unoptimized 1728 x 1607 px PNG weighing 672,115 bytes (656.4 KB). It is loaded synchronously on initial page load in:
1. Loading screen overlay (`index.html`, 112px x 112px)
2. Desktop/mobile sidebar branding tag (`index.html`, 24px x 24px)
3. Login portal header (`login.html`, 96px x 96px)
4. PWA manifest declaration (`manifest.json`, declared as 512x512)

## 2. ROOT CAUSE
Raw uncompressed 2000-class source asset was placed in the `/icons` directory without web optimization. The browser is forced to download over 656 KB of image data and decode 2.77 million pixels into GPU/RAM merely to render a 24px or 112px thumbnail.

## 3. CURRENT IMPLEMENTATION
* File path: `icons/logo-sticker.png`
* Dimensions: 1728 x 1607 px
* Size: 672,115 bytes (656.4 KB)
* Color Format: 32-bit ARGB (ColorType 6)

## 4. PROPOSED OPTIMIZATION
* Generate a web-optimized 512 x 512 px 32-bit ARGB PNG using high-quality bicubic interpolation with compositing quality set to HighQuality.
* Center the graphic on a transparent 512x512 canvas, perfectly preserving aspect ratio and matching the PWA `512x512` specification in `manifest.json`.
* Retain original backup safely in `archive/` or rollback path.
* Replace `icons/logo-sticker.png` in-place.

## 5. EXACT FILES/COMPONENTS AFFECTED
* `icons/logo-sticker.png` (replaced with optimized version)

## 6. IMPLEMENTATION SEQUENCE
1. Backup original `icons/logo-sticker.png` to `scratch/logo-sticker-original.png`.
2. Generate optimized 512x512 PNG directly to `icons/logo-sticker.png`.
3. Verify file size and binary header integrity.
4. Execute automated test suites (`npm test` and `node tests/full-regression.test.js`).
5. Verify visual rendering in browser across sidebar, loading screen, and login page.

## 7. SAFETY CONSIDERATIONS
* Image dimensions remain high enough (512px) to support 4x ultra-high-DPI / Retina screens at the maximum display size (112px * 4 = 448px).
* Transparent alpha channel and drop-shadows are 100% preserved.
* 0 code or logic changes in HTML, CSS, JS, or Firebase.

## 8. VALIDATION PROCEDURE
* File size check: Verify size drops from 656.4 KB to ~64.6 KB.
* Regression test suite: Verify 57/57 tests pass.
* Visual verification: Compare rendering at 24px, 96px, and 112px against baseline.

## 9. EXPECTED RESULT
* Initial network transfer payload decreased by ~606 KB.
* Faster cold load, lower memory decoding overhead.

## 10. ROLLBACK APPROACH
If any visual flaw is found, restore from `scratch/logo-sticker-original.png` immediately via copy command.
