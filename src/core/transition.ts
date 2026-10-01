import * as THREE from 'three';
import gsap from 'gsap';
import quadVert from '../shaders/quad.vert.glsl?raw';
import frostFrag from '../shaders/frost.frag.glsl?raw';
import { transitionDuration } from '../config/timings';

/** Frost-crystal wipe between two rendered rooms (SPEC §5.2). */
export class Transition {
  rtA: THREE.WebGLRenderTarget;
  rtB: THREE.WebGLRenderTarget;
  scene = new THREE.Scene();
  cam = new THREE.Camera();
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  p = { v: 0 };
  active = false;
  origin = new THREE.Vector2(0.5, 0.5);
  private w = 2; private h = 2;

  constructor(w: number, h: number) {
    this.w = w; this.h = h;
    const opts: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: true,
    };
    this.rtA = new THREE.WebGLRenderTarget(w, h, opts);
    this.rtB = new THREE.WebGLRenderTarget(w, h, opts);
    this.material = new THREE.ShaderMaterial({
      vertexShader: quadVert,
      fragmentShader: frostFrag,
      uniforms: {
        tA: { value: null },
        tB: { value: null },
        uP: { value: 0 },
        uAspect: { value: w / h },
        uOrigin: { value: this.origin },
      },
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  setSize(w: number, h: number) {
    this.w = w; this.h = h;
    this.rtA.setSize(w, h);
    this.rtB.setSize(w, h);
    this.material.uniforms.uAspect.value = w / h;
  }

  get progress(): number { return this.p.v; }

  /** animate uP 0→1; onComplete fires when the wipe fully covers the screen */
  run(onDone: () => void) {
    this.active = true;
    this.p.v = 0;
    this.material.uniforms.uP.value = 0;
    gsap.to(this.p, {
      v: 1,
      duration: transitionDuration(),
      ease: 'expo.inOut',
      onComplete: () => {
        this.active = false;
        onDone();
      },
    });
  }

  /** blend currently-bound tA/tB textures into target */
  render(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    this.material.uniforms.uP.value = this.p.v;
    renderer.setRenderTarget(target);
    renderer.render(this.scene, this.cam);
  }

  dispose() {
    this.rtA.dispose(); this.rtB.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
