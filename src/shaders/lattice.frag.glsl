// Pillar shading: INK valleys → frost mid → acid crests, rim light + distance fog.
varying vec3 vWorld;
varying vec3 vNrm;
varying float vH;
uniform float uFogNear, uFogFar;
void main(){
  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNrm);
  float rim = pow(1.-max(dot(N,V),0.), 2.6);
  vec3 col = INK*1.6 + FROST*.02;
  col = mix(col, FROST*.5, smoothstep(.5, 1.8, vH)*.4);
  col = mix(col, ACID, smoothstep(1.1, 2.3, vH)*.75);
  col *= 1. + max(N.y, 0.)*.3;
  col += FROST*rim*.35;
  col += ACID*rim*smoothstep(1.2, 2.2, vH)*.5;
  float dist = length(cameraPosition - vWorld);
  col = mix(col, INK, smoothstep(uFogNear, uFogFar, dist));
  gl_FragColor = vec4(max(col, 0.), 1.);
}
