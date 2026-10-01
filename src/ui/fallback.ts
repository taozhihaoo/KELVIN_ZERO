import { COPY } from '../config/copy';
import { ROOMS } from '../config/rooms';

/** Pure-DOM page shown when WebGL2 is unavailable (SPEC §1 降级文案). */
export function showFallback() {
  const canvas = document.getElementById('gl');
  if (canvas) (canvas as HTMLCanvasElement).style.display = 'none';
  ['loader', 'hud-top', 'hud-bottom', 'marquee', 'panel', 'cursor'].forEach((id) => {
    document.getElementById(id)?.setAttribute('hidden', '');
  });

  const el = document.getElementById('fallback');
  if (!el) return;
  el.hidden = false;
  el.innerHTML = `
    <h1>${COPY.fallback.title}</h1>
    <p class="msg">${COPY.fallback.msg}<br/><span style="opacity:.6">${COPY.fallback.msgEn}</span></p>
    <p class="msg" style="opacity:.6">${COPY.taglineEn} / ${COPY.taglineZh}</p>
    <div>
      ${ROOMS.map((r) => `
        <div class="fb-room">
          <span class="fb-num">00${r.id}</span>
          <span class="fb-name">${r.nameEn} / ${r.nameZh}</span>
          <span class="fb-line">${r.lineEn} ／ ${r.lineZh} — ${r.tempLabel}</span>
        </div>`).join('')}
    </div>
  `;
}
