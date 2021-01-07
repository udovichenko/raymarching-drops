uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
    oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
    oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

float smin(float a, float b, float k) {
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

float sdSphere(vec3 p, float r) {
    return length(p)-r;
}

float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdf(vec3 p) {
    vec3 p1 = rotate(p, vec3(1.), time/5.);
    float box = sdBox(p1, vec3(0.3));
    float sphere = sdSphere(p, 0.4);
    //    return box;
    return smin(box, sphere, 0.2);
}

vec3 calcNormal(in vec3 p) {
    const float eps = 0.0001;
    const vec2 h = vec2(eps, 0);
    return normalize(vec3(sdf(p+h.xyy) - sdf(p-h.xyy), sdf(p+h.yxy) - sdf(p-h.yxy), sdf(p+h.yyx) - sdf(p-h.yyx)));
}

void main() {
    vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
    vec3 camPos = vec3(0., 0., 2.);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * resolution.zw, -1));

    vec3 rayPos = camPos;
    float t = 0.;
    float tMax = 5.;

    for (int i=0;i<256;++i) {
        vec3 pos = camPos + t*ray;
        float h = sdf(pos);
        if (h<0.0001 || t>tMax) break;
        t+=h;
    }

    vec3 color = vec3(0.);
    if (t<tMax) {
        vec3 pos = camPos + t * ray;
        color = vec3(1.);
        vec3 normal = calcNormal(pos);
        color = normal;
        float diff = dot(vec3(1.), normal);
        color = vec3(diff);
    }

    gl_FragColor = vec4(color, 1.);
}