"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { initGame } from "../lib/game";
import { SNAKE_THICKNESS, SNAKE_CORNER } from "../lib/game/constants";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "running" | "gameover">("idle");
  const controllerRef = useRef<null | { dispose: () => void; setVisuals: (v: { thickness?: number; corner?: number; reducedMotion?: boolean }) => void }>(null);

  // Visual controls state
  const [thickness, setThickness] = useState<number>(SNAKE_THICKNESS);
  const [corner, setCorner] = useState<number>(SNAKE_CORNER);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const startOrRestart = useCallback(() => {
    // Dispose any existing game instance before starting anew
    controllerRef.current?.dispose?.();
    const controller = initGame({
      mountId: "game-root",
      onGameOver: () => setStatus("gameover"),
      visuals: { thickness, corner, reducedMotion },
    });
    controllerRef.current = controller ?? null;
    setStatus("running");
  }, [corner, reducedMotion, thickness]);

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-animated">
      {/* Subtle grid overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.08] bg-grid" />

      <main className="relative z-10 w-full max-w-3xl px-6 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Snek Game
        </h1>
        <p className="mt-4 text-balance text-base sm:text-lg text-foreground/80">
          Version 1.0 Alpha - Base
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={startOrRestart}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base sm:text-lg font-semibold text-background bg-foreground hover:bg-foreground/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-foreground/30 active:scale-[0.99] transition"
            aria-label="Start game"
          >
            {status === "gameover" ? "Restart Game" : "Start Game"}
          </button>
        </div>

        {/* Visual controls */}
        <div className="mt-6 mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Thickness</span>
            <input
              type="range"
              min={0.48}
              max={0.64}
              step={0.01}
              value={thickness}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setThickness(v);
                controllerRef.current?.setVisuals({ thickness: v });
              }}
            />
            <span className="text-xs text-foreground/70">{thickness.toFixed(2)}</span>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Corner Radius</span>
            <input
              type="range"
              min={0.28}
              max={0.50}
              step={0.01}
              value={corner}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setCorner(v);
                controllerRef.current?.setVisuals({ corner: v });
              }}
            />
            <span className="text-xs text-foreground/70">{corner.toFixed(2)}</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => {
                const v = e.target.checked;
                setReducedMotion(v);
                controllerRef.current?.setVisuals({ reducedMotion: v });
              }}
            />
            <span className="text-sm font-medium">Reduced Motion</span>
          </label>
        </div>

        {/* Game mount node */}
        <div id="game-root" className="mt-10 mx-auto aspect-[16/9] w-full max-w-3xl rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]" />

        {/* Future: settings/leaderboard modules can mount below */}
        <section className="sr-only" aria-label="Game status region" />
      </main>
    </div>
  );
}

