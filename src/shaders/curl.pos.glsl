// GPGPU position update: curl-noise flow field + Aizawa / Thomas / Lorenz attractors.
// (GPUComputationRenderer injects `uniform sampler2D texturePosition;` + `resolution` define itself.)
uniform float uTime,uDt,uSpeed,uBurst;
uniform int uMode;
uniform vec3 uMouse;
uniform float uReset;
vec3 pot(vec3 p){ return vec3(vnoise3(p+vec3(0.,31.4,5.)), vnoise3(p+vec3(17.1,0.,53.)), vnoise3(p+vec3(9.2,41.,0.))); }
vec3 curl(vec3 p){ float e=.1; vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
  vec3 x0=pot(p-dx),x1=pot(p+dx),y0=pot(p-dy),y1=pot(p+dy),z0=pot(p-dz),z1=pot(p+dz);
  return vec3(y1.z-y0.z-(z1.y-z0.y), z1.x-z0.x-(x1.z-x0.z), x1.y-x0.y-(y1.x-y0.x))/(2.*e); }
vec3 aizawa(vec3 s){ float a=.95,b=.7,c=.6,d=3.5,e=.25,f=.1;
  return vec3((s.z-b)*s.x-d*s.y, d*s.x+(s.z-b)*s.y, c+a*s.z-s.z*s.z*s.z/3.-(s.x*s.x+s.y*s.y)*(1.+e*s.z)+f*s.z*s.x*s.x*s.x); }
vec3 thomas(vec3 s){ float b=.208186; return vec3(sin(s.y)-b*s.x, sin(s.z)-b*s.y, sin(s.x)-b*s.z); }
vec3 lorenz(vec3 s){ return vec3(10.*(s.y-s.x), s.x*(28.-s.z)-s.y, s.x*s.y-(8./3.)*s.z); }
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 d=texture2D(texturePosition,uv);
  vec3 p=d.xyz;
  float life=d.w;
  if(uMode==0){
    vec3 v=curl(p*.35+uTime*.05)*1.2;
    vec3 m=uMouse-p;
    v+=m*.6/(1.+dot(m,m));
    p+=v*uDt*uSpeed;
  } else if(uMode==1){
    float S=2.2; p+=aizawa(p/S)*S*uDt*.6;
  } else if(uMode==2){
    float S=.7; p+=thomas(p/S)*S*uDt*3.;
  } else {
    float S=.12; p+=lorenz(p/S)*S*uDt*.35;
  }
  p+=normalize(p+1e-4)*uBurst*.15;
  life-=uDt*.12*(.5+hash12(uv));
  if(life<0.||uReset>.5){
    vec3 r=vec3(hash12(uv+uTime),hash12(uv*1.7+uTime),hash12(uv*2.3+uTime))-.5;
    p=(uMode==0? r*5. : r*1.2+vec3(.1,0.,0.));
    life=.6+hash12(uv*3.1)*.8;
  }
  gl_FragColor=vec4(p,life);
}
