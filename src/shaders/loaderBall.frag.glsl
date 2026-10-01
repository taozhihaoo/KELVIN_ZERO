precision highp float;
varying vec2 vUv;
uniform float uProgress, uTime;
float h21(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<4;i++){ v+=a*vn(p); p*=2.03; a*=.5; } return v; }
vec3 studioBall(vec3 d, float cool){
  float h=d.y*.5+.5;
  vec3 c=mix(vec3(.01,.012,.02),vec3(.55,.62,.8),pow(h,3.));
  c+=vec3(1.,.24,.18)*pow(max(dot(d,normalize(vec3(-.6,.25,.75))),0.),24.)*2.2;   // molten key light
  c+=vec3(.56,.66,1.)*pow(max(dot(d,normalize(vec3(.7,.1,-.6))),0.),12.)*1.2;
  c+=mix(vec3(1.,.42,.18),vec3(.9,.95,1.),cool)*smoothstep(.93,.99,sin(d.x*4.+d.y*1.5+.5))*1.4;
  return c;
}
void main(){
  vec2 uv=(vUv-.5)*2.;
  float r=length(uv);
  if(r>1.){ gl_FragColor=vec4(0.,0.,0.,0.); return; }
  float z=sqrt(max(0.,1.-r*r));
  vec3 n=normalize(vec3(uv,z));
  float crust=fbm(uv*3.4+uTime*.08);
  vec3 vdir=normalize(vec3(uv,-1.2));
  vec3 refl=reflect(vdir,n);
  vec3 col=studioBall(refl,uProgress);
  float fres=pow(1.-z,3.);
  // molten core leaking through cracks cools into frost white
  vec3 hot=vec3(1.,.32,.1)*(1.1+crust*.8);
  vec3 cold=vec3(.82,.88,1.)*(.55+crust*.5);
  vec3 body=mix(hot,cold,uProgress);
  col=mix(col,body,.55);
  col+=vec3(1.,.5,.2)*fres*(1.-uProgress)*.9;
  col+=vec3(.56,.66,1.)*fres*uProgress*.5;
  float a=smoothstep(1.,.96,r);
  gl_FragColor=vec4(col,a);
}
