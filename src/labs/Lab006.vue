<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";
import { useRouter } from "vue-router";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

labNotes.value = `
Testing cross-scene navigaiton with Router and Window.location
`;
const bjsCanvas = ref(null);

const router = useRouter();

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
const makeCard = () => {
  // GUI
  var plane = BABYLON.MeshBuilder.CreatePlane("plane", {}, scene);
  plane.position.y = 2;

  var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
  advancedTexture.name = "card-texture";

  var cardText = new GUI.TextBlock("card-text");
  cardText.text = "Lab 006";
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
  text1.text = "Go to Lab 005";
  text1.color = "white";
  text1.fontSize = 24;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    console.log("button clicked");
    // This does not work
    router.push({
      name: "Lab005",
    });
    // This does work
    // window.location.assign("/lab005");
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
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
