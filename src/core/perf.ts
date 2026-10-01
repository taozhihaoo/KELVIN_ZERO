// Adaptive quality: 60-frame average; >22ms for 2s → tier down, <14ms for 5s → tier up.
export type Tier = 'high' | 'mid' | 'low';

export interface QualityParams {
  curlN: number;      // GPGPU texture edge (particles = N²)
  latticeN: number;   // lattice grid edge (instances = N²)
  rdSize: number;     // reaction-diffusion texture edge
  rdSteps: number;    // RD steps per frame
  renderScale: number; // raymarched rooms render scale
  useBloom: boolean;
  useReflector: boolean;
}

export const TIERS: Record<Tier, QualityParams> = {
  high: { curlN: 1024, latticeN: 200, rdSize: 512, rdSteps: 8, renderScale: 0.75, useBloom: true, useReflector: true },
  mid: { curlN: 512, latticeN: 140, rdSize: 384, rdSteps: 4, renderScale: 0.6, useBloom: true, useReflector: true },
  low: { curlN: 256, latticeN: 90, rdSize: 256, rdSteps: 2, renderScale: 0.45, useBloom: false, useReflector: false },
};

const ORDER: Tier[] = ['low', 'mid', 'high'];

export class Perf {
  tier: Tier;
  params: QualityParams;
  fps = 60;
  private dts: number[] = [];
  private slowT = 0;
  private fastT = 0;
  private cbs = new Set<(t: Tier) => void>();

  constructor() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const cores = navigator.hardwareConcurrency || 8;
    this.tier = coarse ? 'low' : cores <= 4 ? 'mid' : 'high';
    this.params = TIERS[this.tier];
  }

  onTier(cb: (t: Tier) => void): () => void {
    this.cbs.add(cb);
    return () => this.cbs.delete(cb);
  }

  setTier(t: Tier) {
    if (t === this.tier) return;
    this.tier = t;
    this.params = TIERS[t];
    this.cbs.forEach((cb) => cb(t));
  }

  /** dtMs: real frame delta */
  frame(dtMs: number) {
    this.dts.push(dtMs);
    if (this.dts.length > 60) this.dts.shift();
    const avg = this.dts.reduce((a, b) => a + b, 0) / this.dts.length;
    this.fps = Math.round(1000 / Math.max(avg, 1e-3));

    if (avg > 22) this.slowT += dtMs; else this.slowT = 0;
    if (avg < 14) this.fastT += dtMs; else this.fastT = 0;

    if (this.slowT > 2000) {
      const i = ORDER.indexOf(this.tier);
      if (i > 0) this.setTier(ORDER[i - 1]);
      this.slowT = 0; this.fastT = 0;
    } else if (this.fastT > 5000) {
      const i = ORDER.indexOf(this.tier);
      if (i < ORDER.length - 1) this.setTier(ORDER[i + 1]);
      this.fastT = 0;
    }
  }
}
