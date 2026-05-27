#!/usr/bin/env node
// github-mock — standalone HTTP service that renders github.com-style pages
// for the SynthUX virtual internet. Independent from any OS sim; connects
// only via HTTP, like a real service.

import http from 'node:http';
import { renderPage } from './render.mjs';

const HOST = process.env.GITHUB_MOCK_HOST || '127.0.0.1';
const PORT = parseInt(process.env.GITHUB_MOCK_PORT || '5180', 10);

function parseRequest(req) {
  const u = new URL(req.url, `http://${req.headers.host || HOST}`);
  // Routes:
  //   /                        -> github landing (TODO; for now redirect to /acme/api)
  //   /<owner>                 -> user/org page
  //   /<owner>/<repo>          -> repo overview
  //   /<owner>/<repo>/pulls    -> PR list
  //   /<owner>/<repo>/pull/<n> -> PR detail
  //   /<owner>/<repo>/issues   -> issues
  //   /healthz                 -> readiness check
  const parts = u.pathname.split('/').filter(Boolean);
  return { parts, query: u.searchParams, raw: u };
}

const server = http.createServer((req, res) => {
  const { parts, query } = parseRequest(req);

  if (parts.length === 1 && parts[0] === 'healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'github-mock' }));
    return;
  }

  const owner = parts[0] || 'acme';
  const repo = parts[1] || 'api';
  let view = 'overview';
  if (parts[2] === 'pulls') view = 'pulls';
  else if (parts[2] === 'pull' && parts[3]) view = `pr/${parts[3]}`;
  else if (parts[2] === 'issues') view = 'issues';
  else if (parts[2] === 'actions') view = 'actions';

  const html = renderPage({ owner, repo, view });
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy': "frame-ancestors *",
    'x-frame-options': 'ALLOWALL',
    'cache-control': 'no-store',
  });
  res.end(html);
});

server.listen(PORT, HOST, () => {
  console.log(`[github-mock] http://${HOST}:${PORT}`);
});
