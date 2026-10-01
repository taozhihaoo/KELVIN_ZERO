import gsap from 'gsap';
import { COPY } from '../config/copy';
import { maskRise, fadeUp } from './text';
import { cursor } from './cursor';

function gsapSafe(el: HTMLElement, from: any, to: any) {
  gsap.fromTo(el, from, to);
}

/** Full-screen bilingual manifesto overlay (atrium, bottom-left button). */
export class Manifesto {
  el: HTMLElement;
  isOpen = false;
  private closeBtn: HTMLElement;

  constructor(onRequestClose: () => void) {
    this.el = document.getElementById('manifesto')!;
    const m = COPY.manifesto;
    this.el.innerHTML = `
      <div class="mani-inner">
        <div class="mani-tag">KELVIN ZERO — CURATORIAL STATEMENT</div>
        <h2 data-mani-title>${m.title}</h2>
        <div class="mani-cols">
          <div class="mani-en">
            ${m.lines.map((l) => `<p data-mani-en>${l.en}</p>`).join('')}
            <p style="opacity:.55;margin-top:1.4em">${COPY.taglineEn}<br/>${COPY.subEn}</p>
          </div>
          <div class="mani-zh">
            ${m.lines.map((l) => `<p data-mani-zh>${l.zh}</p>`).join('')}
            <p style="opacity:.55;margin-top:1.4em">${COPY.taglineZh}<br/>${COPY.subZh}</p>
          </div>
        </div>
      </div>`;
    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'manifesto-close';
    this.closeBtn.dataset.cursor = 'CLOSE';
    this.closeBtn.setAttribute('aria-label', '关闭策展声明');
    this.closeBtn.textContent = COPY.hud.close;
    this.el.appendChild(this.closeBtn);
    this.closeBtn.addEventListener('click', () => onRequestClose());
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.el.hidden = false;
    gsapSafe(this.el, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    maskRise(this.el.querySelector('[data-mani-title]')!, { stagger: 0.02 });
    this.el.querySelectorAll('[data-mani-en]').forEach((p, i) => fadeUp(p as HTMLElement, 0.25 + i * 0.14, 22));
    this.el.querySelectorAll('[data-mani-zh]').forEach((p, i) => fadeUp(p as HTMLElement, 0.45 + i * 0.14, 22));
    this.closeBtn.focus();
    cursor.current?.setHot(true, 'CLOSE');
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    cursor.current?.setHot(false);
    const el = this.el;
    gsapSafe(el, { opacity: 1 }, {
      opacity: 0, duration: 0.3,
      onComplete: () => { el.hidden = true; },
    });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }
}
