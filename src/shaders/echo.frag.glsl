// Joy-Division style occlusion lines: INK body, acid row lines, brighter with height.
varying vec2 vUv;
varying float vH;
void main(){
  float rowCoord = vUv.y * 63.;
  float line = 1. - smoothstep(0., .08, abs(fract(rowCoord + .5) - .5));
  vec3 col = INK * 1.6;
  col += ACID * line * (.22 + vH * 2.1);
  col += FROST * line * smoothstep(.55, 1., vH) * .5;
  gl_FragColor = vec4(col, 1.);
}
