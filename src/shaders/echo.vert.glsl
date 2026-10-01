// FFT waterfall terrain: ring-buffer spectrum texture displaces rows.
uniform sampler2D tSpectrum;
uniform float uRow;
varying vec2 vUv;
varying float vH;
void main(){
  vUv = uv;
  float r = floor(uv.y * 63.);
  float texRow = mod(uRow - r, 64.);
  float v = texture2D(tSpectrum, vec2(uv.x, (texRow + .5) / 64.)).r;
  vH = v;
  vec3 p = position;
  p.z += v * 2.6;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}
