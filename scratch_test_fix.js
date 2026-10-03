const fs = require('fs');
const { exec } = require('child_process');

async function testFixVisual() {
  exec('start chrome --remote-debugging-port=9222 --headless=new --window-size=1920,1080 http://localhost:3000/focus');
  await new Promise(r => setTimeout(r, 2000));

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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:3000/focus' });
  await new Promise(r => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: `(async () => {
      if (window.Router) await window.Router.loadPage('timer');
    })()`,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 800));

  // Apply the fix in DOM:
  // 1. Move subject-target-modal to be a direct child of document.body
  // 2. Set modal z-index to 9999
  // 3. Set backdrop to bg-slate-950/80 backdrop-blur-md
  await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('subject-target-modal');
      const backdrop = document.getElementById('stm-target-backdrop');
      document.body.appendChild(modal);

      modal.className = 'fixed inset-0 z-[9999] hidden flex items-center justify-center p-4 sm:p-6 transition-all duration-300';
      backdrop.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md opacity-0 transition-opacity duration-300';

      window.openSubjectTargetModal();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = 'C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/fixed_modal_rendered.png';
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved fixed screenshot to', shotPath);

  ws.close();
}

testFixVisual().catch(console.error);
