const fs = require('fs');
const { exec } = require('child_process');

async function testLiveBackdrop() {
  let list;
  try {
    list = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  } catch (e) {
    exec('start chrome --remote-debugging-port=9222 --headless=new http://localhost:3000/focus');
    await new Promise(r => setTimeout(r, 2000));
    list = await fetch('http://127.0.0.1:9222/json').then(r => r.json());
  }

  const focusTab = list.find(t => t.url && (t.url.includes('/timer') || t.url.includes('/focus') || t.url.includes('localhost:3000')));
  if (!focusTab) {
    console.log('No focus tab found');
    return;
  }

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
  // Wait for app and focus page to initialize
  await new Promise(r => setTimeout(r, 2000));

  // Ensure focus page is shown and populate data
  await send('Runtime.evaluate', {
    expression: `(() => {
      if (window.FocusPage && window.FocusPage.mount) window.FocusPage.mount();
      if (window.renderTimerPage) window.renderTimerPage();
      if (window.updateSubjectTargetUI) window.updateSubjectTargetUI();
      // Ensure page-timer is visible
      const pt = document.getElementById('page-timer');
      if (pt) pt.classList.remove('hidden');
    })()`
  });
  await new Promise(r => setTimeout(r, 500));

  // Now open subject target modal
  await send('Runtime.evaluate', {
    expression: `(() => {
      window.openSubjectTargetModal();
    })()`
  });
  await new Promise(r => setTimeout(r, 600));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const shotPath = 'C:/Users/ratul/.gemini/antigravity-ide/brain/4ced4b78-d704-4205-8ccd-7364f2c48a7b/scratch/live_modal_rendered.png';
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  // Probe DOM styles and bounding rects
  const probe = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('subject-target-modal');
      const backdrop = document.getElementById('stm-target-backdrop');
      const content = document.getElementById('stm-target-content');
      const sidebar = document.getElementById('sidebar-container');
      const pageTimer = document.getElementById('page-timer');

      return {
        modal: {
          rect: modal.getBoundingClientRect(),
          zIndex: getComputedStyle(modal).zIndex,
          position: getComputedStyle(modal).position
        },
        backdrop: {
          rect: backdrop.getBoundingClientRect(),
          zIndex: getComputedStyle(backdrop).zIndex,
          position: getComputedStyle(backdrop).position,
          backdropFilter: getComputedStyle(backdrop).backdropFilter || getComputedStyle(backdrop).webkitBackdropFilter,
          opacity: getComputedStyle(backdrop).opacity
        },
        sidebar: {
          rect: sidebar ? sidebar.getBoundingClientRect() : null,
          zIndex: sidebar ? getComputedStyle(sidebar).zIndex : null,
          position: sidebar ? getComputedStyle(sidebar).position : null
        },
        pageTimer: {
          rect: pageTimer ? pageTimer.getBoundingClientRect() : null,
          transform: pageTimer ? getComputedStyle(pageTimer).transform : null,
          willChange: pageTimer ? getComputedStyle(pageTimer).willChange : null
        }
      };
    })()`,
    returnByValue: true
  });

  console.log('Probe results:', JSON.stringify(probe, null, 2));
  ws.close();
}

testLiveBackdrop().catch(console.error);
