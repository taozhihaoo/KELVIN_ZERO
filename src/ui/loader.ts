import * as THREE from 'three';
import quadVert from '../shaders/quad.vert.glsl?raw';
import ballFrag from '../shaders/loaderBall.frag.glsl?raw';
import { COPY } from '../config/copy';
import { T } from '../config/timings';

export interface LoaderStep {
  label: string;
  run?: () => Promise<void> | void;
  /** replaces the OK suffix with custom text (e.g. live counters) */
  live?: (line: HTMLElement) => void;
}

interface Line { root: HTMLElement; status: HTMLElement }

/**
 * Terminal-style boot sequence with a small raymarched orb that cools from
 * molten orange to frost white as real initialization progresses.
 */
export class Loader {
  private root = document.getElementById('loader')!;
  private log = document.getElementById('loader-log')!;
  private actions = document.getElementById('loader-actions')!;
  private lines: Line[] = [];
  private progress = 0;
  private renderer: THREE.WebGLRenderer | null = null;
  private mat: THREE.ShaderMaterial | null = null;
  private scene = new THREE.Scene();
  private cam = new THREE.Camera();
  private raf = 0;
  private t0 = performance.now();
  private done = false;

  constructor() {
    const canvas = document.getElementById('loader-ball') as HTMLCanvasElement;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      this.renderer.setClearColor(0x000000, 0);
      this.mat = new THREE.ShaderMaterial({
        vertexShader: quadVert,
        fragmentShader: ballFrag,
        uniforms: { uProgress: { value: 0 }, uTime: { value: 0 } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
      mesh.frustumCulled = false;
      this.scene.add(mesh);
      this.spin();
    } catch {
      canvas.style.display = 'none'; // degraded loader — text only
    }
  }

  private spin = () => {
    if (!this.renderer || !this.mat) return;
    this.raf = requestAnimationFrame(this.spin);
    this.mat.uniforms.uTime.value = (performance.now() - this.t0) / 1000;
    this.mat.uniforms.uProgress.value = this.progress;
    this.renderer.render(this.scene, this.cam);
  };

  private print(text: string, status = ''): Line {
    const root = document.createElement('div');
    root.innerHTML = `<span class="dim">▸</span> ${text} `;
    const st = document.createElement('span');
    st.className = 'ok';
    st.textContent = status;
    root.appendChild(st);
    this.log.appendChild(root);
    while (this.log.children.length > 7) this.log.removeChild(this.log.firstChild!);
    return { root, status: st };
  }

  /** run steps sequentially; enforces a minimum on-screen time */
  async run(steps: LoaderStep[]) {
    const started = performance.now();
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const line = this.print(s.label, '…');
      await s.run?.();
      if (s.live) s.live(line.status);
      else line.status.textContent = 'OK';
      this.progress = (i + 1) / steps.length;
      await frame();
    }
    const remain = T.loaderMinVisible * 1000 - (performance.now() - started);
    if (remain > 0) await sleep(remain);
    this.progress = 1;
    this.print('READY. — CHILLED TO 0 K', '◇');
  }

  /** reveal ENTER buttons; resolve with the chosen entrance */
  awaitEnter(): Promise<'gallery' | 'silent'> {
    return new Promise((resolve) => {
      this.actions.classList.add('show');
      const btn = document.getElementById('btn-enter');
      const btnS = document.getElementById('btn-enter-silent');
      btn!.addEventListener('click', () => resolve('gallery'), { once: true });
      btnS!.addEventListener('click', () => resolve('silent'), { once: true });
    });
  }

  hide() {
    if (this.done) return;
    this.done = true;
    cancelAnimationFrame(this.raf);
    this.root.classList.add('done');
    import('./text').then(({ fadeUp }) => fadeUp(this.actions, 0, 0));
    const el = this.root;
    window.setTimeout(() => {
      el.style.transition = 'opacity .6s';
      el.style.opacity = '0';
      window.setTimeout(() => { el.style.display = 'none'; }, 650);
    }, 350);
    this.renderer?.dispose();
    this.renderer = null;
  }
}

function frame(): Promise<void> { return new Promise((r) => window.setTimeout(r, 16)); }
function sleep(ms: number): Promise<void> { return new Promise((r) => window.setTimeout(r, ms)); }
