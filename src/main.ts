import './style.css';
import gsap from 'gsap';
import { createRenderer, hasWebGL2 } from './core/renderer';
import { Clock } from './core/clock';
import { Input } from './core/input';
import { Perf } from './core/perf';
import { Router, routeKey, routeTitle, type Route } from './core/router';
import { SceneManager } from './core/sceneManager';
import { Post } from './core/post';
import { AudioEngine } from './audio/engine';
import type { Ctx, Room } from './rooms/room';
import { showFallback } from './ui/fallback';
import { HUD } from './ui/hud';
import { Loader, type LoaderStep } from './ui/loader';
import { Panel } from './ui/panel';
import { Manifesto } from './ui/manifesto';
import { initMarquee } from './ui/marquee';
import { initCursor, cursor } from './ui/cursor';
import { registry } from './ui/registry';
import { createAtrium } from './rooms/atrium';
import { createTuring } from './rooms/turing';
import { createMercury } from './rooms/mercury';
import { createCurl } from './rooms/curl';
import { createLattice } from './rooms/lattice';
import { createEcho } from './rooms/echo';
import { createHorizon } from './rooms/horizon';
import { createIndexPage } from './rooms/indexPage';
import { roomByKey } from './config/rooms';

const canvas = document.getElementById('gl') as HTMLCanvasElement;

function boot() {
  const renderer = createRenderer(canvas);
  const clock = new Clock();
  const input = new Input(canvas);
  const perf = new Perf();
  const audio = new AudioEngine();
  const panel = new Panel();
  registry.panel = panel;

  const ctx: Ctx = { renderer, input, clock, perf, audio };
  const mgr = new SceneManager(ctx);
  const post = new Post(renderer, mgr, window.innerWidth, window.innerHeight);

  const rooms: Room[] = [
    createAtrium(), createTuring(), createMercury(), createCurl(),
    createLattice(), createEcho(), createHorizon(), createIndexPage(),
  ];
  rooms.forEach((r) => mgr.register(r));

  // ------------------------------------------------------------------ UI ---
  initMarquee();
  initCursor(input);
  const hud = new HUD({
    onIndex: () => router.go('#/index'),
    onSound: () => {
      if (audio.enabled) audio.disable();
      else { audio.enable(); audio.setDrone(currentDrone()); }
      hud.setSound(audio.enabled);
      if (audio.enabled) audio.blip();
    },
    onZero: () => toggleZero(),
  });
  const manifesto = new Manifesto(() => manifesto.close());
  registry.hud = hud;
  (document.getElementById('btn-manifesto') as HTMLElement)
    .addEventListener('click', () => manifesto.open());

  // subtle hover ticks on every button
  let lastTick = 0;
  window.addEventListener('pointerover', (e) => {
    if ((e.target as Element)?.closest?.('button')) {
      const now = performance.now();
      if (now - lastTick > 90) { lastTick = now; audio.hoverTick(); }
    }
  });

  // ----------------------------------------------------------- loader -------
  const loader = new Loader();
  const steps: LoaderStep[] = [{ label: 'INIT RENDERER — WEBGL2' }];
  for (const r of rooms) {
    steps.push({
      label: `BUILD ${r.id.toUpperCase()}`,
      run: () => r.init(ctx),
    });
  }
  steps.push({
    label: 'WARMING GPGPU + THUMBS',
    run: async () => {
      for (const r of rooms) mgr.warmThumb(r);
    },
  });
  steps.push({
    label: 'COMPILING SHADERS',
    run: () => { void renderer; },
    live: (el) => {
      el.textContent = `${renderer.info.programs?.length ?? 0} PROGRAMS · OK`;
    },
  });

  // ------------------------------------------------------------ routing ----
  const pendingOrigin = { x: 0.5, y: 0.5 };
  let clickPending = false;
  input.on('click', (p: any) => { clickPending = true; pendingOrigin.x = p.ux; pendingOrigin.y = p.uy; });

  const router = new Router();
  let currentKey = 'atrium';

  const applyRoute = (route: Route) => {
    const key = routeKey(route);
    if (!mgr.rooms.has(key)) return;
    const origin = clickPending ? pendingOrigin : { x: 0.5, y: 0.5 };
    clickPending = false;
    currentKey = key;
    const meta = roomByKey(key) ?? null;
    hud.setRoute(route, meta);
    hud.hideInfoBlock();
    panel.clear();
    document.title = routeTitle(route);
    mgr.go(key, origin);
    if (!mgr.transitioning) onSettledKey(key);
  };
  router.on(applyRoute);

  mgr.onTransitionStart = () => audio.crack();
  mgr.onBloom = (b) => post.setBloom(b);
  mgr.onSettled = (id) => onSettledKey(id);

  function onSettledKey(key: string) {
    if (key === lastSettled) return;
    lastSettled = key;
    const meta = roomByKey(key);
    if (meta) {
      const count = key === 'r3'
        ? `${(perf.params.curlN * perf.params.curlN).toLocaleString('en-US')} PARTICLES`
        : meta.countLabel || undefined;
      hud.showInfoBlock(meta, count);
    } else {
      hud.hideInfoBlock();
    }
    if (key === 'atrium') hud.showHint('DRAG · WHEEL · ← →', 3);
    (window as any).__roomSettled?.(key);
  }
  let lastSettled = '';

  // ------------------------------------------------------ absolute zero ----
  let zeroOn = false;
  const frost = { v: 0 };
  function toggleZero() {
    zeroOn = !zeroOn;
    clock.setZero(zeroOn);
    gsap.to(frost, { v: zeroOn ? 1 : 0, duration: 1.7, ease: 'power2.out', overwrite: true });
    audio.setLowpassTarget(zeroOn ? 200 : 18000);
    const meta = roomByKey(currentKey) ?? null;
    hud.setZeroActive(zeroOn, meta ? meta.tempK : null, meta?.tempLabel);
    audio.blip();
  }

  // ---------------------------------------------------------- keyboard -----
  input.on('key', ({ code, event }: any) => {
    if (code === 'ArrowLeft' || code === 'ArrowRight') {
      event?.preventDefault();
      const cur = router.current();
      let n = cur.name === 'room' ? parseInt(cur.id, 10) : 0;
      n = code === 'ArrowRight' ? n + 1 : n - 1;
      if (n < 1) n = 6;
      if (n > 6) n = 1;
      router.go(`#/room/${n}`);
      return;
    }
    if (code === 'Escape') {
      if (manifesto.isOpen) manifesto.close();
      else if (router.current().name !== 'atrium') router.go('#/');
      return;
    }
    if (code === 'KeyZ' && !loaderVisible) toggleZero();
  });

  // ------------------------------------------------------------ mainloop ---
  let last = performance.now();
  let loaderVisible = true;
  function loop(now: number) {
    requestAnimationFrame(loop);
    const realDt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (document.hidden) return;
    clock.update(realDt);
    const dt = realDt * clock.timeScale;
    mgr.update(clock.t, dt);
    audio.tick();
    const vel = Math.min(1, Math.hypot(input.vx, input.vy) * 1.4 + (mgr.transitioning ? 0.5 : 0));
    post.feed(clock.t, now / 1000, vel, frost.v, mgr.transitioning ? 1 : 0);
    post.render();
    perf.frame(realDt * 1000);
    hud.frame(realDt, input.x, input.y, perf.fps, perf.tier);
    cursor.current?.update(realDt);
    input.lateUpdate(realDt);
  }

  // -------------------------------------------------------------- start ----
  const enter = async () => {
    await loader.run(steps);
    const auto = new URLSearchParams(location.search).has('autoenter'); // test hook
    const choice = auto ? 'silent' : await loader.awaitEnter();
    loaderVisible = false;
    loader.hide();
    if (choice === 'gallery') {
      audio.enable().then(() => audio.setDrone(currentDrone()));
      hud.setSound(true);
    }
    mgr.enterImmediate(routeKey(router.current()));
    router.start();
    requestAnimationFrame((n) => { last = n; loop(n); });
  };
  enter();

  function currentDrone(): number {
    return roomByKey(currentKey)?.droneHz ?? 110;
  }

  // test/automation hook (also handy in console)
  (window as any).__kz = {
    mgr,
    clock,
    advance(n: number, step = 1 / 60) {
      for (let i = 0; i < n; i++) mgr.update(clock.t += step, step);
    },
  };

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    post.resize(window.innerWidth, window.innerHeight);
    post.setTier(perf.tier, window.innerWidth, window.innerHeight);
    mgr.resize(window.innerWidth, window.innerHeight);
  });

  perf.onTier(() => {
    post.setTier(perf.tier, window.innerWidth, window.innerHeight);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.noteOff(true);
  });

  window.addEventListener('beforeunload', () => {
    mgr.dispose();
    audio.dispose();
    input.dispose();
    post.dispose();
  });
}

// lightweight error sink (used by automated checks; no console spam)
(window as any).__kzErrors = [];
window.addEventListener('error', (e) => (window as any).__kzErrors.push('' + (e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => (window as any).__kzErrors.push('' + (e.reason)));
const _origErr = console.error.bind(console);
console.error = (...a: any[]) => {
  (window as any).__kzErrors.push(a.map((x) => (typeof x === 'string' ? x : String(x?.message || x))).join(' ').slice(0, 300));
  _origErr(...a);
};

if (!hasWebGL2()) {
  showFallback();
} else {
  boot();
}
