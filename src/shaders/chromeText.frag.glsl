// Liquid-chrome title: canvas text → mipmap height → normals → studio reflections.
// Material is created with glslVersion: THREE.GLSL3 so textureLod is available
// (THREE's GLSL3 prefix defines varying/texture2D/gl_FragColor compatibility macros).
precision highp float;
out vec4 fragColor;
#define gl_FragColor fragColor
varying vec2 vUv;
uniform sampler2D tText;
uniform float uTime;
uniform vec2 uPar;
uniform float uAspect;
void main(){
  float h0 = texture2D(tText, vUv).r;
  vec2 px = vec2(3. / 2048., 3. / 512.);
  float hx = textureLod(tText, vUv + vec2(px.x, 0.), 3.).r;
  float hy = textureLod(tText, vUv + vec2(0., px.y), 3.).r;
  vec3 n = normalize(vec3((h0 - hx) * 42., (h0 - hy) * 42., 1.));
  vec3 vdir = normalize(vec3((vUv - .5 - uPar * .05) * vec2(uAspect, 1.) * 2.4, -1.));
  vec3 r = reflect(vdir, n);
  vec3 env = studio(r);
  float fres = pow(1. - max(dot(n, -vdir), 0.), 3.);
  vec3 col = env * (.78 + .6 * fres);
  col = mix(col, iri(dot(n, vdir) * .9 + uTime * .02 + length(vUv - .5) * .5), .12);
  col += ACID * pow(max(dot(r, normalize(vec3(-.6, .25, .75))), 0.), 40.) * .8;
  float mask = smoothstep(.16, .55, h0);
  gl_FragColor = vec4(col * mask, mask);
}
