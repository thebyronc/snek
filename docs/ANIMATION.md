# Animation & Rendering

Last updated: 2025-10-16

## Recommendation
- Use Canvas 2D for core gameplay (tile/grid). Keep logic on a fixed timestep; optionally tween the snake between cells for smoothness.
- Use GSAP or Anime.js for UI/menus/score popups only; avoid driving core gameplay with timeline libs.

## Loop Design
- Logic: fixed step (e.g., 100–66ms per move). Rendering at `requestAnimationFrame`.
- Accumulator pattern: advance logic in fixed increments; render interpolated position based on partial progress.
- Determinism: seed RNG; avoid per-frame allocations.

## Libraries
- Canvas 2D (MDN): https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
- GSAP: https://greensock.com/gsap/
- Anime.js: https://animejs.com/
- PixiJS (upgrade path): https://pixijs.com/

## Performance Tips
- Sprite atlas for tiles; batch by fill style; minimize state changes.
- OffscreenCanvas where supported for heavy work.
- Respect reduced motion preferences and offer a toggle.

