<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

import garden from "../assets/tiny-garden-large.png";
console.log(garden);

labNotes.value = `
Playing with images.
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

  const sizeW = 2966;
  //   const sizeH = 2966;

  const imagePlane = BABYLON.MeshBuilder.CreatePlane(
    "ec-plane",
    { width: 1.5, height: 1.5 },
    scene
  );
  imagePlane.position = new BABYLON.Vector3(0, 1.75, 0);

  // Dynamic texture
  const dTexture = new BABYLON.DynamicTexture("vrhermit-texture", sizeW, scene);

  // Material for the texture
  var planeMat = new BABYLON.StandardMaterial("Mat", scene);
  planeMat.diffuseTexture = dTexture;
  imagePlane.material = planeMat;

  var dTexContext = dTexture.getContext();
  var subjectImage = new Image();

  subjectImage.src = garden;
  subjectImage.onload = function () {
    //Add image to dynamic texture
    dTexContext.drawImage(this, 0, 0);
    dTexture.update();
  };

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
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
