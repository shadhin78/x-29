const fs = require('fs');

const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split('\n');

let balance = 0;
let mainBalance = 0;
let inMain = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('id="main-content-panel"')) {
    inMain = true;
    mainBalance = 0;
  }
  const opens = (line.match(/<div(\s|>)/gi) || []).length;
  const closes = (line.match(/<\/div>/gi) || []).length;
  balance += (opens - closes);
  if (inMain) {
    mainBalance += (opens - closes);
    if (mainBalance <= 0) {
      console.log(`main-content-panel closed at line ${i + 1}: ${line.trim()}`);
      inMain = false;
    }
  }
  if (line.includes('id="subject-target-modal"')) {
    console.log(`subject-target-modal at line ${i + 1}, total div balance: ${balance}, inMain: ${inMain}, mainBalance: ${mainBalance}`);
  }
}
console.log(`End of file. Total div balance: ${balance}`);
