import * as THREE from 'three';
import quadVert from '../shaders/quad.vert.glsl?raw';
import copyFrag from '../shaders/copy.frag.glsl?raw';

const PING_VERT = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
`;

/**
 * Two-RT flip target for feedback simulations (reaction–diffusion etc).
 * Sized square, NearestFilter, RepeatWrapping, float/half-float.
 */
export class PingPong {
  rtA: THREE.WebGLRenderTarget;
  rtB: THREE.WebGLRenderTarget;
  scene = new THREE.Scene();
  cam = new THREE.Camera();
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;

  constructor(public size: number, frag: string, uniforms: Record<string, THREE.IUniform>, type: THREE.TextureDataType) {
    const opts: THREE.RenderTargetOptions = {
      type,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    };
    this.rtA = new THREE.WebGLRenderTarget(size, size, opts);
    this.rtB = new THREE.WebGLRenderTarget(size, size, opts);
    this.material = new THREE.ShaderMaterial({
      vertexShader: PING_VERT,
      fragmentShader: frag,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  get read(): THREE.WebGLRenderTarget { return this.rtA; }
  get write(): THREE.WebGLRenderTarget { return this.rtB; }
  get texture(): THREE.Texture { return this.rtA.texture; }
  swap() { const t = this.rtA; this.rtA = this.rtB; this.rtB = t; }

  /** one simulation step: read → frag → write, then flip */
  step(renderer: THREE.WebGLRenderer) {
    this.material.uniforms.uTex.value = this.rtA.texture;
    renderer.setRenderTarget(this.rtB);
    renderer.render(this.scene, this.cam);
    this.swap();
  }

  /** seed both buffers from a source texture */
  seed(renderer: THREE.WebGLRenderer, src: THREE.Texture) {
    const mat = new THREE.ShaderMaterial({
      vertexShader: PING_VERT,
      fragmentShader: copyFrag,
      uniforms: { tSrc: { value: src } },
      depthTest: false,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    m.frustumCulled = false;
    const s = new THREE.Scene();
    s.add(m);
    for (const rt of [this.rtA, this.rtB]) {
      renderer.setRenderTarget(rt);
      renderer.render(s, this.cam);
    }
    renderer.setRenderTarget(null);
    mat.dispose();
    m.geometry.dispose();
  }

  dispose() {
    this.rtA.dispose(); this.rtB.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
