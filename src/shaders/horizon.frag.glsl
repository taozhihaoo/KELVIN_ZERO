precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime, uMass, uDisk; uniform vec3 uCam, uRight, uUp, uFwd;
vec3 stars(vec3 d){
  vec3 col=vec3(0.);
  for(int i=0;i<2;i++){ float sc=(i==0)?50.:110.; vec3 p=d*sc; vec3 id=floor(p), f=fract(p)-.5;
    float h=hash13(id+float(i)*17.); float s=smoothstep(.12,0.,length(f))*step(.975,h);
    col+=mix(FROST,BONE,hash13(id+3.1))*s*(1.5+2.*hash13(id+7.7)); }
  float band=exp(-pow(d.y*3.+.3*sin(d.x*3.),2.)*2.);
  col+=FROST*.06*band*fbm2(d.xz*6.+d.y*3.);
  return col; }
void main(){
  vec2 uv=(vUv-.5)*vec2(uRes.x/uRes.y,1.);
  vec3 rd=normalize(uv.x*uRight+uv.y*uUp+1.6*uFwd);
  vec3 p=uCam, v=rd; float rs=uMass;
  float h2=dot(cross(p,v),cross(p,v));
  float rIn=2.0*rs, rOut=6.5*rs; vec3 col=vec3(0.); float ring=0.; bool hit=false;
  for(int i=0;i<150;i++){
    float r=length(p);
    if(r<rs){ hit=true; break; }
    if(r>30.&&dot(p,v)>0.) break;
    float dt=clamp(.06*r,.02,.5);
    ring+=exp(-abs(r-1.5*rs)*7.)*dt*.5;
    v=normalize(v+(-1.5*rs*h2*p/(r*r*r*r*r))*dt);
    vec3 pn=p+v*dt;
    if(p.y*pn.y<0.){
      float tt=p.y/(p.y-pn.y); vec3 q=mix(p,pn,tt); float rr=length(q.xz);
      if(rr>rIn&&rr<rOut){
        float ang=atan(q.z,q.x);
        float n=fbm2(vec2(rr*5., ang*3.+uTime*(1.4/sqrt(rr))));
        float dens=smoothstep(rIn,rIn+.3,rr)*smoothstep(rOut,rIn+.8,rr)*(.35+.9*n);
        vec3 vel=normalize(vec3(-q.z,0.,q.x));
        float dop=1.+.65*dot(vel,-v);
        float tc=clamp((rr-rIn)/(rOut-rIn),0.,1.);
        vec3 dc=mix(mix(BONE*1.6,ACID,smoothstep(0.,.35,tc)),FROST*.7,smoothstep(.3,1.,tc));
        col+=dc*dens*pow(max(dop,0.),3.)*.55*uDisk; } }
    p=pn; }
  if(!hit) col+=stars(normalize(v));
  col+=mix(BONE,ACID,.3)*ring*.45;
  col=1.-exp(-col*1.35);
  gl_FragColor=vec4(pow(max(col,0.),vec3(2.2)),1.); }
