import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import shaderModifier from "./shaderModifier.glsl";

const glsl = (x: any) => x;
const backgroundColor = "hsl(172, 23%, 68%)";

// Scene
const scene = new THREE.Scene();

scene.background = new THREE.Color(backgroundColor);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app")?.append(renderer.domElement);

// Camera
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 50);
camera.position.set(0, 0, 4);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Object
function helicoid(u: number, v: number, target: THREE.Vector3) {
  const { PI, sinh, cosh, sin, cos } = Math;
  const U = PI * 2 * (u - 0.5);
  const V = PI * 2 * (v - 0.5);
  const T = 5;

  const denominator = 1 + cosh(U) * cosh(V);
  const x = (sinh(V) * cos(T * U)) / denominator;
  const z = (sinh(V) * sin(T * U)) / denominator;
  const y = (cosh(V) * sinh(U)) / denominator;

  target.set(x, y, z);
}
const geometry = new THREE.ParametricBufferGeometry(helicoid, 256, 32);

const getMaterial = () => {
  const material = new THREE.MeshPhysicalMaterial({
    color: backgroundColor,
    transparent: false,
    side: THREE.DoubleSide,
    roughness: 0,
    metalness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.4,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    material.userData = { shader };

    shader.vertexShader =
      glsl`
        varying mat4 vModelMatrix;
      ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <fog_vertex>",
      glsl`
        vModelMatrix = modelMatrix;
      `
    );

    shader.fragmentShader =
      glsl`
        uniform float uTime;
        varying mat4 vModelMatrix;
      ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <transmission_fragment>",
      shaderModifier + "\n#include <transmission_fragment>"
    );
  };

  return material;
};

const mesh = new THREE.Mesh(geometry, getMaterial());
mesh.receiveShadow = true;
scene.add(mesh);

const balls = new THREE.Object3D();
scene.add(balls);

const ballGeometry = new THREE.IcosahedronBufferGeometry(0.21, 6);
const ball1 = new THREE.Mesh(ballGeometry, getMaterial());
ball1.castShadow = true;
ball1.position.x = 0.65;
balls.add(ball1);

const ball2 = new THREE.Mesh(ballGeometry, getMaterial());
ball2.castShadow = true;
ball2.position.x = -0.65;
balls.add(ball2);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const light = new THREE.DirectionalLight(0xffffff, 2.1);
light.position.set(1, 0, 1);
light.lookAt(0, 0, 0);
scene.add(light);

light.castShadow = true;
light.shadow.mapSize.width = 4096;
light.shadow.mapSize.height = 4096;
light.shadow.camera.right = 3;
light.shadow.camera.left = -3;
light.shadow.camera.top = 3;
light.shadow.camera.bottom = -3;
light.shadow.normalBias = 0.001;

// Animation
const clock = new THREE.Clock();

const animate = () => {
  const time = clock.getElapsedTime();

  const rotateAmount = (time * Math.PI) / 2;
  mesh.rotation.y = rotateAmount;
  balls.rotation.y = rotateAmount + Math.PI / 2;
  ball1.rotation.x = -rotateAmount;
  ball2.rotation.x = rotateAmount;

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(animate);
};

animate();
