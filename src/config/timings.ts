// All durations / easings live here (SPEC §2 动效语言).
export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const T = {
  // easings
  easeEnter: 'power3.out',
  easeTransition: 'expo.inOut',
  easeDecay: 'expo.out',

  // loader
  loaderMinVisible: 2.2,

  // frost transition
  transition: 1.6,
  transitionReduced: 0.5,

  // text
  textDur: 0.7,
  textStagger: 0.016,

  // numbers
  counterDur: 1.15,

  // cursor
  cursorLerp: 0.16,

  // atrium
  hintSeconds: 3,
  cameraPush: 0.5,
  ringSnapLerp: 0.14,

  // effects
  pulseDecay: 1.15,
  burstDecay: 1.2,
} as const;

export function transitionDuration(): number {
  return REDUCED_MOTION ? T.transitionReduced : T.transition;
}
