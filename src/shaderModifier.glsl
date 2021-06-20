float diff = dot(vec3(1.0), vNormal);

vec3 a = vec3(0.5, 0.5, 0.5);
vec3 b = vec3(0.5, 0.5, 0.5);
vec3 c = vec3(1.0, 1.0, 1.0);
vec3 d = vec3(0.0, 0.1, 0.2);

vec3 cc = a + b * cos(2.0 * PI * (c * diff + d + playhead));

diffuseColor.rgb = cc;