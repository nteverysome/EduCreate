#!/usr/bin/env node
const cp = require('child_process');
const path = require('path');

function openPath(p) {
  if (!p) {
    console.error('open: missing path');
    process.exit(1);
  }
  const abs = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`[open] Opening: ${abs}`);
  try {
    if (process.platform === 'win32') {
      // Prefer PowerShell Start-Process
      const ps = cp.spawn('powershell', ['-NoProfile', '-Command', `Start-Process -FilePath "${abs}"`], { stdio: 'ignore', detached: true });
      // Fallback with cmd /c start if PowerShell is blocked
      ps.on('error', () => {
        cp.spawn('cmd', ['/c', 'start', '', abs], { stdio: 'ignore', detached: true });
      });
    } else if (process.platform === 'darwin') {
      cp.spawn('open', [abs], { stdio: 'ignore', detached: true });
    } else {
      cp.spawn('xdg-open', [abs], { stdio: 'ignore', detached: true });
    }
  } catch (e) {
    console.error('open: failed to launch', e.message);
    // Try cmd fallback on Windows even on catch
    if (process.platform === 'win32') {
      try { cp.spawn('cmd', ['/c', 'start', '', abs], { stdio: 'ignore', detached: true }); } catch {}
    }
  }
}

if (require.main === module) {
  openPath(process.argv[2]);
}

module.exports = { openPath };

