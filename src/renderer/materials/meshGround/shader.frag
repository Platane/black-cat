#version 300 es
precision highp float;

uniform vec4 u_directionalLight;

in vec3 v_color;
in vec3 v_worldNormal;

out vec4 outColor;

float invLerp(float a, float b, float k) {
    return (k - a) / (b - a);
}


void main() {

    vec3 lightDirection = u_directionalLight.xyz;
    float lightIntensity = u_directionalLight.w;

    float p = clamp(invLerp(-0.5, 1.0, dot(v_worldNormal, lightDirection)), 0.0, 1.0);
    float l = mix(0.6, 1.1,p);


    outColor = vec4(v_worldNormal, 1.0);
    outColor = vec4(v_color, 1.0);
    outColor.rgb *= l;

    // outColor.rgb = v_worldNormal * 0.5 + vec3(0.5);
}
