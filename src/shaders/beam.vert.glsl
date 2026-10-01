// Light-cone vertex: pass world pos, normal, and normalized height.
varying vec3 vN;
varying vec3 vW;
varying float vF;
uniform float uH;
void main(){
  vN = normalize(mat3(modelMatrix) * normal);
  vec4 wp = modelMatrix * vec4(position, 1.);
  vW = wp.xyz;
  vF = clamp(position.y / uH + .5, 0., 1.);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
