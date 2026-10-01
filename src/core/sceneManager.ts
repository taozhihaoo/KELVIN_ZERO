import * as THREE from 'three';
import type { Room, Ctx, BloomSettings } from '../rooms/room';
import { DEFAULT_BLOOM, makeThumb } from '../rooms/room';
import { Transition } from './transition';
import { drawingSize } from './renderer';

/**
 * Owns every room; drives lifecycle (init / enter / leave / update / render)
 * and renders either the current room or the frost blend of two rooms.
 */
export class SceneManager {
  rooms = new Map<string, Room>();
  currentId: string | null = null;
  transitioning = false;
  toId: string | null = null;

  private transition: Transition;
  private fromRoom: Room | null = null;
  private toRoom: Room | null = null;

  onSettled: ((id: string) => void) | null = null;   // transition finished, room fully in
  onTransitionStart: ((from: string, to: string) => void) | null = null;
  onBloom: ((b: BloomSettings) => void) | null = null;

  constructor(private ctx: Ctx) {
    const s = drawingSize(ctx.renderer);
    this.transition = new Transition(s.x, s.y);
  }

  register(room: Room) {
    this.rooms.set(room.id, room);
  }

  get current(): Room | null {
    return this.currentId ? this.rooms.get(this.currentId) ?? null : null;
  }

  /** enter a room without transition (boot / initial route) */
  enterImmediate(id: string) {
    const room = this.rooms.get(id);
    if (!room || this.currentId === id) return;
    this.currentId = id;
    room.enter();
    this.onBloom?.((room as any).bloom ?? DEFAULT_BLOOM);
    this.onSettled?.(id);
  }

  /** frost-wipe from current room to `id`; origin = uv (0..1, y up) */
  go(id: string, origin: { x: number; y: number }) {
    if (this.transitioning || !this.rooms.has(id) || this.currentId === id) return;
    const from = this.current;
    const to = this.rooms.get(id)!;
    if (!from) { this.enterImmediate(id); return; }

    this.transitioning = true;
    this.toId = id;
    this.fromRoom = from;
    this.toRoom = to;
    this.transition.origin.set(origin.x, origin.y);
    this.onTransitionStart?.(from.id, id);
    to.enter(); // target starts living under the frost immediately
    this.onBloom?.((to as any).bloom ?? DEFAULT_BLOOM);

    this.transition.run(() => {
      from.leave();
      this.currentId = id;
      this.transitioning = false;
      this.fromRoom = null;
      this.toRoom = null;
      this.onSettled?.(id);
    });
  }

  update(t: number, dt: number) {
    this.current?.update(t, dt);
    if (this.transitioning && this.toRoom) this.toRoom.update(t, dt);
  }

  renderInto(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget | null) {
    if (!this.transitioning || !this.fromRoom || !this.toRoom) {
      this.current?.render(renderer, target);
      return;
    }
    this.fromRoom.render(renderer, this.transition.rtA);
    this.toRoom.render(renderer, this.transition.rtB);
    const u = this.transition.material.uniforms;
    u.tA.value = this.transition.rtA.texture;
    u.tB.value = this.transition.rtB.texture;
    this.transition.render(renderer, target);
  }

  /** warm a room's thumbnail: run some frames into its thumb RT, then freeze */
  warmThumb(room: Room, frames = 24, startT = 0.4) {
    if (!room.thumb) room.thumb = makeThumb();
    const r = this.ctx.renderer;
    const dt = 1 / 24;
    let t = startT;
    for (let i = 0; i < frames; i++) {
      room.update(t, dt);
      room.render(r, room.thumb);
      t += dt;
    }
  }

  resize(w: number, h: number) {
    const s = drawingSize(this.ctx.renderer);
    this.transition.setSize(s.x, s.y);
    this.rooms.forEach((room) => room.resize(w, h));
  }

  dispose() {
    this.rooms.forEach((r) => r.dispose());
    this.rooms.clear();
    this.transition.dispose();
  }
}
