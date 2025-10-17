export const CELL = 24; // logical pixels per grid cell
export const TICK_HZ = 10; // movement ticks per second
export const STEP_MS = 1000 / TICK_HZ;

export const COLORS = {
  bg: "transparent",
  gridLight: "rgba(0,0,0,0.08)",
  gridDark: "rgba(255,255,255,0.08)",
  head: "#64ffda",
  body: "#27c8a9",
  food: "#ff6384",
  hudLight: "rgba(0,0,0,0.75)",
  hudDark: "rgba(255,255,255,0.85)",
};

// Visual tuning for the snake bar
// Proportions relative to CELL size
export const SNAKE_THICKNESS = 0.56; // 0.50–0.62 recommended
export const SNAKE_CORNER = 0.38; // corner radius factor (0.3–0.5)
