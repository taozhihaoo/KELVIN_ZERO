import gsap from 'gsap';
import { T } from '../config/timings';

/** Global clock: all rooms read t (already time-scaled). Absolute-zero mode eases timeScale → 0.02. */
export class Clock {
  t = 0;
  timeScale = 1;
  zeroActive = false;

  update(realDt: number) {
    this.t += realDt * this.timeScale;
  }

  setZero(on: boolean) {
    this.zeroActive = on;
    gsap.to(this, {
      timeScale: on ? 0.02 : 1,
      duration: on ? 1.6 : 1.2,
      ease: on ? 'power3.out' : 'power2.inOut',
      overwrite: true,
    });
  }
}
