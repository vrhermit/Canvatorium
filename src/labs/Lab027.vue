<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as MAT from "babylonjs-materials";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import LabColors from "../lab-shared/LabColors";

// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Performance Testing
Playing with Clones, Instances, and Thin Instances.
All three options take a while to create the copies, leading to slower initial load time.
Clones offer the most customization, but are the least performant.
Thin instances are the most performant, but are the least customizable.
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
  scene.getCameraByName("camera").position = new BABYLON.Vector3(26, 52, -26);
  scene.getCameraByName("camera").setTarget(new BABYLON.Vector3(26, 52, 0));
  addLabLights(scene);

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 100, width: 52, subdivisions: 13 },
    scene
  );
  ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  ground.sideOrientation = "DOUBLESIDE";
  ground.position = new BABYLON.Vector3(25.5, 49.5, 0);
  // ground.position = new BABYLON.Vector3(25.5, -0.05, 49.5);
  const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  groundMaterial.majorUnitFrequency = 13;
  groundMaterial.minorUnitFrequency = 0.1;
  groundMaterial.gridRatio = 1;
  groundMaterial.backFaceCulling = false;
  groundMaterial.mainColor = LabColors.light1;
  groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  groundMaterial.opacity = 0.98;
  groundMaterial.gridOffset = new BABYLON.Vector3(0, 0, 2);
  ground.material = groundMaterial;
  ground.checkCollisions = true;

  const boxMat = new BABYLON.StandardMaterial(scene);
  boxMat.diffuseColor = new BABYLON.Color3.FromHexString("#718096");
  boxMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  boxMat.parent = ground;

  const box = new BABYLON.MeshBuilder.CreateBox("plane", {
    width: 0.8,
    height: 0.8,
    depth: 0.2,
  });
  box.position = new BABYLON.Vector3(0, 0, 0);
  box.material = boxMat;

  const createRects = () => {
    let row = 0;

    let numberOfItems = 5200;
    console.log(numberOfItems);
    let z = 0;
    do {
      let x = 0;

      do {
        row++;
        // console.log("week:", week);
        // console.log(z, x);
        // Instance version
        // const rect = futureRect.createInstance("z" + z);
        // rect.position = new BABYLON.Vector3(x, 0, z);
        // Thin instance version
        var matrix = BABYLON.Matrix.Translation(x, z, 0);
        box.thinInstanceAdd(matrix);
        x += 1;
      } while (x < 52 && row < numberOfItems);
      z += 1;
    } while (z < 100 && row < numberOfItems);
  };
  //   console.log(createRects);
  createRects();
  box.isVisisble = false;

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.x = 26;
    xrCamera.position.y = 52;
    xrCamera.position.z = -26;
    xrCamera.applyGravity = false;
  });

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
