<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";
// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Columns

`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  console.log(ground);

  createColumn1();

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
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

const createColumn1 = () => {
  const colMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  colTex.vScale = 4;
  colTex.uScale = 4;
  colMat.diffuseTexture = colTex;

  const maseMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  maseMat.diffuseColor = LabColors["light3"];
  maseMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const baseTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);

  maseMat.diffuseTexture = baseTex;

  const base = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1.04,
    height: 0.2,
    depth: 1.04,
  });
  base.material = maseMat;
  base.position = new BABYLON.Vector3(0, 0.1, 0);

  const cap = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1.04,
    height: 0.2,
    depth: 1.04,
  });
  cap.material = maseMat;
  cap.position = new BABYLON.Vector3(0, 5.34, 0);

  const profile = [
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.4, 5, 0),
    new BABYLON.Vector3(0.41, 5.04, 0),
    new BABYLON.Vector3(0.41, 5.08, 0),
    new BABYLON.Vector3(0.5, 5.25, 0),
  ];

  const column = BABYLON.MeshBuilder.CreateLathe("stand", {
    tessellation: 18,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  column.material = colMat;
  column.convertToFlatShadedMesh();
  column.enableEdgesRendering();
  column.edgesWidth = 0.2;
  column.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);

  base.material = colMat;
  base.enableEdgesRendering();
  base.edgesWidth = 0.4;
  base.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);

  cap.material = colMat;
  cap.enableEdgesRendering();
  cap.edgesWidth = 0.4;
  cap.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);

  base.addChild(column);
  base.addChild(cap);

  return base;
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
