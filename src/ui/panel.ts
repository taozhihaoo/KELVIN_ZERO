import { fadeUp } from './text';

export interface PanelSlider {
  type: 'slider';
  label: string;
  min: number; max: number; step: number;
  value: number;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
}
export interface PanelButtons {
  type: 'buttons';
  label: string;
  options: string[];
  value: number; // selected index
  onChange: (index: number) => void;
}
export type PanelControl = PanelSlider | PanelButtons;

/** Floating parameter panel (self-written, SPEC §5.6). */
export class Panel {
  el: HTMLElement;
  private visible = false;

  constructor() {
    this.el = document.getElementById('panel')!;
  }

  set(controls: PanelControl[], title = 'CTRL / 参数') {
    this.el.innerHTML = `<div class="p-head"><span>${title}</span><span>◇</span></div>`;
    for (const c of controls) {
      if (c.type === 'slider') {
        const row = document.createElement('div');
        row.className = 'p-row';
        row.innerHTML = `
          <div class="p-label"><span>${c.label}</span><b data-val></b></div>
          <input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"
                 aria-label="${c.label}" />`;
        const input = row.querySelector('input')!;
        const val = row.querySelector('[data-val]')!;
        const fmt = c.fmt ?? ((v: number) => v.toFixed(2));
        val.textContent = fmt(c.value);
        input.addEventListener('input', () => {
          const v = parseFloat(input.value);
          val.textContent = fmt(v);
          c.onChange(v);
        });
        this.el.appendChild(row);
      } else {
        const row = document.createElement('div');
        row.className = 'p-row';
        row.innerHTML = `<div class="p-label"><span>${c.label}</span></div>`;
        const btns = document.createElement('div');
        btns.className = 'p-btns';
        c.options.forEach((opt, i) => {
          const b = document.createElement('button');
          b.className = 'pbtn' + (i === c.value ? ' active' : '');
          b.textContent = opt;
          b.setAttribute('aria-label', `${c.label} ${opt}`);
          b.addEventListener('click', () => {
            btns.querySelectorAll('.pbtn').forEach((x) => x.classList.remove('active'));
            b.classList.add('active');
            c.onChange(i);
          });
          btns.appendChild(b);
        });
        row.appendChild(btns);
        this.el.appendChild(row);
      }
    }
    if (!this.visible) {
      this.visible = true;
      this.el.hidden = false;
      requestAnimationFrame(() => this.el.classList.add('show'));
      fadeUp(this.el, 0.05);
    }
  }

  clear() {
    if (!this.visible) return;
    this.visible = false;
    this.el.classList.remove('show');
    window.setTimeout(() => { if (!this.visible) this.el.hidden = true; }, 500);
  }
}
