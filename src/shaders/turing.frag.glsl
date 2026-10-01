// Chrome heightfield lighting: finite-difference normals + studio reflections + iridescence.
varying vec2 vUv;
varying vec3 vWorld;
varying float vV;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform float uTime;
void main(){
  float hL=texture2D(uTex, vUv-vec2(uTexel.x,0.)).g;
  float hR=texture2D(uTex, vUv+vec2(uTexel.x,0.)).g;
  float hD=texture2D(uTex, vUv-vec2(0.,uTexel.y)).g;
  float hU=texture2D(uTex, vUv+vec2(0.,uTexel.y)).g;
  // plane local frame: x -> world x, y -> world -z, height -> world y
  vec3 nLocal=normalize(vec3(hL-hR, hD-hU, .12));
  vec3 n=normalize(vec3(nLocal.x, nLocal.z, -nLocal.y));
  vec3 V=normalize(cameraPosition - vWorld);
  if(dot(n,V)<0.) n=-n;
  vec3 R=reflect(-V,n);
  float fres=pow(1.-max(dot(n,V),0.),3.);
  vec3 refl=vec3(studio(R+vec3(.015,0.,0.)).r, studio(R).g, studio(R-vec3(.015,0.,0.)).b);
  vec3 base=INK*1.2 + FROST*.03;
  float lift=.22+.78*smoothstep(.08,.55,vV);
  vec3 col=mix(base, refl*.5*lift, .38+.32*smoothstep(0.,.4,vV));
  col*=mix(vec3(1.), iri(vV*1.3+uTime*.02), .14);
  col+=ACID*smoothstep(.55,.97,vV)*.5;
  col+=FROST*(1.-smoothstep(.05,.4,vV))*.1;
  col=1.-exp(-col*1.15);
  gl_FragColor=vec4(max(col,0.),1.);
}
