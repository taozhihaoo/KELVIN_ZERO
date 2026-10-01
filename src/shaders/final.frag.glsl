// Final post: dispersion, vignette breath, grain, frost edges, faint scanlines (SPEC §5.4).
precision highp float;
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform float uTime, uRTime, uVel, uFrost, uGrain, uAberr;
uniform vec2 uRes;
float h12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h12(i),h12(i+vec2(1,0)),f.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
void main(){
  vec2 uv = vUv;
  vec2 c = uv - .5;
  float r2 = dot(c, c);

  // ① radial chromatic aberration — stronger toward edges, with velocity / transition
  float ab = (0.0014 + uVel * 0.005 + uAberr * 0.004) * (0.3 + r2 * 2.4);
  vec3 col;
  col.r = texture2D(tDiffuse, uv + c * ab).r;
  col.g = texture2D(tDiffuse, uv).g;
  col.b = texture2D(tDiffuse, uv - c * ab).b;

  // ⑤ ultra-faint scanlines
  col *= 0.985 + 0.015 * sin(uv.y * uRes.y * 1.35);

  // ② vignette breathing
  float vig = 1.0 - smoothstep(0.42, 1.08, length(c) * (1.0 + 0.045 * sin(uTime * 0.6)));
  col *= mix(0.68, 1.0, vig);

  // ③ film grain (real time — keeps living even inside absolute zero)
  float g = h12(uv * uRes + fract(uRTime * 13.73) * vec2(157.31, 113.97)) - 0.5;
  col += g * uGrain;

  // ④ frost edges — driven by absolute-zero mode
  float rr = length(c) * 1.42;
  float frost = smoothstep(0.55, 1.0, rr + fbm(uv * 8.0 + uTime * 0.02) * 0.25) * uFrost;
  col = mix(col, vec3(0.8, 0.9, 1.0) * (0.5 + fbm(uv * 40.0)), frost * 0.7);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum), uFrost * 0.55);

  gl_FragColor = vec4(col, 1.0);
}
