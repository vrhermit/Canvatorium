<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, onMounted, onUnmounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

labNotes.value = `
Expanding on the script setup idea from lab 2.
- Added some reactive references to some data (count and sample)
- Explores watch() and watchEffect() with refs
`;
const bjsCanvas = ref(null);

const sample = ref("default");
const count = ref(0);
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
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);

  makeButton();
  makeCard();

  // WebXRDefaultExperience
  const xrDefault = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });
  const xrHelper = xrDefault.baseExperience;
  console.info("webxr:", xrHelper);

  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

const makeCard = () => {
  // GUI
  var plane = BABYLON.MeshBuilder.CreatePlane("plane", {}, scene);
  plane.position.y = 2;

  var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
  advancedTexture.name = "card-texture";

  var cardText = new GUI.TextBlock("card-text");
  cardText.text = "Watch";
  cardText.color = "white";
  cardText.fontSize = 64;

  advancedTexture.addControl(cardText);
  plane.scaling = new BABYLON.Vector3(5, 5, 5);
};

const makeButton = () => {
  // Let's add a button
  var button = new GUI.Button3D("reset");
  manager.addControl(button);
  button.linkToTransformNode(anchor);
  button.position.y = 1;

  var text1 = new GUI.TextBlock();
  text1.text = "Change Values";
  text1.color = "white";
  text1.fontSize = 24;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    count.value++;
    sample.value = "Modified";
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
});

// Watch with a single value
watch(count, (newValue, oldValue) => {
  const texture = scene.getTextureByName("card-texture");
  texture.getControlByName("card-text").text =
    "From " + oldValue + " to " + newValue;
});

// // Watch with multiple values
// watch([sample, count], (newValues, prevValues) => {
//   const texture = scene.getTextureByName("card-texture");
//   const [oldText, oldNum] = prevValues;
//   const [text, num] = newValues;
//   texture.getControlByName("card-text").text =
//     oldText + " > " + text + "; " + oldNum + " > " + num;
// });

// watchEffect watches any changes to reactive data using the effect hook
// watchEffect(
//   () => {
//     if (scene) {
//       const texture = scene.getTextureByName("card-texture");
//       texture.getControlByName("card-text").text =
//         sample.value + " " + count.value;
//     }
//     console.log("watching", sample.value + " " + count.value, scene);
//   }
// );
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
