// Local development server.
// Serves public/ as static files and runs api/*.js the same way Vercel does,
// so the whole app can be tested without a Vercel account.

import http from 'node:http';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const apiDir = path.join(root, 'api');
const port = Number(process.env.PORT) || 3000;

if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// Adds the helpers Vercel puts on req/res (req.query, req.body, res.status, res.json).
function withVercelHelpers(req, res, url, body) {
  req.query = Object.fromEntries(url.searchParams);
  req.body = body;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };
  res.send = (data) => {
    res.end(data);
    return res;
  };
}

async function handleApi(req, res, url) {
  const name = url.pathname.slice('/api/'.length).replace(/\/$/, '');
  const file = path.join(apiDir, `${name}.js`);
  if (!/^[\w-]+$/.test(name) || !existsSync(file)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  withVercelHelpers(req, res, url, await readBody(req));
  // Cache-bust so edits to api files are picked up without restarting.
  const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
  await mod.default(req, res);
}

async function handleStatic(res, url) {
  let filePath = path.join(publicDir, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(publicDir)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  try {
    if ((await fs.stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
    const data = await fs.readFile(filePath);
    res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    try {
      if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
      else await handleStatic(res, url);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) res.statusCode = 500;
      res.end('Server error');
    }
  })
  .listen(port, () => console.log(`Dev server running at http://localhost:${port}`));
