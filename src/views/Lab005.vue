<script setup>
/*
Lab Notes:
Testing cross-scene navigaiton with Router and Window.location
*/
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, onMounted } from "@vue/runtime-core";
import { useRouter } from "vue-router";

import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

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

  // Use the shared lap tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // Make some boxes to test out the colors in VR
  const group = new BABYLON.Mesh("logo-group");
  group.position = new BABYLON.Vector3(-3.5, 0.5, 0);

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);

  makeButton();
  makeCard();

  // WebXRDefaultExperience
  const xrDefault = scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });
  const xrHelper = xrDefault.baseExperience;
  console.info("webxr:", xrHelper);

  engine.runRenderLoop(() => {
    scene.render();
  });
};

const makeCard = () => {
  // GUI
  var plane = BABYLON.MeshBuilder.CreatePlane("plane", {}, scene);
  plane.position.y = 2;

  var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
  advancedTexture.name = "card-texture";

  var cardText = new GUI.TextBlock("card-text");
  cardText.text = "Lab 005";
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
  text1.text = "Go to Lab 006";
  text1.color = "white";
  text1.fontSize = 24;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    console.log("button clicked");
    // This does not work
    router.push({
      name: "Lab 006",
    });
    // This does work
    // window.location.assign("/lab006");
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});
</script>

<template>
  <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
  <p>
    Lab 005 - Router Nav to Lab 006 (not working). I'm not sure if the issue is
    in Vue Router or on Babylon JS. Placing this idea on hold for now. While
    Router may not work, I can brute force my way to other scenes with
    <code>window.location.assign("/lab006");</code>
  </p>
</template>
