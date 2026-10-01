import type { Input } from '../core/input';
import { T } from '../config/timings';

/**
 * Fine crosshair + lagging box, mix-blend difference; contextual labels via
 * [data-cursor] attributes or direct calls from 3D hovers. Disabled on touch.
 */
class Cursor {
  private root: HTMLElement;
  private cross: HTMLElement;
  private box: HTMLElement;
  private label: HTMLElement;
  private bx = window.innerWidth / 2;
  private by = window.innerHeight / 2;
  private seen = false;
  enabled = !window.matchMedia('(pointer: coarse)').matches;

  constructor(private input: Input) {
    this.root = document.getElementById('cursor')!;
    this.cross = document.getElementById('cursor-cross')!;
    this.box = document.getElementById('cursor-box')!;
    this.label = document.getElementById('cursor-label')!;
    if (!this.enabled) {
      this.root.style.display = 'none';
      document.documentElement.style.cursor = 'auto';
      return;
    }
    window.addEventListener('pointerover', (e) => {
      const t = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      this.setHot(!!t, t?.dataset.cursor ?? '');
    });
  }

  setHot(on: boolean, label = '') {
    if (!this.enabled) return;
    this.box.classList.toggle('hot', on);
    this.label.textContent = on ? label : '';
  }

  update(dt: number) {
    if (!this.enabled) return;
    const { px, py } = this.input;
    if (!this.seen && (px || py)) { this.bx = px; this.by = py; this.seen = true; }
    this.cross.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
    const k = 1 - Math.exp(-dt / T.cursorLerp);
    this.bx += (px - this.bx) * k;
    this.by += (py - this.by) * k;
    this.box.style.transform = `translate(${this.bx}px, ${this.by}px) translate(-50%,-50%)`;
  }
}

export const cursor = { current: null as Cursor | null };
export function initCursor(input: Input): Cursor {
  cursor.current = new Cursor(input);
  return cursor.current;
}
