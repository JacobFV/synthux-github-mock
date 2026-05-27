// Static page renderer for github-mock. Pure ES modules — no deps beyond
// Node stdlib. Mirrors the production github.com layout closely enough for
// agents to interact with familiar selectors (.btn, .pr-item, .file-diff).

import { CSS } from './css.mjs';

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function headerHTML(owner, repo, view) {
  const counts = { pulls: 7, issues: 14 };
  const active = view === 'pulls' || view.startsWith('pr/')
    ? 'pulls' : view === 'issues' ? 'issues' : 'code';
  return `
<div class="header">
  <div class="logo">
    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    <span>GitHub</span>
  </div>
  <input class="search" placeholder="Type / to search" />
  <div class="nav">
    <a href="#">Pull requests</a>
    <a href="#">Issues</a>
    <a href="#">Marketplace</a>
    <a href="#">Explore</a>
  </div>
  <div class="right">
    <span class="hdr-icon" title="Notifications">🔔</span>
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

function overviewBody(owner, repo) {
  const files = [
    ['📁', '.github', 'ci: bump action versions',            '3 days ago'],
    ['📁', 'src',     'feat: validate checkout totals',       '2 hours ago'],
    ['📁', 'tests',   'test: cover zero-price line items',    '2 hours ago'],
    ['📁', 'docs',    'docs: refresh checkout spec',          'yesterday'],
    ['📄', '.gitignore',   'chore: ignore .vercel',           '2 weeks ago'],
    ['📄', 'LICENSE',      'Initial commit',                  '8 months ago'],
    ['📄', 'package.json', 'chore: bump deps',                '1 week ago'],
    ['📄', 'README.md',    'docs: add architecture diagram',  '4 days ago'],
  ];
  const rows = files.map(([i, n, m, t]) => `
    <div class="file-row">
      <span class="icon">${i}</span>
      <span class="name"><a href="#">${escape(n)}</a></span>
      <span class="commit-msg">${escape(m)}</span>
      <span class="time">${escape(t)}</span>
    </div>`).join('');

  return `
<div class="row">
  <div class="col-main">
    <div class="branch-bar">
      <button class="btn"><span class="icon">⌥</span> main ▾</button>
      <div class="branch-meta">
        <span class="muted">42 branches</span>
        <span class="sep-dot">·</span>
        <span class="muted">12 tags</span>
      </div>
      <div class="grow"></div>
      <button class="btn">Go to file</button>
      <button class="btn btn-primary">&lt;/&gt; Code ▾</button>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="avatar-sm grad-blue"></span>
        <a href="#" class="author">alice</a>
        <span class="muted commit-summary">feat: validate checkout totals · 2 hours ago</span>
        <span class="sha">a1b2c3d</span>
        <span class="muted commit-count">· 142 Commits</span>
      </div>
      <div class="file-tree">${rows}</div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="author">📄 README.md</span>
      </div>
      <div class="readme">
        <h2>${escape(owner)}/${escape(repo)}</h2>
        <p>Checkout, billing, and inventory backend for ACME storefront.</p>
        <h3>Quick start</h3>
        <pre>git clone git@github.com:${escape(owner)}/${escape(repo)}.git
cd ${escape(repo)}
npm install
npm run dev</pre>
        <h3>Stack</h3>
        <ul>
          <li>TypeScript · Node 20 · pnpm 9</li>
          <li>Postgres 16 (Neon) · Redis (Upstash)</li>
          <li>Vitest · Playwright · GitHub Actions</li>
        </ul>
      </div>
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

function pullsBody(owner, repo) {
  const prs = [
    [42, 'open',   'feat: validate checkout totals against zero-price items', 'alice', 'opened 2 hours ago',  ['feature'],         3],
    [41, 'open',   'fix: design v3 spacing tokens for the cart page',         'carol', 'opened yesterday',    ['bug'],             1],
    [40, 'open',   'chore: bump terraform provider to 6.7',                   'bob',   'opened 3 days ago',   ['docs'],            0],
    [38, 'open',   'perf: cache product lookups in inventory service',        'alice', 'opened 4 days ago',   ['feature'],         2],
    [35, 'open',   'docs: add architecture diagram + sequence flows',         'carol', 'opened last week',    ['docs','good-first-issue'], 0],
  ];
  const items = prs.map(([num, state, title, author, ts, labels, n_reviewers]) => {
    const labelHTML = labels.map(lab =>
      `<span class="label ${lab}">${lab.replace(/-/g, ' ')}</span>`).join('');
    const reviewerHTML = Array.from({ length: n_reviewers }).map(() =>
      `<span class="reviewer" title="reviewer"></span>`).join('');
    return `
<div class="pr-item">
  <span class="status-icon ${state === 'open' ? '' : 'closed'}">●</span>
  <div class="pr-info">
    <div class="pr-title">
      <a href="/${escape(owner)}/${escape(repo)}/pull/${num}">${escape(title)}</a>${labelHTML}
    </div>
    <div class="pr-meta">
      #${num} ${escape(ts)} by <a href="#">${escape(author)}</a>
      <span class="check-icon" title="Checks passed">✓</span>
    </div>
  </div>
  <div class="pr-actions">${reviewerHTML} <span class="muted">💬 ${n_reviewers + 1}</span></div>
</div>`;
  }).join('');

  return `
<div class="card">
  <div class="pr-toolbar">
    <span class="checkbox"></span>
    <a class="filter-chip active" href="?state=open"><b>●</b> ${prs.length} Open</a>
    <a class="filter-chip" href="?state=closed">✔ 24 Closed</a>
    <span class="grow"></span>
    <span class="filter-chip">Author ▾</span>
    <span class="filter-chip">Label ▾</span>
    <span class="filter-chip">Projects ▾</span>
    <span class="filter-chip">Reviews ▾</span>
    <span class="filter-chip">Assignee ▾</span>
    <span class="filter-chip">Sort ▾</span>
  </div>
  ${items}
</div>`;
}

function prDetailBody(owner, repo, num) {
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

  return `
<div class="pr-header">
  <h1>feat: validate checkout totals against zero-price items
    <span class="num">#${escape(num)}</span></h1>
  <div class="pr-header-meta">
    <span class="pr-state open">● Open</span>
    <span class="pr-summary">
      <b>alice</b> wants to merge <b>3 commits</b> into
      <code>main</code> from <code>feat/checkout-totals</code>
    </span>
  </div>
</div>
<div class="pr-tabs">
  <a class="tab" href="#"><span>💬</span> Conversation <span class="count">4</span></a>
  <a class="tab" href="#"><span>⏱</span> Commits <span class="count">3</span></a>
  <a class="tab" href="#"><span>✔</span> Checks <span class="count">8</span></a>
  <a class="tab active" href="#"><span>±</span> Files changed <span class="count">2</span></a>
</div>
<div class="file-diff">
  <div class="file-head">
    <span class="icon">📄</span>
    <span class="path">src/checkout.py</span>
    <span class="stats">
      <span class="add-count">+4</span>
      <span class="rem-count">-1</span>
    </span>
  </div>
  <div class="diff-body">${diffLines.join('')}</div>
</div>
<div class="file-diff">
  <div class="file-head">
    <span class="icon">📄</span>
    <span class="path">tests/test_checkout.py</span>
    <span class="stats">
      <span class="add-count">+12</span>
      <span class="rem-count">-0</span>
    </span>
  </div>
  <div class="diff-body">
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">42</span><span class="code"><span class="marker">+ </span>def test_total_skips_zero_price_items():</span></div>
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">43</span><span class="code"><span class="marker">+ </span>    items = [Item(price=10), Item(price=0), Item(price=4)]</span></div>
    <div class="diff-line add"><span class="lineno"></span><span class="lineno">44</span><span class="code"><span class="marker">+ </span>    assert total(items) == 14</span></div>
  </div>
</div>
<div class="review-bar">
  <div class="review-head">
    <strong>Review changes</strong>
    <span class="muted">·</span>
    <span class="muted">Files reviewed (0/2)</span>
  </div>
  <textarea placeholder="Leave a comment"></textarea>
  <div class="review-actions">
    <button class="btn">Comment</button>
    <button class="btn btn-primary">Approve</button>
    <button class="btn btn-danger">Request changes</button>
  </div>
</div>`;
}

function issuesBody(owner, repo) {
  const issues = [
    [128, 'open',   'Pricing miscalculation on bulk orders > 50 items',     'bob',   'opened today',         ['bug']],
    [127, 'open',   'Add Stripe webhook retry policy',                       'alice', 'opened yesterday',     ['feature']],
    [126, 'open',   'Document refund flow for partial returns',              'carol', 'opened 3 days ago',    ['docs','good-first-issue']],
    [124, 'open',   'Inventory drift between primary + analytics warehouse', 'bob',   'opened last week',     ['bug']],
  ];
  const items = issues.map(([num, state, title, author, ts, labels]) => {
    const labelHTML = labels.map(lab =>
      `<span class="label ${lab}">${lab.replace(/-/g, ' ')}</span>`).join('');
    return `
<div class="pr-item">
  <span class="status-icon">⊙</span>
  <div class="pr-info">
    <div class="pr-title"><a href="#">${escape(title)}</a>${labelHTML}</div>
    <div class="pr-meta">#${num} ${escape(ts)} by <a href="#">${escape(author)}</a></div>
  </div>
  <div class="pr-actions"><span class="muted">💬 3</span></div>
</div>`;
  }).join('');
  return `
<div class="card">
  <div class="pr-toolbar">
    <span class="checkbox"></span>
    <a class="filter-chip active"><b>⊙</b> ${issues.length} Open</a>
    <a class="filter-chip">✔ 28 Closed</a>
  </div>
  ${items}
</div>`;
}

export function renderPage({ owner, repo, view }) {
  const title = `${owner}/${repo}`;
  let pageTitle, body;
  if (view === 'pulls') {
    pageTitle = `Pull Requests · ${title}`;
    body = pullsBody(owner, repo);
  } else if (view.startsWith('pr/')) {
    const num = view.slice(3);
    pageTitle = `#${num} · ${title}`;
    body = prDetailBody(owner, repo, num);
  } else if (view === 'issues') {
    pageTitle = `Issues · ${title}`;
    body = issuesBody(owner, repo);
  } else {
    pageTitle = `${title}: ACME backend`;
    body = overviewBody(owner, repo);
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escape(pageTitle)}</title>
<style>${CSS}</style></head><body>${headerHTML(owner, repo, view)}<main>${body}</main></body></html>`;
}
