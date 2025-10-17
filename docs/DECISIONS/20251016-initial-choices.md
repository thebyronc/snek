# ADR: Initial Tech Choices

Date: 2025-10-16
Status: accepted

## Context
We need a simple, performant baseline for a real-time browser Snake game that can evolve into multiplayer with low latency and scale.

## Decision
- Rendering: Canvas 2D for gameplay, GSAP for UI polish. PixiJS reserved as upgrade path if particle effects or sprite counts grow.
- Frontend Stack: TypeScript + Next.js. Fixed-step logic loop with `requestAnimationFrame` rendering.
- Multiplayer Transport: WebSockets (start with `ws`/Socket.IO). JSON first; evaluate MessagePack later.
- Server Model: Server-authoritative rooms with deterministic logic and seeded RNG.
- Hosting: Start with containerized Node on Fly.io or Railway; evaluate Cloudflare Workers + Durable Objects for global scaling.
- Observability: Sentry for errors; basic metrics for ticks/sec, RTT, dropped messages.

## Consequences
- Keeping gameplay deterministic simplifies reconciliation and reduces cheating.
- Canvas 2D is sufficient for grid-based visuals and keeps complexity low.
- Starting with JSON eases iteration; MessagePack provides a path to optimize bandwidth.
- Workers/DOs offer excellent latency but add vendor-specific constraints; containers are more portable.

## Alternatives Considered
- PixiJS from day one: richer FX but unnecessary complexity for MVP.
- WebRTC DataChannels: NAT traversal overhead and topology complexity not needed initially.
- Client-authoritative: easier early but vulnerable to cheating and desync.

## Links
- Architecture: ../ARCHITECTURE.md
- Multiplayer: ../MULTIPLAYER.md
- Animation: ../ANIMATION.md

