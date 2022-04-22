<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as MAT from "babylonjs-materials";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";
import LabLayout from "../components/LabLayout.vue";
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
This is a work in progress version of a Stoa for a side project I'm considering.
- Uses Skybox material and directional lighting (fixed position for now)
- New version of the noise texture
- Switch to Cell Material
- New Color palette
`;
const bjsCanvas = ref(null);

let engine;
let scene;

// Define a custom set of colors for this lab
const LabColors = {
  purple: new BABYLON.Color3.FromHexString("#a7afff"),
  blue: new BABYLON.Color3.FromHexString("#a7dbff"),
  teal: new BABYLON.Color3.FromHexString("#a7fff7"),
  cyan: new BABYLON.Color3.FromHexString("#a7ffcb"),

  green: new BABYLON.Color3.FromHexString("#afffa7"),
  yellow: new BABYLON.Color3.FromHexString("#fff7a7"),
  orange: new BABYLON.Color3.FromHexString("#ffcba7"),
  red: new BABYLON.Color3.FromHexString("#ffa7af"),

  light1: new BABYLON.Color3.FromHexString("#ffe9da"),
  light2: new BABYLON.Color3.FromHexString("#FFF8F3"),
  light3: new BABYLON.Color3.FromHexString("#FFFFFF"),
};

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  const framesPerSecond = 60;
  const gravity = -9.81;
  scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);

  setupCamera(scene, canvas, false);
  const skybox = setupSceneLighting();
  console.log(skybox);

  createPlaceholder(scene);
  createFountain(scene);

  const ground = addLabRoomLocal(scene);

  const { floor, step1, step2 } = createBase();
  createRoof();
  createCeilingBlock();
  createCeiling();
  createRails();
  createCorners();
  createWallsInside();
  createWallsOutside();

  const columnDoric = createColumnDoric();
  columnDoric.position = new BABYLON.Vector3(-16.15, 0, 0);
  columnFactory(columnDoric);

  const columnIonic = createColumnIonic();
  columnIonic.position = new BABYLON.Vector3(-14, 0, -7);
  columnFactory2(columnIonic);

  //Right Side
  const columnDoricTemp1 = createColumnDoric();
  columnDoricTemp1.position = new BABYLON.Vector3(16, -0.5, 16);
  columnDoricTemp1.scaling = new BABYLON.Vector3(0.7, 1, 0.7);
  columnFactoryTemp(columnDoricTemp1);

  const columnDoricTemp2 = createColumnDoric();
  columnDoricTemp2.position = new BABYLON.Vector3(24, -0.5, 16);
  columnDoricTemp2.scaling = new BABYLON.Vector3(0.7, 1, 0.7);
  columnFactoryTemp(columnDoricTemp2);

  //Left Side
  const columnDoricTemp3 = createColumnDoric();
  columnDoricTemp3.position = new BABYLON.Vector3(-16, -0.5, 16);
  columnDoricTemp3.scaling = new BABYLON.Vector3(0.7, 1, 0.7);
  columnFactoryTemp(columnDoricTemp3);

  const columnDoricTemp4 = createColumnDoric();
  columnDoricTemp4.position = new BABYLON.Vector3(-24, -0.5, 16);
  columnDoricTemp4.scaling = new BABYLON.Vector3(0.7, 1, 0.7);
  columnFactoryTemp(columnDoricTemp4);

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground, floor, step1, step2]);
  console.log(xr);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", resizeListener);
};

const resizeListener = () => {
  if (engine) {
    engine.resize();
  }
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
  window.removeEventListener("resize", resizeListener);
});
onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
});

// Camera (non-XR)
const setupCamera = (scene, canvas, animateIntro) => {
  BABYLON.ArcRotateCamera.prototype.spinTo = function (
    whichprop,
    targetval,
    speed
  ) {
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    BABYLON.Animation.CreateAndStartAnimation(
      "at4",
      this,
      whichprop,
      speed,
      120,
      this[whichprop],
      targetval,
      0,
      ease
    );
  };

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    3,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.wheelDeltaPercentage = 0.01;
  camera.upperBetaLimit = Math.PI / 1.5;
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 128;
  camera.setPosition(new BABYLON.Vector3(0, 3.5, -6));
  camera.setTarget(new BABYLON.Vector3(0, 1, 24));
  camera.attachControl(canvas, true);

  if (animateIntro) {
    setTimeout(() => camera.spinTo("beta", 1.2, 20), 2000);
    setTimeout(() => camera.spinTo("radius", 12, 20), 1000);
    setTimeout(() => camera.spinTo("alpha", Math.PI / 2, 40), 4000);
    setTimeout(() => camera.spinTo("radius", 24, 20), 5000);
    setTimeout(() => camera.spinTo("alpha", -2, 20), 8000);
    setTimeout(() => camera.spinTo("beta", 1.5, 20), 8000);
    setTimeout(() => camera.spinTo("beta", 0, 20), 10000);
    setTimeout(() => camera.spinTo("beta", 1.2, 20), 11000);
    setTimeout(() => camera.spinTo("radius", 128, 20), 12000);
    setTimeout(() => camera.spinTo("beta", 1.5, 20), 14000);
  }
};

// Lighting & Skybox

const setupSceneLighting = (scene) => {
  const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 25, 0),
    scene
  );

  hemiLight.intensity = 0.3;
  hemiLight.diffuse = LabColors["light3"];

  var sunPos = new BABYLON.Vector3(3, 5, 20);

  var skyMaterial = new MAT.SkyMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;
  skyMaterial.turbidity = 0.1;
  skyMaterial.luminance = 0.25;
  skyMaterial.useSunPosition = true; // Do not set sun position from azimuth and inclination
  skyMaterial.sunPosition = sunPos;
  skyMaterial.cameraOffset.y = 64;

  var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
  skybox.material = skyMaterial;

  const daylight = new BABYLON.DirectionalLight(
    "daylight",
    new BABYLON.Vector3(
      sunPos.x - sunPos.x * 2,
      sunPos.y,
      sunPos.z - sunPos.z * 2
    ),
    scene
  );

  daylight.intensity = 0.7;
  daylight.diffuse = LabColors["light3"];

  const point1 = new BABYLON.PointLight(
    "point1",
    new BABYLON.Vector3(-9, 1, -12),
    scene
  );
  //   point1.diffuse = LabColors["orange"];
  point1.intensity = 0.3;

  const point2 = point1.clone("point2");
  point2.position = new BABYLON.Vector3(9, 1, -12);

  return skybox;
};

// Placeholder meshes

const createPlaceholder = (scene) => {
  const placeMat = new MAT.CellMaterial("base-mat", scene);
  placeMat.diffuseColor = LabColors["light2"];
  const placeTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  placeTex.uScale = 2;
  placeTex.vScale = 2;
  placeMat.diffuseTexture = placeTex;
  const place1 = new BABYLON.MeshBuilder.CreateBox(
    "place1",
    { width: 7, height: 1, depth: 7 },
    scene
  );
  place1.position = new BABYLON.Vector3(20, -0.9, 20);
  place1.rotation = new BABYLON.Vector3(0, 0, 0);
  place1.material = placeMat;

  const place2 = place1.clone("place2");
  place2.position = new BABYLON.Vector3(20, -0.9, 32);

  const place3 = place1.clone("place3");
  place3.position = new BABYLON.Vector3(20, -0.9, 44);

  const place4 = place1.clone("place4");
  place4.position = new BABYLON.Vector3(-20, -0.9, 20);

  const place5 = place1.clone("place5");
  place5.position = new BABYLON.Vector3(-20, -0.9, 32);

  const place6 = place1.clone("place6");
  place6.position = new BABYLON.Vector3(-20, -0.9, 44);

  const placeRoof1 = new BABYLON.MeshBuilder.CreateBox(
    "placeRoof1",
    { width: 10, height: 0.2, depth: 34 },
    scene
  );
  placeRoof1.position = new BABYLON.Vector3(-20, 5, 32);
  placeRoof1.material = placeMat;

  const placeRoof2 = placeRoof1.clone("placeRoof2");
  placeRoof2.position = new BABYLON.Vector3(20, 5, 32);
};

const createFountain = (scene) => {
  const placeMat = new MAT.CellMaterial("base-mat", scene);
  placeMat.diffuseColor = LabColors["purple"];
  const placeTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  placeTex.uScale = 2;
  placeTex.vScale = 2;
  placeMat.diffuseTexture = placeTex;

  const group = new BABYLON.AbstractMesh("group", scene);

  const profile = [
    // Base
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(6, 0, 0),
    new BABYLON.Vector3(6, 0.6, 0),
    new BABYLON.Vector3(5.4, 0.6, 0),
    new BABYLON.Vector3(5.4, 0.2, 0),
    new BABYLON.Vector3(0, 0.2, 0),
  ];

  const fountainBase = BABYLON.MeshBuilder.CreateLathe("colum-docic-01", {
    tessellation: 4,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  fountainBase.rotation.y = Math.PI / 4;

  fountainBase.convertToFlatShadedMesh();

  group.addChild(fountainBase);
  fountainBase.position = new BABYLON.Vector3(0, -0.2, 0);
  fountainBase.material = placeMat;

  const profileTop = [
    // Top
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 1, 0),
    new BABYLON.Vector3(0.4, 1, 0),
    new BABYLON.Vector3(0.4, 1.3, 0),
    new BABYLON.Vector3(0.3, 1.3, 0),
    new BABYLON.Vector3(0.3, 1.8, 0),
    new BABYLON.Vector3(0.2, 1.8, 0),
    new BABYLON.Vector3(0.2, 2.1, 0),
  ];
  const fountainTop = BABYLON.MeshBuilder.CreateLathe("colum-docic-01", {
    tessellation: 4,
    shape: profileTop,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  fountainTop.rotation.y = Math.PI / 4;

  fountainTop.convertToFlatShadedMesh();

  group.addChild(fountainTop);
  fountainTop.position = new BABYLON.Vector3(0, 0, 0);
  fountainTop.material = placeMat;

  // var water = new MAT.WaterMaterial(
  //   "water",
  //   scene,
  //   new BABYLON.Vector2(512, 512)
  // );
  // water.backFaceCulling = true;
  // water.bumpTexture = new BABYLON.Texture("../assets/waterbump.png", scene);
  // water.windForce = -5;
  // water.waveHeight = 0.05;
  // water.bumpHeight = 0.15;
  // water.waterColor = LabColors["purple"];
  // water.colorBlendFactor = 0.5;
  // water.addToRenderList(fountainBase);
  // water.addToRenderList(fountainTop);
  // water.addToRenderList(skyBox);

  const blockMat = new MAT.CellMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["blue"];
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 6;
  blockText.vScale = 6;
  blockMat.diffuseTexture = blockText;

  // const blockMat = new BABYLON.StandardMaterial("blockMat", scene);
  // blockMat.diffuseColor = LabColors["blue"];
  // blockMat.specularColor = LabColors["teal"];

  const pool = new BABYLON.MeshBuilder.CreateBox(
    "pool",
    { width: 8, height: 0.2, depth: 8 },
    scene
  );
  group.addChild(pool);
  pool.position = new BABYLON.Vector3(0, 0, 0);
  pool.material = blockMat;

  // Move the entier group to the the location for the fountain
  group.position = new BABYLON.Vector3(0, -0.4, 32);
  group.rotation = new BABYLON.Vector3(0, Math.PI / 4, 0);

  //https://playground.babylonjs.com/#TC31NV#4
  // Create a particle system
  var particleSystem = new BABYLON.ParticleSystem("particles", 1000, scene);

  //Texture of each particle
  particleSystem.particleTexture = new BABYLON.Texture(
    "../assets/particle-01.png",
    scene
  );

  // Where the particles come from
  particleSystem.emitter = new BABYLON.Vector3(0, 1.8, group.position.z); // the starting object, the emitter
  particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
  particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

  // Colors of all particles
  particleSystem.color1 = new BABYLON.Color4.FromHexString("#a7dbff");
  particleSystem.color2 = new BABYLON.Color4.FromHexString("#a7fff7");
  particleSystem.colorDead = new BABYLON.Color4.FromHexString("#ffffff");

  // Size of each particle (random between...
  particleSystem.minSize = 0.03;
  particleSystem.maxSize = 0.07;

  // Life time of each particle (random between...
  particleSystem.minLifeTime = 2;
  particleSystem.maxLifeTime = 5;

  // Emission rate
  particleSystem.emitRate = 75;

  // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
  particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  // Set the gravity of all particles
  particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

  // Direction of each particle after it has been emitted
  particleSystem.direction1 = new BABYLON.Vector3(-1.4, 5, 1.4);
  particleSystem.direction2 = new BABYLON.Vector3(1.4, 8, -1.4);

  // Angular speed, in radians
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;

  // Speed
  particleSystem.minEmitPower = 0.2;
  particleSystem.maxEmitPower = 0.9;
  // particleSystem.maxEmitPower = 1.15;
  particleSystem.updateSpeed = 0.015;

  // Start the particle system
  particleSystem.start();

  //https://pixabay.com/sound-effects/small-fountain-7073/
  // new BABYLON.Sound("water", "assets/small-fountain-7073.mp3", scene, null, {
  //   loop: true,
  //   autoplay: true,
  // });
};

/*

  ***************************** Create 3D Models*****************************
  - Each of these functions creates one type of geometry for the lab.
  - They often create one or more materials using a placeholder noise texture.

*/

const createBase = () => {
  const blockMat = new MAT.CellMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 15;
  blockText.vScale = 36.5;
  blockMat.diffuseTexture = blockText;

  const floor = BABYLON.MeshBuilder.CreateBox(
    "floor",
    { height: 0.2, width: 36.5, depth: 15 },
    scene
  );
  floor.material = blockMat;
  floor.position = new BABYLON.Vector3(0, 0, -7);

  const blockMat2 = new MAT.CellMaterial("base-mat", scene);
  blockMat2.diffuseColor = LabColors["teal"];
  blockMat.diffuseTexture = blockText;

  const step1 = BABYLON.MeshBuilder.CreateBox(
    "step1",
    { height: 0.2, width: 37.3, depth: 15.8 },
    scene
  );
  step1.material = blockMat2;
  step1.position = new BABYLON.Vector3(0, -0.2, -7);

  const step2 = BABYLON.MeshBuilder.CreateBox(
    "step2",
    { height: 0.2, width: 38.1, depth: 16.6 },
    scene
  );
  step2.material = blockMat2;
  step2.position = new BABYLON.Vector3(0, -0.4, -7);

  return [floor, step1, step2];
};

const createRoof = () => {
  const blockMat = new MAT.CellMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 15;
  blockText.vScale = 36.5;
  blockMat.diffuseTexture = blockText;
  const roofCap1 = BABYLON.MeshBuilder.CreateCylinder("roofCap1", {
    tessellation: 3,
  });
  roofCap1.convertToFlatShadedMesh();
  roofCap1.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
  roofCap1.scaling = new BABYLON.Vector3(3, 0.5, 17);
  roofCap1.position = new BABYLON.Vector3(-17.6, 7.85, -7);
  roofCap1.material = blockMat;

  const roofCap2 = roofCap1.clone("roofCap2");
  roofCap2.position = new BABYLON.Vector3(17.6, 7.85, -7);

  const roofCenterMat = new MAT.CellMaterial("base-mat", scene);
  roofCenterMat.diffuseColor = LabColors["red"];
  //   roofCenterMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const roofCenterTex = new BABYLON.Texture(
    "../assets/stoa-noise-02.png",
    scene
  );
  roofCenterTex.uScale = 15;
  roofCenterTex.vScale = 36.5;
  roofCenterMat.diffuseTexture = blockText;

  const roofCenter = BABYLON.MeshBuilder.CreateCylinder("roofCenter", {
    tessellation: 3,
  });
  roofCenter.convertToFlatShadedMesh();
  roofCenter.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
  roofCenter.scaling = new BABYLON.Vector3(3, 17.4, 17);
  roofCenter.position = new BABYLON.Vector3(0, 7.8, -7);
  roofCenter.material = roofCenterMat;
};

const createCeilingBlock = () => {
  const blockMat = new MAT.CellMaterial("ceiling-mat", scene);
  blockMat.diffuseColor = LabColors["blue"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 15;
  blockText.vScale = 36.5;
  blockMat.diffuseTexture = blockText;

  const ceiling = BABYLON.MeshBuilder.CreateBox(
    "ceiling",
    { height: 1.1, width: 36.5, depth: 15 },
    scene
  );
  ceiling.material = blockMat;
  ceiling.position = new BABYLON.Vector3(0, 6.55, -7);
};

const createCeiling = () => {
  const blockMat = new MAT.CellMaterial("ceiling-mat", scene);
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 14;
  blockText.vScale = 36.2;
  blockMat.diffuseTexture = blockText;

  const ceilingPlane = BABYLON.MeshBuilder.CreatePlane(
    "ceiling-plane",
    { width: 36.2, height: 14 },
    scene
  );
  ceilingPlane.material = blockMat;
  ceilingPlane.position = new BABYLON.Vector3(0, 5.9, -7);
  ceilingPlane.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
};

const createRails = () => {
  const railMat = new MAT.CellMaterial("rail-mat", scene);
  railMat.diffuseColor = LabColors["light3"];
  //   railMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 1;
  blockText.vScale = 9;
  railMat.diffuseTexture = blockText;
  const rail1 = BABYLON.MeshBuilder.CreateBox(
    "rail",
    { height: 0.6, width: 36.3, depth: 0.8 },
    scene
  );
  rail1.material = railMat;
  rail1.position = new BABYLON.Vector3(0, 5.76, 0);

  const rail2 = rail1.clone();
  rail2.position = new BABYLON.Vector3(0, 5.76, -14);

  const rail3 = BABYLON.MeshBuilder.CreateBox(
    "rail",
    { height: 0.56, width: 0.75, depth: 14 },
    scene
  );
  rail3.material = railMat;
  rail3.position = new BABYLON.Vector3(17.75, 5.76, -7);

  const rail4 = rail3.clone();
  rail4.position = new BABYLON.Vector3(-17.75, 5.76, -7);
};

const createCorners = () => {
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 1;
  blockText.vScale = 7;

  const cornerMat = new MAT.CellMaterial("corner-mat", scene);
  cornerMat.diffuseColor = LabColors["light3"];
  cornerMat.diffuseTexture = blockText;

  const corner1 = BABYLON.MeshBuilder.CreateBox(
    "corner1",
    { height: 7, width: 0.82, depth: 0.82 },
    scene
  );
  corner1.material = cornerMat;
  corner1.position = new BABYLON.Vector3(17.75, 3.5, 0);

  const corner2 = corner1.clone();
  corner2.position = new BABYLON.Vector3(-17.75, 3.5, 0);

  const corner3 = corner1.clone();
  corner3.position = new BABYLON.Vector3(17.75, 3.5, -14);

  const corner4 = corner1.clone();
  corner4.position = new BABYLON.Vector3(-17.75, 3.5, -14);
};

const createWallsInside = () => {
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 17.5;
  blockText.vScale = 3;

  const wallMat1 = new MAT.CellMaterial("wall-mat-1", scene);
  wallMat1.diffuseColor = LabColors["light3"];
  wallMat1.diffuseTexture = blockText;

  const wall1 = BABYLON.MeshBuilder.CreatePlane(
    "wall1",
    { height: 6, width: 35 },
    scene
  );
  wall1.position = new BABYLON.Vector3(0, 3, -13.4);
  wall1.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  wall1.material = wallMat1;

  const blockText2 = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText2.uScale = 7;
  blockText2.vScale = 3;

  const wallMat2 = new MAT.CellMaterial("wall-mat-2", scene);
  wallMat2.diffuseColor = LabColors["light3"];
  wallMat2.diffuseTexture = blockText2;

  const wall2 = BABYLON.MeshBuilder.CreatePlane(
    "wall2",
    { height: 6, width: 14 },
    scene
  );
  wall2.position = new BABYLON.Vector3(17.37, 3, -7);
  wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  wall2.material = wallMat2;

  const wall3 = wall2.clone("wall3");
  wall3.position = new BABYLON.Vector3(-17.37, 3, -7);
  wall3.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
};

const createWallsOutside = () => {
  const wallMat = new MAT.CellMaterial("wall-mat", scene);
  wallMat.diffuseColor = LabColors["red"];
  const blockText = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText.uScale = 35;
  blockText.vScale = 6;
  wallMat.diffuseTexture = blockText;

  const wall1 = BABYLON.MeshBuilder.CreatePlane(
    "wall1",
    { height: 6, width: 35 },
    scene
  );
  wall1.position = new BABYLON.Vector3(0, 3, -14.2);
  wall1.rotation = new BABYLON.Vector3(0, 0, 0);
  wall1.material = wallMat;

  const blockText2 = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  blockText2.uScale = 7;
  blockText2.vScale = 3;

  const wallMat2 = new MAT.CellMaterial("wall-mat-2", scene);
  wallMat2.diffuseColor = LabColors["red"];
  wallMat2.diffuseTexture = blockText2;

  const wall2 = BABYLON.MeshBuilder.CreatePlane(
    "wall2",
    { height: 6, width: 14 },
    scene
  );
  wall2.position = new BABYLON.Vector3(18, 3, -7);
  wall2.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
  wall2.material = wallMat2;

  const wall3 = wall2.clone();
  wall3.position = new BABYLON.Vector3(-18, 3, -7);
  wall3.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
};

const createColumnDoric = () => {
  const colMat = new MAT.CellMaterial("column-doric-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.computeHighLevel = true;
  //   colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const colTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  colTex.vScale = 1;
  colTex.uScale = 5.6;
  colMat.diffuseTexture = colTex;

  const profile = [
    new BABYLON.Vector3(0.48, 0, 0),
    new BABYLON.Vector3(0.38, 5.1, 0),
    new BABYLON.Vector3(0.46, 5.175, 0),
    new BABYLON.Vector3(0.5, 5.3, 0),
  ];

  const column = BABYLON.MeshBuilder.CreateLathe("colum-docic-01", {
    tessellation: 18,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  column.material = colMat;
  column.convertToFlatShadedMesh();

  const cap = BABYLON.MeshBuilder.CreateBox("column-doric-cap", {
    width: 1.02,
    height: 0.16,
    depth: 1.02,
  });
  cap.material = colMat;
  cap.parent = column;
  cap.position = new BABYLON.Vector3(0, 5.38, 0);

  const result = BABYLON.Mesh.MergeMeshes([column, cap], true, true);
  result.name = "column-doric-base";

  return result;
};

const columnFactory = (column) => {
  const numberOfColumns = 19;
  var x = column.position.x;
  var i = 0;
  do {
    i++;
    x += 1.7;
    const newCol = column.createInstance("column");
    newCol.position = new BABYLON.Vector3(
      x,
      column.position.y,
      column.position.z
    );
  } while (i < numberOfColumns);
};

const columnFactoryTemp = (column) => {
  const numberOfColumns = 8;
  var z = column.position.z;
  var i = 0;
  do {
    i++;
    z += 4;
    const newCol = column.createInstance("column");
    newCol.position = new BABYLON.Vector3(
      column.position.x,
      column.position.y,
      z
    );
  } while (i < numberOfColumns);
};

const createColumnIonic = () => {
  const colMat = new MAT.CellMaterial("column-ionic-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  //   colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const colTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  colTex.vScale = 4;
  colTex.uScale = 4;
  colMat.diffuseTexture = colTex;

  const profile = [
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 6.4, 0),
  ];

  const column = BABYLON.MeshBuilder.CreateLathe("stand", {
    tessellation: 18,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  column.material = colMat;
  column.convertToFlatShadedMesh();
  column.scaling = new BABYLON.Vector3(0.6, 1, 0.6);
  return column;
};

const columnFactory2 = (column) => {
  const numberOfColumns = 8;
  var x = column.position.x;
  var i = 0;
  do {
    i++;
    x += 3.7;
    const newCol = column.createInstance("column");
    newCol.position = new BABYLON.Vector3(
      x,
      column.position.y,
      column.position.z
    );
  } while (i < numberOfColumns);
};

const addLabRoomLocal = (scene) => {
  // Copied from Lab 026 and modified
  // Add a ground plane to the scene. Used for WebXR teleportation
  const groundGridMaterial = new MAT.GridMaterial("ground-mat", scene);
  groundGridMaterial.majorUnitFrequency = 1;
  groundGridMaterial.gridRatio = 1;
  groundGridMaterial.backFaceCulling = false;
  groundGridMaterial.mainColor = LabColors["light2"];
  groundGridMaterial.lineColor = LabColors["light2"];
  groundGridMaterial.opacity = 0.98;

  const groundTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  groundTex.vScale = 100;
  groundTex.uScale = 100;

  const groundMaterial = new MAT.CellMaterial("ground-mat", scene);
  groundMaterial.diffuseColor = LabColors["light3"];
  groundMaterial.diffuseTexture = groundTex;
  groundMaterial.computeHighLevel = true;

  const ground = BABYLON.MeshBuilder.CreateDisc(
    "ground",
    {
      radius: 64,
    },
    scene
  );
  ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  ground.position = new BABYLON.Vector3(0, -0.5, 24);

  ground.material = groundMaterial;
  ground.sideOrientation = "DOUBLESIDE";
  ground.checkCollisions = true;

  const groundGrid = ground.clone("ground-grid");
  groundGrid.material = groundGridMaterial;
  groundGrid.position = new BABYLON.Vector3(0, -0.495, 24);

  // Create Base
  const baseMat = new MAT.CellMaterial("column-ionic-mat", scene);
  baseMat.diffuseColor = LabColors["light3"];
  const baseTex = new BABYLON.Texture("../assets/stoa-noise-02.png", scene);
  baseTex.vScale = 100;
  baseTex.uScale = 100;
  baseMat.diffuseTexture = baseTex;

  const profile = [
    new BABYLON.Vector3(0, -36, 0),
    new BABYLON.Vector3(22, -36, 0),
    new BABYLON.Vector3(34, -24, 0),
    new BABYLON.Vector3(48, -12, 0),
    new BABYLON.Vector3(64, 0, 0),
    new BABYLON.Vector3(64, 1, 0),
    new BABYLON.Vector3(62, 1, 0),
    new BABYLON.Vector3(62, 0, 0),
  ];

  const base = BABYLON.MeshBuilder.CreateLathe("base", {
    tessellation: 64,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  base.material = baseMat;
  base.convertToFlatShadedMesh();
  base.checkCollisions = true;
  base.position = new BABYLON.Vector3(0, -0.55, 24);

  // return meshes for teleportation
  return ground;
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>