// All UI copy (single source, SPEC §1).
export const COPY = {
  brand: 'KELVIN ZERO°',
  brandSub: '零度美术馆',
  taglineEn: 'A gallery of computed phenomena.',
  taglineZh: '一座陈列「被计算出来的现象」的美术馆。',
  subEn: 'At zero, only mathematics remains.',
  subZh: '在零度，只剩数学。',

  hud: {
    select: 'SELECT AN EXHIBIT / 选择展品',
    atrium: 'ATRIUM / 中庭 — DRAG · WHEEL · ← →',
    index: 'INDEX / 索引',
    esc: 'ESC — ATRIUM',
    enterHint: 'ENTER ↵',
    manifesto: 'MANIFESTO ↗',
    close: 'CLOSE ✕',
    dragHint: 'DRAG · WHEEL · ← →',
    enableSound: 'ENABLE SOUND / 开启声音',
  },

  loader: {
    enter: 'ENTER GALLERY ↵',
    enterSilent: 'ENTER SILENT',
  },

  manifesto: {
    title: 'MANIFESTO / 策展声明',
    lines: [
      {
        en: 'We believe every phenomenon can be written as an equation.',
        zh: '我们相信，每一个现象都可以被写成一个公式。',
      },
      {
        en: 'As temperature falls to zero, noise exits and structure appears — fluids become sculpture, particles become grammar, sound becomes terrain.',
        zh: '当温度降至零，噪声退场，结构显形——流体变成雕塑，粒子变成语法，声音变成地形。',
      },
      {
        en: 'KELVIN ZERO is a pavilion that exists only inside the GPU. Exhibits are never collected; they are computed.',
        zh: 'KELVIN ZERO 是一座只存在于 GPU 中的展馆。展品不会被收藏，只会被计算。',
      },
    ],
  },

  marquee: [
    'GPGPU', 'RAYMARCHING', 'SDF', 'FFT', 'CURL NOISE', 'REACTION–DIFFUSION',
    'GEODESIC LENSING', 'INSTANCED GRIDS', 'VORONOI FROST', 'PING-PONG FBO',
    'STRANGE ATTRACTORS', 'WEB AUDIO SYNTH', 'DOPPLER BEAMING',
    'PROCEDURAL HDRIS', 'ZERO EXTERNAL ASSETS',
  ],

  fallback: {
    title: 'KELVIN ZERO',
    msg: 'KELVIN ZERO — 此展馆需要 WebGL2。请使用最新版 Chrome / Edge / Firefox / Safari 访问。',
    msgEn: 'This pavilion requires WebGL2. Please visit with an up-to-date Chrome / Edge / Firefox / Safari.',
  },

  indexStats: '6 EXHIBITS · 4 RAYMARCHED / SIMULATED ON GPU · 0 EXTERNAL ASSETS',
} as const;
