const fs = require('fs');
const { exec } = require('child_process');

async function testDesktopSized() {
  exec('taskkill /F /IM chrome.exe');
  await new Promise(r => setTimeout(r, 1000));

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

  await new Promise(r => setTimeout(r, 1000));

  // Load timer page cleanly
  await send('Runtime.evaluate', {
    expression: `(async () => {
      if (window.Router) {
        await window.Router.loadPage('timer');
      }
    })()`,
    awaitPromise: true
  });
  await new Promise(r => setTimeout(r, 800));

  // Open modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.openSubjectTargetModal();
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/desktop_1920_open.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved desktop_1920_open.png');

  // Now set backdrop to red and take screenshot
  await send('Runtime.evaluate', {
    expression: `(() => {
      const backdrop = document.getElementById('stm-target-backdrop');
      backdrop.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  const redShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/desktop_1920_red.png', Buffer.from(redShot.data, 'base64'));
  console.log('Saved desktop_1920_red.png');

  ws.close();
}

testDesktopSized().catch(console.error);
