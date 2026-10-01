import * as THREE from 'three';
import gsap from 'gsap';
import common from '../shaders/common.glsl?raw';
import worldQuadVert from '../shaders/worldQuad.vert.glsl?raw';
import previewFrag from '../shaders/preview.frag.glsl?raw';
import { Subs, makeThumb, type Room, type Ctx, type BloomSettings } from './room';
import { registry } from '../ui/registry';
import { ROOMS } from '../config/rooms';
import { COPY } from '../config/copy';

const BLOOM: BloomSettings = { strength: 0.5, radius: 0.4, threshold: 0.3 };

/**
 * INDEX — giant DOM row list; a WebGL preview card trails the pointer showing
 * the hovered exhibit's live thumbnail, with velocity dispersion.
 */
export function createIndexPage(): Room {
  const thumb = makeThumb();
  const subs = new Subs();
  let ctx: Ctx;
  let scene: THREE.Scene;
  let cam: THREE.PerspectiveCamera;
  let mat: THREE.ShaderMaterial;
  let dom: HTMLElement | null = null;
  let hovered = -1;
  const pos = { x: 0, y: 0 };
  const vel = { v: 0 };
  let lastPx = 0; let lastPy = 0;

  function buildDom() {
    dom = document.createElement('div');
    dom.innerHTML = `
      <ol class="index-list">
        ${ROOMS.map((r, i) => `
          <li class="index-row" data-i="${i}" data-cursor="ENTER" tabindex="0" role="link"
              aria-label="进入展厅 00${r.id} ${r.nameEn}">
            <span class="idx">00${r.id}</span>
            <span class="nm">${r.nameEn}</span>
            <span class="zh">${r.nameZh}</span>
            <span class="tmp">${r.tempLabel}</span>
            <span class="tech">${r.tech[0]}</span>
          </li>`).join('')}
      </ol>
      <div class="index-stats">${COPY.indexStats}</div>`;
    dom.querySelectorAll('.index-row').forEach((el) => {
      const i = parseInt((el as HTMLElement).dataset.i!, 10);
      el.addEventListener('pointerenter', () => {
        hovered = i;
        const room = registry.mgr?.rooms.get(ROOMS[i].key);
        if (room?.thumb) mat.uniforms.tThumb.value = room.thumb.texture;
        gsap.to(mat.uniforms.uOpacity, { value: 1, duration: 0.3, overwrite: true });
        registry.blip?.();
      });
      const go = () => registry.router?.go(`#/room/${ROOMS[i].id}`);
      el.addEventListener('click', go);
      el.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).code === 'Enter') go(); });
    });
    document.getElementById('room-dom')!.appendChild(dom);
  }

  return {
    id: 'index',
    bloom: BLOOM,
    init(c: Ctx) {
      ctx = c;
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(50, 1.6, 0.1, 50);
      cam.position.set(0, 0, 6);
      mat = new THREE.ShaderMaterial({
        vertexShader: worldQuadVert,
        fragmentShader: common + previewFrag,
        uniforms: {
          tThumb: { value: null },
          uVel: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
        transparent: true,
        depthTest: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.625), mat);
      mesh.position.z = 2;
      mesh.frustumCulled = false;
      scene.add(mesh);
      (this as any)._mesh = mesh;
    },
    enter() {
      buildDom();
      const offMove = ctx.input.on('move', () => {});
      subs.add(offMove);
    },
    leave() {
      subs.flush();
      dom?.remove();
      dom = null;
      hovered = -1;
      gsap.killTweensOf(mat.uniforms.uOpacity);
      mat.uniforms.uOpacity.value = 0;
    },
    update(t, dt) {
      mat.uniforms.uTime.value = t;
      // card trails the pointer
      const asp = cam.aspect;
      const tx = ctx.input.x * asp * 3.1;
      const ty = ctx.input.y * 2.3;
      const k = 1 - Math.exp(-dt * 5);
      const px = pos.x + (tx - pos.x) * k;
      const py = pos.y + (ty - pos.y) * k;
      vel.v += (Math.min(1.6, Math.hypot(px - pos.x, py - pos.y) / Math.max(dt, 1e-3) * .35) - vel.v) * k;
      pos.x = px; pos.y = py;
      ((this as any)._mesh as THREE.Mesh).position.set(pos.x, pos.y, 2);
      mat.uniforms.uVel.value = vel.v;
      // refresh preview content at ~15fps while hovering
      if (hovered >= 0) {
        const room = registry.mgr?.rooms.get(ROOMS[hovered].key);
        if (room?.thumb && Math.random() < 0.25) {
          room.update(ctx.clock.t, 1 / 30);
          room.render(ctx.renderer, room.thumb);
        }
      }
    },
    render(r, target) {
      const w = target ? target.width : r.domElement.width;
      const h = target ? target.height : r.domElement.height;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      r.setRenderTarget(target);
      r.clear();
      r.render(scene, cam);
    },
    resize() {},
    thumb,
    dispose() {
      subs.flush();
      dom?.remove();
      mat.dispose();
      thumb.dispose();
    },
  };
}
