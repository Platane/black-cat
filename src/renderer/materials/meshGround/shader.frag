#version 300 es
precision highp float;

in vec3 v_color;
in vec3 v_worldNormal;

out vec4 outColor;

float invLerp(float from, float to, float value) {
    return (value - from) / (to - from);
}


void main() {

    vec3 lightDirection = vec3(0.615457, 0.492365, 0.615457);

    float p = clamp(invLerp(-0.4, 0.8, dot(v_worldNormal, lightDirection)), 0.0, 1.0);
    float l = mix(0.6, 1.1,p);


    outColor = vec4(v_worldNormal, 1.0);
    outColor = vec4(v_color, 1.0);
    outColor.rgb *= l;
}
