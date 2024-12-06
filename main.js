import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.152.0/examples/jsm/loaders/GLTFLoader.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcce7ff); // Light icy blue
scene.fog = new THREE.Fog(0xcce7ff, 10, 50); // Snow blizzard effect

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
  new THREE.MeshStandardMaterial({ color: 0xffffff }) // Snowy white
);
snow.rotation.x = -Math.PI / 2;
scene.add(snow);

// Lights
const ambientLight = new THREE.AmbientLight(0x99ccff, 0.4); // Icy blue ambient light
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
    yeti.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
    scene.add(yeti);

    // Animation Mixer
    mixer = new THREE.AnimationMixer(yeti);

    // Play All Animations
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });
  },
  undefined,
  (error) => console.error('Error loading Yeti model:', error)
);

// Raycastable Spiky Rocks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tallRocks = [];
const rockMaterial = new THREE.MeshStandardMaterial({
  color: 0x6666ff, // Icy blue-gray
  roughness: 0.8,
  metalness: 0.2
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

// Diamonds with Raycasting
const diamonds = [];
const diamondMaterial = new THREE.MeshStandardMaterial({
  color: 0x99ccff,
  roughness: 0.3,
  metalness: 0.9
});

for (let i = 0; i < 30; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const diamond = new THREE.Mesh(
    new THREE.TetrahedronGeometry(0.5, 0),
    diamondMaterial.clone()
  );
  diamond.position.set(x, 0.2, z);
  diamond.castShadow = true;
  diamonds.push(diamond);
  scene.add(diamond);
}

// Handle Click Interaction
const handleClick = (event) => {
  // Normalize mouse position
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check intersections for tall rocks
  const rockIntersects = raycaster.intersectObjects(tallRocks);
  if (rockIntersects.length > 0) {
    const selectedRock = rockIntersects[0].object;
    const originalColor = selectedRock.material.color.clone();
    const originalScale = selectedRock.scale.clone();

    selectedRock.material.color.set(0x4444ff); // Darker blue
    selectedRock.scale.multiplyScalar(1.2);

    setTimeout(() => {
      selectedRock.material.color.copy(originalColor);
      selectedRock.scale.copy(originalScale);
    }, 2000);
  }

  // Check intersections for diamonds
  const diamondIntersects = raycaster.intersectObjects(diamonds);
  if (diamondIntersects.length > 0) {
    const selectedDiamond = diamondIntersects[0].object;
    const originalColor = selectedDiamond.material.color.clone();

    selectedDiamond.material.color.set(0x66ccff); // Mystical glowing blue

    setTimeout(() => {
      selectedDiamond.material.color.copy(originalColor);
    }, 2000);
  }
};

// Event Listeners
window.addEventListener('click', handleClick);

// Snow Particles
const particleCount = 12000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];
const velocities = [];

for (let i = 0; i < particleCount; i++) {
  positions.push(
    Math.random() * 60 - 30,
    Math.random() * 50,
    Math.random() * 60 - 30
  );
  velocities.push(0.002 * (Math.random() > 0.5 ? 1 : -1));
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  transparent: true,
  opacity: 0.8
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Animation Loop
const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta); // Update animations

  const positions = particlesGeometry.attributes.position.array;

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 1] -= 0.1; // Move particles downward for snow
    if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 50;
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
