<script setup>
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, onMounted } from "@vue/runtime-core";

import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

const bjsCanvas = ref(null);

const sample = ref("default value");
const count = ref(0);
let manager;
let anchor;

const createScene = async (canvas) => {
  // Create and customize the scene
  const engine = new BABYLON.Engine(canvas);
  const scene = new BABYLON.Scene(engine);

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

const makeButton = () => {
  // Let's add a button
  var button = new GUI.Button3D("reset");
  manager.addControl(button);
  button.linkToTransformNode(anchor);
  button.position.y = 1;

  var text1 = new GUI.TextBlock();
  text1.text = sample.value;
  text1.color = "white";
  text1.fontSize = 24;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    count.value++;
    sample.value = "new value";
    text1.text = sample.value + " " + count.value;
    console.log("Sample value changed to: " + sample.value + " " + count.value);
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});
</script>

<template>
  <div>{{ sample }} - {{ count }}</div>
  <canvas id="bjsCanvas" ref="bjsCanvas" />
</template>

<style>
canvas {
  width: 100%;
  height: 100%;
  padding: auto;
}
</style>