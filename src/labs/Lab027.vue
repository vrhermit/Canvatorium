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

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 100, width: 52, subdivisions: 13 },
    scene
  );
  ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  // ground.position.y = 10;
  ground.sideOrientation = "DOUBLESIDE";
  ground.position = new BABYLON.Vector3(25.5, 49.5, 0);
  //   ground.position = new BABYLON.Vector3(25.5, -0.05, 49.5);
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
  //   ground.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  //   const ground = addLabRoom(scene);
  //   console.log(ground);

  //   const pastMat = new BABYLON.StandardMaterial(scene);
  //   pastMat.diffuseColor = new BABYLON.Color3.FromHexString("#03c4a1");
  //   pastMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const futureMat = new BABYLON.StandardMaterial(scene);
  futureMat.diffuseColor = new BABYLON.Color3.FromHexString("#718096");
  futureMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  futureMat.parent = ground;

  //   const pastRect = new BABYLON.MeshBuilder.CreatePlane("plane", {
  //     width: 0.9,
  //     height: 0.9,
  //   });
  //   pastRect.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  //   pastRect.position = new BABYLON.Vector3(0, 0, 0);
  //   pastRect.material = pastMat;

  const futureRect = new BABYLON.MeshBuilder.CreatePlane("plane", {
    width: 0.9,
    height: 0.9,
  });
  //   futureRect.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  futureRect.position = new BABYLON.Vector3(0, 0, 0);
  futureRect.material = futureMat;

  function diff_weeks(dt2, dt1) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24 * 7;
    return Math.abs(Math.round(diff));
  }

  const createRects = () => {
    let week = 0;
    const startDate = new Date("March 29, 1982 12:00:00");
    const today = new Date("March 29, 2022 12:00:00");

    let numberOfWeeks = diff_weeks(startDate, today);
    console.log(numberOfWeeks);
    let z = 0;
    do {
      let x = 0;

      do {
        week++;
        // console.log("week:", week);
        // console.log(z, x);
        // Instance version
        // const rect = futureRect.createInstance("z" + z);
        // rect.position = new BABYLON.Vector3(x, 0, z);
        // Thin instance version
        var matrix = BABYLON.Matrix.Translation(x, z, 0);
        futureRect.thinInstanceAdd(matrix);
        x += 1;
      } while (x < 52 && week < numberOfWeeks);
      z += 1;
    } while (z < 99 && week < numberOfWeeks);
    console.log("week:", week);
    console.log("done");
  };
  //   console.log(createRects);
  createRects();
  futureRect.isVisisble = false;

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.x = 0;
    xrCamera.position.z = -10;
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
