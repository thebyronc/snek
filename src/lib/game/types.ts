export type Vec2 = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

export type GameState = {
  cols: number;
  rows: number;
  head: Vec2;
  body: Vec2[]; // excludes head; head is separate for clarity
  // Previous positions captured at the start of the last tick for interpolation
  prevHead?: Vec2;
  prevBody?: Vec2[];
  food?: Vec2 | null;
  dir: Direction;
  nextDir?: Direction | null;
  tick: number;
  paused: boolean;
  gameOver: boolean;
  score: number;
  pendingGrowth: number; // segments to grow (increment on food)
  grewLastTick?: boolean; // true if tail was frozen last update
  // Visual tuning (factors relative to CELL)
  thickness?: number; // e.g., 0.56
  corner?: number; // e.g., 0.38
  reducedMotion?: boolean; // snap between cells if true
};
