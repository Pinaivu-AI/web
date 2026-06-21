# web

Next.js web app for Pinaivu: chat, explorer, and account settings.
Backs `chat.pinaivu.com` and `explorer.pinaivu.com`.

- **`/chat`** — chat UI. Sends requests to the coordinator (directly,
  or via the gateway), and to [`Pinaivu-AI/relayer`](https://github.com/Pinaivu-AI/relayer)
  for memory-aware sessions.
- **`/explorer`**, **`/r/[requestId]`**, **`/n/[peerId]`** — public,
  read-only views into routing receipts, proofs, and node activity,
  backed by [`Pinaivu-AI/indexer`](https://github.com/Pinaivu-AI/indexer).
- **`/login`**, **`/settings`** — Sui zkLogin (Google OAuth via Enoki),
  account and session management.

None of this app talks to the coordinator's signing key or the Sui
contracts directly — it reads from the coordinator's public API and the
indexer's read-only API. See the [architecture
overview](https://docs.pinaivu.com/architecture/overview) for how the
pieces this app talks to fit together.

## Run

```bash
cp .env.example .env.local
npm install
npm run dev
```

See `.env.example` for the full set of environment variables, including
the coordinator/gateway URL, the indexer URL, and zkLogin (Enoki)
configuration.

## Scripts

```bash
npm run dev          # dev server, port 3000
npm run build         # production build
npm run lint
npm run type-check
```
