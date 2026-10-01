// Shared GLSL — concatenated into fragment shaders via string join (SPEC §5.3).
#define PI 3.14159265359
const vec3 INK = vec3(.02, .02, .027);
const vec3 BONE = vec3(.925, .918, .894);
const vec3 ACID = vec3(.784, 1., .18);
const vec3 FROST = vec3(.56, .66, 1.);

float hash12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
float hash13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }

float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x),f.y); }
float vnoise3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x),mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z); }

float fbm2(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return v; }

vec3 iri(float t){ return .5+.5*cos(6.28318*(vec3(0.,.33,.67)+t)); }

// Procedural "studio HDRI" — reflection content for chrome / mercury materials.
vec3 studio(vec3 d){
  float h=d.y*.5+.5;
  vec3 c=mix(vec3(.01,.012,.02),vec3(.55,.62,.8),pow(h,3.));
  c+=BONE*smoothstep(.93,.99,sin(d.x*4.+d.y*1.5+.5))*smoothstep(-.2,.6,d.y)*1.4;
  c+=ACID*pow(max(dot(d,normalize(vec3(-.6,.25,.75))),0.),24.)*2.2;
  c+=FROST*pow(max(dot(d,normalize(vec3(.7,.1,-.6))),0.),12.)*1.2;
  return c;
}
