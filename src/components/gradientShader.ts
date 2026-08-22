export const VERTEX_SHADER = `#version 300 es

in vec2 aPosition;
out vec2 vPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vPosition = aPosition;
}
`

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uViewportSize;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform float uColorSize;
uniform float uColorSpacing;
uniform float uColorRotation;
uniform float uColorSpread;
uniform float uDisplacement;
uniform float uZoom;
uniform float uSpacing;
uniform float uSeed;
uniform vec2 uColorOffset;
uniform vec2 uTransformPosition;
uniform float uNoiseSize;
uniform float uNoiseIntensity;

in vec2 vPosition;
out vec4 fragColor;

// The MIT License
// Copyright (c) 2017 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions: the above copyright notice and this
// permission notice shall be included in all copies or substantial portions of
// the Software.
// Computes the analytic derivatives of a 3D Gradient Noise.
// https://www.shadertoy.com/view/4dffRH

vec3 gradientDerivativesNoise3DHash(vec3 p) {
  p = fract(p * vec3(.1031, .1030, .0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

// return value noise (in x) and its derivatives (in yzw)
vec4 gradientDerivativesNoise3D(in vec3 x) {
  vec3 p = floor(x);
  vec3 w = fract(x);

  vec3 u = w * w * w * (w * (w * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * w * w * (w * (w - 2.0) + 1.0);

  vec3 ga = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 0.0));
  vec3 gb = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 0.0));
  vec3 gc = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 0.0));
  vec3 gd = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 0.0));
  vec3 ge = gradientDerivativesNoise3DHash(p + vec3(0.0, 0.0, 1.0));
  vec3 gf = gradientDerivativesNoise3DHash(p + vec3(1.0, 0.0, 1.0));
  vec3 gg = gradientDerivativesNoise3DHash(p + vec3(0.0, 1.0, 1.0));
  vec3 gh = gradientDerivativesNoise3DHash(p + vec3(1.0, 1.0, 1.0));

  float va = dot(ga, w - vec3(0.0, 0.0, 0.0));
  float vb = dot(gb, w - vec3(1.0, 0.0, 0.0));
  float vc = dot(gc, w - vec3(0.0, 1.0, 0.0));
  float vd = dot(gd, w - vec3(1.0, 1.0, 0.0));
  float ve = dot(ge, w - vec3(0.0, 0.0, 1.0));
  float vf = dot(gf, w - vec3(1.0, 0.0, 1.0));
  float vg = dot(gg, w - vec3(0.0, 1.0, 1.0));
  float vh = dot(gh, w - vec3(1.0, 1.0, 1.0));

  return vec4(
    va + u.x * (vb - va) + u.y * (vc - va) + u.z * (ve - va) + u.x * u.y * (va - vb - vc + vd) + u.y * u.z * (va - vc - ve + vg) + u.z * u.x * (va - vb - ve + vf) + (-va + vb + vc - vd + ve - vf - vg + vh) * u.x * u.y * u.z,
    ga + u.x * (gb - ga) + u.y * (gc - ga) + u.z * (ge - ga) + u.x * u.y * (ga - gb - gc + gd) + u.y * u.z * (ga - gc - ge + gg) + u.z * u.x * (ga - gb - ge + gf) + (-ga + gb + gc - gd + ge - gf - gg + gh) * u.x * u.y * u.z +
      du * (vec3(vb, vc, ve) - va + u.yzx * vec3(va - vb - vc + vd, va - vc - ve + vg, va - vb - ve + vf) + u.zxy * vec3(va - vb - ve + vf, va - vb - vc + vd, va - vc - ve + vg) + u.yzx * u.zxy * (-va + vb + vc - vd + ve - vf - vg + vh))
  );
}

float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float computeNoise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a);
  float c = cos(a);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

void main() {
  vec2 position = vPosition;
  position.x *= min(1.0, uViewportSize.x / uViewportSize.y);
  position.y *= min(1.0, uViewportSize.y / uViewportSize.x);
  position /= uZoom;
  position += uTransformPosition;

  vec2 noiseLocalPosition = position * 0.5 + 0.5;
  vec3 displacementNoise = gradientDerivativesNoise3D(vec3(noiseLocalPosition, uSeed)).xyz;

  float noise = computeNoise(vPosition * uViewportSize / uNoiseSize);

  position += displacementNoise.xz * uDisplacement;

  vec2 offsetedPosition = position;
  offsetedPosition -= uColorOffset;
  offsetedPosition = mod(offsetedPosition - uSpacing, vec2(uSpacing * 2.0)) - uSpacing;
  offsetedPosition = rotate(offsetedPosition, -uColorRotation);
  offsetedPosition /= vec2(uColorSize, uColorSize);
  offsetedPosition *= vec2(1.0 / uColorSpread, 1.0);

  vec3 color = vec3(0.0);
  color = mix(uColor1, color, smoothstep(0.0, 1.0, distance(offsetedPosition, vec2(0.0, uColorSpacing * 1.5))));
  color = mix(uColor2, color, smoothstep(0.0, 1.0, distance(offsetedPosition, vec2(0.0, uColorSpacing * 0.5))));
  color = mix(uColor3, color, smoothstep(0.0, 1.0, distance(offsetedPosition, vec2(0.0, -uColorSpacing * 0.5))));
  color = mix(uColor4, color, smoothstep(0.0, 1.0, distance(offsetedPosition, vec2(0.0, -uColorSpacing * 1.5))));

  color += noise * uNoiseIntensity;
  color = clamp(color, 0.0, 1.0);

  fragColor = vec4(color, 1.0);
}
`
