// A tiny static file server for game/, so the heist can be played and photographed
// locally with no build step: `node serve.ts` serves http://localhost:8080.
// It answers only files inside game/, with the MIME types a browser game needs.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const portIndex = process.argv.indexOf('--port');
const asked = portIndex === -1 ? 8080 : Number(process.argv[portIndex + 1]);
const port = Number.isInteger(asked) && asked > 0 && asked < 65536 ? asked : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = resolve(join(root, normalize(decodeURIComponent(url.pathname))));
  if (path !== root && !path.startsWith(root + sep)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  const file = url.pathname === '/' ? join(root, 'index.html') : path;
  try {
    if (!statSync(file).isFile()) throw new Error('not a file');
  } catch {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log('Vaultbreak at http://localhost:' + port));
