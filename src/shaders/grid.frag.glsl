// Atrium floor overlay: radial fade, hairline grid, faint frost noise.
precision highp float;
varying vec2 vUv;
void main(){
  vec2 p = (vUv - .5) * 2.;
  float r = length(p);
  vec3 col = INK;
  vec2 g = abs(fract(vUv * 28.) - .5);
  float line = 1. - smoothstep(0., .05, min(g.x, g.y));
  col += BONE * line * .045;
  col += FROST * fbm2(vUv * 7.) * .012;
  float fade = 1. - smoothstep(.5, 1.02, r);
  gl_FragColor = vec4(col * fade, fade * .9);
}
