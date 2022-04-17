<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as MAT from "babylonjs-materials";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import LabColors from "../lab-shared/LabColors";
// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
This is a work in progress version of a Stoa for a side project I'm considering.
The geometry is messy, but uses only Babylon JS. No imported models from other tools.

`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  const framesPerSecond = 60;
  const gravity = -9.81;
  scene.gravity = new BABYLON.Vector3(0, gravity / framesPerSecond, 0);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const teleportMeshes = addLabRoomLocal(scene);
  // const ground = BABYLON.MeshBuilder.CreateGround(
  //   "ground",
  //   { height: 50, width: 100, subdivisions: 10 },
  //   scene
  // );
  // ground.position = new BABYLON.Vector3(0, -0.4, -6);
  // //   ground.isVisible = false;
  // ground.receiveShadows = true;
  // ground.sideOrientation = "DOUBLESIDE";
  // const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  // groundMaterial.majorUnitFrequency = 5;
  // groundMaterial.minorUnitFrequency = 0.1;
  // groundMaterial.gridRatio = 1;
  // groundMaterial.backFaceCulling = false;
  // groundMaterial.mainColor = LabColors.light1;
  // groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  // groundMaterial.opacity = 0.98;
  // ground.material = groundMaterial;
  // ground.checkCollisions = true;

  const { floor, step1, step2 } = createBase();
  createRoof();
  createCeilingBlock();
  createCeiling();
  createRails();
  createCorners();
  createWallsInside();
  createWallsOutside();

  const column = createColumnDoric();
  column.position = new BABYLON.Vector3(-16.15, 0, 0);
  columnFactory(column);

  const column2 = createColumn2();
  column2.position = new BABYLON.Vector3(-14, 0, -7);
  columnFactory2(column2);

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

const createBase = () => {
  const blockMat = new BABYLON.StandardMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["dark1"];
  blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  blockMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const blockMat = new BABYLON.StandardMaterial("base-mat", scene);
  blockMat.diffuseColor = LabColors["purple"];
  blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // blockMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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

  const roofCenterMat = new BABYLON.StandardMaterial("base-mat", scene);
  roofCenterMat.diffuseColor = LabColors["light1"];
  roofCenterMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // blockMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const blockMat = new BABYLON.StandardMaterial("ceiling-mat", scene);
  blockMat.diffuseColor = LabColors["red"];
  blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // blockMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const blockMat = new BABYLON.StandardMaterial("ceiling-mat", scene);
  blockMat.diffuseColor = LabColors["blue"];
  blockMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // blockMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const railMat = new BABYLON.StandardMaterial("rail-mat", scene);
  railMat.diffuseColor = LabColors["cyan"];
  railMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // railMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const cornerMat = new BABYLON.StandardMaterial("corner-mat", scene);
  cornerMat.diffuseColor = LabColors["purple"];
  cornerMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // cornerMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const wallMat = new BABYLON.StandardMaterial("wall-mat", scene);
  wallMat.diffuseColor = LabColors["teal"];
  wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // wallMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const blockText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  blockText.uScale = 1;
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
  const wallMat = new BABYLON.StandardMaterial("wall-mat", scene);
  wallMat.diffuseColor = LabColors["orange"];
  wallMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  // wallMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  const colMat = new BABYLON.StandardMaterial("column-doric-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  colMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);

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

  const column = BABYLON.MeshBuilder.CreateLathe("stand", {
    tessellation: 18,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  column.material = colMat;
  column.convertToFlatShadedMesh();

  const cap = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1.02,
    height: 0.16,
    depth: 1.02,
  });
  cap.material = colMat;
  cap.parent = column;
  cap.position = new BABYLON.Vector3(0, 5.38, 0);

  const result = BABYLON.Mesh.MergeMeshes([column, cap], true, true);
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

    // newCol.enableEdgesRendering();
  } while (i < numberOfColumns);
};

const createColumn2 = () => {
  const colMat = new BABYLON.StandardMaterial("column-ionic-mat", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  colMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  colTex.vScale = 4;
  colTex.uScale = 4;
  colMat.diffuseTexture = colTex;

  const profile = [
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 6.4, 0),
    // new BABYLON.Vector3(0.42, 5.05, 0),
    // new BABYLON.Vector3(0.44, 5.1, 0),
    // new BABYLON.Vector3(0.44, 5.2, 0),
    // new BABYLON.Vector3(0.5, 5.3, 0),
    // new BABYLON.Vector3(0.5, 5.4, 0),
    // // new BABYLON.Vector3(0.44, 5.2, 0),
    // new BABYLON.Vector3(0, 5.4, 0),
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

    // newCol.enableEdgesRendering();
  } while (i < numberOfColumns);
};

const addLabRoomLocal = (scene) => {
  // Add a ground plane to the scene. Used for WebXR teleportation
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 100, width: 100, subdivisions: 4 },
    scene
  );
  // ground.position.y = 10;
  ground.sideOrientation = "DOUBLESIDE";
  const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  groundMaterial.majorUnitFrequency = 5;
  groundMaterial.minorUnitFrequency = 0.1;
  groundMaterial.gridRatio = 1;
  groundMaterial.backFaceCulling = false;
  groundMaterial.mainColor = LabColors.light1;
  groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  groundMaterial.opacity = 0.98;
  ground.material = groundMaterial;
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

  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["dark1"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    width: 6,
    height: 3,
    depth: 6,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(-6, 1.5, 12);
  subject1.checkCollisions = true;

  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["dark1"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    width: 6,
    height: 6,
    depth: 6,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(-12, 3, 12);
  subject2.checkCollisions = true;

  const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["dark1"];
  subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
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
  ground.isVisible = false;
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
