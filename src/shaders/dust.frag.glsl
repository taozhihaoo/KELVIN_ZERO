precision highp float;
varying float vA;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .08, d) * vA;
  gl_FragColor = vec4(BONE * a * .8 + FROST * a * .3, a);
}
