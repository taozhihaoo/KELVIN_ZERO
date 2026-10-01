attribute float aSeed;
varying float vTw;
uniform float uTime;
void main(){
  vTw = .35 + .65 * (sin(uTime * (0.6 + fract(aSeed) * 1.7) + aSeed * 37.) * .5 + .5);
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = (1.2 + fract(aSeed * 7.) * 2.) * (14. / max(1., -mv.z));
  gl_Position = projectionMatrix * mv;
}
