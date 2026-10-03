const fs = require('fs');

async function testModalDirectOnBody() {
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

  // Move modal to body, set z-index 9999, test rendering
  await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('subject-target-modal');
      const backdrop = document.getElementById('stm-target-backdrop');
      document.body.appendChild(modal);
      modal.style.zIndex = '9999';
      modal.style.position = 'fixed';
      modal.style.inset = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';

      backdrop.style.position = 'fixed';
      backdrop.style.inset = '0';
      backdrop.style.width = '100vw';
      backdrop.style.height = '100vh';
      backdrop.style.zIndex = '0';

      // Re-trigger open animation
      window.openSubjectTargetModal();
    })()`
  });

  await new Promise(r => setTimeout(r, 600));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = 'C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/body_modal_rendered.png';
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved to', shotPath);

  ws.close();
}

testModalDirectOnBody().catch(console.error);
