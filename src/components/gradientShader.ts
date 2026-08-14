export const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

export const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uDistortion;
uniform float uScale;
uniform float uNoiseAmt;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 p = uv - 0.5;
  p.x *= aspect;

  vec2 mouseP = uMouse - 0.5;
  mouseP.x *= aspect;

  // the whole field bends as one smooth, low-frequency shape — never noise —
  // so it is completely still until the mouse moves.
  vec2 warp;
  warp.x = sin(p.y * 2.0 + 0.4) * 0.1 * uDistortion;
  warp.y = sin(p.x * 2.0 - 0.7) * 0.1 * uDistortion;

  // the mouse pushes the whole color field locally, the mesh points
  // deform around it, nothing shreds into noise and no grid is ever drawn.
  vec2 toMouse = p - mouseP;
  float dist = length(toMouse);
  float radius = 0.65;
  float influence = uMouseInfluence * smoothstep(radius, 0.0, dist);
  vec2 pushDir = toMouse / max(dist, 0.0001);
  vec2 push = pushDir * influence * influence * 0.5;

  vec2 wp = p + warp + push;

  // an invisible mesh of 3 color anchor points, blended smoothly across
  // the whole canvas — this is the actual "gradient mesh" technique.
  vec2 pt1 = vec2(-0.5, 0.42);
  vec2 pt2 = vec2(0.55, 0.4);
  vec2 pt3 = vec2(0.05, -0.5);

  float sigma = 0.55 * uScale;
  float w1 = exp(-dot(wp - pt1, wp - pt1) / (2.0 * sigma * sigma));
  float w2 = exp(-dot(wp - pt2, wp - pt2) / (2.0 * sigma * sigma));
  float w3 = exp(-dot(wp - pt3, wp - pt3) / (2.0 * sigma * sigma));

  vec3 color = (uColor1 * w1 + uColor2 * w2 + uColor3 * w3) / max(w1 + w2 + w3, 0.0001);

  float grain = hash(gl_FragCoord.xy) - 0.5;
  color += grain * uNoiseAmt;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, 1.0);
}
`
