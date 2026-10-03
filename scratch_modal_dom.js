const fs = require('fs');
const { exec } = require('child_process');

async function inspectModalDOM() {
  let list;
  try {
    list = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  } catch (e) {
    exec('start chrome --remote-debugging-port=9222 --headless=new http://localhost:3000/focus');
    await new Promise(r => setTimeout(r, 2000));
    list = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  }

  const focusTab = list.find(t => t.url && (t.url.includes('/timer') || t.url.includes('/focus') || t.url.includes('localhost:3000')));
  if (!focusTab) return;

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

  await send('Page.navigate', { url: 'http://localhost:3000/focus' });
  await new Promise(r => setTimeout(r, 1200));

  const result = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('subject-target-modal');
      const chain = [];
      let cur = modal;
      while (cur) {
        chain.push({
          tag: cur.tagName,
          id: cur.id,
          className: cur.className,
          parentElement: cur.parentElement ? cur.parentElement.tagName + '#' + cur.parentElement.id : null
        });
        cur = cur.parentElement;
      }
      return {
        chain,
        modalDisplay: window.getComputedStyle(modal).display,
        modalPosition: window.getComputedStyle(modal).position,
        modalZIndex: window.getComputedStyle(modal).zIndex
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM Chain in Chrome:', JSON.stringify(result, null, 2));
  ws.close();
}

inspectModalDOM().catch(console.error);
