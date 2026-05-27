// In-memory state store for github-mock. Keyed by `${owner}/${repo}`.
// Seeded on first access so pages are populated out of the box.

const stores = new Map();

const SEED_FILES = {
  'README.md': `# acme/api

Checkout, billing, and inventory backend for the ACME storefront.

## Quick start

\`\`\`bash
git clone git@github.com:acme/api.git
cd api
npm install
npm run dev
\`\`\`

## Stack

- TypeScript, Node 20, pnpm 9
- Postgres 16 (Neon), Redis (Upstash)
- Vitest, Playwright, GitHub Actions

See [docs/architecture.md](docs/architecture.md) for the high-level design.
`,
  'package.json': `{
  "name": "@acme/api",
  "version": "3.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p .",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "fastify": "^4.27.0",
    "pg": "^8.12.0",
    "stripe": "^16.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "tsx": "^4.16.0"
  }
}
`,
  '.gitignore': `node_modules
dist
.env
.env.local
coverage
*.log
.vercel
`,
  'src/index.ts': `import Fastify from 'fastify';
import { checkoutRoutes } from './checkout.js';

// Bootstrap the ACME API server.
const app = Fastify({ logger: true });

app.register(checkoutRoutes, { prefix: '/v1/checkout' });

const port = Number(process.env.PORT ?? 3000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(\`api listening on \${port}\`);
});
`,
  'src/checkout.py': `"""Checkout helpers for the ACME storefront API.

These functions intentionally reject malformed cart payloads early so the
billing service never sees an inconsistent total.
"""

from dataclasses import dataclass


@dataclass
class Item:
    sku: str
    price: float
    qty: int = 1


def total(items):
    # Reject zero-price line items so the cart total can't be
    # gamed by an empty/free coupon flow.
    return sum(i.price * i.qty for i in items if i.price > 0)


def is_valid_cart(items):
    if not items:
        return False
    return all(i.qty >= 1 and i.price >= 0 for i in items)
`,
  'tests/test_checkout.py': `import pytest
from src.checkout import Item, total, is_valid_cart


def test_total_skips_zero_price_items():
    items = [Item(sku="A", price=10), Item(sku="B", price=0), Item(sku="C", price=4)]
    assert total(items) == 14


def test_total_respects_quantity():
    items = [Item(sku="A", price=10, qty=3)]
    assert total(items) == 30


def test_empty_cart_is_invalid():
    assert is_valid_cart([]) is False
`,
  '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
`,
  'docs/architecture.md': `# Architecture

The ACME API is a Fastify application with three logical services:

1. **Checkout** — validates carts and computes totals.
2. **Billing** — talks to Stripe and records transactions.
3. **Inventory** — reserves stock and reconciles drift.

\`\`\`
client -> api -> checkout -> billing -> stripe
                          \\-> inventory -> postgres
\`\`\`

All cross-service calls are HTTP, so each piece can scale independently.
`,
};

function seedRepo(key) {
  return {
    files: { ...SEED_FILES },
    issues: [
      {
        num: 128,
        state: 'open',
        title: 'Pricing miscalculation on bulk orders > 50 items',
        body: 'When carts grow past 50 items the totals diverge from the reference calculator by a few cents.',
        author: 'bob',
        labels: ['bug'],
        ts: 'opened today',
        comments: [
          { author: 'alice', body: 'Repro confirmed on staging — looks like a rounding loop.', ts: '1 hour ago' },
        ],
      },
      {
        num: 127,
        state: 'open',
        title: 'Add Stripe webhook retry policy',
        body: 'We currently swallow 5xx responses from Stripe. We should retry with exponential backoff.',
        author: 'alice',
        labels: ['feature'],
        ts: 'opened yesterday',
        comments: [],
      },
      {
        num: 126,
        state: 'open',
        title: 'Document refund flow for partial returns',
        body: 'Support keeps asking how partial refunds work. Let’s write it down.',
        author: 'carol',
        labels: ['docs', 'good-first-issue'],
        ts: 'opened 3 days ago',
        comments: [],
      },
      {
        num: 124,
        state: 'open',
        title: 'Inventory drift between primary + analytics warehouse',
        body: 'Counts diverge by ~0.3% per day. Probably a missing reconciliation job.',
        author: 'bob',
        labels: ['bug'],
        ts: 'opened last week',
        comments: [],
      },
    ],
    prs: [
      {
        num: 42,
        state: 'open',
        title: 'feat: validate checkout totals against zero-price items',
        body: 'Reject zero-price line items so coupons can\'t zero out the cart.',
        author: 'alice',
        base: 'main',
        head: 'feat/checkout-totals',
        labels: ['feature'],
        ts: 'opened 2 hours ago',
        reviewers: 3,
        comments: [
          { author: 'bob', body: 'Looks good — can we add a test for negative prices too?', ts: '1 hour ago' },
        ],
        reviews: [],
        commits: 3,
        checks: 8,
      },
      {
        num: 41,
        state: 'open',
        title: 'fix: design v3 spacing tokens for the cart page',
        body: 'Adjusts spacing tokens to match the v3 design system.',
        author: 'carol',
        base: 'main',
        head: 'fix/cart-spacing',
        labels: ['bug'],
        ts: 'opened yesterday',
        reviewers: 1,
        comments: [],
        reviews: [],
        commits: 1,
        checks: 6,
      },
      {
        num: 40,
        state: 'open',
        title: 'chore: bump terraform provider to 6.7',
        body: 'Routine bump.',
        author: 'bob',
        base: 'main',
        head: 'chore/tf-6.7',
        labels: ['docs'],
        ts: 'opened 3 days ago',
        reviewers: 0,
        comments: [],
        reviews: [],
        commits: 1,
        checks: 4,
      },
      {
        num: 38,
        state: 'open',
        title: 'perf: cache product lookups in inventory service',
        body: 'Adds an LRU cache in front of the product table.',
        author: 'alice',
        base: 'main',
        head: 'perf/product-cache',
        labels: ['feature'],
        ts: 'opened 4 days ago',
        reviewers: 2,
        comments: [],
        reviews: [],
        commits: 2,
        checks: 8,
      },
      {
        num: 35,
        state: 'open',
        title: 'docs: add architecture diagram + sequence flows',
        body: 'Adds the missing architecture diagram referenced in onboarding.',
        author: 'carol',
        base: 'main',
        head: 'docs/architecture',
        labels: ['docs', 'good-first-issue'],
        ts: 'opened last week',
        reviewers: 0,
        comments: [],
        reviews: [],
        commits: 1,
        checks: 3,
      },
    ],
    nextIssueNum: 200,
    nextPrNum: 100,
    commitsTotal: 142,
    branchesTotal: 42,
    tagsTotal: 12,
  };
}

export function getRepo(owner, repo) {
  const key = `${owner}/${repo}`;
  if (!stores.has(key)) stores.set(key, seedRepo(key));
  return stores.get(key);
}

export function listFiles(owner, repo) {
  return Object.keys(getRepo(owner, repo).files).sort();
}

export function getFile(owner, repo, path) {
  return getRepo(owner, repo).files[path] ?? null;
}

// Group files into a directory listing for the given prefix ('' = root).
export function listTree(owner, repo, prefix) {
  const all = listFiles(owner, repo);
  const norm = prefix ? (prefix.endsWith('/') ? prefix : prefix + '/') : '';
  const dirs = new Set();
  const files = [];
  for (const p of all) {
    if (norm && !p.startsWith(norm)) continue;
    const rest = p.slice(norm.length);
    if (!rest) continue;
    const slash = rest.indexOf('/');
    if (slash === -1) {
      files.push({ name: rest, path: p, type: 'file' });
    } else {
      dirs.add(rest.slice(0, slash));
    }
  }
  const dirEntries = [...dirs].sort().map((d) => ({
    name: d,
    path: (norm + d).replace(/^\//, ''),
    type: 'dir',
  }));
  return [...dirEntries, ...files.sort((a, b) => a.name.localeCompare(b.name))];
}

export function createIssue(owner, repo, { title, body, labels = [], author = 'you' }) {
  const r = getRepo(owner, repo);
  const num = r.nextIssueNum++;
  const issue = {
    num,
    state: 'open',
    title,
    body,
    author,
    labels,
    ts: 'opened just now',
    comments: [],
  };
  r.issues.unshift(issue);
  return issue;
}

export function getIssue(owner, repo, num) {
  return getRepo(owner, repo).issues.find((i) => i.num === Number(num)) || null;
}

export function addIssueComment(owner, repo, num, { author = 'you', body }) {
  const issue = getIssue(owner, repo, num);
  if (!issue) return null;
  issue.comments.push({ author, body, ts: 'just now' });
  return issue;
}

export function createPR(owner, repo, { title, body, base = 'main', head = 'feature', author = 'you', labels = [] }) {
  const r = getRepo(owner, repo);
  const num = r.nextPrNum++;
  const pr = {
    num,
    state: 'open',
    title,
    body,
    author,
    base,
    head,
    labels,
    ts: 'opened just now',
    reviewers: 0,
    comments: [],
    reviews: [],
    commits: 1,
    checks: 0,
  };
  r.prs.unshift(pr);
  return pr;
}

export function getPR(owner, repo, num) {
  return getRepo(owner, repo).prs.find((p) => p.num === Number(num)) || null;
}

export function addPRComment(owner, repo, num, { author = 'you', body }) {
  const pr = getPR(owner, repo, num);
  if (!pr) return null;
  pr.comments.push({ author, body, ts: 'just now' });
  return pr;
}

export function addPRReview(owner, repo, num, { author = 'you', body, action }) {
  const pr = getPR(owner, repo, num);
  if (!pr) return null;
  const review = { author, body, action, ts: 'just now' };
  pr.reviews.push(review);
  if (action === 'approve') pr.state = 'approved';
  if (action === 'request-changes') pr.state = 'changes-requested';
  return pr;
}
