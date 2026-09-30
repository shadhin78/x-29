const fs = require('fs');

const pageDirs = fs.readdirSync('pages');
pageDirs.forEach(dir => {
    const fullDir = `pages/${dir}`;
    if (fs.statSync(fullDir).isDirectory()) {
        const files = fs.readdirSync(fullDir);
        console.log(`Directory: ${dir}`);
        files.forEach(f => {
            const stat = fs.statSync(`${fullDir}/${f}`);
            console.log(`  - ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
        });
    }
});
