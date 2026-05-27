# github-mock

Standalone HTTP service that renders github.com-style pages for the
SynthUX virtual internet. Independent from any OS simulator — connects
only via HTTP, like a real internet service would.

## Run

```bash
node src/server.mjs                       # 127.0.0.1:5180
GITHUB_MOCK_PORT=6180 node src/server.mjs # override port
```

## Routes

- `GET /healthz` — `{ok: true, service: 'github-mock'}`
- `GET /<owner>` — user/org page (TODO)
- `GET /<owner>/<repo>` — repo overview (file tree + README + side panel)
- `GET /<owner>/<repo>/pulls` — pull request list
- `GET /<owner>/<repo>/pull/<n>` — PR detail with diff + review bar
- `GET /<owner>/<repo>/issues` — issues list

## Wiring into the SynthUX virtual internet

The synthux virtual-internet server reverse-proxies `/web/github/*`
requests to this service. Browser apps inside the OS simulators
intercept `github.com/...` URLs at navigation time and rewrite them to
`<internet-url>/web/github/...`.
