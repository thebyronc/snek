"use client";

import { useCallback, useRef } from "react";
import { initGame } from "../lib/game";

export default function Home() {
  const startedRef = useRef(false);

  const onStart = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    initGame({ mountId: "game-root" });
  }, []);

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
            onClick={onStart}
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base sm:text-lg font-semibold text-background bg-foreground hover:bg-foreground/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-foreground/30 active:scale-[0.99] transition"
            aria-label="Start game"
          >
            Start Game
          </button>
        </div>

        {/* Game mount node */}
        <div id="game-root" className="mt-10 mx-auto aspect-[16/9] w-full max-w-3xl rounded-2xl border border-foreground/10 bg-background/60 backdrop-blur-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]" />

        {/* Future: settings/leaderboard modules can mount below */}
        <section className="sr-only" aria-label="Game status region" />
      </main>
    </div>
  );
}

