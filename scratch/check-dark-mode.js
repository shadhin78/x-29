const fs = require('fs');

function walk(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(f => {
        const full = `${dir}/${f}`;
        if (fs.statSync(full).isDirectory()) {
            if (f !== 'node_modules' && f !== '.git' && f !== 'scratch') files = files.concat(walk(full));
        } else if (f.endsWith('.js') || f.endsWith('.html')) {
            files.push(full);
        }
    });
    return files;
}

const files = walk('.');
files.forEach(f => {
    const c = fs.readFileSync(f, 'utf8');
    if (c.includes('dark:') || c.includes('dark mode') || c.includes('classList.add(\'dark\')') || c.includes('classList.toggle(\'dark\')') || c.includes('darkMode')) {
        console.log('File with dark mode references:', f);
    }
});
