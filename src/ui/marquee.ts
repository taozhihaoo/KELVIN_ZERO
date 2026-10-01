import { COPY } from '../config/copy';

/** Looping tech-tag marquee along the bottom edge. */
export function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;
  const half = COPY.marquee.map((m) => `<span>${m} <em>✕</em></span>`).join('');
  track.innerHTML = half + half; // duplicated for a seamless -50% loop
}
