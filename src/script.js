import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();



/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObject = {
  count: 20,
};


// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
 


  "/textures/HEAD_baseColor.png",
  "/textures/HEAD_metallicRoughness.png",
  "/textures/Screenshot_2023-05-17_165926_baseColor.png",
]);

// scene.background = environmentMap;
scene.environment = environmentMap;

const cats = [];

const loadModel = async (url) => {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        resolve(model);
      },
      undefined,
      reject
    );
  });
};

let MODEL = null;

(async () => {
  return await loadModel("/models/dingus_the_cat/scene.gltf"); 
})().then((model) => {
  loadModels(debugObject.count, model);
  MODEL = model;
});

const loadModels = async (count, model) => {
  for (let i = 0; i < count; i++) {
    const modelClone = model.clone();
    scene.add(modelClone);
    cats.push(modelClone);
    modelClone.position.set(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 200
    );
    const scale = Math.random() * 1 + 0.1;
    modelClone.scale.set(scale, scale, scale);
    modelClone.rotation.y = (Math.random() - 0.5) * Math.PI * 2;
  }
  updateAllMaterials();
};

gui
  .add(debugObject, "count")
  .min(1)
  .max(300)
  .step(1)
  .onFinishChange((value) => {
    if (value > cats.length) {
      loadModels(value - cats.length, MODEL);
    } else if (value < cats.length) {
      const removeCats = cats.splice(value);
      removeCats.forEach((cat) => {
        scene.remove(cat);
      });
    }
  });

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(0.25, 3, -2.25);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(30, 1, 15);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 120;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();

// background color
const params = {
  background: "#ffffff",
};
scene.background = new THREE.Color(params.background);
directionalLight.color.set(params.background);
gui.addColor(params, "background").onChange((value) => {
  scene.background.set(value);
  directionalLight.color.set(value);
});

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  const elapsedTime = clock.getElapsedTime();

  cats.forEach((catModel, i) => {
    catModel.rotationSpeed = Math.random() * 0.1;
    catModel.rotation.y += catModel.rotationSpeed;
  });

  //   if (catModel) {
  //     catModel.position.y = Math.abs(Math.sin(elapsedTime * 4));
  //     catModel.position.z = Math.cos(elapsedTime * 4);
  //     catModel.rotation.x = Math.cos(elapsedTime * 4) * 0.5;
  //   }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
