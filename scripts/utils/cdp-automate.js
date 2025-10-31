/*
 * CDP automation for existing local Chrome.
 * - Connects to Chrome via DevTools Protocol (port from BROWSER_REMOTE_DEBUGGING_PORT).
 * - Finds the target page by URL substring.
 * - Locates the iframe for match-up-game and interacts inside it.
 * - Captures HTML snapshot and screenshot to logs/.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const CDP = require('chrome-remote-interface');

const PORT = process.env.BROWSER_REMOTE_DEBUGGING_PORT || '9222';
const HOST = '127.0.0.1';
const URL_HINT = process.argv[2] || 'edu-create.vercel.app/games/switcher?game=match-up-game';
const FRAME_HINT = process.argv[3] || 'match-up-game';
const outDir = path.join(process.cwd(), 'logs');
const pngOut = path.join(outDir, 'chrome-game-cdp.png');
const htmlOut = path.join(outDir, 'chrome-game-cdp.html');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fetchJSONList() {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: HOST, port: PORT, path: '/json/list', method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const arr = JSON.parse(data);
          resolve(arr);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function pickTarget() {
  const list = await fetchJSONList();
  // Prefer page targets with matching URL
  const byUrl = list.find((t) => (t.type === 'page' || t.type === 'background_page') && String(t.url).includes(URL_HINT));
  if (byUrl) return byUrl;
  // Fallback to first page target
  const anyPage = list.find((t) => t.type === 'page');
  if (anyPage) return anyPage;
  throw new Error('No suitable page target found');
}

async function main() {
  ensureDir(outDir);
  const target = await pickTarget();
  const wsUrl = target.webSocketDebuggerUrl;
  if (!wsUrl) throw new Error('Target missing webSocketDebuggerUrl');

  const client = await CDP({ target: wsUrl });
  const { Page, Runtime, DOM, Network, Target } = client;
  await Promise.all([Page.enable(), Runtime.enable(), DOM.enable(), Network.enable()]);
  try { await Page.bringToFront(); } catch {}

  // Get frame tree and find the match-up-game iframe
  const tree = await Page.getFrameTree();
  const findFrame = (node, pred) => {
    if (pred(node)) return node;
    if (node.childFrames) {
      for (const ch of node.childFrames) {
        const f = findFrame(ch, pred);
        if (f) return f;
      }
    }
    return null;
  };
  const frameNode = findFrame(tree.frameTree, (n) => {
    const url = (n.frame && n.frame.url) || '';
    return url.includes(FRAME_HINT);
  });

  // Create isolated world in the iframe (or fallback to main frame)
  let contextId;
  if (frameNode && frameNode.frame && frameNode.frame.id) {
    const { executionContextId } = await Page.createIsolatedWorld({ frameId: frameNode.frame.id, worldName: 'automation' });
    contextId = executionContextId;
  } else {
    // Fallback: main world
    const { result } = await Runtime.evaluate({ expression: 'window', returnByValue: false });
    contextId = result ? result.objectId : undefined;
  }

  // Snapshot HTML from the chosen context (iframe if available)
  let html = '';
  try {
    const { result } = await Runtime.evaluate({ expression: 'document.documentElement.outerHTML', contextId, returnByValue: true });
    html = result && result.value ? String(result.value) : '';
  } catch (e) {
    // Fallback to main document
    const { result } = await Runtime.evaluate({ expression: 'document.documentElement.outerHTML', returnByValue: true });
    html = result && result.value ? String(result.value) : '';
  }
  fs.writeFileSync(htmlOut, html, 'utf8');

  // Try some basic interactions inside the iframe/world
  const interactScript = `(() => {
    const log = [];
    const clickIfExists = (sel) => { const el = document.querySelector(sel); if (el) { el.click(); log.push('clicked '+sel); return true; } return false; };
    const candidates = ['button', '[data-testid=start]', '.start', '#start', '.begin', '.play', '.start-button'];
    for (const c of candidates) { if (clickIfExists(c)) break; }
    const tiles = Array.from(document.querySelectorAll('.card, .tile, .match-card, .game-card'));
    if (tiles.length >= 2) { tiles[0].dispatchEvent(new MouseEvent('click', { bubbles: true })); tiles[1].dispatchEvent(new MouseEvent('click', { bubbles: true })); log.push('clicked two tiles'); }
    return log;
  })()`;
  try {
    const { result } = await Runtime.evaluate({ expression: interactScript, contextId, returnByValue: true });
    console.log('Interact log:', result && result.value);
  } catch (e) {
    console.warn('Interaction failed:', e.message);
  }

  // Screenshot the current page viewport
  const shot = await Page.captureScreenshot({ format: 'png' });
  fs.writeFileSync(pngOut, Buffer.from(shot.data, 'base64'));

  console.log('Outputs saved:', { htmlOut, pngOut });
  await client.close();
}

main().catch((err) => {
  console.error('CDP automation error:', err);
  process.exit(1);
});