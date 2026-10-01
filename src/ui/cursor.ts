import type { Input } from '../core/input';

/**
 * Fine crosshair + lagging box, mix-blend difference; contextual labels via
 * [data-cursor] attributes or direct calls from 3D hovers. Disabled on touch.
 *
 * Driven directly by pointermove (NOT the rAF loop) so it also tracks while the
 * loader sequence runs and while the tab throttles rendering; the box lag is a
 * CSS transform transition instead of a JS lerp.
 */
class Cursor {
  private root: HTMLElement;
  private cross: HTMLElement;
  private box: HTMLElement;
  private label: HTMLElement;
  private visible = false;
  enabled = !window.matchMedia('(pointer: coarse)').matches;

  constructor(private input: Input) {
    this.root = document.getElementById('cursor')!;
    this.cross = document.getElementById('cursor-cross')!;
    this.box = document.getElementById('cursor-box')!;
    this.label = document.getElementById('cursor-label')!;
    if (!this.enabled) {
      this.root.style.display = 'none';
      return;
    }
    // hide the OS cursor only once the custom one is live
    document.documentElement.classList.add('custom-cursor');

    window.addEventListener('pointermove', this.onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => this.show(false));
    document.documentElement.addEventListener('mouseenter', () => this.show(true));
    window.addEventListener('pointerover', (e) => {
      const t = (e.target as Element | null)?.closest?.('[data-cursor]') as HTMLElement | null;
      this.setHot(!!t, t?.dataset.cursor ?? '');
    });
  }

  private onMove = () => {
    const { px, py } = this.input;
    this.show(true);
    const t = `translate(${px}px, ${py}px) translate(-50%, -50%)`;
    this.cross.style.transform = t;
    this.box.style.transform = t;
  };

  private show(on: boolean) {
    if (on === this.visible) return;
    this.visible = on;
    this.root.classList.toggle('visible', on);
  }

  setHot(on: boolean, label = '') {
    if (!this.enabled) return;
    this.box.classList.toggle('hot', on);
    this.label.textContent = on ? label : '';
  }
}

export const cursor = { current: null as Cursor | null };
export function initCursor(input: Input): Cursor {
  cursor.current = new Cursor(input);
  return cursor.current;
}
