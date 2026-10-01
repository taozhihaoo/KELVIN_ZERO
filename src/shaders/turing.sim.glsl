// Gray–Scott reaction–diffusion step (Karl Sims recipe).
uniform sampler2D uTex; uniform vec2 uTexel; uniform float uF,uK,uBrush; uniform vec2 uMouse; uniform float uAspect;
varying vec2 vUv;
vec2 S(vec2 o){ return texture2D(uTex,vUv+o*uTexel).rg; }
void main(){
  vec2 c=S(vec2(0.));
  vec2 lap=-c + (S(vec2(1,0))+S(vec2(-1,0))+S(vec2(0,1))+S(vec2(0,-1)))*.2
              + (S(vec2(1,1))+S(vec2(-1,1))+S(vec2(1,-1))+S(vec2(-1,-1)))*.05;
  float uvv=c.r*c.g*c.g;
  vec2 n=c+vec2(1.0*lap.r-uvv+uF*(1.-c.r), .5*lap.g+uvv-(uF+uK)*c.g);
  if(uBrush>0.){ vec2 d=(vUv-uMouse)*vec2(uAspect,1.); n.g+=smoothstep(uBrush,0.,length(d))*.6; }
  gl_FragColor=vec4(clamp(n,0.,1.),0.,1.); }
