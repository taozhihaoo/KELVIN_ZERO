precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime, uPulse, uWarp; uniform vec3 uMouse3;
float smin(float a,float b,float k){ float h=max(k-abs(a-b),0.)/k; return min(a,b)-h*h*k*.25; }
float map(vec3 p){
  float t=uTime*.4;
  float d=length(p)-1.1;
  d+=uWarp*.12*sin(p.x*3.+t)*sin(p.y*3.+t*1.3)*sin(p.z*3.-t*.7);
  d+=uWarp*.05*sin(p.x*9.+t*2.)*sin(p.y*9.-t*1.7)*sin(p.z*9.+t);
  d+=uPulse*.1*sin(length(p)*8.-uTime*6.);
  for(int i=0;i<5;i++){ float fi=float(i);
    vec3 c=vec3(sin(t*(.6+fi*.17)+fi*2.1)*1.9, cos(t*(.5+fi*.11)+fi)*1.1, sin(t*(.4+fi*.13)+fi*1.3)*1.5);
    d=smin(d,length(p-c)-(.35+.08*sin(fi*3.+t)),.6); }
  d=smin(d,length(p-uMouse3)-.45,.7);
  return d; }
vec3 nrm(vec3 p){ const vec2 k=vec2(1.,-1.); float e=.0015;
  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e)); }
void main(){
  vec2 uv=(vUv-.5)*vec2(uRes.x/uRes.y,1.);
  vec3 ro=vec3(0.,0.,5.5), rd=normalize(vec3(uv,-1.9));
  float t=0.,d=0.,glow=0.; bool hit=false;
  for(int i=0;i<90;i++){ d=map(ro+rd*t); glow+=exp(-abs(d)*6.)*.015; if(d<.001){hit=true;break;} t+=d*.9; if(t>14.)break; }
  vec3 col=mix(INK*.6,INK*2.+FROST*.04,smoothstep(1.2,0.,length(uv)));
  if(hit){ vec3 p=ro+rd*t, n=nrm(p), r=reflect(rd,n); float fr=pow(1.+dot(rd,n),3.);
    vec3 refl=vec3(studio(r+vec3(.02,0.,0.)).r, studio(r).g, studio(r-vec3(.02,0.,0.)).b);
    col=refl*(.55+.45*fr); col*=mix(vec3(1.),iri(dot(n,-rd)*1.2+uTime*.03),.18); }
  col+=ACID*glow*.5;
  // shader computes in sRGB-ish space; encode to linear so OutputPass restores the look
  gl_FragColor=vec4(pow(max(col,0.),vec3(2.2)),1.); }
