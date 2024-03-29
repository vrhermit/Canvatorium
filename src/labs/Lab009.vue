<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";

import createTitleCard from "../composables/TitleCard";

labNotes.value = `
Playing with Vue 3 composables as a way of updating BabylonJS objects
- Created a folder called \`composables\`
- New composable called \`TitleCard\`
- Titlecard exports a function called \`createCreateTitle\`, which returns two reactive refs as an object
- The scene destructures this object and uses the refs to update the title card
`;
const bjsCanvas = ref(null);

let engine;
let scene;
let manager;
let anchor;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 2, -3);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  const { title, subtitle } = createTitleCard(scene);

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);

  console.log("3D GUI:", manager, anchor);

  var buttonPrev = new GUI.Button3D("button-previous");
  manager.addControl(buttonPrev);
  buttonPrev.linkToTransformNode(anchor);
  buttonPrev.position = new BABYLON.Vector3(-0.3, 0.8, 0);
  buttonPrev.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  var textPrev = new GUI.TextBlock();
  textPrev.text = "Lab 008";
  textPrev.color = "white";
  textPrev.fontSize = 48;
  buttonPrev.content = textPrev;

  buttonPrev.onPointerUpObservable.add(() => {
    title.value = "Lab 008";
    subtitle.value = "Near Menu";
  });

  var buttonNext = new GUI.Button3D("button-next");
  manager.addControl(buttonNext);
  buttonNext.linkToTransformNode(anchor);
  buttonNext.position = new BABYLON.Vector3(0.3, 0.8, 0);
  buttonNext.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  var textNext = new GUI.TextBlock();
  textNext.text = "Lab 009";
  textNext.color = "white";
  textNext.fontSize = 48;
  buttonNext.content = textNext;

  buttonNext.onPointerUpObservable.add(() => {
    title.value = "Lab 009";
    subtitle.value = "Title Card & Vue 3 Composables";
  });
  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Use the LabPlayer
  createLabPlayer(scene, [ground]);

  // END WebXR --------------------------------------------------

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
