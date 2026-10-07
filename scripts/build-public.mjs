import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = path.resolve(root, 'public');
if (output !== path.join(root, 'public') || !output.startsWith(root + path.sep)) {
  throw new Error('Refusing to replace a directory outside this project.');
}

const files = [
  'index.html',
  'favicon.svg',
  'projects.css',
  'project.js',
  'project-experience.js',
  '李思萱CV.docx',
  'assets/sixuan-portrait.jpg',
];
const directories = ['projects', 'assets/figma-projects'];

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
    else throw new Error(`Unsupported website asset: ${from}`);
  }
}

for (const item of [...files, ...directories]) {
  if (!fs.existsSync(path.join(root, item))) {
    throw new Error(`Missing website file: ${item}`);
  }
}

fs.rmSync(output, { recursive: true, force: true });
for (const item of files) {
  const destination = path.join(output, item);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, item), destination);
}
for (const item of directories) {
  copyDirectory(path.join(root, item), path.join(output, item));
}

console.log(`Cloudflare site prepared in ${output}`);
