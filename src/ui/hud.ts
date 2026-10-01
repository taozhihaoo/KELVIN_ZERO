import gsap from 'gsap';
import { countTo, maskRise, fadeUp } from './text';
import { COPY } from '../config/copy';
import { ATRIUM_TEMP_K, type RoomMeta } from '../config/rooms';
import type { Route } from '../core/router';
import { T } from '../config/timings';

export interface HudDeps {
  onIndex: () => void;
  onSound: () => void;
  onZero: () => void;
}

let fmtTemp: (k: number) => string = (k) => (k >= 1 ? k.toFixed(2) : k.toFixed(3)) + ' K';

/** HUD chrome: top bar, bottom bar, temp readout, info block, hints. */
export class HUD {
  private routeEl: HTMLElement;
  private tempEl: HTMLElement;
  private perfFps: HTMLElement;
  private perfTier: HTMLElement;
  private perfXY: HTMLElement;
  private info: HTMLElement;
  private hint: HTMLElement;
  private soundBtn: HTMLElement;
  private zeroBtn: HTMLElement;
  private indexBtn: HTMLElement;
  private manifestoBtn: HTMLElement;
  private shownTemp = ATRIUM_TEMP_K;
  private zeroActive = false;
  private pendingTempK: number | null = ATRIUM_TEMP_K;

  constructor(deps: HudDeps) {
    this.routeEl = document.getElementById('hud-route')!;
    this.tempEl = document.getElementById('hud-temp')!;
    this.perfFps = document.getElementById('perf-fps')!;
    this.perfTier = document.getElementById('perf-tier')!;
    this.perfXY = document.getElementById('perf-xy')!;
    this.info = document.getElementById('info-block')!;
    this.hint = document.getElementById('hint-overlay')!;
    this.soundBtn = document.getElementById('btn-sound')!;
    this.zeroBtn = document.getElementById('btn-zero')!;
    this.indexBtn = document.getElementById('btn-index')!;
    this.manifestoBtn = document.getElementById('btn-manifesto')!;

    (document.getElementById('btn-index') as HTMLElement).addEventListener('click', deps.onIndex);
    this.soundBtn.addEventListener('click', deps.onSound);
    this.zeroBtn.addEventListener('click', deps.onZero);
  }

  // ------------------------------------------------------------- routing --

  setRoute(route: Route, meta: RoomMeta | null) {
    let txt: string;
    if (meta) {
      txt = `00${meta.id} / 006 — ${meta.nameEn} / ${meta.nameZh}`;
    } else if (route.name === 'index') {
      txt = COPY.hud.index;
    } else if (route.name === 'atrium') {
      txt = COPY.hud.select;
    } else {
      txt = '';
    }
    this.routeEl.textContent = txt;
    this.manifestoBtn.hidden = route.name !== 'atrium';

    const target = this.zeroActive ? 0 : meta ? meta.tempK : ATRIUM_TEMP_K;
    this.rollTemp(target, meta?.tempLabel);
  }

  // ---------------------------------------------------------------- temp --

  private rollTemp(k: number, exactLabel?: string) {
    this.pendingTempK = k;
    this.tempEl.classList.toggle('frozen', this.zeroActive);
    const from = this.shownTemp;
    countTo(this.tempEl, from, k, T.counterDur, (v) => {
      this.shownTemp = v;
      return fmtTemp(v);
    });
    if (exactLabel && k < 0.01) {
      // tiny kelvin values read better as their physics label
      window.setTimeout(() => {
        if (this.pendingTempK === k && !this.zeroActive) {
          this.tempEl.textContent = exactLabel;
          this.shownTemp = k;
        }
      }, T.counterDur * 1000 + 30);
    }
  }

  setZeroActive(on: boolean, roomTemp: number | null, roomLabel?: string) {
    this.zeroActive = on;
    this.zeroBtn.classList.toggle('active', on);
    if (on) this.rollTemp(0);
    else this.rollTemp(roomTemp ?? ATRIUM_TEMP_K, roomLabel);
  }

  setSound(on: boolean) {
    this.soundBtn.textContent = on ? 'SOUND ON' : 'SOUND OFF';
    this.soundBtn.classList.toggle('active', on);
  }

  /** persistent highlight while the index page is the current route */
  setIndexActive(on: boolean) {
    this.indexBtn.classList.toggle('active', on);
  }

  // ----------------------------------------------------------- info block --

  showInfoBlock(meta: RoomMeta, countLabel?: string) {
    this.info.hidden = false;
    this.info.innerHTML = `
      <div class="info-num" data-i="num">EXHIBIT 00${meta.id} — ${meta.tempLabel}</div>
      <h2 class="info-name" data-i="name">${meta.nameEn}</h2>
      <div class="info-zh" data-i="zh">${meta.nameZh} · KELVIN ${meta.tempLabel}</div>
      <p class="info-line-en" data-i="le">${meta.lineEn}</p>
      <p class="info-line-zh" data-i="lz">${meta.lineZh}</p>
      ${countLabel ? `<div class="info-count" data-i="count">${countLabel}</div>` : ''}
      <ul class="info-tech" data-i="tech">${meta.tech.map((t) => `<li>${t}</li>`).join('')}</ul>
      <div class="info-hint" data-i="hint">${meta.hints}${COPY.hud.esc ? ' · ' + COPY.hud.esc : ''}</div>
    `;
    const q = (s: string) => this.info.querySelector(s) as HTMLElement;
    maskRise(q('[data-i=name]'), { stagger: 0.024 });
    fadeUp(q('[data-i=num]'), 0.08, 10);
    fadeUp(q('[data-i=zh]'), 0.14, 10);
    fadeUp(q('[data-i=le]'), 0.2, 12);
    fadeUp(q('[data-i=lz]'), 0.26, 12);
    fadeUp(q('[data-i=tech]'), 0.3, 14);
    fadeUp(q('[data-i=hint]'), 0.38, 10);
    if (countLabel) fadeUp(q('[data-i=count]'), 0.42, 10);
  }

  hideInfoBlock() {
    this.info.hidden = true;
    this.info.innerHTML = '';
  }

  updateCountLabel(text: string) {
    const el = this.info.querySelector('[data-i=count]');
    if (el) el.textContent = text;
  }

  // ---------------------------------------------------------------- hints --

  showAtriumSelection(meta: RoomMeta) {
    this.showHint(
      `00${meta.id} ${meta.nameEn} / ${meta.nameZh} — ${meta.tempLabel} — ${meta.lineEn} — ${COPY.hud.enterHint}`,
      Infinity,
    );
  }

  showHint(text: string, seconds: number) {
    this.hint.textContent = text;
    this.hint.hidden = false;
    gsap.fromTo(this.hint, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 });
    window.clearTimeout((this as any)._hintTimer);
    if (!isFinite(seconds)) return;
    (this as any)._hintTimer = window.setTimeout(() => {
      gsap.to(this.hint, { opacity: 0, duration: 0.5, onComplete: () => { this.hint.hidden = true; } });
    }, seconds * 1000);
  }

  // ----------------------------------------------------------------- perf --

  private perfAcc = 0;
  frame(dt: number, x: number, y: number, fps: number, tier: string) {
    this.perfAcc += dt;
    this.perfXY.textContent = `X ${x.toFixed(3)} Y ${y.toFixed(3)}`;
    if (this.perfAcc > 0.5) {
      this.perfAcc = 0;
      this.perfFps.textContent = `${fps} FPS`;
      this.perfTier.textContent = tier.toUpperCase();
    }
  }
}
