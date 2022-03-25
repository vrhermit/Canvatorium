<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";

import ecLogo from "../assets/ec-logo.png";
console.log(ecLogo);

labNotes.value = `
Working with Assets
- Example 1: vrhermit image loaded from the public/assets folder
- Example 2: ec logo loaded from the src/assets folder
  - import it from the src/assets folder
  - use the import name to reference it in the scene
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

  // Example 1: vrhermit image loaded from the public/assets folder
  // Plane for the texture
  const vrhermitPlane = BABYLON.MeshBuilder.CreatePlane(
    "vrhermit-plane",
    { width: 1, height: 1 },
    scene
  );
  vrhermitPlane.position = new BABYLON.Vector3(-1.5, 1.5, 0);

  // Dynamic texture
  const vrhermitTexture = new BABYLON.DynamicTexture(
    "vrhermit-texture",
    512,
    scene
  );

  // Material for the texture
  var vrhermitMaterial = new BABYLON.StandardMaterial("Mat", scene);
  vrhermitMaterial.diffuseTexture = vrhermitTexture;
  vrhermitPlane.material = vrhermitMaterial;

  var vrhermitTextureContext = vrhermitTexture.getContext();
  var vrhermitImage = new Image();

  vrhermitImage.src = "assets/vrhermit_ReadyPlayerMe.jpg";
  vrhermitImage.onload = function () {
    //Add image to dynamic texture
    vrhermitTextureContext.drawImage(this, 0, 0);
    vrhermitTexture.update();
  };

  // Example 2: ec logo loaded from the src/assets folder
  // Plane for the texture
  const ecPlane = BABYLON.MeshBuilder.CreatePlane(
    "ec-plane",
    { width: 1, height: 1 },
    scene
  );
  ecPlane.position = new BABYLON.Vector3(1.5, 1.5, 0);

  // Dynamic texture
  const ecTexture = new BABYLON.DynamicTexture("vrhermit-texture", 3072, scene);

  // Material for the texture
  var ecMaterial = new BABYLON.StandardMaterial("Mat", scene);
  ecMaterial.diffuseTexture = ecTexture;
  ecPlane.material = ecMaterial;

  var ecTextureContext = ecTexture.getContext();
  var ecImage = new Image();

  ecImage.src = ecLogo;
  ecImage.onload = function () {
    //Add image to dynamic texture
    ecTextureContext.drawImage(this, 0, 0);
    ecTexture.update();
  };

  // BABYLON.SceneLoader.Append(
  //   "./assets/",
  //   "vrh-sandbox-001.glb",
  //   scene,
  //   function (newScene) {
  //     // do something with the scene
  //     console.log("model loaded", newScene);
  //     let node;
  //     for (node of scene.rootNodes) {
  //       console.log(node);
  //       node.scaling = new BABYLON.Vector3(10, 10, 10);
  //     }
  //   }
  // );

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
