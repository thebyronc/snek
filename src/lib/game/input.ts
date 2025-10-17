import type { Direction } from "./types";

const KEY_TO_DIR: Record<string, Direction | undefined> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

export function isOpposite(a: Direction, b: Direction) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

export type InputHandlers = {
  consumeNextDir: (current: Direction) => Direction | null;
  dispose: () => void;
};

export function attachDirectionInput(target: EventTarget): InputHandlers {
  const MAX_QUEUE = 2;
  const queue: Direction[] = [];

  const onKeyDown = (e: KeyboardEvent) => {
    const dir = KEY_TO_DIR[e.code];
    if (!dir) return;
    // Prevent page scroll with arrow keys while playing
    e.preventDefault();
    if (e.repeat) return; // ignore key auto-repeat
    if (queue.length >= MAX_QUEUE) return;
    // Avoid enqueuing redundant duplicates (same as last queued)
    const last = queue[queue.length - 1];
    if (last && last === dir) return;
    queue.push(dir);
  };

  target.addEventListener("keydown", onKeyDown as EventListener);

  return {
    consumeNextDir(current: Direction) {
      // Apply at most one direction per tick.
      // Skip any queued directions that are invalid relative to current.
      while (queue.length) {
        const next = queue[0];
        if (next === current || isOpposite(current, next)) {
          // Drop invalid/redundant input and continue scanning
          queue.shift();
          continue;
        }
        // Valid turn
        queue.shift();
        return next;
      }
      return null;
    },
    dispose() {
      target.removeEventListener("keydown", onKeyDown as EventListener);
      queue.length = 0;
    },
  };
}

