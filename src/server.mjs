#!/usr/bin/env node
// github-mock — standalone HTTP service that renders github.com-style pages
// for the SynthUX virtual internet. Independent from any OS sim; connects
// only via HTTP, like a real service.

import http from 'node:http';
import querystring from 'node:querystring';
import { renderPage, renderRaw } from './render.mjs';
import {
  createIssue, addIssueComment,
  createPR, addPRComment, addPRReview,
} from './state.mjs';

const HOST = process.env.GITHUB_MOCK_HOST || '127.0.0.1';
const PORT = parseInt(process.env.GITHUB_MOCK_PORT || '5180', 10);

const COMMON_HEADERS = {
  'content-security-policy': 'frame-ancestors *',
  'x-frame-options': 'ALLOWALL',
  'cache-control': 'no-store',
};

function html(res, body, status = 200) {
  res.writeHead(status, { ...COMMON_HEADERS, 'content-type': 'text/html; charset=utf-8' });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(303, { ...COMMON_HEADERS, location });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseForm(raw) {
  return querystring.parse(raw);
}

function parseLabels(s) {
  if (!s) return [];
  return String(s).split(',').map((x) => x.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
}

async function handle(req, res) {
  const u = new URL(req.url, `http://${req.headers.host || HOST}`);
  const parts = u.pathname.split('/').filter(Boolean);
  const method = req.method || 'GET';

  // Health
  if (parts.length === 1 && parts[0] === 'healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'github-mock' }));
    return;
  }

  if (parts.length === 0) {
    redirect(res, '/acme/api');
    return;
  }

  const owner = parts[0];
  const repo = parts[1];

  // GET /<owner> only -> redirect to a default repo page (cheap stub).
  if (!repo) {
    return html(res, renderPage({ owner, repo: 'api', view: 'overview' }));
  }

  const action = parts[2];
  const sub = parts[3];

  // ---------- POST routes (forms) ----------
  if (method === 'POST') {
    const raw = await readBody(req);
    const form = parseForm(raw);

    // POST /<owner>/<repo>/issues -> create issue
    if (action === 'issues' && !sub) {
      const issue = createIssue(owner, repo, {
        title: String(form.title || 'Untitled issue'),
        body: String(form.body || ''),
        labels: parseLabels(form.labels),
      });
      return redirect(res, `/${owner}/${repo}/issues/${issue.num}`);
    }

    // POST /<owner>/<repo>/issues/<n>/comment
    if (action === 'issues' && sub && parts[4] === 'comment') {
      addIssueComment(owner, repo, sub, { body: String(form.body || '') });
      return redirect(res, `/${owner}/${repo}/issues/${sub}`);
    }

    // POST /<owner>/<repo>/pulls -> create PR
    if (action === 'pulls' && !sub) {
      const pr = createPR(owner, repo, {
        title: String(form.title || 'Untitled PR'),
        body: String(form.body || ''),
        base: String(form.base || 'main'),
        head: String(form.head || 'feature'),
        labels: parseLabels(form.labels),
      });
      return redirect(res, `/${owner}/${repo}/pull/${pr.num}`);
    }

    // POST /<owner>/<repo>/pull/<n>/review
    if (action === 'pull' && sub && parts[4] === 'review') {
      const act = String(form.action || 'comment');
      if (act === 'comment') {
        addPRComment(owner, repo, sub, { body: String(form.body || '') });
      } else {
        addPRReview(owner, repo, sub, { body: String(form.body || ''), action: act });
      }
      return redirect(res, `/${owner}/${repo}/pull/${sub}`);
    }

    return html(res, `<h1>405</h1><p>Unknown form action</p>`, 405);
  }

  // ---------- GET routes ----------
  // /<owner>/<repo>
  if (!action) {
    return html(res, renderPage({ owner, repo, view: 'overview' }));
  }

  // /<owner>/<repo>/pulls
  if (action === 'pulls' && !sub) {
    return html(res, renderPage({ owner, repo, view: 'pulls' }));
  }

  // /<owner>/<repo>/pull/<n>
  if (action === 'pull' && sub) {
    return html(res, renderPage({ owner, repo, view: `pr/${sub}` }));
  }

  // /<owner>/<repo>/compare/<base>...<head>  (open-PR form)
  if (action === 'compare' && sub) {
    const m = sub.match(/^(.+?)\.\.\.(.+)$/);
    const base = m ? m[1] : 'main';
    const head = m ? m[2] : sub;
    return html(res, renderPage({ owner, repo, view: 'pr-new', base, head }));
  }

  // /<owner>/<repo>/issues[/new|/<n>]
  if (action === 'issues') {
    if (!sub) {
      return html(res, renderPage({ owner, repo, view: 'issues' }));
    }
    if (sub === 'new') {
      return html(res, renderPage({ owner, repo, view: 'issue-new' }));
    }
    return html(res, renderPage({ owner, repo, view: `issue/${sub}` }));
  }

  // /<owner>/<repo>/tree/main/<path...>
  if (action === 'tree' && sub) {
    const path = parts.slice(4).join('/');
    return html(res, renderPage({ owner, repo, view: 'tree', path }));
  }

  // /<owner>/<repo>/blob/main/<path...>
  if (action === 'blob' && sub) {
    const path = parts.slice(4).join('/');
    return html(res, renderPage({ owner, repo, view: 'blob', path }));
  }

  // /<owner>/<repo>/raw/main/<path...> -> raw text
  if (action === 'raw' && sub) {
    const path = parts.slice(4).join('/');
    const txt = renderRaw(owner, repo, path);
    if (txt === null) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('404 — file not found');
    }
    res.writeHead(200, { ...COMMON_HEADERS, 'content-type': 'text/plain; charset=utf-8' });
    return res.end(txt);
  }

  if (action === 'actions') {
    return html(res, renderPage({ owner, repo, view: 'actions' }));
  }

  if (action === 'search') {
    // Just bounce back to overview for now.
    return html(res, renderPage({ owner, repo, view: 'overview' }));
  }

  // Fallback
  return html(res, renderPage({ owner, repo, view: 'overview' }));
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error('[github-mock]', err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('500 — ' + err.message);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[github-mock] http://${HOST}:${PORT}`);
});
