import { COLORS, CELL } from "./constants";
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

function drawHead(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  const r = Math.floor(CELL * 0.38);
  ctx.save();
  ctx.fillStyle = COLORS.head;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBody(ctx: CanvasRenderingContext2D, segments: Vec2[]) {
  if (!segments.length) return;
  ctx.save();
  ctx.fillStyle = COLORS.body;
  const r = Math.floor(CELL * 0.3);
  for (const s of segments) {
    const cx = s.x * CELL + CELL / 2;
    const cy = s.y * CELL + CELL / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
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
  // Entities
  drawFood(ctx, state.food ?? null);
  drawBody(ctx, state.body);
  drawHead(ctx, state.head.x, state.head.y);
  drawHud(ctx, state);
}
