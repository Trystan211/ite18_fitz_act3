import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb0e0e6); // Light blue for a snowy atmosphere
scene.fog = new THREE.Fog(0xadd8e6, 5, 40); // Light blue fog to mimic snow blizzard

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
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // Pure white for snow
);
snow.rotation.x = -Math.PI / 2;
scene.add(snow);

// Lights
const ambientLight = new THREE.AmbientLight(0xbbbbbb, 0.6);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff, 1);
spotlight.position.set(0, 20, 0); // Spotlight directly above the center
spotlight.castShadow = true;
scene.add(spotlight);

// Load the Yeti model
const loader = new GLTFLoader();
let yetiPosition = { x: 0, y: -0.5, z: 0 };

loader.load(
  'https://trystan211.github.io/ite_joash/yeti_model.glb', // Replace with an actual Yeti model URL
  (gltf) => {
    const yeti = gltf.scene;
    yeti.position.set(yetiPosition.x, yetiPosition.y, yetiPosition.z);
    yeti.scale.set(0.01, 0.01, 0.01); // Adjust size appropriately
    scene.add(yeti);
  },
  undefined,
  (error) => console.error('Error loading Yeti model:', error)
);

// Pointy Rocks with Snowy Colors
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tallRocks = []; // Store references for raycasting

const rockMaterial = new THREE.MeshStandardMaterial({
  color: 0xd3d3d3, // Light gray to fit the snowy atmosphere
  roughness: 0.9,
  metalness: 0.1,
});

for (let i = 0; i < 10; i++) {
  const x = Math.random() * 50 - 25;
  const z = Math.random() * 50 - 25;

  const tallRock = new THREE.Mesh(
    new THREE.ConeGeometry(Math.random() * 1 + 1, Math.random() * 10 + 5, 8),
    rockMaterial.clone()
  );
  tallRock.position.set(x, Math.random() * 2, z);
  tallRock.castShadow = true;
  tallRocks.push(tallRock);
  scene.add(tallRock);
}

// Handle Click for Raycasted Rocks
const handleClick = (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(tallRocks);

  if (intersects.length > 0) {
    const selectedRock = intersects[0].object;

    const originalColor = selectedRock.material.color.clone();
    const originalScale = selectedRock.scale.clone();

    selectedRock.material.color.set(0xaaaaaa); // Darker gray for highlight
    selectedRock.scale.multiplyScalar(1.2);

    setTimeout(() => {
      selectedRock.material.color.copy(originalColor);
      selectedRock.scale.copy(originalScale);
    }, 2000);
  }
};

window.addEventListener('click', handleClick);

// Floating Diamond Crystals
const diamondMaterial = new THREE.MeshStandardMaterial({
  color: 0x87cefa, // Sky blue for crystals
  roughness: 0.5,
  metalness: 1,
});

for (let i = 0; i < 30; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(Math.random() * 0.5 + 0.1),
    diamondMaterial
  );
  diamond.position.set(x, Math.random() * 2 + 0.5, z);
  diamond.castShadow = true;
  scene.add(diamond);
}

// Blizzard Particles
const particleCount = 10000; // Increase particle count for a denser blizzard
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];
const velocities = [];

for (let i = 0; i < particleCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 45 + 5;
  const y = Math.random() * 12 + 2;

  positions.push(
    Math.cos(angle) * distance + yetiPosition.x,
    y,
    Math.sin(angle) * distance + yetiPosition.z
  );
  velocities.push(0.01 * (Math.random() > 0.5 ? 1 : -1)); // Faster rotation
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Animation Loop
const animate = () => {
  const positions = particlesGeometry.attributes.position.array;
  const velocities = particlesGeometry.attributes.velocity.array;

  for (let i = 0; i < particleCount; i++) {
    const xIndex = i * 3;
    const zIndex = xIndex + 2;

    const x = positions[xIndex] - yetiPosition.x;
    const z = positions[zIndex] - yetiPosition.z;

    const angle = Math.atan2(z, x) + velocities[i];
    const distance = Math.sqrt(x * x + z * z);

    positions[xIndex] = Math.cos(angle) * distance + yetiPosition.x;
    positions[zIndex] = Math.sin(angle) * distance + yetiPosition.z;
  }
  particlesGeometry.attributes.position.needsUpdate = true;

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

