const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');

// Find parent tags of subject-target-modal by simulating tag stack
const lines = content.split('\n');
const stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('id="subject-target-modal"')) {
    console.log('subject-target-modal is inside:');
    console.log(stack.map(s => `<${s.tag} id="${s.id || ''}" class="${s.class || ''}">`).join('\n  '));
    break;
  }
  // find tags
  const regex = /<\/?([a-zA-Z0-9\-]+)([^>]*)>/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const full = match[0];
    const tag = match[1].toLowerCase();
    const rest = match[2];
    if (tag === 'input' || tag === 'img' || tag === 'meta' || tag === 'link' || tag === 'hr' || tag === 'br') continue;
    if (full.endsWith('/>')) continue;

    if (full.startsWith('</')) {
      // pop until tag matches
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].tag === tag) {
          stack.splice(j);
          break;
        }
      }
    } else {
      const idMatch = rest.match(/id="([^"]+)"/);
      const classMatch = rest.match(/class="([^"]+)"/);
      stack.push({
        tag,
        id: idMatch ? idMatch[1] : '',
        class: classMatch ? classMatch[1] : ''
      });
    }
  }
}
