const { spawn } = require('child_process');

console.log('Testing Memory Bank MCP Server...');
console.log('Current directory:', process.cwd());
console.log('');

// Test if npx can find the memory bank package
const child = spawn('npx', ['@movibe/memory-bank-mcp'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send a simple test after 2 seconds
setTimeout(() => {
  console.log('Sending test message to Memory MCP server...');
  child.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}\n');
}, 2000);

// Kill after 5 seconds
setTimeout(() => {
  child.kill();
}, 5000);

child.on('close', (code) => {
  console.log('');
  console.log('=== Memory MCP Server Test Results ===');
  console.log('Exit code:', code);
  console.log('');
  
  if (output) {
    console.log('Output:');
    console.log(output);
  }
  
  if (errorOutput) {
    console.log('Error output:');
    console.log(errorOutput);
  }
  
  if (output.includes('Memory') || errorOutput.includes('Memory') || output.includes('memory')) {
    console.log('✅ Memory MCP Server appears to be working!');
  } else if (code === null || code === 0) {
    console.log('✅ Memory MCP Server started successfully (killed by test)');
  } else {
    console.log('❌ Memory MCP Server may have issues');
  }
});

child.on('error', (err) => {
  console.log('❌ Error starting Memory MCP server:', err.message);
});
