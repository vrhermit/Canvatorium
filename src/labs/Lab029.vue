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
  scene.clearColor = BABYLON.Color3.FromHexString("#a7dbff");
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

  //   var skyMaterial = new MAT.SkyMaterial("skyMaterial", scene);
  //   skyMaterial.backFaceCulling = false;
  //   skyMaterial.luminance = 0.2;
  //   skyMaterial.inclination = -0.4; // The solar inclination, related to the solar azimuth in interval [0, 1]
  //   skyMaterial.azimuth = 0.2; // The solar azimuth in interval [0, 1]

  //   var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
  //   skybox.material = skyMaterial;

  const daylight = new BABYLON.DirectionalLight(
    "daylight",
    new BABYLON.Vector3(-50, -50, -50),
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
  //   colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
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
  //   const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  //   groundMaterial.majorUnitFrequency = 5;
  //   groundMaterial.minorUnitFrequency = 0.1;
  //   groundMaterial.gridRatio = 1;
  //   groundMaterial.backFaceCulling = false;
  //   groundMaterial.mainColor = LabColors.light3;
  //   groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  //   groundMaterial.opacity = 0.98;

  const groundMaterial = new MAT.CellMaterial("ground-mat", scene);
  groundMaterial.diffuseColor = LabColors["light1"];

  const ground = BABYLON.MeshBuilder.CreateDisc(
    "ground",
    {
      radius: 100,
      tessellation: 100,
      //   ark: 0,
    },
    scene
  );
  ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  ground.position = new BABYLON.Vector3(0, -0.5, 0);

  //   const ground = BABYLON.MeshBuilder.CreateGround(
  //     "ground",
  //     { height: 100, width: 100, subdivisions: 4 },
  //     scene
  //   );
  ground.material = groundMaterial;
  ground.sideOrientation = "DOUBLESIDE";
  ground.checkCollisions = true;

  // Note: the rotation of these elements is set to put the face of the plane/ground facing the inside of the room so that collisions will work.

  const wall1 = BABYLON.MeshBuilder.CreateGround(
    "wall1",
    { height: 10, width: 100, subdivisions: 4 },
    scene
  );
  wall1.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, Math.PI / 2);
  wall1.position = new BABYLON.Vector3(-50, 5, 0);
  wall1.material = groundMaterial;
  wall1.sideOrientation = "DOUBLESIDE";
  wall1.checkCollisions = true;

  const wall2 = wall1.clone("wall2");
  wall2.rotation.z = -Math.PI / 2;
  wall2.position = new BABYLON.Vector3(50, 5, 0);

  const wall3 = BABYLON.MeshBuilder.CreateGround(
    "wall1",
    { height: 10, width: 100, subdivisions: 4 },
    scene
  );
  wall3.material = groundMaterial;
  wall3.sideOrientation = "DOUBLESIDE";
  wall3.checkCollisions = true;
  wall3.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall3.position = new BABYLON.Vector3(0, 5, -50);

  const wall4 = wall3.clone("wall4");
  wall4.rotation.z = -Math.PI / 2;
  wall4.position = new BABYLON.Vector3(0, 5, 50);

  const subjectMat1 = new MAT.CellMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["light1"];
  //   subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    width: 6,
    height: 3,
    depth: 6,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(-6, 1.5, 12);
  subject1.checkCollisions = true;

  const subjectMat2 = new MAT.CellMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["light1"];
  //   subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    width: 6,
    height: 6,
    depth: 6,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(-12, 3, 12);
  subject2.checkCollisions = true;

  const subjectMat3 = new MAT.CellMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["light1"];
  //   subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
    width: 6,
    height: 9,
    depth: 6,
  });
  subject3.material = subjectMat3;
  subject3.position = new BABYLON.Vector3(-18, 4.5, 12);
  subject3.checkCollisions = true;

  subject1.isVisible = false;
  subject2.isVisible = false;
  subject3.isVisible = false;
  //   ground.isVisible = false;
  wall1.isVisible = false;
  wall2.isVisible = false;
  wall3.isVisible = false;
  wall4.isVisible = false;

  // return meshes for teleportation
  return [ground, subject1, subject2, subject3];
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>