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

- `GET /healthz` — readiness check (`{ok: true, service: 'github-mock'}`)
- `GET /<owner>/<repo>` — repo overview (file tree + README + side panel)
- `GET /<owner>/<repo>/pulls` — pull request list
- `GET /<owner>/<repo>/pull/<n>` — PR detail with diff + review bar
- `GET /<owner>/<repo>/issues` — issues list

## Wiring into the SynthUX virtual internet

The synthux virtual-internet server reverse-proxies `/web/github/*`
requests to this service. Browser apps inside the OS simulators
intercept `github.com/...` URLs at navigation time and rewrite them to
`<internet-url>/web/github/...`, which transparently forwards here.

See [`docs/services.md`](https://github.com/JacobFV/synthux/blob/main/docs/services.md)
in the parent repo for the full layout.
