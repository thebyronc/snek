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
  let nextDir: Direction | null = null;

  const onKeyDown = (e: KeyboardEvent) => {
    const dir = KEY_TO_DIR[e.code];
    if (dir) {
      // Prevent page scroll with arrow keys while playing
      e.preventDefault();
      nextDir = dir;
      return;
    }
  };

  target.addEventListener("keydown", onKeyDown as EventListener);

  return {
    consumeNextDir(current: Direction) {
      if (nextDir && !isOpposite(current, nextDir)) {
        const d = nextDir;
        nextDir = null;
        return d;
      }
      // If queued opposite direction, ignore it for this tick
      nextDir = null;
      return null;
    },
    dispose() {
      target.removeEventListener("keydown", onKeyDown as EventListener);
    },
  };
}

