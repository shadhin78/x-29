const fs = require('fs');

async function inspectPixelAndRect() {
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

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('subject-target-modal');
      const backdrop = document.getElementById('stm-target-backdrop');
      const mr = modal.getBoundingClientRect();
      const br = backdrop.getBoundingClientRect();
      const panel = document.getElementById('timer-active-panel');
      const pr = panel ? panel.getBoundingClientRect() : null;

      // Test changing backdrop background to red to see where it actually is!
      return {
        modalRect: { x: mr.x, y: mr.y, w: mr.width, h: mr.height },
        backdropRect: { x: br.x, y: br.y, w: br.width, h: br.height },
        panelRect: pr ? { x: pr.x, y: pr.y, w: pr.width, h: pr.height } : null,
        backdropComputedBg: getComputedStyle(backdrop).backgroundColor,
        backdropComputedBF: getComputedStyle(backdrop).backdropFilter || getComputedStyle(backdrop).webkitBackdropFilter,
        backdropComputedOpacity: getComputedStyle(backdrop).opacity,
        backdropComputedVisibility: getComputedStyle(backdrop).visibility,
        modalZIndex: getComputedStyle(modal).zIndex,
        parentTag: backdrop.parentElement.tagName + '#' + backdrop.parentElement.id
      };
    })()`,
    returnByValue: true
  });

  console.log('MEASUREMENTS:', JSON.stringify(res.result.value, null, 2));

  // Let's now make the backdrop bright red with no blur to SEE where it draws!
  await send('Runtime.evaluate', {
    expression: `(() => {
      const backdrop = document.getElementById('stm-target-backdrop');
      backdrop.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
      backdrop.style.backdropFilter = 'none';
      backdrop.style.webkitBackdropFilter = 'none';
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/red_backdrop_test.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved red_backdrop_test.png');

  ws.close();
}

inspectPixelAndRect().catch(console.error);
