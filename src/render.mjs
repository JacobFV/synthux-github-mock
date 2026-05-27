// Static page renderer for github-mock. Pure ES modules — no deps beyond
// Node stdlib. Mirrors the production github.com layout closely enough for
// agents to interact with familiar selectors (.btn, .pr-item, .file-diff).

import { CSS } from './css.mjs';
import {
  getRepo, listTree, getFile, listFiles,
  getIssue, getPR,
} from './state.mjs';
import { highlight, langOf, extOf } from './highlight.mjs';

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fileIcon(name, type) {
  if (type === 'dir') return '📁';
  const ext = extOf(name);
  const map = {
    md: '📝', py: '🐍', ts: '📘', tsx: '📘', js: '📒', mjs: '📒',
    json: '🧾', yml: '⚙', yaml: '⚙',
  };
  return map[ext] || '📄';
}

function headerHTML(owner, repo, view) {
  const r = getRepo(owner, repo);
  const counts = { pulls: r.prs.length, issues: r.issues.length };
  const active = view === 'pulls' || view.startsWith('pr/') || view === 'pr-new'
    ? 'pulls'
    : view === 'issues' || view.startsWith('issue/') || view === 'issue-new'
      ? 'issues'
      : 'code';
  return `
<div class="header">
  <div class="logo">
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    <span>GitHub</span>
  </div>
  <form class="search-form" method="GET" action="/${escape(owner)}/${escape(repo)}/search" style="flex:1;max-width:360px">
    <input class="search" name="q" placeholder="Type / to search" autocomplete="off" />
  </form>
  <div class="nav">
    <a href="/${escape(owner)}/${escape(repo)}/pulls">Pull requests</a>
    <a href="/${escape(owner)}/${escape(repo)}/issues">Issues</a>
    <a href="#">Marketplace</a>
    <a href="#">Explore</a>
  </div>
  <div class="right">
    <span class="hdr-icon" title="Notifications">🔔</span>
    <span class="hdr-icon" title="New">+</span>
    <span class="avatar" title="profile"></span>
  </div>
</div>
<div class="repo-banner">
  <div class="repo-title">
    <span class="icon">📓</span>
    <a class="owner" href="/${escape(owner)}">${escape(owner)}</a>
    <span class="sep">/</span>
    <a class="name" href="/${escape(owner)}/${escape(repo)}">${escape(repo)}</a>
    <span class="visibility">Public</span>
  </div>
  <div class="repo-actions">
    <button class="btn">👁 Watch <span class="count-pill">23</span></button>
    <button class="btn">🍴 Fork <span class="count-pill">42</span></button>
    <button class="btn">⭐ Star <span class="count-pill">1.2k</span></button>
  </div>
</div>
<div class="subnav">
  <a class="tab ${active === 'code' ? 'active' : ''}" href="/${escape(owner)}/${escape(repo)}">&lt;/&gt; Code</a>
  <a class="tab ${active === 'pulls' ? 'active' : ''}" href="/${escape(owner)}/${escape(repo)}/pulls">↗ Pull requests <span class="count">${counts.pulls}</span></a>
  <a class="tab ${active === 'issues' ? 'active' : ''}" href="/${escape(owner)}/${escape(repo)}/issues">⊙ Issues <span class="count">${counts.issues}</span></a>
  <a class="tab" href="/${escape(owner)}/${escape(repo)}/actions">▶ Actions</a>
  <a class="tab" href="#">📁 Projects</a>
  <a class="tab" href="#">🛡 Security</a>
  <a class="tab" href="#">📊 Insights</a>
  <a class="tab" href="#">⚙ Settings</a>
</div>`;
}

function branchBar(owner, repo, prefix = '') {
  const breadcrumb = prefix
    ? renderBreadcrumb(owner, repo, prefix)
    : `<span class="muted commit-summary">main</span>`;
  return `
<div class="branch-bar">
  <button class="btn"><span class="icon">⌥</span> main ▾</button>
  ${breadcrumb}
  <div class="grow"></div>
  <a class="btn" href="/${escape(owner)}/${escape(repo)}/issues">Go to file</a>
  <a class="btn add-file-btn" href="/${escape(owner)}/${escape(repo)}/issues/new">Add file ▾</a>
  <button class="btn btn-primary">&lt;/&gt; Code ▾</button>
</div>`;
}

function renderBreadcrumb(owner, repo, path) {
  const parts = path.split('/').filter(Boolean);
  const links = [];
  links.push(`<a href="/${escape(owner)}/${escape(repo)}">${escape(repo)}</a>`);
  let acc = '';
  parts.forEach((p, i) => {
    acc = acc ? `${acc}/${p}` : p;
    const isLast = i === parts.length - 1;
    links.push(`<span class="sep">/</span>`);
    if (isLast) {
      links.push(`<span class="leaf">${escape(p)}</span>`);
    } else {
      links.push(`<a href="/${escape(owner)}/${escape(repo)}/tree/main/${escape(acc)}">${escape(p)}</a>`);
    }
  });
  return `<div class="breadcrumbs">${links.join('')}</div>`;
}

function renderFileTree(owner, repo, prefix = '') {
  const entries = listTree(owner, repo, prefix);
  const commitMsgs = {
    '.github': ['ci: bump action versions', '3 days ago'],
    'src':     ['feat: validate checkout totals', '2 hours ago'],
    'tests':   ['test: cover zero-price line items', '2 hours ago'],
    'docs':    ['docs: refresh checkout spec', 'yesterday'],
    'README.md':    ['docs: add architecture diagram', '4 days ago'],
    'package.json': ['chore: bump deps', '1 week ago'],
    '.gitignore':   ['chore: ignore .vercel', '2 weeks ago'],
  };
  const rows = entries.map((e) => {
    const meta = commitMsgs[e.name] || ['update file', 'a while ago'];
    const href = e.type === 'dir'
      ? `/${escape(owner)}/${escape(repo)}/tree/main/${escape(e.path)}`
      : `/${escape(owner)}/${escape(repo)}/blob/main/${escape(e.path)}`;
    return `
    <div class="file-row">
      <span class="icon">${fileIcon(e.name, e.type)}</span>
      <span class="name"><a href="${href}">${escape(e.name)}</a></span>
      <span class="commit-msg">${escape(meta[0])}</span>
      <span class="time">${escape(meta[1])}</span>
    </div>`;
  }).join('');
  return `<div class="file-tree">${rows}</div>`;
}

function renderReadmeMarkdown(source) {
  // Minimal markdown rendering: headers, code fences, lists, paragraphs.
  const lines = source.split('\n');
  let out = '';
  let inCode = false;
  let codeBuf = [];
  let listOpen = false;
  let paraBuf = [];
  const flushPara = () => {
    if (paraBuf.length) {
      out += `<p>${escape(paraBuf.join(' '))}</p>`;
      paraBuf = [];
    }
  };
  const closeList = () => { if (listOpen) { out += '</ul>'; listOpen = false; } };

  for (const raw of lines) {
    if (inCode) {
      if (raw.startsWith('```')) {
        out += `<pre>${escape(codeBuf.join('\n'))}</pre>`;
        codeBuf = [];
        inCode = false;
      } else {
        codeBuf.push(raw);
      }
      continue;
    }
    if (raw.startsWith('```')) { flushPara(); closeList(); inCode = true; continue; }
    if (/^#{1,6}\s/.test(raw)) {
      flushPara(); closeList();
      const lvl = raw.match(/^#+/)[0].length;
      const text = raw.replace(/^#+\s*/, '');
      out += `<h${lvl}>${escape(text)}</h${lvl}>`;
      continue;
    }
    if (/^\s*[-*]\s/.test(raw)) {
      flushPara();
      if (!listOpen) { out += '<ul>'; listOpen = true; }
      out += `<li>${escape(raw.replace(/^\s*[-*]\s+/, ''))}</li>`;
      continue;
    }
    if (raw.trim() === '') {
      flushPara(); closeList();
      continue;
    }
    paraBuf.push(raw);
  }
  flushPara();
  closeList();
  return out;
}

function overviewBody(owner, repo) {
  const r = getRepo(owner, repo);
  const readmeSrc = getFile(owner, repo, 'README.md') || '';
  return `
<div class="row">
  <div class="col-main">
    ${branchBar(owner, repo)}
    <div class="card">
      <div class="card-header">
        <span class="avatar-sm grad-blue"></span>
        <a href="#" class="author">alice</a>
        <span class="muted commit-summary">feat: validate checkout totals · 2 hours ago</span>
        <span class="sha">a1b2c3d</span>
        <span class="muted commit-count">· ${r.commitsTotal} Commits</span>
      </div>
      ${renderFileTree(owner, repo, '')}
    </div>
    <div class="card">
      <div class="card-header">
        <span class="author">📄 README.md</span>
      </div>
      <div class="md-view">${renderReadmeMarkdown(readmeSrc)}</div>
    </div>
  </div>
  <div class="col-side">
    <div class="side-card">
      <div class="title">About <a href="#" class="gear">⚙</a></div>
      <div class="body">
        <p class="lead">Checkout, billing, and inventory backend for ACME storefront.</p>
        <ul class="side-meta">
          <li>🔗 <a href="#">acme.dev/api</a></li>
          <li>📖 Readme</li>
          <li>⚖ MIT license</li>
          <li>🛡 Security policy</li>
          <li>📊 Activity</li>
          <li>📌 <a href="#">${r.commitsTotal} commits</a></li>
          <li>🌿 <a href="#">${r.branchesTotal} branches</a></li>
          <li>🏷 <a href="#">${r.tagsTotal} tags</a></li>
        </ul>
      </div>
      <div class="topics">
        <a class="topic-pill" href="#">typescript</a>
        <a class="topic-pill" href="#">stripe</a>
        <a class="topic-pill" href="#">postgres</a>
        <a class="topic-pill" href="#">ecommerce</a>
      </div>
    </div>
    <div class="side-card">
      <div class="title">Releases <a class="muted">12</a></div>
      <div class="body">
        <div class="release-row">
          <span class="dot-green"></span>
          <a href="#" class="bold">v3.0.1</a>
          <span class="label feature">Latest</span>
        </div>
        <p class="muted">3 days ago</p>
        <a href="#" class="muted">+ 11 releases</a>
      </div>
    </div>
    <div class="side-card">
      <div class="title">Packages</div>
      <div class="body"><p class="muted">No packages published</p></div>
    </div>
    <div class="side-card">
      <div class="title">Contributors <a class="muted">8</a></div>
      <div class="body">
        <div class="contributors">
          <span class="avatar-sm grad-blue"></span>
          <span class="avatar-sm grad-pink"></span>
          <span class="avatar-sm grad-orange"></span>
          <span class="avatar-sm grad-green"></span>
          <span class="avatar-sm grad-violet"></span>
          <span class="muted">+ 3</span>
        </div>
      </div>
    </div>
    <div class="side-card">
      <div class="title">Languages</div>
      <div class="lang-bar">
        <div style="width:62%;background:#3178c6"></div>
        <div style="width:24%;background:#f1e05a"></div>
        <div style="width:10%;background:#e34c26"></div>
        <div style="width:4%;background:#563d7c"></div>
      </div>
      <ul class="lang-list">
        <li><span class="dot" style="background:#3178c6"></span> TypeScript <span class="muted">62.0%</span></li>
        <li><span class="dot" style="background:#f1e05a"></span> JavaScript <span class="muted">24.0%</span></li>
        <li><span class="dot" style="background:#e34c26"></span> HTML <span class="muted">10.0%</span></li>
        <li><span class="dot" style="background:#563d7c"></span> CSS <span class="muted">4.0%</span></li>
      </ul>
    </div>
  </div>
</div>`;
}

function treeBody(owner, repo, path) {
  return `
<div class="col-main" style="width:100%">
  ${branchBar(owner, repo, path)}
  <div class="card">
    <div class="card-header">
      <span class="avatar-sm grad-blue"></span>
      <a href="#" class="author">alice</a>
      <span class="muted commit-summary">latest commit · 2 hours ago</span>
      <span class="sha">a1b2c3d</span>
    </div>
    ${renderFileTree(owner, repo, path)}
  </div>
</div>`;
}

function fileViewBody(owner, repo, path) {
  const src = getFile(owner, repo, path);
  if (src === null) {
    return `<div class="form-card"><h2>404 — file not found</h2><p>${escape(path)}</p>
      <p><a href="/${escape(owner)}/${escape(repo)}">← back to repo</a></p></div>`;
  }
  const lang = langOf(path);
  const lines = src.split('\n');
  const isMd = lang === 'md';
  let body;
  if (isMd) {
    body = `<div class="md-view">${renderReadmeMarkdown(src)}</div>`;
  } else {
    const highlighted = highlight(src, path);
    const rows = highlighted.map((html, i) => `
      <tr><td class="ln">${i + 1}</td><td class="src">${html || '&nbsp;'}</td></tr>`).join('');
    body = `<table class="code-table">${rows}</table>`;
  }
  const sizeStr = `${lines.length} lines · ${src.length} chars`;
  return `
<div class="col-main" style="width:100%">
  ${branchBar(owner, repo, path)}
  <div class="file-view">
    <div class="file-view-head">
      <span>${fileIcon(path.split('/').pop(), 'file')}</span>
      <span class="path">${escape(path)}</span>
      <span class="meta">${escape(sizeStr)}</span>
      <div class="actions">
        <a class="btn" href="/${escape(owner)}/${escape(repo)}/raw/main/${escape(path)}">Raw</a>
        <button class="btn">Blame</button>
        <button class="btn">History</button>
      </div>
    </div>
    ${body}
  </div>
</div>`;
}

function pullsBody(owner, repo) {
  const r = getRepo(owner, repo);
  const open = r.prs.filter((p) => p.state === 'open' || p.state === 'approved' || p.state === 'changes-requested');
  const closed = r.prs.filter((p) => p.state === 'closed' || p.state === 'merged');
  const items = open.map((pr) => {
    const labelHTML = pr.labels.map((lab) =>
      `<span class="label ${lab}">${escape(lab.replace(/-/g, ' '))}</span>`).join('');
    const reviewerHTML = Array.from({ length: pr.reviewers }).map(() =>
      `<span class="reviewer" title="reviewer"></span>`).join('');
    return `
<div class="pr-item">
  <span class="status-icon ${pr.state === 'open' ? '' : 'closed'}">●</span>
  <div class="pr-info">
    <div class="pr-title">
      <a href="/${escape(owner)}/${escape(repo)}/pull/${pr.num}">${escape(pr.title)}</a>${labelHTML}
    </div>
    <div class="pr-meta">
      #${pr.num} ${escape(pr.ts)} by <a href="#">${escape(pr.author)}</a>
      <span class="check-icon" title="Checks passed">✓</span>
    </div>
  </div>
  <div class="pr-actions">${reviewerHTML} <span class="muted">💬 ${pr.comments.length}</span></div>
</div>`;
  }).join('');

  return `
<div style="display:flex;justify-content:flex-end;margin-bottom:12px">
  <a class="btn btn-primary" href="/${escape(owner)}/${escape(repo)}/compare/main...feature">New pull request</a>
</div>
<div class="card">
  <div class="pr-toolbar">
    <span class="checkbox"></span>
    <a class="filter-chip active" href="?state=open"><b>●</b> ${open.length} Open</a>
    <a class="filter-chip" href="?state=closed">✔ ${closed.length} Closed</a>
    <span class="grow"></span>
    <span class="filter-chip">Author ▾</span>
    <span class="filter-chip">Label ▾</span>
    <span class="filter-chip">Projects ▾</span>
    <span class="filter-chip">Reviews ▾</span>
    <span class="filter-chip">Assignee ▾</span>
    <span class="filter-chip">Sort ▾</span>
  </div>
  ${items || '<div class="pr-item"><span class="muted">No open pull requests.</span></div>'}
</div>`;
}

function renderSidebar() {
  return `
<div class="col-side">
  <div class="side-section">
    <div class="title">Assignees <span class="gear">⚙</span></div>
    <div class="empty">No one assigned</div>
  </div>
  <div class="side-section">
    <div class="title">Labels <span class="gear">⚙</span></div>
    <div class="empty">None yet</div>
  </div>
  <div class="side-section">
    <div class="title">Projects <span class="gear">⚙</span></div>
    <div class="empty">None yet</div>
  </div>
  <div class="side-section">
    <div class="title">Milestone <span class="gear">⚙</span></div>
    <div class="empty">No milestone</div>
  </div>
  <div class="side-section">
    <div class="title">Development <span class="gear">⚙</span></div>
    <div class="empty">No branches or pull requests</div>
  </div>
  <div class="side-section">
    <div class="title">Notifications</div>
    <div class="empty"><button class="btn">🔔 Subscribe</button></div>
  </div>
</div>`;
}

function renderComment(c) {
  return `
<div class="comment">
  <div class="head">
    <span class="avatar-sm grad-pink"></span>
    <span class="author">${escape(c.author)}</span>
    <span class="muted">commented ${escape(c.ts)}</span>
  </div>
  <div class="body">${escape(c.body || '')}</div>
</div>`;
}

function prDetailBody(owner, repo, num) {
  const pr = getPR(owner, repo, num);
  if (!pr) {
    return `<div class="form-card"><h2>404 — PR not found</h2><p><a href="/${escape(owner)}/${escape(repo)}/pulls">← pull requests</a></p></div>`;
  }
  const stateLabel = pr.state === 'merged'
    ? 'Merged'
    : pr.state === 'closed'
      ? 'Closed'
      : pr.state === 'approved'
        ? 'Approved'
        : pr.state === 'changes-requested'
          ? 'Changes requested'
          : 'Open';
  const stateClass = pr.state === 'merged' ? 'merged' : pr.state === 'closed' ? 'closed' : 'open';

  // Diff (synthetic for PR #42; minimal for others).
  let diffsHTML = '';
  if (pr.num === 42) {
    const diff_old = 'def total(items):\n    return sum(i.price for i in items)';
    const diff_new = ('def total(items):\n'
      + '    # Reject zero-price line items so the cart total can\'t be\n'
      + '    # gamed by an empty/free coupon flow.\n'
      + '    return sum(i.price for i in items if i.price > 0)');
    let nOld = 12, nNew = 12;
    const diffLines = [];
    for (const line of diff_old.split('\n')) {
      diffLines.push(`<div class="diff-line rem"><span class="lineno">${nOld}</span><span class="lineno"></span><span class="code"><span class="marker">- </span>${escape(line)}</span></div>`);
      nOld++;
    }
    for (const line of diff_new.split('\n')) {
      diffLines.push(`<div class="diff-line add"><span class="lineno"></span><span class="lineno">${nNew}</span><span class="code"><span class="marker">+ </span>${escape(line)}</span></div>`);
      nNew++;
    }
    diffsHTML = `
<div class="file-diff">
  <div class="file-head">
    <span class="icon">📄</span>
    <a class="path" href="/${escape(owner)}/${escape(repo)}/blob/main/src/checkout.py">src/checkout.py</a>
    <span class="stats"><span class="add-count">+4</span><span class="rem-count">-1</span></span>
  </div>
  <div class="diff-body">${diffLines.join('')}</div>
</div>
<div class="file-diff">
  <div class="file-head">
    <span class="icon">📄</span>
    <a class="path" href="/${escape(owner)}/${escape(repo)}/blob/main/tests/test_checkout.py">tests/test_checkout.py</a>
    <span class="stats"><span class="add-count">+12</span><span class="rem-count">-0</span></span>
  </div>
  <div class="diff-body">
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">42</span><span class="code"><span class="marker">+ </span>def test_total_skips_zero_price_items():</span></div>
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">43</span><span class="code"><span class="marker">+ </span>    items = [Item(price=10), Item(price=0), Item(price=4)]</span></div>
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">44</span><span class="code"><span class="marker">+ </span>    assert total(items) == 14</span></div>
  </div>
</div>`;
  } else {
    diffsHTML = `<div class="file-diff"><div class="file-head"><span class="icon">📄</span><span class="path muted">No diff preview available for this PR.</span></div></div>`;
  }

  const timeline = `
<div class="timeline">
  <div class="timeline-event"><span class="dot green"></span><b>${escape(pr.author)}</b> opened this pull request · ${escape(pr.ts)}</div>
  ${pr.comments.map(renderComment).join('')}
  ${pr.reviews.map((rv) => `
    <div class="timeline-event"><span class="dot ${rv.action === 'approve' ? 'green' : rv.action === 'request-changes' ? 'red' : 'blue'}"></span>
      <b>${escape(rv.author)}</b> ${escape(rv.action === 'approve' ? 'approved' : rv.action === 'request-changes' ? 'requested changes on' : 'commented on')} this pull request · ${escape(rv.ts)}
    </div>
    ${rv.body ? renderComment({ author: rv.author, body: rv.body, ts: rv.ts }) : ''}
  `).join('')}
  <div class="timeline-event"><span class="dot blue"></span>CI · all ${pr.checks} checks passed</div>
</div>`;

  return `
<div class="pr-header">
  <h1>${escape(pr.title)}
    <span class="num">#${pr.num}</span></h1>
  <div class="pr-header-meta">
    <span class="pr-state ${stateClass}">● ${escape(stateLabel)}</span>
    <span class="pr-summary">
      <b>${escape(pr.author)}</b> wants to merge <b>${pr.commits} commits</b> into
      <code>${escape(pr.base)}</code> from <code>${escape(pr.head)}</code>
    </span>
  </div>
</div>
<div class="pr-tabs">
  <a class="tab active" href="/${escape(owner)}/${escape(repo)}/pull/${pr.num}"><span>💬</span> Conversation <span class="count">${pr.comments.length + pr.reviews.length}</span></a>
  <a class="tab" href="#"><span>⏱</span> Commits <span class="count">${pr.commits}</span></a>
  <a class="tab" href="#"><span>✔</span> Checks <span class="count">${pr.checks}</span></a>
  <a class="tab" href="#"><span>±</span> Files changed <span class="count">2</span></a>
</div>
<div class="row">
  <div class="col-main">
    ${timeline}
    ${diffsHTML}
    <div class="review-bar">
      <div class="review-head">
        <strong>Review changes</strong>
        <span class="muted">·</span>
        <span class="muted">Files reviewed (0/2)</span>
      </div>
      <form method="POST" action="/${escape(owner)}/${escape(repo)}/pull/${pr.num}/review">
        <textarea name="body" placeholder="Leave a comment"></textarea>
        <div class="review-actions">
          <button class="btn" name="action" value="comment">Comment</button>
          <button class="btn btn-primary" name="action" value="approve">Approve</button>
          <button class="btn btn-danger" name="action" value="request-changes">Request changes</button>
        </div>
      </form>
    </div>
  </div>
  ${renderSidebar()}
</div>`;
}

function issuesBody(owner, repo) {
  const r = getRepo(owner, repo);
  const open = r.issues.filter((i) => i.state === 'open');
  const closed = r.issues.filter((i) => i.state === 'closed');
  const items = open.map((iss) => {
    const labelHTML = iss.labels.map((lab) =>
      `<span class="label ${lab}">${escape(lab.replace(/-/g, ' '))}</span>`).join('');
    return `
<div class="pr-item">
  <span class="status-icon">⊙</span>
  <div class="pr-info">
    <div class="pr-title"><a href="/${escape(owner)}/${escape(repo)}/issues/${iss.num}">${escape(iss.title)}</a>${labelHTML}</div>
    <div class="pr-meta">#${iss.num} ${escape(iss.ts)} by <a href="#">${escape(iss.author)}</a></div>
  </div>
  <div class="pr-actions"><span class="muted">💬 ${iss.comments.length}</span></div>
</div>`;
  }).join('');
  return `
<div style="display:flex;justify-content:flex-end;margin-bottom:12px">
  <a class="btn btn-primary" href="/${escape(owner)}/${escape(repo)}/issues/new">New issue</a>
</div>
<div class="card">
  <div class="pr-toolbar">
    <span class="checkbox"></span>
    <a class="filter-chip active"><b>⊙</b> ${open.length} Open</a>
    <a class="filter-chip">✔ ${closed.length} Closed</a>
    <span class="grow"></span>
    <span class="filter-chip">Author ▾</span>
    <span class="filter-chip">Label ▾</span>
    <span class="filter-chip">Assignee ▾</span>
    <span class="filter-chip">Sort ▾</span>
  </div>
  ${items || '<div class="pr-item"><span class="muted">No open issues.</span></div>'}
</div>`;
}

function issueNewBody(owner, repo) {
  return `
<div class="row">
  <div class="col-main">
    <form class="form-card" method="POST" action="/${escape(owner)}/${escape(repo)}/issues">
      <h2>Open a new issue</h2>
      <div class="form-row">
        <label for="title">Title</label>
        <input id="title" type="text" name="title" placeholder="Title" required />
      </div>
      <div class="form-row">
        <label for="body">Leave a comment</label>
        <textarea id="body" name="body" placeholder="Describe the issue (markdown supported)"></textarea>
        <div class="hint">Markdown supported. Drag &amp; drop to attach files.</div>
      </div>
      <div class="form-row">
        <label for="labels">Labels (comma-separated)</label>
        <input id="labels" type="text" name="labels" placeholder="bug, feature, docs, good-first-issue" />
      </div>
      <div class="form-actions">
        <a class="btn" href="/${escape(owner)}/${escape(repo)}/issues">Cancel</a>
        <button class="btn btn-primary" type="submit">Submit new issue</button>
      </div>
    </form>
  </div>
  ${renderSidebar()}
</div>`;
}

function issueDetailBody(owner, repo, num) {
  const iss = getIssue(owner, repo, num);
  if (!iss) {
    return `<div class="form-card"><h2>404 — issue not found</h2><p><a href="/${escape(owner)}/${escape(repo)}/issues">← issues</a></p></div>`;
  }
  const labelHTML = iss.labels.map((lab) =>
    `<span class="label ${lab}">${escape(lab.replace(/-/g, ' '))}</span>`).join(' ');
  return `
<div class="pr-header">
  <h1>${escape(iss.title)} <span class="num">#${iss.num}</span></h1>
  <div class="pr-header-meta">
    <span class="pr-state open">⊙ ${escape(iss.state === 'open' ? 'Open' : 'Closed')}</span>
    <span class="pr-summary"><b>${escape(iss.author)}</b> opened this issue · ${escape(iss.ts)} · ${iss.comments.length} comments</span>
    ${labelHTML}
  </div>
</div>
<div class="row">
  <div class="col-main">
    ${renderComment({ author: iss.author, body: iss.body, ts: iss.ts })}
    <div class="timeline">
      ${iss.comments.map(renderComment).join('')}
    </div>
    <div class="review-bar">
      <div class="review-head"><strong>Add a comment</strong></div>
      <form method="POST" action="/${escape(owner)}/${escape(repo)}/issues/${iss.num}/comment">
        <textarea name="body" placeholder="Leave a comment"></textarea>
        <div class="review-actions">
          <button class="btn" name="close" value="1">Close issue</button>
          <button class="btn btn-primary" type="submit">Comment</button>
        </div>
      </form>
    </div>
  </div>
  ${renderSidebar()}
</div>`;
}

function compareBody(owner, repo, base, head) {
  return `
<div class="row">
  <div class="col-main">
    <div class="pr-header">
      <h1>Open a pull request</h1>
      <div class="pr-header-meta">
        <span class="pr-summary">
          base: <code>${escape(base)}</code> ← compare: <code>${escape(head)}</code>
        </span>
      </div>
    </div>
    <form class="form-card" method="POST" action="/${escape(owner)}/${escape(repo)}/pulls">
      <input type="hidden" name="base" value="${escape(base)}" />
      <input type="hidden" name="head" value="${escape(head)}" />
      <div class="form-row">
        <label for="title">Title</label>
        <input id="title" type="text" name="title" placeholder="Title" required />
      </div>
      <div class="form-row">
        <label for="body">Description</label>
        <textarea id="body" name="body" placeholder="Add a description (markdown supported)"></textarea>
      </div>
      <div class="form-row">
        <label for="labels">Labels (comma-separated)</label>
        <input id="labels" type="text" name="labels" placeholder="feature, bug, docs" />
      </div>
      <div class="form-actions">
        <a class="btn" href="/${escape(owner)}/${escape(repo)}/pulls">Cancel</a>
        <button class="btn btn-primary" type="submit">Create pull request</button>
      </div>
    </form>
  </div>
  ${renderSidebar()}
</div>`;
}

export function renderPage(opts) {
  const { owner, repo, view } = opts;
  const title = `${owner}/${repo}`;
  let pageTitle, body;
  if (view === 'pulls') {
    pageTitle = `Pull Requests · ${title}`;
    body = pullsBody(owner, repo);
  } else if (view.startsWith('pr/')) {
    const num = view.slice(3);
    const pr = getPR(owner, repo, num);
    pageTitle = pr ? `${pr.title} · #${num} · ${title}` : `#${num} · ${title}`;
    body = prDetailBody(owner, repo, num);
  } else if (view === 'pr-new') {
    pageTitle = `Open a pull request · ${title}`;
    body = compareBody(owner, repo, opts.base || 'main', opts.head || 'feature');
  } else if (view === 'issues') {
    pageTitle = `Issues · ${title}`;
    body = issuesBody(owner, repo);
  } else if (view === 'issue-new') {
    pageTitle = `New issue · ${title}`;
    body = issueNewBody(owner, repo);
  } else if (view.startsWith('issue/')) {
    const num = view.slice('issue/'.length);
    const iss = getIssue(owner, repo, num);
    pageTitle = iss ? `${iss.title} · #${num} · ${title}` : `#${num} · ${title}`;
    body = issueDetailBody(owner, repo, num);
  } else if (view === 'tree') {
    pageTitle = `${opts.path || ''} · ${title}`;
    body = treeBody(owner, repo, opts.path || '');
  } else if (view === 'blob') {
    pageTitle = `${opts.path} · ${title}`;
    body = fileViewBody(owner, repo, opts.path);
  } else {
    pageTitle = `${title}: ACME backend`;
    body = overviewBody(owner, repo);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escape(pageTitle)}</title>
<style>${CSS}</style></head><body>${headerHTML(owner, repo, view)}<main>${body}</main></body></html>`;
}

export function renderRaw(owner, repo, path) {
  return getFile(owner, repo, path);
}
