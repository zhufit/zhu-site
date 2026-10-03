// Browser driver for check-responsive.py. Node >=22 supplies WebSocket.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [chrome, directory, origin, mode] = process.argv.slice(2);
const routes = { home: 'index.html', writing: 'writing/index.html', article: 'writing/architecture/qa-responsive/index.html', projects: 'projects/index.html', project: 'projects/qa-responsive/index.html', about: 'about/index.html', '404': '404.html' };
const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--disable-background-networking', '--no-first-run', '--no-default-browser-check', '--no-proxy-server', '--remote-debugging-port=0', `--user-data-dir=${directory}/profile`], { detached: true, stdio: ['ignore', 'ignore', 'pipe'] });
let socket;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Chrome startup timeout')), 15000);
    browser.stderr.on('data', chunk => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    browser.once('error', error => { clearTimeout(timer); reject(error); });
  });
  socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer); pending.delete(message.id);
    message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result);
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out`)); }, 10000);
      pending.set(id, { resolve, reject, timer });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const results = [];
  for (const [page, route] of Object.entries(routes)) {
    for (const width of (mode === 'accessibility' ? [1440, 375] : [1440, 1280, 1024, 768, 390, 375])) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId);
      await send('Page.navigate', { url: `${origin}/${route}` }, sessionId);
      let data;
      for (let attempt = 0; attempt < 50; attempt++) {
        const result = await send('Runtime.evaluate', { expression: "document.getElementById('qa-result')?.textContent", returnByValue: true }, sessionId);
        if (result.result.value) { data = JSON.parse(result.result.value); break; }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!data) throw new Error(`${page}/${width}: missing DOM diagnostics`);
      const screenshot = `${directory}/${page}-${width}.png`;
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }, sessionId);
      writeFileSync(screenshot, Buffer.from(shot.data, 'base64'));
      const top = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, sessionId);
      writeFileSync(`${directory}/${page}-${width}-top.png`, Buffer.from(top.data, 'base64'));
      data = { ...data, page, screenshot, passed: data.width === width && data.scroll <= width + 1 && data.outside.length === 0 && data.images.every(image => image.loaded && image.width <= width) && data.scrollers.every(element => element.overflow === 'auto' && element.width <= width) };
      if (mode === 'accessibility') {
        const semantic = await send('Runtime.evaluate', { expression: `(() => {
          const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>+e.tagName[1]);
          const issues=[];
          if(document.documentElement.lang!=='zh-CN') issues.push('language');
          if(document.querySelectorAll('main').length!==1||headings.filter(h=>h===1).length!==1) issues.push('landmarks/h1');
          if(headings.some((h,i)=>i>0&&h>headings[i-1]+1)) issues.push('heading order');
          for(const image of document.images) if(!image.hasAttribute('alt')) issues.push('image alt');
          for(const link of document.querySelectorAll('a')) if(!link.getAttribute('href')||!(link.getAttribute('aria-label')||link.textContent).trim()) issues.push('link name/href');
          if(document.querySelector('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')) issues.push('positive tabindex');
          for(const e of document.querySelectorAll('.article-content pre,.article-content table')) if(e.tabIndex!==0||!e.getAttribute('aria-label')) issues.push('scroll focus');
          const rgb=value=>(value.match(/[0-9.]+/g)||[]).map(Number);
          const luminance=color=>color.slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
          for(const element of document.querySelectorAll('main *')) {
            if(![...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim())||!element.getClientRects().length) continue;
            const style=getComputedStyle(element);
            let parent=element, background;
            while(parent) {const c=rgb(getComputedStyle(parent).backgroundColor);if(c.length===3||c[3]===1){background=c;break;}parent=parent.parentElement;}
            background??=[255,255,255];
            const values=[luminance(rgb(style.color)),luminance(background)].sort((a,b)=>a-b);
            const ratio=(values[1]+.05)/(values[0]+.05);
            const large=parseFloat(style.fontSize)>=24||(parseFloat(style.fontSize)>=18.667&&parseInt(style.fontWeight)>=700);
            if(ratio<(large?3:4.5)) issues.push('contrast '+element.tagName+' '+style.color+' '+ratio.toFixed(2));
          }
          return issues;
        })()`, returnByValue:true }, sessionId);
        await send('Runtime.evaluate', {expression:"document.activeElement.blur(); scrollTo(0,0)"},sessionId);
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);
        await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},sessionId);
        const focus=await send('Runtime.evaluate',{expression:`(() => {const e=document.activeElement;const s=getComputedStyle(e);const r=e.getBoundingClientRect();return {skip:e.classList.contains('skip-link'),visible:r.top>=0&&r.bottom<=innerHeight,outline:s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2};})()`,returnByValue:true},sessionId);
        await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
        await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},sessionId);
        const target=await send('Runtime.evaluate',{expression:"document.activeElement.id",returnByValue:true},sessionId);
        const issues=semantic.result.value;
        if(!focus.result.value.skip||!focus.result.value.visible||!focus.result.value.outline) issues.push('skip link keyboard/visibility/focus');
        if(target.result.value!=='main-content') issues.push('skip target');
        data.accessibilityIssues=issues;
        data.passed &&= issues.length===0;
      }
      results.push(data);
      console.log(`${page} ${width}: ${data.passed ? 'PASS' : 'FAIL'} ${JSON.stringify(data.accessibilityIssues ?? data.outside)}`);
    }
  }
  writeFileSync(`${directory}/${mode === 'accessibility' ? 'accessibility' : 'results'}.json`, JSON.stringify(results, null, 2));
  if (!results.every(result => result.passed)) process.exitCode = 1;
} finally {
  socket?.close();
  // The isolated browser and its helpers are owned by this invocation.
  try { process.kill(-browser.pid, 'SIGTERM'); } catch {}
  browser.stderr.destroy();
  browser.unref();
}
