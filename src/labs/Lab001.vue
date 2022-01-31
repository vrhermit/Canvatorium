<script setup>
const labNotes = `
This lab uses Vue 3 script setup. It replaces the interface object by combining it with the vue component for the lab.
I picked out some colors to use throughout the labs in the future.
I created a box for each color and used the standard BabylonJS material.
`;

import * as BABYLON from "babylonjs";

import LabLayout from "../components/LabLayout.vue";
import LabColors from "../lab-shared/LabColors";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { ref, onMounted } from "@vue/runtime-core";

const bjsCanvas = ref(null);

const createScene = async (canvas) => {
  // Create and customize the scene
  const engine = new BABYLON.Engine(canvas);
  const scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // Make some boxes to test out the colors in VR
  const group = new BABYLON.Mesh("color-group");
  group.position = new BABYLON.Vector3(-3.5, 0.5, 0);

  makeBox("purple", group, scene).position = new BABYLON.Vector3(0, 0, 0);
  makeBox("blue", group, scene).position = new BABYLON.Vector3(1, 0, 0);
  makeBox("teal", group, scene).position = new BABYLON.Vector3(2, 0, 0);
  makeBox("cyan", group, scene).position = new BABYLON.Vector3(3, 0, 0);

  makeBox("green", group, scene).position = new BABYLON.Vector3(4, 0, 0);
  makeBox("yellow", group, scene).position = new BABYLON.Vector3(5, 0, 0);
  makeBox("orange", group, scene).position = new BABYLON.Vector3(6, 0, 0);
  makeBox("red", group, scene).position = new BABYLON.Vector3(7, 0, 0);

  makeBox("dark1", group, scene).position = new BABYLON.Vector3(0, 1, 0);
  makeBox("dark2", group, scene).position = new BABYLON.Vector3(1, 1, 0);
  makeBox("dark3", group, scene).position = new BABYLON.Vector3(2, 1, 0);
  makeBox("dark4", group, scene).position = new BABYLON.Vector3(3, 1, 0);

  makeBox("light1", group, scene).position = new BABYLON.Vector3(4, 1, 0);
  makeBox("light2", group, scene).position = new BABYLON.Vector3(5, 1, 0);
  makeBox("light3", group, scene).position = new BABYLON.Vector3(6, 1, 0);
  makeBox("light4", group, scene).position = new BABYLON.Vector3(7, 1, 0);

  // WebXRDefaultExperience
  const xrDefault = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });
  const xrHelper = xrDefault.baseExperience;
  console.info("webxr:", xrHelper);

  engine.runRenderLoop(() => {
    scene.render();
  });
};

const makeBox = (colorName, parent, scene) => {
  // Create a colored box from using a string to get the color from the Brand object
  const mat = new BABYLON.StandardMaterial(`${colorName}-material`, scene);
  mat.diffuseColor = LabColors[colorName];
  mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const mesh = BABYLON.MeshBuilder.CreateBox(
    `${colorName}-box`,
    { size: 1 },
    scene
  );
  mesh.material = mat;
  mesh.parent = parent;

  return mesh;
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
