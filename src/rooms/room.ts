import * as THREE from 'three';
import quadVert from '../shaders/quad.vert.glsl?raw';
import copyFrag from '../shaders/copy.frag.glsl?raw';
import type { Input } from '../core/input';
import type { Clock } from '../core/clock';
import type { Perf } from '../core/perf';
import type { AudioEngine } from '../audio/engine';

export interface Ctx {
  renderer: THREE.WebGLRenderer;
  input: Input;
  clock: Clock;
  perf: Perf;
  audio: AudioEngine;
}

export interface Room {
  id: string;
  init(ctx: Ctx): Promise<void> | void;
  enter(): void;
  leave(): void;
  update(t: number, dt: number): void;
  render(r: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null): void;
  resize(w: number, h: number): void;
  thumb?: THREE.WebGLRenderTarget;
  dispose(): void;
}

/** Optional per-room bloom override applied while the room is current. */
export interface BloomSettings { strength: number; radius: number; threshold: number }
export const DEFAULT_BLOOM: BloomSettings = { strength: 0.7, radius: 0.5, threshold: 0.2 };

// ---------------------------------------------------------------- helpers ---

export function makeThumb(): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(512, 640, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
}

/** Renders `tex` 1:1 into `target` — used to upscale low-res raymarch buffers. */
export class Blitter {
  scene = new THREE.Scene();
  cam = new THREE.Camera();
  mat: THREE.ShaderMaterial;
  mesh: THREE.Mesh;

  constructor() {
    this.mat = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: copyFrag,
      uniforms: { tSrc: { value: null } },
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  blit(renderer: THREE.WebGLRenderer, tex: THREE.Texture, target: THREE.WebGLRenderTarget | null) {
    this.mat.uniforms.tSrc.value = tex;
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.cam);
  }

  dispose() {
    this.mat.dispose();
    this.mesh.geometry.dispose();
  }
}

/** Fullscreen-quad room scaffolding for raymarch-style exhibits. */
export class QuadRoomBase {
  scene = new THREE.Scene();
  cam = new THREE.Camera();
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;

  constructor(frag: string, uniforms: Record<string, THREE.IUniform>, vert: string = quadVert) {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  renderInto(r: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    r.setRenderTarget(target);
    r.clear();
    r.render(this.scene, this.cam);
  }

  disposeBase() {
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}

/** collect unsubscribe fns while a room is entered; flush on leave */
export class Subs {
  private fns: Array<() => void> = [];
  add(fn: () => void) { this.fns.push(fn); }
  flush() { this.fns.forEach((f) => f()); this.fns = []; }
}

// ------------------------------------------------- M0 placeholder rooms ---

let phN = 0;

/** Temporary placeholder exhibit: slow-drifting dual-color gradient quad. */
export function placeholderRoom(id: string, top: string, bottom: string): Room {
  const uid = ++phN;
  const base = new QuadRoomBase(
    /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec3 cA, cB;
float h12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
void main(){
  vec3 col = mix(cB, cA, vUv.y + .12*sin(vUv.x*3. + uTime*.3));
  col += h12(vUv*90. + uTime)*.02;
  float d = length(vUv - .5);
  col *= 1. - d * .9;
  gl_FragColor = vec4(col, 1.);
}
`,
    {
      uTime: { value: 0 },
      cA: { value: new THREE.Color(top) },
      cB: { value: new THREE.Color(bottom) },
    },
  );
  const thumb = makeThumb();
  return {
    id,
    init(ctx: Ctx) { base.renderInto(ctx.renderer, thumb); },
    enter() {},
    leave() {},
    update(t) { base.material.uniforms.uTime.value = t * 0.001; },
    render(r, target) { base.renderInto(r, target); },
    resize() {},
    thumb,
    dispose() { base.disposeBase(); thumb.dispose(); },
  };
}
