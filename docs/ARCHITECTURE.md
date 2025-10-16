# Architecture

Last updated: 2025-10-16

## Overview
A real-time, browser-based multiplayer Snake with a server-authoritative model. The client renders and predicts; the server simulates and validates.

## Front-end
- Runtime: TypeScript + Next.js (App Router) with Vite-like dev speed via Next.
- Rendering: Canvas 2D for grid-based gameplay (baseline). Consider PixiJS for heavy FX.
- UI: Lightweight React/Preact components, Tailwind optional.
- Loop: Fixed-timestep logic (e.g., 10–15 Hz movement) + `requestAnimationFrame` for rendering; optional micro-tween between cells for smoothness.
- Input: Keyboard and touch (swipe or on-screen D-pad); input buffering for precise direction changes.

## Back-end
- Runtime: Node.js + TypeScript.
- Transport: WebSockets (e.g., `ws`, Socket.IO, or `uWebSockets.js`).
- Topology: Server-authoritative "Room" instances. Each room simulates at 20–30 Hz and broadcasts snapshots at 10–20 Hz.
- Determinism: Seeded RNG per room for reproducible food spawns.
- Anti-cheat: Server validates all moves and spawns; clients never author state.

## Data Flow
1. Client sends input events `{seq, dir, clientTime}`.
2. Server applies inputs on the next tick and updates authoritative state.
3. Server broadcasts `snapshot {tick, players[], food[], serverTime}`.
4. Client reconciles: rewinds to server state, reapplies unacknowledged inputs, and interpolates other players.

## Hosting/Deployment
- Edge/serverless: Cloudflare Workers + Durable Objects for per-room authority and global low latency.
  - https://developers.cloudflare.com/workers/
  - https://developers.cloudflare.com/durable-objects/
- Containers/VMs: Fly.io/Railway running Node + `uWebSockets.js`; Redis for coordination/leaderboards.
  - https://fly.io/ • https://railway.app/ • https://redis.io/
- Static assets: Any CDN (Cloudflare Pages, Netlify, Vercel). Use `Cache-Control` + versioned filenames.

## Observability
- Metrics: ticks/sec, room count, avg/max RTT, dropped messages.
- Tracing/logging: Sentry for client+server, pino logs.
  - https://sentry.io/ • https://github.com/pinojs/pino

## Security
- Rate limiting (per-IP/session), CORS restrictions, unguessable room codes.
- Optional HMAC signing of messages; replay protection via sequence IDs.

