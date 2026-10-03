const fs = require('fs');

async function testRedOnDesktop() {
  const list = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  const focusTab = list.find(t => t.url && (t.url.includes('/timer') || t.url.includes('/focus') || t.url.includes('localhost:3000')));

  const ws = new WebSocket(focusTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === curId) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  await send('Runtime.evaluate', {
    expression: `(() => {
      const backdrop = document.getElementById('stm-target-backdrop');
      backdrop.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/desktop_red_backdrop.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved desktop_red_backdrop.png');

  ws.close();
}

testRedOnDesktop().catch(console.error);
