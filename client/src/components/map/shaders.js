
export const vertex = `
#define SHADER_NAME wind vertex shader

attribute vec3 positions;
attribute vec3 colors;

uniform float opacity;
uniform float currentTime;
uniform float trailLength;

varying float vTime;
varying vec4 vColor;

void main(void) {
  vec2 p = preproject(positions.xy);
  gl_Position = project(vec4(p, 1., 1.));

  vColor = vec4(colors / 255.0, opacity);
  vTime = 1.0 - (currentTime - positions.z) / trailLength;
}
`;

export const fragment = `
#define SHADER_NAME wind fragment shader

#ifdef GL_ES
precision highp float;
#endif

varying float vTime;
varying vec4 vColor;

void main(void) {
  if (vTime > 1.0 || vTime < 0.0) {
    discard;
  }
  gl_FragColor = vec4(vColor.rgb, vColor.a * vTime);
}
`;
