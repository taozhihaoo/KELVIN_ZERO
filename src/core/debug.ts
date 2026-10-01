// Optional ?debug overlay — stats.js is an optional dependency, loaded dynamically.
export async function initDebugStats() {
  if (!new URLSearchParams(location.search).has('debug')) return;
  try {
    const spec = 'stats.js';
    const mod: any = await import(/* @vite-ignore */ spec);
    const Stats = mod.default;
    const stats = new Stats();
    stats.showPanel(0);
    const dom: HTMLElement = stats.dom;
    dom.style.position = 'fixed';
    dom.style.top = '0';
    dom.style.left = '0';
    dom.style.zIndex = '500';
    document.body.appendChild(dom);
    const loop = () => {
      (window as any).__kzStatsReq = requestAnimationFrame(loop);
      stats.update();
    };
    loop();
  } catch {
    console.warn('[KELVIN ZERO] stats.js is not installed — ?debug overlay disabled.');
  }
}
