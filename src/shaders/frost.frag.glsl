// Voronoi frost crystallization transition (SPEC §5.2).
precision highp float;
varying vec2 vUv;
uniform sampler2D tA, tB; uniform float uP, uAspect; uniform vec2 uOrigin;
vec2 h22(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
vec3 vor(vec2 x){
  vec2 n=floor(x), f=fract(x), mg=vec2(0.), mr=vec2(0.); float md=8.;
  for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
    vec2 g=vec2(float(i),float(j)); vec2 o=h22(n+g); vec2 r=g+o-f; float d=dot(r,r);
    if(d<md){ md=d; mr=r; mg=g; } }
  md=8.;
  for(int j=-2;j<=2;j++) for(int i=-2;i<=2;i++){
    vec2 g=mg+vec2(float(i),float(j)); vec2 o=h22(n+g); vec2 r=g+o-f;
    if(dot(mr-r,mr-r)>1e-5) md=min(md,dot(.5*(mr+r),normalize(r-mr))); }
  return vec3(md,h22(n+mg));
}
void main(){
  vec2 asp=vec2(uAspect,1.);
  vec3 v=vor(vUv*asp*14.);
  float dist=length((vUv-uOrigin)*asp);
  float delay=dist*.9+v.y*.35;
  float m=smoothstep(delay,delay+.18,uP*1.7);
  float pulse=sin(m*3.14159);
  vec2 shift=(v.yz-.5)*.025*pulse;
  vec3 a=texture2D(tA,vUv).rgb, b=texture2D(tB,vUv+shift).rgb;
  vec3 col=mix(a,b,step(.5,m));
  float crack=(1.-smoothstep(0.,.05,v.x))*pulse;
  col+=vec3(.784,1.,.18)*crack*2.2 + vec3(.56,.66,1.)*pulse*.15;
  gl_FragColor=vec4(col,1.);
}
