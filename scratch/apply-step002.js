const fs = require('fs');

// 1. Update index.html
let indexContent = fs.readFileSync('index.html', 'utf8');

const oldIndexFontBlock = `    <!-- Google Fonts -->\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Rajdhani:wght@600;700;800&family=Chakra+Petch:wght@600;700&display=swap"\r
        rel="stylesheet">`;

const newIndexFontBlock = `    <!-- Google Fonts Optimization (Non-Render-Blocking Asynchronous Load) -->\r
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">\r
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link rel="preload" as="style"\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Rajdhani:wght@600;700;800&family=Chakra+Petch:wght@600;700&display=swap">\r
    <link rel="stylesheet"\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Rajdhani:wght@600;700;800&family=Chakra+Petch:wght@600;700&display=swap"\r
        media="print" onload="this.media='all'">\r
    <noscript>\r
        <link rel="stylesheet"\r
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700;800&family=Rajdhani:wght@600;700;800&family=Chakra+Petch:wght@600;700&display=swap">\r
    </noscript>`;

if (!indexContent.includes(oldIndexFontBlock)) {
    console.error('ERROR: oldIndexFontBlock not found in index.html');
    process.exit(1);
}
indexContent = indexContent.replace(oldIndexFontBlock, newIndexFontBlock);
fs.writeFileSync('index.html', indexContent, 'utf8');
console.log('SUCCESS: Updated index.html font loading.');

// 2. Update login.html
let loginContent = fs.readFileSync('login.html', 'utf8');

const oldLoginFontBlock = `    <!-- Google Fonts -->\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&display=swap"\r
        rel="stylesheet">`;

const newLoginFontBlock = `    <!-- Google Fonts Optimization (Non-Render-Blocking Asynchronous Load) -->\r
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">\r
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link rel="preload" as="style"\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&display=swap">\r
    <link rel="stylesheet"\r
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&display=swap"\r
        media="print" onload="this.media='all'">\r
    <noscript>\r
        <link rel="stylesheet"\r
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;800;900&display=swap">\r
    </noscript>`;

if (!loginContent.includes(oldLoginFontBlock)) {
    console.error('ERROR: oldLoginFontBlock not found in login.html');
    process.exit(1);
}
loginContent = loginContent.replace(oldLoginFontBlock, newLoginFontBlock);
fs.writeFileSync('login.html', loginContent, 'utf8');
console.log('SUCCESS: Updated login.html font loading.');
