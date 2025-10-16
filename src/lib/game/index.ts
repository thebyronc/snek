export type InitOptions = {
  mountId: string;
};

export function initGame(opts: InitOptions) {
  const mount = document.getElementById(opts.mountId);
  if (!mount) {
    // Fail gracefully if mount node is missing
    // eslint-disable-next-line no-console
    console.warn(`Game mount node not found: #${opts.mountId}`);
    return;
  }

  // Clear previous content and set up a canvas for future rendering.
  mount.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.width = mount.clientWidth;
  canvas.height = mount.clientHeight;
  canvas.className = "w-full h-full block";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Snake game canvas");
  mount.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Placeholder render: subtle instruction text.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game initialized — ready to play!", canvas.width / 2, canvas.height / 2);

  // Resize handler to keep canvas crisp & responsive.
  const onResize = () => {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = mount.getBoundingClientRect();
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.font = "600 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game initialized — ready to play!", canvas.width / (2 * dpr), canvas.height / (2 * dpr));
  };
  onResize();
  window.addEventListener("resize", onResize);

  // Return a simple disposer for future use.
  return () => {
    window.removeEventListener("resize", onResize);
  };
}

