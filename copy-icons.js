const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'public', 'logo-square.png');
const targets = [
  path.join(__dirname, 'public', 'icon-192.png'),
  path.join(__dirname, 'public', 'icon-512.png'),
  path.join(__dirname, 'public', 'icon-maskable.png'),
  path.join(__dirname, 'public', 'favicon.ico'),
  path.join(__dirname, 'app', 'favicon.ico'),
];

targets.forEach((tgt) => {
  fs.copyFileSync(src, tgt);
  console.log('Copied to', tgt);
});
