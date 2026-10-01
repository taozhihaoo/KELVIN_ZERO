// Drifting dust; brighter inside the beam ring radius.
attribute float aSeed;
uniform float uTime;
varying float vA;
void main(){
  vec3 p = position;
  p.x += sin(uTime * .12 + aSeed * 17.) * .9;
  p.y += sin(uTime * .07 + aSeed * 29.) * .6 + fract(aSeed * 3.7);
  p.z += cos(uTime * .1 + aSeed * 23.) * .9;
  float inner = 1. - smoothstep(4.5, 9.5, length(position.xz));
  vA = (.12 + .5 * inner) * (.5 + .5 * sin(uTime * (1. + fract(aSeed) * 2.) + aSeed * 41.));
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_PointSize = (1. + fract(aSeed * 5.3) * 2.2) * (10. / max(1., -mv.z));
  gl_Position = projectionMatrix * mv;
}
