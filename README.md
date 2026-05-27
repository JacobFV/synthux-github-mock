# synthux-github-mock

Standalone HTTP service that renders github.com-style pages for the
[SynthUX](https://github.com/JacobFV/synthux) virtual internet.
Independent from any OS simulator — connects only via HTTP, like a real
internet service.

Vendored into the parent repo as
[`sim/services/github-mock`](https://github.com/JacobFV/synthux/tree/main/sim/services/github-mock).

## Run

```bash
node src/server.mjs                        # 127.0.0.1:5180
GITHUB_MOCK_PORT=6180 node src/server.mjs  # override port
GITHUB_MOCK_HOST=0.0.0.0 node src/server.mjs
```

Zero dependencies — pure Node 18+ stdlib.

## Routes

### Health
- `GET /healthz` — readiness check (`{ok: true, service: 'github-mock'}`)

### Repo browsing
- `GET /<owner>/<repo>` — overview (file tree + README + sidebar with commit/contributor stats)
- `GET /<owner>/<repo>/tree/main/<path>` — directory listing with breadcrumbs
- `GET /<owner>/<repo>/blob/main/<path>` — file viewer with regex-based syntax highlighting and line numbers
- `GET /<owner>/<repo>/raw/main/<path>` — raw file contents as `text/plain`

### Issues
- `GET /<owner>/<repo>/issues` — issue list
- `GET /<owner>/<repo>/issues/new` — new-issue form (title, markdown body, labels)
- `POST /<owner>/<repo>/issues` — create issue, 303 to `/issues/<n>`
- `GET /<owner>/<repo>/issues/<n>` — issue detail with comment composer
- `POST /<owner>/<repo>/issues/<n>/comment` — add a comment, 303 back to detail

### Pull requests
- `GET /<owner>/<repo>/pulls` — PR list
- `GET /<owner>/<repo>/compare/<base>...<head>` — open-PR form
- `POST /<owner>/<repo>/pulls` — create PR, 303 to `/pull/<n>`
- `GET /<owner>/<repo>/pull/<n>` — PR detail with Conversation timeline + diff + review bar
- `POST /<owner>/<repo>/pull/<n>/review` — submit review (`action=comment|approve|request-changes`), 303 back

### Other
- `GET /<owner>/<repo>/actions` — placeholder actions tab
- `GET /<owner>/<repo>/search?q=...` — placeholder search

## Seeded files

The in-memory store comes pre-populated with a fake repo tree clickable from the overview:

```
.github/workflows/ci.yml
docs/architecture.md
src/index.ts
src/checkout.py
tests/test_checkout.py
.gitignore
package.json
README.md
```

The syntax highlighter recognizes Python, TypeScript/JavaScript, JSON, YAML,
and Markdown — emitting `tok-keyword`, `tok-string`, `tok-comment`,
`tok-number`, and `tok-function` spans for the dark Primer-style theme.

## State

Issues, PRs, comments, and reviews live in module-level `Map`s keyed by
`${owner}/${repo}` (see `src/state.mjs`). State is seeded on first access
and lost on restart — perfect for a virtual-internet sandbox.

## Wiring into the SynthUX virtual internet

The synthux virtual-internet server reverse-proxies `/web/github/*`
requests to this service. Browser apps inside the OS simulators
intercept `github.com/...` URLs at navigation time and rewrite them to
`<internet-url>/web/github/...`, which transparently forwards here.

See [`docs/services.md`](https://github.com/JacobFV/synthux/blob/main/docs/services.md)
in the parent repo for the full layout.
