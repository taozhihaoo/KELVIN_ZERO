// Points vertex: fetch GPGPU position, size by life & distance.
uniform sampler2D tPos;
uniform float uSize;
attribute vec2 aRef;
varying float vLife;
void main(){
  vec4 d = texture2D(tPos, aRef);
  vec4 mv = modelViewMatrix * vec4(d.xyz, 1.);
  float life = clamp(d.w, 0., 1.5);
  vLife = d.w;
  gl_PointSize = uSize * (.35 + .65 * life) * (10. / max(1., -mv.z));
  gl_Position = projectionMatrix * mv;
}
