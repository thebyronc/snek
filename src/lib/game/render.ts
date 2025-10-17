import { COLORS, CELL, SNAKE_THICKNESS, SNAKE_CORNER } from "./constants";
import type { GameState, Vec2 } from "./types";

export function clear(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  dpr: number,
) {
  const dark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const color = dark ? COLORS.gridDark : COLORS.gridLight;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1 / dpr; // crisp lines
  ctx.beginPath();
  for (let x = 0; x <= cols; x++) {
    const px = x * CELL + 0.5 / dpr;
    ctx.moveTo(px, 0);
    ctx.lineTo(px, rows * CELL);
  }
  for (let y = 0; y <= rows; y++) {
    const py = y * CELL + 0.5 / dpr;
    ctx.moveTo(0, py);
    ctx.lineTo(cols * CELL, py);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSnakeBar(
  ctx: CanvasRenderingContext2D,
  points: Vec2[],
  boardWidthPx: number,
  boardHeightPx: number,
  targetLengthPx: number,
  thicknessPx: number,
  cornerRadiusPx: number,
) {
  if (!points.length) return;
  // Desired visual thickness similar to previous body/head sizes
  const thickness = Math.floor(thicknessPx);
  const half = thickness / 2;

  // Single dot fallback
  if (points.length === 1) {
    const p = points[0];
    const cx = p.x * CELL + CELL / 2;
    const cy = p.y * CELL + CELL / 2;
    ctx.save();
    ctx.fillStyle = COLORS.body;
    ctx.beginPath();
    ctx.arc(cx, cy, half, 0, Math.PI * 2);
    ctx.fill();
    // Draw once; head uses same body color
    ctx.restore();
    return;
  }

  // Convert grid centers to pixel coords
  const toPx = (v: Vec2) => ({ x: v.x * CELL + CELL / 2, y: v.y * CELL + CELL / 2 });
  const raw = points.map(toPx);

  // Unwrap across torus edges so adjacent points take the shortest path
  const pxPoints: { x: number; y: number }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const p = { ...raw[i] };
    if (i > 0) {
      const prev = pxPoints[i - 1];
      let dx = p.x - prev.x;
      let dy = p.y - prev.y;
      if (dx > boardWidthPx / 2) p.x -= boardWidthPx;
      else if (dx < -boardWidthPx / 2) p.x += boardWidthPx;
      if (dy > boardHeightPx / 2) p.y -= boardHeightPx;
      else if (dy < -boardHeightPx / 2) p.y += boardHeightPx;
    }
    pxPoints.push(p);
  }

  // Build a trimmed polyline from head backwards to target length
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y);
  const lerpTo = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  let remaining = Math.max(0, targetLengthPx);
  const trimmed: { x: number; y: number }[] = [];
  if (pxPoints.length) trimmed.push({ x: pxPoints[0].x, y: pxPoints[0].y });
  for (let i = 0; i < pxPoints.length - 1 && remaining > 0; i++) {
    const a = trimmed[trimmed.length - 1];
    const b = pxPoints[i + 1];
    const segLen = dist(a, b);
    if (segLen <= remaining) {
      trimmed.push({ x: b.x, y: b.y });
      remaining -= segLen;
    } else {
      const t = segLen > 0 ? remaining / segLen : 0;
      const p = lerpTo(a, b, t);
      trimmed.push(p);
      remaining = 0;
    }
  }

  // Stroke the trimmed snake as a rounded polyline
  ctx.save();
  ctx.strokeStyle = COLORS.body;
  ctx.lineWidth = thickness;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(trimmed[0].x, trimmed[0].y);

  // Corner smoothing using quadratic curves at turns
  const cornerR = Math.min(cornerRadiusPx, CELL * 0.5);
  for (let i = 1; i < trimmed.length; i++) {
    const prev = trimmed[i - 1];
    const curr = trimmed[i];
    const next = i + 1 < trimmed.length ? trimmed[i + 1] : null;
    if (!next) {
      // Last segment
      ctx.lineTo(curr.x, curr.y);
      break;
    }

    // Determine if there's a turn at 'curr'
    const d1x = curr.x - prev.x, d1y = curr.y - prev.y;
    const d2x = next.x - curr.x, d2y = next.y - curr.y;
    const colinear = Math.sign(Math.round(d1x)) === Math.sign(Math.round(d2x)) && Math.sign(Math.round(d1y)) === Math.sign(Math.round(d2y));
    if (colinear) {
      ctx.lineTo(curr.x, curr.y);
      continue;
    }

    const seg1 = dist(prev, curr);
    const seg2 = dist(curr, next);
    const r1 = Math.min(cornerR, seg1 / 2);
    const r2 = Math.min(cornerR, seg2 / 2);
    const a = seg1 > 0 ? lerpTo(curr, prev, r1 / seg1) : curr; // point before corner along prev->curr
    const b = seg2 > 0 ? lerpTo(curr, next, r2 / seg2) : curr; // point after corner along curr->next

    ctx.lineTo(a.x, a.y);
    // Smooth the corner with a quadratic curve (control at the corner point)
    ctx.quadraticCurveTo(curr.x, curr.y, b.x, b.y);
  }

  ctx.stroke();

  // Draw a cap at the front (same color as body)
  ctx.fillStyle = COLORS.body;
  ctx.beginPath();
  ctx.arc(pxPoints[0].x, pxPoints[0].y, half, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFood(ctx: CanvasRenderingContext2D, f: Vec2 | null | undefined) {
  if (!f) return;
  ctx.save();
  ctx.fillStyle = COLORS.food;
  const size = Math.floor(CELL * 0.5);
  const x = f.x * CELL + (CELL - size) / 2;
  const y = f.y * CELL + (CELL - size) / 2;
  const r = Math.floor(size * 0.25);
  // Rounded rect
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + size, r);
  ctx.arcTo(x + size, y + size, x, y + size, r);
  ctx.arcTo(x, y + size, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawHud(ctx: CanvasRenderingContext2D, state: GameState) {
  const dark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  ctx.save();
  ctx.fillStyle = dark ? COLORS.hudDark : COLORS.hudLight;
  ctx.font = "600 12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const pad = 6;
  const lines = [
    `Score: ${state.score}`,
    `Tick: ${state.tick}`,
    `Len: ${state.body.length + 1}`,
  ];
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], pad, pad + i * 14);
  }
  ctx.restore();
}

export function render(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  alpha: number,
  dpr: number,
) {
  const width = state.cols * CELL;
  const height = state.rows * CELL;
  clear(ctx, width, height);
  // Optional grid (subtle)
  drawGrid(ctx, state.cols, state.rows, dpr);
  // Interpolated entities
  drawFood(ctx, state.food ?? null);

  // Helpers for interpolation (handles wrapping one cell across edges)
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpWrapped = (a: number, b: number, t: number, span: number) => {
    let d = b - a;
    // Normalize to the shortest step (movement per tick is <= 1 in grid)
    if (d > 1) d -= span;
    else if (d < -1) d += span;
    return a + d * t;
  };

  // Head interpolation
  const prevHead = state.prevHead ?? state.head;
  const headX = lerpWrapped(prevHead.x, state.head.x, alpha, state.cols);
  const headY = lerpWrapped(prevHead.y, state.head.y, alpha, state.rows);

  // Body interpolation
  const prevBody = state.prevBody ?? [];
  const interpBody: Vec2[] = [];
  for (let i = 0; i < state.body.length; i++) {
    const start = (
      i < prevBody.length ? prevBody[i] : (prevBody[prevBody.length - 1] ?? prevHead)
    );
    const end = (
      i === 0
        ? prevHead
        : (i - 1 < prevBody.length ? prevBody[i - 1] : (prevBody[prevBody.length - 1] ?? prevHead))
    );
    const x = lerpWrapped(start.x, end.x, alpha, state.cols);
    const y = lerpWrapped(start.y, end.y, alpha, state.rows);
    interpBody.push({ x, y });
  }

  // Combined snake path: head followed by body points
  const boardW = state.cols * CELL;
  const boardH = state.rows * CELL;
  const targetLenPx = (state.body.length + 1) * CELL - (state.grewLastTick ? 0 : alpha * CELL);
  const thicknessFactor = typeof state.thickness === "number" ? state.thickness : SNAKE_THICKNESS;
  const cornerFactor = typeof state.corner === "number" ? state.corner : SNAKE_CORNER;
  const thicknessPx = CELL * thicknessFactor;
  const cornerRadiusPx = CELL * cornerFactor;
  drawSnakeBar(
    ctx,
    [{ x: headX, y: headY }, ...interpBody],
    boardW,
    boardH,
    targetLenPx,
    thicknessPx,
    cornerRadiusPx,
  );
  drawHud(ctx, state);
}
