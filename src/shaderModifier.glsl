vec3 rotation = (vModelMatrix * vec4(0.0, 2.0, 0.0, 0.0)).xyz;
float diff = dot(rotation, vNormal * faceDirection);


// IQ Palettes  https://iquilezles.org/www/articles/palettes/palettes.htm
vec3 a = vec3(0.5, 0.5, 0.5);
vec3 b = vec3(0.5, 0.5, 0.5);
vec3 c = vec3(1.0, 1.0, 1.0);
vec3 d = vec3(0.0, 0.1, 0.2);
vec3 cc = a + b * cos(2.0 * PI * (c * diff + d));

// Fresnel factor
vec3 angle = vec3(0.0, 0.0, -1.0);
float factor = 0.1 + 1.0 * pow(1.0 + dot(angle, vNormal * faceDirection), 0.75);

diffuseColor.rgb = mix(cc, diffuseColor.rgb, clamp(factor, 0.0, 1.0));