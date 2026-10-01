// Index-page hover preview: thumb with velocity-driven wobble + dispersion.
precision highp float;
varying vec2 vUv;
uniform sampler2D tThumb;
uniform float uVel, uOpacity, uTime;
void main(){
  vec2 uv = vUv;
  uv.x += sin(uv.y * 9. + uTime * 2.2) * .014 * uVel;
  uv.y += cos(uv.x * 7. + uTime * 1.7) * .01 * uVel;
  float ca = .004 + .022 * uVel;
  vec3 col;
  col.r = texture2D(tThumb, uv + vec2(ca, 0.)).r;
  col.g = texture2D(tThumb, uv).g;
  col.b = texture2D(tThumb, uv - vec2(ca, 0.)).b;
  gl_FragColor = vec4(col, uOpacity);
}
