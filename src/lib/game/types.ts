export type Vec2 = { x: number; y: number };

export type Direction = "up" | "down" | "left" | "right";

export type GameState = {
  cols: number;
  rows: number;
  head: Vec2;
  body: Vec2[]; // excludes head; head is separate for clarity
  food?: Vec2 | null;
  dir: Direction;
  nextDir?: Direction | null;
  tick: number;
  paused: boolean;
  gameOver: boolean;
  score: number;
  pendingGrowth: number; // segments to grow (increment on food)
};
