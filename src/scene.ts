import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import shaderModifier from "./shaderModifier.glsl";

// Scene
const scene = new THREE.Scene();

scene.background = new THREE.Color("#85cffb");

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

let shaderUniforms: {
  [uniform: string]: THREE.IUniform<any>;
} = {
  playhead: { value: 0 },
};

const getMaterial = () => {
  const material = new THREE.MeshPhysicalMaterial({
    // wireframe: true,
    side: THREE.DoubleSide,
    roughness: 0,
    metalness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.4,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms = {
      ...shader.uniforms,
      ...shaderUniforms,
    };

    shader.fragmentShader = "uniform float playhead;\n" + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <logdepthbuf_fragment>",
      shaderModifier + "\n#include <logdepthbuf_fragment>"
    );
  };

  return material;
};

const material = getMaterial();

const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

const geom = new THREE.IcosahedronBufferGeometry(0.215, 5);
const ball1 = new THREE.Mesh(geom, getMaterial());
ball1.castShadow = true;
ball1.receiveShadow = true;
scene.add(ball1);

const ball2 = new THREE.Mesh(geom, getMaterial());
ball2.castShadow = true;
ball2.receiveShadow = true;
scene.add(ball2);

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
light.shadow.normalBias = 0.01;

// Animation
const clock = new THREE.Clock();

const animate = () => {
  const time = clock.getElapsedTime();
  if (shaderUniforms) {
    // shaderUniforms.playhead.value = time;
  }

  const rotateAmount = (-time * Math.PI) / 2;
  mesh.rotation.y = rotateAmount;
  ball1.rotation.x = time;
  ball2.rotation.x = time;

  ball1.position.x = Math.sin(rotateAmount) * 0.65;
  ball1.position.z = Math.cos(rotateAmount) * 0.65;
  ball2.position.x = Math.sin(rotateAmount + Math.PI) * 0.65;
  ball2.position.z = Math.cos(rotateAmount + Math.PI) * 0.65;

  renderer.render(scene, camera);
  controls.update();
  window.requestAnimationFrame(animate);
};

animate();
