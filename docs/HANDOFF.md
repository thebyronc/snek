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

## Next 1–3 Tasks
- Decide transport stack (`ws` vs Socket.IO vs uWS`). Owner: TBD
- Implement fixed-timestep loop and Canvas render scaffold. Owner: TBD
- Draft minimal room server with snapshots + inputs. Owner: TBD

## Open Questions
- Hosting choice and region strategy?
- Max players per room and target tick rates?

## Contacts
- Owners: TBD

