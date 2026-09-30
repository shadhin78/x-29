const fs = require('fs');

const originalHtml = fs.readFileSync('index.html', 'utf8');
console.log('Original index.html size:', originalHtml.length, 'bytes');

// 1. Create backup
fs.writeFileSync('index.html.bak-step009', originalHtml, 'utf8');

// 2. Define reusable SVG symbols
const SYMBOLS = [
    {
        id: 'x29-icon-close-thick',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="3"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close-thick"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-close',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-close-thin',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M6 18L18 6M6 6l12 12"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-close-thin"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></g>'
    },
    {
        id: 'x29-icon-plus',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M12 4v16m8-8H4"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-plus"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></g>'
    },
    {
        id: 'x29-icon-external',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-external"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></g>'
    },
    {
        id: 'x29-icon-calendar',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-calendar"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></g>'
    },
    {
        id: 'x29-icon-clock',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-clock"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></g>'
    },
    {
        id: 'x29-icon-chevron-down',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M19 9l-7 7-7-7"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-chevron-down"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/></g>'
    },
    {
        id: 'x29-icon-bolt',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2\.5"\s+d="M13 10V3L4 14h7v7l9-11h-7z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-bolt"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></g>'
    },
    {
        id: 'x29-icon-sparkles',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2\.286 6\.857L21 12l-5\.714 2\.143L13 21l-2\.286-6\.857L5 12l5\.714-2\.143L13 3z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-sparkles"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></g>'
    },
    {
        id: 'x29-icon-pencil',
        pattern: /<path\s+stroke-linecap="round"\s+stroke-linejoin="round"\s+stroke-width="2"\s+d="M15\.232 5\.232l3\.536 3\.536m-2\.036-5\.036a2\.5 2\.5 0 113\.536 3\.536L6\.5 21\.036H3v-3\.572L16\.732 3\.732z"(><\/path>|\s*\/>)/gi,
        def: '<g id="x29-icon-pencil"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></g>'
    }
];

const spriteDefs = `  <!-- Shared Reusable SVG Icons Sprite (Step 009) -->\r\n  <svg class="hidden" style="display:none;position:absolute;width:0;height:0;" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\r\n    <defs>\r\n` +
    SYMBOLS.map(s => `      ${s.def}`).join('\r\n') +
    `\r\n    </defs>\r\n  </svg>\r\n`;

// Insert defs right after <body>
let updatedHtml = originalHtml.replace(/<body\b[^>]*>/i, m => `${m}\r\n${spriteDefs}`);

// Replace SVG paths
let totalReplacements = 0;
for (const s of SYMBOLS) {
    let count = 0;
    updatedHtml = updatedHtml.replace(s.pattern, () => {
        count++;
        totalReplacements++;
        return `<use href="#${s.id}"/>`;
    });
    console.log(`Replaced ${s.id}: ${count} occurrences`);
}
console.log(`Total icon replacements: ${totalReplacements}`);

// Normalize excessive whitespace while preserving all scripts, styles, pre blocks
const lines = updatedHtml.replace(/\r\n/g, '\n').split('\n');
let inScript = false;
let inStyle = false;
const cleanLines = [];

for (const line of lines) {
    if (line.includes('<script')) inScript = true;
    if (line.includes('<style')) inStyle = true;

    if (inScript || inStyle) {
        cleanLines.push(line);
    } else {
        const trimmedRight = line.replace(/\s+$/, '');
        const match = trimmedRight.match(/^( +)(.*)$/);
        if (match) {
            const spaces = match[1].length;
            const content = match[2];
            // Scale deep indentation down (e.g. 24 spaces -> 14 spaces)
            const newSpaces = ' '.repeat(Math.min(spaces, Math.floor(spaces / 2) + 2));
            cleanLines.push(newSpaces + content);
        } else {
            cleanLines.push(trimmedRight);
        }
    }

    if (line.includes('</script>')) inScript = false;
    if (line.includes('</style>')) inStyle = false;
}

const finalHtml = cleanLines.join('\r\n');
console.log('Writing optimized index.html...');
fs.writeFileSync('index.html', finalHtml, 'utf8');

console.log('Original size:', originalHtml.length, 'bytes');
console.log('Optimized size:', finalHtml.length, 'bytes');
console.log('Payload reduction:', originalHtml.length - finalHtml.length, 'bytes saved');
