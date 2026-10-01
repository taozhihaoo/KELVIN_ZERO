// Exhibit portal: rounded-rect thumbnail with parallax + dispersion, hover frame.
precision highp float;
varying vec2 vUv;
uniform sampler2D tThumb;
uniform float uHover;
uniform vec2 uPar;
float rrect(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.))+min(max(q.x,q.y),0.)-r; }
void main(){
  vec2 p = vUv - .5;
  float d = rrect(p, vec2(.5) - .012, .045);
  float mask = 1. - smoothstep(-.0015, .0015, d);
  vec2 uv = vUv + uPar * .014;
  float ca = .0035 + .012 * uHover;
  vec3 col;
  col.r = texture2D(tThumb, uv + p * ca).r;
  col.g = texture2D(tThumb, uv).g;
  col.b = texture2D(tThumb, uv - p * ca).b;
  col *= .82 + .4 * uHover;
  if (!gl_FrontFacing) col *= .2;
  float frame = 1. - smoothstep(0., .0035, abs(d));
  col += BONE * frame * .1;
  col += ACID * frame * uHover * 1.7;
  float dots = (1. - smoothstep(0., .004, length(abs(p) - vec2(.476)) - .013)) * uHover;
  col += ACID * dots;
  gl_FragColor = vec4(col, mask);
}
