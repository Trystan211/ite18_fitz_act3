import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcce7ff);
scene.fog = new THREE.Fog(0xcce7ff, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(20, 10, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Snowy Ground
const snow = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
snow.rotation.x = -Math.PI / 2;
scene.add(snow);

// Lights
const ambientLight = new THREE.AmbientLight(0x99ccff, 0.5);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(0, 30, 0);
spotlight.angle = Math.PI / 6;
spotlight.penumbra = 0.3;
spotlight.castShadow = true;
scene.add(spotlight);

// Load Yeti Model with Animations
const loader = new GLTFLoader();
let mixer;
loader.load(
  'https://trystan211.github.io/ite18_fitz_act3/lowpoly_bigfoot.glb', // Replace with actual model path
  (gltf) => {
    const yeti = gltf.scene;
    yeti.position.set(0, 0, 0);
    yeti.scale.set(3, 3, 3);
    scene.add(yeti);

    mixer = new THREE.AnimationMixer(yeti);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });
  },
  undefined,
  (error) => console.error('Error loading Yeti model:', error)
);

// Medium-Sized Pointy Rocks
const mediumRocks = [];
const mediumRockMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f5f5, // White for snowy effect
  roughness: 0.8,
  metalness: 0.2
});

for (let i = 0; i < 15; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const mediumRock = new THREE.Mesh(
    new THREE.ConeGeometry(Math.random() * 2 + 1, Math.random() * 6 + 3, 8),
    mediumRockMaterial.clone()
  );
  mediumRock.position.set(x, 0.5, z);
  mediumRock.castShadow = true;
  mediumRocks.push(mediumRock);
  scene.add(mediumRock);
}

// White Bushes
const bushes = [];
const bushMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.9,
  metalness: 0.1
});

for (let i = 0; i < 20; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 1 + 0.5, 8, 8),
    bushMaterial.clone()
  );
  bush.position.set(x, 0.25, z);
  bush.castShadow = true;
  bushes.push(bush);
  scene.add(bush);
}

// Mjolnir-Style Orbiting Particles
const particleCount = 3000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];
const particleAngles = [];
const orbitSpeeds = [];
const orbitRadius = 10;

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const height = Math.random() * 10 - 5;
  const distance = Math.random() * orbitRadius;

  positions.push(
    Math.cos(angle) * distance,
    height,
    Math.sin(angle) * distance
  );

  particleAngles.push(angle);
  orbitSpeeds.push(0.05 + Math.random() * 0.1);
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particlesGeometry.setAttribute('angle', new THREE.Float32BufferAttribute(particleAngles, 1));
particlesGeometry.setAttribute('speed', new THREE.Float32BufferAttribute(orbitSpeeds, 1));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.2,
  transparent: true,
  opacity: 0.9
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Animation Loop
const clock = new THREE.Clock();

const animateParticles = (delta) => {
  const positions = particlesGeometry.attributes.position.array;
  const angles = particlesGeometry.attributes.angle.array;
  const speeds = particlesGeometry.attributes.speed.array;

  for (let i = 0; i < particleCount; i++) {
    const index = i * 3;

    angles[i] += speeds[i] * delta;

    positions[index] = Math.cos(angles[i]) * orbitRadius;
    positions[index + 2] = Math.sin(angles[i]) * orbitRadius;
  }

  particlesGeometry.attributes.position.needsUpdate = true;
  particlesGeometry.attributes.angle.needsUpdate = true;
};

const animate = () => {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  animateParticles(delta);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
