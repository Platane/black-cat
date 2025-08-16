#version 300 es
precision highp float;

in vec3 v_color;
in vec3 v_normal;

out vec4 outColor;

void main() {
    outColor = vec4(v_normal, 1.0);
    outColor = vec4(v_color, 1.0);
}
