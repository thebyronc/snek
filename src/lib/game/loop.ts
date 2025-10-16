export type LoopOptions = {
  stepMs: number;
  update: (dt: number) => void; // dt in ms (fixed step)
  render: (alpha: number) => void; // alpha in [0,1)
  isPaused?: () => boolean;
};

export function startLoop(opts: LoopOptions) {
  const { stepMs, update, render } = opts;
  let rafId = 0;
  let prev = performance.now();
  let acc = 0;
  let running = true;

  const frame = () => {
    if (!running) return;
    const now = performance.now();
    let delta = now - prev;
    prev = now;

    if (opts.isPaused?.()) {
      // Render last known state while paused (alpha 0)
      render(0);
      rafId = requestAnimationFrame(frame);
      return;
    }

    // Avoid spiral of death on tab restore
    if (delta > stepMs * 5) delta = stepMs * 5;

    acc += delta;
    while (acc >= stepMs) {
      update(stepMs);
      acc -= stepMs;
    }
    const alpha = acc / stepMs;
    render(alpha);
    rafId = requestAnimationFrame(frame);
  };

  rafId = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(rafId);
  };
}

