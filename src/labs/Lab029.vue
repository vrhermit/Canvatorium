<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as MAT from "babylonjs-materials";
import "babylonjs-inspector";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";
import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
// import addLabLights from "../lab-shared/LabLights";
// import LabColors from "../lab-shared/LabColors";
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
This is a work in progress version of a Stoa for a side project I'm considering.
- [ ] Explore HDR and lighting
- [ ] Add some textures to the geometry
`;
const bjsCanvas = ref(null);

let engine;
let scene;

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

const makeBox = (colorName, parent, scene) => {
  // Create a colored box from using a string to get the color from the Brand object
  const mat = new MAT.CellMaterial(`${colorName}-material`, scene);
  mat.diffuseColor = LabColors[colorName];
  mat.computeHighLevel = true;
  const mesh = BABYLON.MeshBuilder.CreateBox(
    `${colorName}-box`,
    { size: 1 },
    scene
  );
  mesh.material = mat;
  mesh.parent = parent;

  return mesh;
};

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  // scene.clearColor = BABYLON.Color3.FromHexString("#a7dbff");
  //   scene.debugLayer.show();
  const framesPerSecond = 60;
  const gravity = -9.81;
  scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);
  addLabCamera(canvas, scene);

  const hemiLight = new BABYLON.HemisphericLight(
    "hemiLight",
    new BABYLON.Vector3(0, 25, 0),
    scene
  );

  hemiLight.intensity = 0.3;
  hemiLight.diffuse = LabColors["light3"];

  var sunPos = new BABYLON.Vector3(3, 6, 20);

  var skyMaterial = new MAT.SkyMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;
  skyMaterial.turbidity = 0.4;
  skyMaterial.luminance = 0.2;
  // skyMaterial.inclination = -0.4; // The solar inclination, related to the solar azimuth in interval [0, 1]
  // skyMaterial.azimuth = 0.2; // The solar azimuth in interval [0, 1]

  skyMaterial.useSunPosition = true; // Do not set sun position from azimuth and inclination
  skyMaterial.sunPosition = sunPos;

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

  daylight.intensity = 0.8;
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

  // Make some boxes to test out the colors in VR
  makeBox("orange", group, scene).position = point1.position;
  makeBox("orange", group, scene).position = point2.position;

  const group = new BABYLON.Mesh("color-group");
  group.position = new BABYLON.Vector3(-3.5, 0.5, 6);

  makeBox("purple", group, scene).position = new BABYLON.Vector3(1, 0, 0);
  makeBox("blue", group, scene).position = new BABYLON.Vector3(2, 0, 0);
  makeBox("teal", group, scene).position = new BABYLON.Vector3(3, 0, 0);
  makeBox("green", group, scene).position = new BABYLON.Vector3(4, 0, 0);
  makeBox("yellow", group, scene).position = new BABYLON.Vector3(5, 0, 0);
  makeBox("orange", group, scene).position = new BABYLON.Vector3(6, 0, 0);
  makeBox("red", group, scene).position = new BABYLON.Vector3(7, 0, 0);
  makeBox("light1", group, scene).position = new BABYLON.Vector3(6, 1, 0);
  makeBox("light2", group, scene).position = new BABYLON.Vector3(7, 1, 0);
  makeBox("light3", group, scene).position = new BABYLON.Vector3(8, 1, 0);

  // const sun = new BABYLON.MeshBuilder.CreateSphere(
  //   "sun",
  //   { diameter: 20, segments: 32 },
  //   scene
  // );
  // sun.position = new BABYLON.Vector3(0, 100, 200);

  // const sunMaterial = new BABYLON.StandardMaterial("sunMaterial", scene);
  // sunMaterial.diffuseColor = LabColors["orange"];
  // sunMaterial.emissiveColor = LabColors["orange"];

  // const sunMaterial = new MAT.GradientMaterial("sunMaterial", scene);
  // sunMaterial.topColor = LabColors["orange"];
  // sunMaterial.bottomColor = LabColors["red"];
  // sunMaterial.offset;
  // sunMaterial.emissiveColor = LabColors["orange"];

  // sun.material = sunMaterial;

  const teleportMeshes = addLabRoomLocal(scene);

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

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [
    ...teleportMeshes,
    floor,
    step1,
    step2,
  ]);
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

/*

  ***************************** Create 3D Models*****************************
  - Each of these functions creates one type of geometry for the lab.
  - They often create one or more materials using a placeholder noise texture.

*/

const createBase = () => {
  const blockMat = new MAT.CellMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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

  const step1 = BABYLON.MeshBuilder.CreateBox(
    "step1",
    { height: 0.2, width: 37.3, depth: 15.8 },
    scene
  );
  step1.material = blockMat;
  step1.position = new BABYLON.Vector3(0, -0.2, -7);

  const step2 = BABYLON.MeshBuilder.CreateBox(
    "step2",
    { height: 0.2, width: 38.1, depth: 16.6 },
    scene
  );
  step2.material = blockMat;
  step2.position = new BABYLON.Vector3(0, -0.4, -7);

  return [floor, step1, step2];
};

const createRoof = () => {
  const blockMat = new MAT.CellMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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
  roofCenterMat.diffuseColor = LabColors["light3"];
  //   roofCenterMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const roofCenterTex = new BABYLON.Texture(
    "../assets/stoa-noise-01.jpg",
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
  blockMat.diffuseColor = LabColors["light3"];
  //   blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  blockText.uScale = 1;
  blockText.vScale = 36.5;
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
  const cornerMat = new MAT.CellMaterial("corner-mat", scene);
  cornerMat.diffuseColor = LabColors["light3"];
  //   cornerMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  blockText.uScale = 5.46;
  blockText.vScale = 1;
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
  const wallMat = new MAT.CellMaterial("wall-mat", scene);
  wallMat.diffuseColor = LabColors["light3"];
  //   wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  blockText.uScale = 4;
  blockText.vScale = 1;
  wallMat.diffuseTexture = blockText;

  const wall1 = BABYLON.MeshBuilder.CreatePlane(
    "wall1",
    { height: 6, width: 35 },
    scene
  );
  wall1.position = new BABYLON.Vector3(0, 3, -13.4);
  wall1.rotation = new BABYLON.Vector3(0, Math.PI, 0);
  wall1.material = wallMat;

  const wall2 = BABYLON.MeshBuilder.CreatePlane(
    "wall2",
    { height: 6, width: 14 },
    scene
  );
  wall2.position = new BABYLON.Vector3(17.37, 3, -7);
  wall2.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  wall2.material = wallMat;

  const wall3 = wall2.clone();
  wall3.position = new BABYLON.Vector3(-17.37, 3, -7);
  wall3.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
};

const createWallsOutside = () => {
  const wallMat = new MAT.CellMaterial("wall-mat", scene);
  wallMat.diffuseColor = LabColors["light3"];
  //   wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  blockText.uScale = 1;
  blockText.vScale = 1;
  wallMat.diffuseTexture = blockText;

  const wall1 = BABYLON.MeshBuilder.CreatePlane(
    "wall1",
    { height: 6, width: 35 },
    scene
  );
  wall1.position = new BABYLON.Vector3(0, 3, -14.2);
  wall1.rotation = new BABYLON.Vector3(0, 0, 0);
  wall1.material = wallMat;

  const wall2 = BABYLON.MeshBuilder.CreatePlane(
    "wall2",
    { height: 6, width: 14 },
    scene
  );
  wall2.position = new BABYLON.Vector3(18, 3, -7);
  wall2.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);
  wall2.material = wallMat;

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

const createColumnIonic = () => {
  const colMat = new MAT.CellMaterial("column-ionic-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  //   colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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
  // groundGridMaterial.minorUnitFrequency = 0.1;
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
      // tessellation: 100,
      //   ark: 0,
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
  groundGrid.position = new BABYLON.Vector3(0, -0.45, 24);

  // Create Base
  const colMat = new MAT.CellMaterial("column-ionic-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  //   colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  colTex.vScale = 100;
  colTex.uScale = 100;
  colMat.diffuseTexture = colTex;

  const profile = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(22, -36, 0),
    new BABYLON.Vector3(34, -24, 0),
    new BABYLON.Vector3(48, -12, 0),
    new BABYLON.Vector3(64, 0, 0),
    new BABYLON.Vector3(64, 1, 0),
    new BABYLON.Vector3(62, 1, 0),
    new BABYLON.Vector3(62, 0, 0),
  ];

  const column = BABYLON.MeshBuilder.CreateLathe("base", {
    tessellation: 64,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  column.material = colMat;
  column.convertToFlatShadedMesh();
  column.checkCollisions = true;
  column.position = new BABYLON.Vector3(0, -0.55, 24);
  // column.scaling = new BABYLON.Vector3(0.6, 1, 0.6);

  // return meshes for teleportation
  return [ground];
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>