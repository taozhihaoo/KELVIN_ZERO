// Display plane for the reaction–diffusion heightfield (plane lies on xz after rotation).
varying vec2 vUv;
varying vec3 vWorld;
varying float vV;
uniform sampler2D uTex;
uniform float uAmp;
void main(){
  vUv = uv;
  float v = texture2D(uTex, uv).g;
  vV = v;
  vec3 p = position;
  p.z += v * uAmp;
  vec4 wp = modelMatrix * vec4(p, 1.);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
