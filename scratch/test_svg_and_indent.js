const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
console.log('Original size:', html.length, 'bytes');

// 1. Identify all repeated SVG patterns
const fullSvgRegex = /<svg\b([^>]*)>([\s\S]*?)<\/svg>/gi;
let m;
const svgs = [];
while ((m = fullSvgRegex.exec(html)) !== null) {
    svgs.push({
        full: m[0],
        attrs: m[1],
        inner: m[2].trim(),
        index: m.index
    });
}

const innerCounts = {};
for (const s of svgs) {
    const norm = s.inner.replace(/\s+/g, ' ');
    innerCounts[norm] = (innerCounts[norm] || 0) + 1;
}

// Map the most frequent patterns to symbol IDs
const SYMBOLS = [
    {
        id: 'x29-icon-close-thick', // 23 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="3"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close-thick"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-close', // 12 + 3 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-close-thin', // 3 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close-thin"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-plus', // 9 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M12 4v16m8-8H4"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-plus"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></g>'
    },
    {
        id: 'x29-icon-external', // 10 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-external"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></g>'
    },
    {
        id: 'x29-icon-calendar', // 9 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-calendar"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></g>'
    },
    {
        id: 'x29-icon-clock', // 7 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-clock"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></g>'
    },
    {
        id: 'x29-icon-chevron-down', // 5 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M19 9l-7 7-7-7"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-chevron-down"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></g>'
    },
    {
        id: 'x29-icon-bolt', // 4 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M13 10V3L4 14h7v7l9-11h-7z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-bolt"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></g>'
    },
    {
        id: 'x29-icon-sparkles', // 4 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2\.286 6\.857L21 12l-5\.714 2\.143L13 21l-2\.286-6\.857L5 12l5\.714-2\.143L13 3z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-sparkles"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></g>'
    },
    {
        id: 'x29-icon-pencil', // 3 times
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M15\.232 5\.232l3\.536 3\.536m-2\.036-5\.036a2\.5 2\.5 0 113\.536 3\.536L6\.5 21\.036H3v-3\.572L16\.732 3\.732z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-pencil"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></g>'
    }
];

const spriteDefs = `  <!-- Shared Reusable SVG Icons Sprite (Step 009) -->\n  <svg class="hidden" style="display:none;position:absolute;width:0;height:0;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n    <defs>\n` +
    SYMBOLS.map(s => `      ${s.def}`).join('\n') +
    `\n    </defs>\n  </svg>\n`;

let newHtml = html.replace(/<body\b[^>]*>/i, m => `${m}\n${spriteDefs}`);

let totalReplacements = 0;
for (const s of SYMBOLS) {
    let count = 0;
    newHtml = newHtml.replace(s.pattern, () => {
        count++;
        totalReplacements++;
        return `<use href="#${s.id}"/>`;
    });
    console.log(`Replaced ${s.id}: ${count} occurrences`);
}
console.log(`Total icon replacements: ${totalReplacements}`);
console.log('Size after SVG consolidation:', newHtml.length, 'bytes');

// Safe whitespace normalization:
// 1. Never touch <script> or <style> or <pre>
// 2. Trim trailing spaces on every line
// 3. Normalize indentation: reduce redundant spaces while preserving structure
// Let's test line-by-line whitespace normalization:
const lines = newHtml.split('\r\n').length > 1 ? newHtml.split('\r\n') : newHtml.split('\n');
let inScript = false;
let inStyle = false;
const cleanLines = [];

for (const line of lines) {
    if (line.includes('<script')) inScript = true;
    if (line.includes('<style')) inStyle = true;

    if (inScript || inStyle) {
        cleanLines.push(line);
    } else {
        // Normal HTML line: trim trailing whitespace
        const trimmedRight = line.replace(/\s+$/, '');
        // If line has indentation > 4 spaces, scale indentation safely (e.g. 2 spaces per 4 spaces)
        const match = trimmedRight.match(/^( +)(.*)$/);
        if (match) {
            const spaces = match[1].length;
            const content = match[2];
            // Scale deep indentation down (reduce 4 spaces to 2 spaces)
            const newSpaces = ' '.repeat(Math.min(spaces, Math.floor(spaces / 2) + 2));
            cleanLines.push(newSpaces + content);
        } else {
            cleanLines.push(trimmedRight);
        }
    }

    if (line.includes('</script>')) inScript = false;
    if (line.includes('</style>')) inStyle = false;
}

const cleanedHtml = cleanLines.join('\r\n');
console.log('Size after indentation normalization:', cleanedHtml.length, 'bytes');
console.log('Total bytes saved:', html.length - cleanedHtml.length, 'bytes');
