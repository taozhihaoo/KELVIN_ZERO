import './style.css';
import * as THREE from 'three';
import { createRenderer, hasWebGL2 } from './core/renderer';
import { Clock } from './core/clock';
import { Input } from './core/input';
import { Perf } from './core/perf';
import { Router, routeKey, type Route } from './core/router';
import { SceneManager } from './core/sceneManager';
import { Post } from './core/post';
import { AudioEngine } from './audio/engine';
import type { Ctx, Room } from './rooms/room';
import { showFallback } from './ui/fallback';
import { createAtrium } from './rooms/atrium';
import { createTuring } from './rooms/turing';
import { createMercury } from './rooms/mercury';
import { createCurl } from './rooms/curl';
import { createLattice } from './rooms/lattice';
import { createEcho } from './rooms/echo';
import { createHorizon } from './rooms/horizon';
import { createIndexPage } from './rooms/indexPage';

function boot() {
  const renderer = createRenderer(canvas);
  const clock = new Clock();
  const input = new Input(canvas);
  const perf = new Perf();
  const audio = new AudioEngine();

  const ctx: Ctx = { renderer, input, clock, perf, audio };

  const mgr = new SceneManager(ctx);
  const post = new Post(renderer, mgr, window.innerWidth, window.innerHeight);
  const rooms: Room[] = [
    createAtrium(), createTuring(), createMercury(), createCurl(),
    createLattice(), createEcho(), createHorizon(), createIndexPage(),
  ];
  rooms.forEach((r) => mgr.register(r));

  const initAll = async () => {
    for (const r of rooms) await r.init(ctx);
  };

  // ------------------------------------------------------------- routing ---
  const pendingOrigin = { x: 0.5, y: 0.5 };
  let clickPending = false;
  input.on('click', (p: any) => { clickPending = true; pendingOrigin.x = p.ux; pendingOrigin.y = p.uy; });

  const router = new Router();
  router.on((route: Route) => {
    const key = routeKey(route);
    if (!mgr.rooms.has(key)) return;
    const origin = clickPending ? pendingOrigin : { x: 0.5, y: 0.5 };
    clickPending = false;
    mgr.go(key, origin);
  });

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
    } else if (code === 'Escape') {
      router.go('#/');
    }
  });

  // ------------------------------------------------------------ mainloop ---
  let last = performance.now();
  function loop(now: number) {
    requestAnimationFrame(loop);
    const realDt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (document.hidden) return;
    clock.update(realDt);
    const dt = realDt * clock.timeScale;
    mgr.update(clock.t, dt);
    audio.tick();
    post.feed(clock.t, performance.now() / 1000, 0, 0, 0);
    post.render();
    perf.frame(realDt * 1000);
    input.lateUpdate(realDt);
  }

  initAll().then(() => {
    mgr.enterImmediate('atrium');
    router.start();
    requestAnimationFrame((n) => { last = n; loop(n); });
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    post.resize(window.innerWidth, window.innerHeight);
    mgr.resize(window.innerWidth, window.innerHeight);
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

const canvas = document.getElementById('gl') as HTMLCanvasElement;

if (!hasWebGL2()) {
  showFallback();
} else {
  boot();
}
