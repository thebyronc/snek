# Roadmap

Last updated: 2025-10-16

## Phase 1 — MVP (Single-Player)
- Goals: crisp controls; fixed-timestep logic; responsive Canvas 2D rendering.
- Deliverables: single-player Snake, settings (speed, grid), pause/restart, basic mobile controls, local scoreboard.
- Tech: TS + Next.js, Canvas 2D; GSAP for UI polish only.
- Duration target: 1–2 weeks.

## Phase 2 — Multiplayer Prototype
- Goals: real-time rooms (2–8 players), server-authoritative loop, prediction + reconciliation, interpolation for other players.
- Deliverables: room create/join, smooth movement with latency <120ms RTT, disconnect/reconnect handling.
- Transport: WebSockets (`ws`/Socket.IO); start JSON, consider MessagePack.
- Duration target: 2 weeks.

## Phase 3 — Production Ready
- Goals: scale rooms, observability, persistence (leaderboards), security hardening.
- Deliverables: hosted infra (Workers/DOs or containers), metrics/dashboards, leaderboards, basic cosmetics, CI.
- Duration target: 2–3 weeks.

## Milestones
- Beta: 4–8 players stable, weekly leaderboard.
- GA: global scaling, cosmetic store, events/rotations.

