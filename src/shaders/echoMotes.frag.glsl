varying float vTw;
void main(){
  float d = length(gl_PointCoord - .5);
  float a = smoothstep(.5, .1, d) * vTw * .8;
  gl_FragColor = vec4(FROST * a, 1.);
}
