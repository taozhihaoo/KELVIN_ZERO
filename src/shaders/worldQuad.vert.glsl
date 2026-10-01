// For quads that live inside a 3D world (portals, chrome text, waterfall...).
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
