# Multiplayer

Last updated: 2025-10-16

## Model
- Server authoritative per room; clients send inputs and predict locally.
- Server tick: 20–30 Hz; Snapshot broadcast: 10–20 Hz.
- Deterministic logic with seeded RNG.

## Messages (initial JSON)
- Client → Server
  - `join { roomId, name }`
  - `input { seq, dir, clientTime }`
  - `ping { id }`
- Server → Client
  - `welcome { roomCfg, seed }`
  - `snapshot { tick, players[], food[], serverTime }`
  - `ack { seq }`
  - `pong { id, serverTime }`

Consider MessagePack when optimizing bandwidth: https://msgpack.org/

## Sync Strategy
- Client prediction & reconciliation: keep a ring buffer of unacked inputs; on snapshot, rewind to server state, reapply inputs, correct visuals.
- Interpolation: buffer remote players ~100–150ms and interpolate between snapshots; snap if error exceeds threshold.
- Clock sync: compute RTT and smoothed offset using serverTime in snapshots.
- Out-of-order handling: sequence numbers; drop stale inputs.

## Anti-cheat & Abuse
- Server enforces move legality and spawns; rate limit input frequency and joins.
- Room codes unguessable; optional HMAC per message in production.

## Libraries
- `ws`: https://github.com/websockets/ws
- Socket.IO: https://socket.io/
- `uWebSockets.js`: https://github.com/uNetworking/uWebSockets.js
- Colyseus (higher-level rooms): https://www.colyseus.io/

