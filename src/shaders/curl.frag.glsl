// Soft round sprites; colour ramps FROST → ACID → BONE with life.
varying float vLife;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .12, d);
  if (a < .01) discard;
  float l = clamp(vLife, 0., 1.4);
  vec3 col = mix(FROST, ACID, clamp(l, 0., 1.));
  col = mix(col, BONE, smoothstep(.95, 1.35, l));
  gl_FragColor = vec4(col * a * .22, 1.);
}
