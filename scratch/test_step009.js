const fs = require('fs');
const path = require('path');

const originalHtml = fs.readFileSync('index.html', 'utf8');
console.log('Original index.html size:', originalHtml.length, 'bytes');

// 1. Reusable SVGs definition
const SVG_DEFS = `  <!-- Shared Reusable SVG Icons Sprite (Step 009) -->
  <svg class="hidden" style="display:none;position:absolute;width:0;height:0;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <g id="x29-icon-close">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
      </g>
      <g id="x29-icon-close-thick">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
      </g>
      <g id="x29-icon-plus">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
      </g>
      <g id="x29-icon-calendar">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
      </g>
      <g id="x29-icon-clock">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </g>
      <g id="x29-icon-clock-thick">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </g>
      <g id="x29-icon-external">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
      </g>
      <g id="x29-icon-chevron-down">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
      </g>
      <g id="x29-icon-bolt">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </g>
      <g id="x29-icon-trash">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </g>
      <g id="x29-icon-edit">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
      </g>
    </defs>
  </svg>
`;

// Patterns to replace inside SVGs:
// 1. Close icon with stroke-width 3: <path ... d="M6 18L18 6M6 6l12 12"...>
let updatedHtml = originalHtml;

// Insert defs right after <body>
updatedHtml = updatedHtml.replace(/<body\b[^>]*>/i, (m) => `${m}\n${SVG_DEFS}`);

// Let's count replacements
let replacedCount = 0;

// Replace close icons
// <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
// or with self-closing or 2.5
const closeThickRegex = /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="3"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi;
updatedHtml = updatedHtml.replace(closeThickRegex, () => {
    replacedCount++;
    return '<use href="#x29-icon-close-thick"/>';
});

const closeNormRegex = /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi;
updatedHtml = updatedHtml.replace(closeNormRegex, () => {
    replacedCount++;
    return '<use href="#x29-icon-close"/>';
});

// Plus icon
const plusRegex = /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M12 4v16m8-8H4"(><\/path>|\s*\/>)/gi;
updatedHtml = updatedHtml.replace(plusRegex, () => {
    replacedCount++;
    return '<use href="#x29-icon-plus"/>';
});

// External link icon
const extRegex = /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"(><\/path>|\s*\/>)/gi;
updatedHtml = updatedHtml.replace(extRegex, () => {
    replacedCount++;
    return '<use href="#x29-icon-external"/>';
});

console.log('Total icon path replacements with <use>:', replacedCount);
console.log('Size after SVG symbol consolidation:', updatedHtml.length, 'bytes (saved', originalHtml.length - updatedHtml.length, 'bytes)');

// Now test whitespace normalization (compress multiple empty lines and excessive indentation)
// Rule: don't touch code inside <script> tags or <style> tags or <pre>
const parts = updatedHtml.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/gi);
let cleanParts = parts.map((part, idx) => {
    // If it's script or style (odd indices), preserve exactly
    if (idx % 2 === 1) return part;
    
    // Normal HTML: collapse runs of 3+ newlines to 2, and trim trailing whitespace from lines
    let cleaned = part.replace(/[ \t]+$/gm, '');
    // Collapse 3 or more blank lines into 1 blank line
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    return cleaned;
});

const optimizedHtml = cleanParts.join('');
console.log('Size after safe whitespace cleanup:', optimizedHtml.length, 'bytes (saved', originalHtml.length - optimizedHtml.length, 'bytes)');
