import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Pane } from "tweakpane";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

(async () => {
  /**
   * Base
   */
  const urlParams = new URLSearchParams(window.location.search);
  let isDebug = false;

  if (urlParams.get("debug") === "true") {
    isDebug = true;
  }

  // Pane
  let pane = undefined;
  if (isDebug) {
    pane = new Pane({
      title: "Super secret debug panel",
      expanded: true,
    });
    const debugPhrase = document.querySelector("p.debug");

    debugPhrase.innerHTML = "Press 'D' to exit debug mode";
  }

  // Stats
  let stats = undefined;
  if (isDebug) {
    stats = new Stats();
  }

  // Fog
  const fog = new THREE.Fog("#542D5A", 1, 12);

  // Canvas
  const canvas = document.querySelector("canvas.webgl");

  // Scene
  const scene = new THREE.Scene();
  scene.fog = fog;

  // Axes helper
  if (isDebug) {
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
  }

  /**
   * Textures
   */
  const textureLoader = new THREE.TextureLoader();

  // Door textures
  const doorColorTexture = textureLoader.load("/textures/door/color.jpg");
  const doorAlphaTexture = textureLoader.load("/textures/door/alpha.jpg");
  const doorAoTexture = textureLoader.load("/textures/door/ambientOcclusion.jpg");
  const doorHeightTexture = textureLoader.load("/textures/door/height.jpg");
  const doorNormalTexture = textureLoader.load("/textures/door/normal.jpg");
  const doorMetalnessTexture = textureLoader.load("/textures/door/metalness.jpg");
  const doorRoughnessTexture = textureLoader.load("/textures/door/roughness.jpg");

  // Walls textures
  const bricksColorTexture = textureLoader.load("/textures/bricks/color.jpg");
  const bricksAoTexture = textureLoader.load("/textures/bricks/ambientOcclusion.jpg");
  const bricksNormalTexture = textureLoader.load("/textures/bricks/normal.jpg");
  const bricksRoughnessTexture = textureLoader.load("/textures/bricks/roughness.jpg");

  // Grass textures
  const grassColorTexture = textureLoader.load("/textures/grass/color.jpg");
  const grassAoTexture = textureLoader.load("/textures/grass/ambientOcclusion.jpg");
  const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
  const grassRoughnessTexture = textureLoader.load("/textures/grass/roughness.jpg");
  // Repeat
  grassColorTexture.repeat.set(8, 8);
  grassAoTexture.repeat.set(8, 8);
  grassNormalTexture.repeat.set(8, 8);
  grassRoughnessTexture.repeat.set(8, 8);

  // Activate repeat on textures
  grassColorTexture.wrapS = THREE.RepeatWrapping;
  grassColorTexture.wrapT = THREE.RepeatWrapping;

  grassAoTexture.wrapS = THREE.RepeatWrapping;
  grassAoTexture.wrapT = THREE.RepeatWrapping;

  grassNormalTexture.wrapS = THREE.RepeatWrapping;
  grassNormalTexture.wrapT = THREE.RepeatWrapping;

  grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
  grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

  /**
   * Load 3d stuff
   */
  const gltfLoader = new GLTFLoader();
  const pumpkin = await gltfLoader.loadAsync("/models/lantern.gltf");
  const fenceGltf = await gltfLoader.loadAsync("/models/fence.gltf");
  /**
   * Place fences
   */
  const frontFences = new THREE.Group();
  for (let i = 0; i !== 8; i++) {
    const newFence = fenceGltf.scene.clone();
    newFence.position.z = 7.5;
    newFence.position.x = -7 + i * 2;
    frontFences.add(newFence);
  }

  const backFences = new THREE.Group();
  for (let i = 0; i !== 8; i++) {
    const newFence = fenceGltf.scene.clone();
    newFence.position.z = -7.5;
    newFence.position.x = -7 + i * 2;
    backFences.add(newFence);
  }

  const leftFences = new THREE.Group();
  for (let i = 0; i !== 7; i++) {
    const newFence = fenceGltf.scene.clone();
    newFence.position.x = -8;
    newFence.position.z = -6 + i * 2;
    newFence.rotation.y = 1.5708;
    leftFences.add(newFence);
  }

  const rightFences = new THREE.Group();
  for (let i = 0; i !== 7; i++) {
    const newFence = fenceGltf.scene.clone();
    newFence.position.x = 8;
    newFence.position.z = -6 + i * 2;
    newFence.rotation.y = 1.5708;
    rightFences.add(newFence);
  }

  scene.add(frontFences, backFences, leftFences, rightFences);

  /**
   * Load an place trees
   */
  gltfLoader.load("/models/tree.gltf", (gltf) => {
    gltf.scene.position.x = 3;
    gltf.scene.position.z = 5;
    gltf.scene.rotation.y = 36;
    gltf.scene.children[0].castShadow = true;

    const treeTwo = gltf.scene.clone();
    treeTwo.position.x = -6;
    treeTwo.position.z = 3;
    treeTwo.rotation.y = 160;
    treeTwo.children[0].castShadow = true;

    const treeThree = gltf.scene.clone();
    treeThree.position.x = -6;
    treeThree.position.z = -6;
    treeThree.rotation.y = 110;
    treeThree.children[0].castShadow = true;

    const treeFour = gltf.scene.clone();
    treeFour.position.x = 4;
    treeFour.position.z = -5;
    treeFour.rotation.y = 280;
    treeFour.children[0].castShadow = true;

    scene.add(gltf.scene, treeTwo, treeThree, treeFour);
  });

  /**
   * House
   */
  const house = new THREE.Group();

  const wallsMaterial = new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAoTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  });
  const walls = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 4), wallsMaterial);
  walls.position.y = 2.5 / 2;
  walls.castShadow = true;

  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1, 4), new THREE.MeshStandardMaterial({ color: "#322E2E" }));
  roof.position.y = 3;
  roof.rotation.y = Math.PI * 0.25;

  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
      map: doorColorTexture,
      transparent: true,
      alphaMap: doorAlphaTexture,
      aoMap: doorAoTexture,
      displacementMap: doorHeightTexture,
      displacementScale: 0.3,
      normalMap: doorNormalTexture,
      roughnessMap: doorRoughnessTexture,
    })
  );
  door.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2));
  door.position.z = 1.9;
  door.position.y = 1;

  house.add(walls, roof, door);
  scene.add(house);

  /**
   * Bushes
   */
  const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: "#89c854" });

  for (let i = 0; i !== 20; i++) {
    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    const scale = Math.min(0.5, Math.random());
    const x = (Math.random() - 0.5) * 7;
    const z = (Math.random() - 0.5) * 7;
    bush.castShadow = true;
    bush.position.set(x, 0.2, z);
    bush.scale.set(scale, scale, scale);
    house.add(bush);
  }

  /**
   * Graves
   */
  const graves = new THREE.Group();
  const gravesGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const gravesMaterial = new THREE.MeshStandardMaterial({ color: "#b2b6b1" });

  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 6;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    const grave = new THREE.Mesh(gravesGeometry, gravesMaterial);
    grave.position.set(x, 0.3, z);
    grave.rotation.set(0, Math.random() - 0.5, Math.random() - 0.5);
    grave.castShadow = true;
    graves.add(grave);
  }

  scene.add(graves);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
      map: grassColorTexture,
      aoMap: grassAoTexture,
      normalMap: grassNormalTexture,
      roughnessMap: grassRoughnessTexture,
    })
  );
  floor.rotation.x = -Math.PI * 0.5;
  floor.position.y = 0;
  floor.receiveShadow = true;
  // If AO
  floor.geometry.setAttribute("uv2", new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2));
  scene.add(floor);

  /**
   * Lights
   */

  // Door light
  const doorLight = new THREE.PointLight("#690FA5", 1, 7);
  doorLight.castShadow = true;
  doorLight.shadow.mapSize.width = 256;
  doorLight.shadow.mapSize.height = 256;
  doorLight.shadow.camera.far = 7;
  doorLight.position.set(0, 2.2, 2.7);
  house.add(doorLight);

  /**
   * Ghosts
   */
  const ghost1 = new THREE.PointLight("#690FA5", 3, 3);
  ghost1.castShadow = true;
  scene.add(ghost1);

  // Ghost 2 w Pumpkin
  const ghost2 = new THREE.Group();
  const ghost2Light = new THREE.PointLight("#4BA9D2", 2, 3);
  const ghost2Pumpkin = pumpkin.scene.children[0].clone();
  ghost2Pumpkin.traverse((o) => {
    var newMaterial = new THREE.MeshStandardMaterial({ color: "#4BA9D2" });
    newMaterial.transparent = true;
    newMaterial.opacity = 0.5;
    if (o.isMesh) {
      o.material = newMaterial;
    }
  });
  ghost2Light.castShadow = true;
  ghost2.add(ghost2Light, ghost2Pumpkin);
  scene.add(ghost2);

  // Ghost 3 w Pumpkin
  const ghost3 = new THREE.Group();
  const ghostLight = new THREE.PointLight("#BE0E00", 5, 6);
  const ghostPumpkin = pumpkin.scene.children[0].clone();
  ghostPumpkin.traverse((o) => {
    var newMaterial = new THREE.MeshStandardMaterial({ color: "#BE0E00" });
    newMaterial.transparent = true;
    newMaterial.opacity = 0.5;
    if (o.isMesh) {
      o.material = newMaterial;
    }
  });
  ghostLight.castShadow = true;
  ghostPumpkin.scale.set(0.5, 0.5, 0.5);
  ghost3.add(ghostLight, ghostPumpkin);
  scene.add(ghost3);

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
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
  camera.position.x = 4;
  camera.position.y = 1;
  camera.position.z = 7;
  scene.add(camera);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.3;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.target.set(0, 1.5, 0);

  if (isDebug) {
    const cameraFolder = pane.addFolder({
      title: "Camera controls",
      expanded: true,
    });
    controls.autoRotate = false;
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    cameraFolder.addInput(controls, "autoRotate");
    cameraFolder.addInput(controls, "autoRotateSpeed", { min: -10, max: 10, step: 0.01 });
    cameraFolder.addInput(controls, "enablePan");
    cameraFolder.addInput(controls, "enableRotate");
    cameraFolder.addInput(controls, "enableZoom");
  }

  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Changer la couleur du fond
  renderer.setClearColor("#542D5A");
  // Activer les ombres
  renderer.shadowMap.enabled = true;
  if (isDebug) document.body.appendChild(stats.dom);

  /**
   * Animate
   */
  const clock = new THREE.Clock();

  window.addEventListener("keydown", (ev) => {
    if (ev.key === "r") {
      document.location.reload(true);
    }
  });

  window.addEventListener("keydown", (ev) => {
    if (ev.key === "d" && isDebug === false) {
      document.location.search = "debug=true";
    } else if (ev.key === "d" && isDebug === true) {
      document.location.search = "";
    }
  });

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    if (isDebug) stats.update();

    // Update ghost
    const g1Angle = elapsedTime;
    ghost1.position.x = Math.cos(g1Angle) * 3;
    ghost1.position.z = Math.sin(g1Angle) * 3;
    ghost1.position.y = Math.sin(g1Angle) * 3;

    const g2Angle = elapsedTime * 0.26;
    ghost2.position.x = Math.cos(g2Angle) * 6;
    ghost2.position.z = Math.sin(g2Angle) * 6;
    ghost2.position.y = Math.sin(elapsedTime * 6) + Math.sin(elapsedTime * 3);
    ghost2.rotation.y -= 0.04;
    ghost2.rotation.x -= 0.09;

    const g3Angle = -elapsedTime * 0.32;
    ghost3.position.x = Math.cos(g3Angle) * 5;
    ghost3.position.z = Math.sin(g3Angle) * 5;
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);
    ghost3.rotation.y += 0.07;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
})();
