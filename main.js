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
    yeti.scale.set(3, 3, 3); // Adjust scale as needed
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

// Medium White Pointy Rocks
const mediumRocks = [];
const mediumRockMaterial = new THREE.MeshStandardMaterial({
  color: 0xf0f0f0, // White
  roughness: 0.9,
  metalness: 0.1,
});

for (let i = 0; i < 15; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const mediumRock = new THREE.Mesh(
    new THREE.ConeGeometry(Math.random() * 2 + 1, Math.random() * 4 + 3, 8),
    mediumRockMaterial.clone()
  );
  mediumRock.position.set(x, Math.random() * 1, z);
  mediumRock.castShadow = true;
  mediumRocks.push(mediumRock);
  scene.add(mediumRock);
}

// White Bushes
const bushes = [];
const bushMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff, // White
  roughness: 0.8,
  metalness: 0.2,
});

for (let i = 0; i < 20; i++) {
  const x = Math.random() * 60 - 30;
  const z = Math.random() * 60 - 30;

  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 1.5 + 0.5, 8, 8),
    bushMaterial.clone()
  );
  bush.position.set(x, Math.random() * 0.5, z);
  bush.castShadow = true;
  bushes.push(bush);
  scene.add(bush);
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
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const rockIntersects = raycaster.intersectObjects(tallRocks);
  if (rockIntersects.length > 0) {
    const selectedRock = rockIntersects[0].object;
    selectedRock.material.color.set(0x4444ff);
    selectedRock.scale.multiplyScalar(1.2);
    setTimeout(() => {
      selectedRock.material.color.set(0x6666ff);
      selectedRock.scale.set(1, 1, 1);
    }, 2000);
  }

  const diamondIntersects = raycaster.intersectObjects(diamonds);
  if (diamondIntersects.length > 0) {
    const selectedDiamond = diamondIntersects[0].object;
    selectedDiamond.material.color.set(0x66ccff);
    setTimeout(() => {
      selectedDiamond.material.color.set(0x99ccff);
    }, 2000);
  }
};
window.addEventListener('click', handleClick);

// Snow Particles Orbiting
const particleCount = 12000;
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];
const velocities = [];
const particleAngles = [];
const radius = 30;

for (let i = 0; i < particleCount; i++) {
  positions.push(Math.random() * 60 - 30, Math.random() * 50, Math.random() * 60 - 30);
  velocities.push(0.002 * (Math.random() > 0.5 ? 1 : -1));
  particleAngles.push(Math.random() * Math.PI * 2);
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

const animateParticles = (delta) => {
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const angle = particleAngles[i];
    const orbitSpeed = velocities[i];
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    positions[i * 3 + 1] += Math.sin(clock.elapsedTime * orbitSpeed) * 0.1;
    particleAngles[i] += orbitSpeed * delta;
  }
  particlesGeometry.attributes.position.needsUpdate = true;
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
