// Instanced lattice field: height field + travelling shockwaves displace pillars.
uniform float uTime, uAmp, uWaveSpeed, uBass, uSpan, uN;
uniform vec4 uShock[4]; // xy grid uv, z start time, w amplitude
attribute vec2 aGrid;
varying vec3 vWorld;
varying vec3 vNrm;
varying float vH;
float hfield(float t){
  float h = vnoise(aGrid*3. + t*.15)*.9;
  h += .55*sin(length(aGrid-.5)*18. - t*1.4);
  h += uBass * .4;
  for(int i=0;i<4;i++){
    vec4 s = uShock[i];
    float age = t - s.z;
    if(s.w <= 0.001 || age < 0.) continue;
    float d = distance(aGrid, s.xy) * uN;      // cell units
    h += s.w * exp(-pow(d - age*9.*uWaveSpeed, 2.)*.5) * exp(-age*.8);
  }
  return max(h, 0.);
}
void main(){
  float h = hfield(uTime);
  float hh = 0.15 + h * uAmp;
  vec3 p = position;
  p.y = (p.y + .5) * hh;
  vec3 wp = vec3((aGrid.x - .5)*uSpan, 0., (aGrid.y - .5)*uSpan);
  vec4 world = modelMatrix * vec4(p + wp, 1.);
  vWorld = world.xyz;
  vNrm = normalize(mat3(modelMatrix) * normal);
  vH = h;
  gl_Position = projectionMatrix * viewMatrix * world;
}
