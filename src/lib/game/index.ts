import { CELL, STEP_MS, SNAKE_CORNER, SNAKE_THICKNESS } from "./constants";
import type { GameState, Direction, Vec2 } from "./types";
import { attachDirectionInput } from "./input";
import { startLoop } from "./loop";
import { render as renderScene } from "./render";

export type InitOptions = {
  mountId: string;
  wrap?: boolean; // wrap around edges vs. wall-collide
  onGameOver?: () => void; // called once when game ends
  visuals?: {
    thickness?: number;
    corner?: number;
    reducedMotion?: boolean;
  };
};

export type GameController = {
  dispose: () => void;
  setVisuals: (v: { thickness?: number; corner?: number; reducedMotion?: boolean }) => void;
};

export function initGame(opts: InitOptions): GameController | undefined {
  const mount = document.getElementById(opts.mountId);
  if (!mount) {
    console.warn(`Game mount node not found: #${opts.mountId}`);
    return;
  }

  // Clear previous content and set up a canvas.
  mount.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.className = "w-full h-full block outline-none";
  canvas.tabIndex = 0; // capture keyboard when focused
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Snake game canvas");
  mount.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Compute cols/rows from mount size and CELL; handle DPR scaling.
  const fitToDpr = () => {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = mount.getBoundingClientRect();
    const cols = Math.max(4, Math.floor(rect.width / CELL));
    const rows = Math.max(4, Math.floor(rect.height / CELL));
    const width = cols * CELL;
    const height = rows * CELL;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return { cols, rows, dpr };
  };

  let { cols, rows, dpr } = fitToDpr();

  const center = (): Vec2 => ({ x: Math.floor(cols / 2), y: Math.floor(rows / 2) });

  const state: GameState = {
    cols,
    rows,
    head: center(),
    body: [],
    prevHead: undefined,
    prevBody: undefined,
    food: null,
    dir: "right",
    nextDir: null,
    tick: 0,
    paused: false,
    gameOver: false,
    score: 0,
    pendingGrowth: 0,
    thickness: opts.visuals?.thickness ?? SNAKE_THICKNESS,
    corner: opts.visuals?.corner ?? SNAKE_CORNER,
    reducedMotion: opts.visuals?.reducedMotion ?? false,
  };

  // Input
  const input = attachDirectionInput(canvas);

  // Ensure focus so keys work after clicking Start
  canvas.addEventListener("pointerdown", () => canvas.focus());
  canvas.focus();

  const wrap = opts.wrap ?? true;

  const clampOrWrap = (p: Vec2): Vec2 => {
    if (wrap) {
      return { x: (p.x + cols) % cols, y: (p.y + rows) % rows };
    }
    return {
      x: Math.max(0, Math.min(cols - 1, p.x)),
      y: Math.max(0, Math.min(rows - 1, p.y)),
    };
  };

  const dirVec = (d: Direction): Vec2 => {
    switch (d) {
      case "up":
        return { x: 0, y: -1 };
      case "down":
        return { x: 0, y: 1 };
      case "left":
        return { x: -1, y: 0 };
      case "right":
      default:
        return { x: 1, y: 0 };
    }
  };

  let notifiedGameOver = false;
  const notifyGameOver = () => {
    if (!notifiedGameOver) {
      notifiedGameOver = true;
      try { opts.onGameOver?.(); } catch {}
    }
  };

  const update = () => {
    if (state.gameOver || state.paused) return;
    // Snapshot previous positions for interpolation this tick
    state.prevHead = { x: state.head.x, y: state.head.y };
    state.prevBody = state.body.slice();
    const maybeDir = input.consumeNextDir(state.dir);
    if (maybeDir) state.dir = maybeDir;

    const v = dirVec(state.dir);
    const prevHead: Vec2 = { x: state.head.x, y: state.head.y };
    const next = { x: state.head.x + v.x, y: state.head.y + v.y };

    if (wrap) {
      state.head = clampOrWrap(next);
    } else {
      // Wall collision ends the game
      if (next.x < 0 || next.x >= cols || next.y < 0 || next.y >= rows) {
        state.gameOver = true;
        // Freeze interpolation at final position
        state.prevHead = state.head;
        state.prevBody = state.body.slice();
      } else {
        state.head = next;
      }
    }

    // Self-collision: if head hits any body segment
    if (state.body.some((s) => s.x === state.head.x && s.y === state.head.y)) {
      state.gameOver = true;
      // Freeze interpolation at final position
      state.prevHead = state.head;
      state.prevBody = state.body.slice();
    }

    // Move body: add previous head at front
    state.body.unshift(prevHead);

    const grew = state.pendingGrowth > 0;
    if (grew) {
      state.pendingGrowth -= 1; // keep tail (grow)
    } else {
      state.body.pop(); // remove tail to maintain length
    }
    state.grewLastTick = grew;

    // Eating food
    if (state.food && state.head.x === state.food.x && state.head.y === state.food.y) {
      state.score += 1;
      state.pendingGrowth += 1;
      state.food = spawnFood(cols, rows, state.head, state.body);
    }

    state.tick += 1;
    if (state.gameOver) notifyGameOver();
  };

  const render = (alpha: number) => {
    const a = state.reducedMotion ? 0 : alpha;
    renderScene(ctx, state, a, dpr);
    if (state.gameOver) {
      // Simple overlay
      ctx.save();
      ctx.fillStyle = "rgba(248, 248, 248, 0.6)";
      ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const w = state.cols * CELL;
      const h = state.rows * CELL;
      ctx.fillText("Game Over — press Start to restart", w / 2, h / 2);
      ctx.restore();
    }
  };

  // Resize handler keeps canvas crisp & updates grid size.
  const onResize = () => {
    const fitted = fitToDpr();
    cols = fitted.cols;
    rows = fitted.rows;
    dpr = fitted.dpr;
    state.cols = cols;
    state.rows = rows;
    state.head = clampOrWrap(state.head);
    // Clamp/wrap body and food
    state.body = state.body.map(clampOrWrap);
    if (state.food) state.food = clampOrWrap(state.food);
    render(0);
  };
  window.addEventListener("resize", onResize);

  // Initial food spawn
  state.food = spawnFood(cols, rows, state.head, state.body);

  const stop = startLoop({ stepMs: STEP_MS, update, render, isPaused: () => state.paused || state.gameOver });

  // Return disposer to cleanup when navigating away or restarting later.
  const controller: GameController = {
    dispose() {
      stop();
      input.dispose();
      window.removeEventListener("resize", onResize);
    },
    setVisuals(v) {
      if (typeof v.thickness === "number") state.thickness = v.thickness;
      if (typeof v.corner === "number") state.corner = v.corner;
      if (typeof v.reducedMotion === "boolean") state.reducedMotion = v.reducedMotion;
    },
  };

  return controller;
}

function spawnFood(cols: number, rows: number, head: Vec2, body: Vec2[]): Vec2 | null {
  const occupied = new Set<string>();
  occupied.add(`${head.x},${head.y}`);
  for (const s of body) occupied.add(`${s.x},${s.y}`);

  const total = cols * rows;
  if (occupied.size >= total) return null; // no space (won state!)

  // Try random positions, fallback to scan
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    const key = `${x},${y}`;
    if (!occupied.has(key)) return { x, y };
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) return { x, y };
    }
  }
  return null;
}
