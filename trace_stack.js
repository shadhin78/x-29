const fs = require('fs');

const content = fs.readFileSync('focus/index.html', 'utf8');
const lines = content.split('\n');
const modalIdx = lines.findIndex(l => l.includes('id="subject-target-modal"'));

let stack = [];
for (let i = 0; i < modalIdx; i++) {
  const line = lines[i];
  const tagMatches = line.matchAll(/<\/?([a-zA-Z0-9\-]+)([^>]*)>/g);
  for (const m of tagMatches) {
    const isClosing = m[0].startsWith('</');
    const tag = m[1].toLowerCase();
    if (['input','img','meta','link','hr','br'].includes(tag) || m[0].endsWith('/>')) continue;
    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Line ${i + 1}: Unmatched closing tag </${tag}>`);
        continue;
      }
      const last = stack[stack.length - 1];
      if (last.tag === tag) {
        const popped = stack.pop();
        if (['body', 'div'].includes(popped.tag) && (popped.id === 'app-wrapper' || popped.id === 'main-content-panel' || popped.tag === 'body')) {
          console.log(`Line ${i + 1}: Expected pop of <${popped.tag} id="${popped.id}">`);
        }
      } else {
        // Tag mismatch
        console.log(`Line ${i + 1}: Mismatched closing tag </${tag}>, top of stack is <${last.tag} id="${last.id}"> (from line ${last.line})`);
        let foundIndex = -1;
        for (let k = stack.length - 1; k >= 0; k--) {
          if (stack[k].tag === tag) {
            foundIndex = k;
            break;
          }
        }
        if (foundIndex !== -1) {
          const removed = stack.splice(foundIndex);
          console.log(`  Popped ${removed.length} elements:`, removed.map(r => `<${r.tag} id="${r.id}" line="${r.line}">`).join(', '));
        } else {
          console.log(`  No matching opening tag for </${tag}> in stack`);
        }
      }
    } else {
      const idMatch = m[2].match(/id="([^"]+)"/);
      const id = idMatch ? idMatch[1] : '';
      const clsMatch = m[2].match(/class="([^"]+)"/);
      const cls = clsMatch ? clsMatch[1] : '';
      stack.push({ line: i + 1, tag, id, cls });
    }
  }
}
