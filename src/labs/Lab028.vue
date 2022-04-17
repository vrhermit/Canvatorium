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
  //   const ground = addLabRoom(scene);
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 36, width: 64, subdivisions: 10 },
    scene
  );
  ground.position = new BABYLON.Vector3(0, -0.4, -6);
  //   ground.isVisible = false;
  ground.receiveShadows = true;
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

  const rail = BABYLON.MeshBuilder.CreateBox(
    "rail",
    { height: 0.6, width: 36.5, depth: 0.8 },
    scene
  );
  // rail.material = blockMat;
  rail.position = new BABYLON.Vector3(0, 5.76, 0);

  const { floor, step1, step2 } = createBase();

  const column = createColumnDoric();
  column.position = new BABYLON.Vector3(-16.15, 0, 0);
  columnFactory(column);

  const column2 = createColumn2();
  column2.position = new BABYLON.Vector3(-14, 0, -7);
  columnFactory2(column2);

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

const createBase = () => {
  const blockMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  blockMat.diffuseColor = LabColors["light1"];
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

const createColumnDoric = () => {
  const colMat = new BABYLON.StandardMaterial("menu-card-material", scene);
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
  const colMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  colMat.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  colTex.vScale = 4;
  colTex.uScale = 4;
  colMat.diffuseTexture = colTex;
  //   colMat.emissiveTexture = colTex;
  //   colMat.

  const profile = [
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 7.4, 0),
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
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
