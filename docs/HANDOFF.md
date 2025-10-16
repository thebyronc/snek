# Handoff

Last updated: 2025-10-16

## Current Status
- Phase: Planning/Scaffold
- Risks: networking choices TBD, hosting path decision pending (Workers vs containers)

## How To Run (Dev)
- Install: `npm install`
- Start: `npm run dev` then open http://localhost:3000

## How To Deploy
- Static (frontend): Vercel/Cloudflare Pages.
- Realtime server: Cloudflare Workers + Durable Objects OR Fly.io (Node container). See `docs/ARCHITECTURE.md`.

## Where Things Live
- Architecture: `docs/ARCHITECTURE.md`
- Roadmap: `docs/ROADMAP.md`
- Multiplayer: `docs/MULTIPLAYER.md`
- Animation: `docs/ANIMATION.md`
- Decisions (ADRs): `docs/DECISIONS/`

## MVP Plan: Grid + Head + Controls

Goals
- Grid-based play area that scales with the viewport.
- A single player dot (snake head) moving cell-to-cell.
- Keyboard controls (Arrow keys + WASD) with crisp, predictable movement.
- Fixed-timestep update loop; smooth rendering via `requestAnimationFrame`.

Suggested Modules (front-end only)
- `src/lib/game/constants.ts` — `CELL`, `TICK_HZ`, `STEP_MS`, colors.
- `src/lib/game/types.ts` — `Vec2`, `Direction`, `GameState`.
- `src/lib/game/input.ts` — Key mapping, direction queue, reversal guard.
- `src/lib/game/loop.ts` — Fixed-step accumulator loop.
- `src/lib/game/render.ts` — Canvas draws (grid + head).
- `src/lib/game/index.ts` — `initGame(opts)` and lifecycle wiring (already present).

Grid & Coordinates
- Compute `cols = floor(width / CELL)`, `rows = floor(height / CELL)` from the mount rect.
- Helpers: `inBounds(pos)`, `wrap(pos)` (if using wrap-around), `gridToPx({x,y})`.

Loop & Timing
- `TICK_HZ = 10` (100ms per step). Accumulate `dt` from `performance.now()`.
- While `accumulator >= STEP_MS`: apply `update(state)`, then `accumulator -= STEP_MS`.
- `alpha = accumulator / STEP_MS` for optional micro-tween in render.

Controls
- Arrow keys and WASD. Space toggles pause; Escape resets (optional).
- Queue at most one direction change per tick; disallow immediate reversals.
- Prevent default browser scroll for handled keys during gameplay.

State (MVP)
- `GameState`: `{ cols, rows, head: {x,y}, dir, nextDir?, tick, paused, gameOver }`.
- Movement rule per tick: apply `nextDir` if valid → move `head` by current `dir`.
- Walls: choose wrap-around (recommended for initial testing) or game-over.

Rendering
- Use existing `#game-root` canvas mount created by `initGame`.
- Optional low-opacity grid lines; draw head as a circle or rounded rect centered in cell.
- Respect DPR for crisp rendering; clear canvas each frame.

Step-by-Step Implementation
1) Constants/Types
   - Add `src/lib/game/constants.ts` with `CELL`, `TICK_HZ`, `STEP_MS`.
   - Add `src/lib/game/types.ts` with `Vec2`, `Direction`, `GameState`.
2) Input
   - Add `src/lib/game/input.ts`: map keys, `isOpposite(a,b)`, manage `nextDir` per tick.
3) Loop
   - Add `src/lib/game/loop.ts`: accumulator loop with `start()` returning a `stop()` disposer.
4) Update/Render
   - Add `src/lib/game/render.ts`: `render(ctx, state, alpha)` draws grid and head.
   - In `src/lib/game/index.ts`, create `state`, wire `update` and `render`, and handle resize/DPR.
5) Page Integration
   - Already in place: `src/app/page.tsx` calls `initGame({ mountId: 'game-root' })` on Start.

Acceptance Criteria
- The dot moves one cell per tick with Arrow/WASD; no diagonal skips.
- Resize keeps grid and dot within bounds; visuals remain crisp.
- Reduced motion preference disables background animation (already respected by CSS).
- No runtime errors; CPU usage stays low when idle.

Nice-to-Haves (Post-MVP)
- Pause/Resume overlay text; Reset key.
- Toggle between wrap-around and wall-collide game-over.
- Basic HUD: tick rate, position, pause status.

## Next 1–3 Tasks
- Decide transport stack (`ws` vs Socket.IO vs uWS`). Owner: TBD
- Implement fixed-timestep loop and Canvas render scaffold. Owner: TBD
- Draft minimal room server with snapshots + inputs. Owner: TBD

## Open Questions
- Hosting choice and region strategy?
- Max players per room and target tick rates?

## Contacts
- Owners: TBD
