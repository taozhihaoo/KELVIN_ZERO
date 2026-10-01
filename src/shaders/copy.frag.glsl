// Blit a texture 1:1 (used for RT init and low-res upscale).
uniform sampler2D tSrc;
varying vec2 vUv;
void main(){ gl_FragColor = texture2D(tSrc, vUv); }
