/**
 * Creates a shim for @tensorflow/tfjs-node that redirects to @tensorflow/tfjs (CPU backend).
 * This avoids native compilation issues while allowing @vladmandic/face-api to work server-side.
 * Run this after npm install: node scripts/setup-tfjs-shim.js
 */
const fs = require('fs');
const path = require('path');

const shimDir = path.join(__dirname, '..', 'node_modules', '@tensorflow', 'tfjs-node');
const pkgPath = path.join(shimDir, 'package.json');

// Skip shim if real @tensorflow/tfjs-node is already installed
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.version && pkg.version !== '0.0.0-shim') {
      console.log('[setup] Real @tensorflow/tfjs-node found (v' + pkg.version + '), skipping shim');
      process.exit(0);
    }
  } catch {}
}

if (!fs.existsSync(shimDir)) {
  fs.mkdirSync(shimDir, { recursive: true });
}

fs.writeFileSync(
  pkgPath,
  JSON.stringify({ name: '@tensorflow/tfjs-node', version: '0.0.0-shim', main: 'index.js' }, null, 2),
);

fs.writeFileSync(
  path.join(shimDir, 'index.js'),
  '// Shim: re-export @tensorflow/tfjs (CPU backend) as tfjs-node\nmodule.exports = require("@tensorflow/tfjs");\n',
);

console.log('[setup] @tensorflow/tfjs-node shim created (fallback CPU backend)');
