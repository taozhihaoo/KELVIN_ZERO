// Additive volumetric-looking shaft: silhouette falloff + flicker.
precision highp float;
varying vec3 vN;
varying vec3 vW;
varying float vF;
uniform float uTime;
void main(){
  vec3 V = normalize(cameraPosition - vW);
  float sil = pow(1. - abs(dot(normalize(vN), V)), 1.4);
  float flick = .82 + .18 * sin(uTime * 1.7 + vW.x * 2.1);
  float a = smoothstep(.05, .5, vF) * (1. - vF) * (.25 + .75 * sil) * .3 * flick;
  gl_FragColor = vec4(FROST * a + ACID * a * .12, a);
}
