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

  // the gradient is one continuous wave — a smooth, low-frequency curve,
  // never noise. It is completely still until the mouse moves.
  float baseY =
    sin(p.x * uScale * 2.0 + 0.6) * 0.16 * uDistortion +
    sin(p.x * uScale * 0.8 - 1.1) * 0.09 * uDistortion;

  // the mouse bends the wave locally, like a radius pulling/pushing the
  // curve toward the cursor — the shape itself deforms, nothing shreds.
  float dx = p.x - mouseP.x;
  float bump = exp(-(dx * dx) / (2.0 * 0.1));
  float pull = (mouseP.y - baseY) * bump * uMouseInfluence * 0.95;

  float waveY = baseY + pull;

  float d = p.y - waveY;
  float width = 0.1;
  float band = smoothstep(width, width * 0.15, abs(d));

  // hue sweeps along the length of the wave
  float along = clamp(p.x / aspect + 0.5, 0.0, 1.0);
  vec3 gradient = mix(uColor1, uColor2, smoothstep(0.0, 0.5, along));
  gradient = mix(gradient, uColor3, smoothstep(0.5, 1.0, along));

  // bright core running through the middle of the ribbon
  float core = smoothstep(width * 0.4, 0.0, abs(d));
  vec3 color = gradient * band + vec3(1.0) * core * 0.55;

  float grain = hash(gl_FragCoord.xy) - 0.5;
  color += grain * uNoiseAmt;
  color = max(color, 0.0);

  gl_FragColor = vec4(color, 1.0);
}
`
