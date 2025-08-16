#version 300 es

in vec4 a_position;
in vec3 a_color;
in vec3 a_normal;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

out vec3 v_color;
out vec3 v_worldNormal;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * a_position;
    v_color = a_color;
    v_worldNormal = a_normal;
}
