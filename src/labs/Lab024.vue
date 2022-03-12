<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as MAT from "babylonjs-materials";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Movement Controls
- Try out the new Movement Controls in Babylon JS 5.0


Resources
- Documentation for [Movement Controls](https://doc.babylonjs.com/divingDeeper/webXR/WebXRSelectedFeatures#movement-module)
- Movement Controls [Playground](https://playground.babylonjs.com/#AZML8U) - I adapted this to the controls used in this lab.
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
  addLabRoom(scene);

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    disableTeleportation: true,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true,
    },
  });

  const swappedHandednessConfiguration = [
    {
      allowedComponentTypes: [
        BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
        BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
      ],
      forceHandedness: "right",
      axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
        console.log(xrInput);
        movementState.rotateX =
          Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0;
        movementState.rotateY =
          Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0;
      },
    },
    {
      allowedComponentTypes: [
        BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
        BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
      ],
      forceHandedness: "left",
      axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
        console.log(xrInput);
        movementState.moveX =
          Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0;
        movementState.moveY =
          Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0;
      },
    },
  ];

  setupCameraForCollisions(xr.input.xrCamera);

  const featureManager = xr.baseExperience.featuresManager;

  const movementFeature = featureManager.enableFeature(
    BABYLON.WebXRFeatureName.MOVEMENT,
    "latest",
    {
      xrInput: xr.input,
      customRegistrationConfigurations: swappedHandednessConfiguration,

      // add options here
      movementOrientationFollowsViewerPose: true, // default true
    }
  );
  movementFeature.movementSpeed = 0.5;
  // movementFeature.rotationEnabled = false;
  // movementFeature.rotationSpeed = 2;

  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

const setupCameraForCollisions = (camera) => {
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new BABYLON.Vector3(0.7, 1, 0.7);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0);
};

const addLabRoom = (scene) => {
  // Add a ground plane to the scene. Used for WebXR teleportation
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 100, width: 100, subdivisions: 4 },
    scene
  );
  // ground.position.y = 10;
  ground.sideOrientation = "DOUBLESIDE";
  const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  groundMaterial.majorUnitFrequency = 5;
  groundMaterial.minorUnitFrequency = 0.1;
  groundMaterial.gridRatio = 1;
  groundMaterial.backFaceCulling = false;
  groundMaterial.mainColor = LabColors.light1;
  groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  groundMaterial.opacity = 0.98;
  ground.material = groundMaterial;
  ground.checkCollisions = true;

  // Note: the rotation of these elements is set to put the face of the plane/ground facing the inside of the room so that collisions will work.

  const wall1 = BABYLON.MeshBuilder.CreateGround(
    "wall1",
    { height: 10, width: 100, subdivisions: 4 },
    scene
  );
  wall1.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, Math.PI / 2);
  wall1.position = new BABYLON.Vector3(-50, 5, 0);
  wall1.material = groundMaterial;
  wall1.sideOrientation = "DOUBLESIDE";
  wall1.checkCollisions = true;

  const wall2 = wall1.clone("wall2");
  wall2.rotation.z = -Math.PI / 2;
  wall2.position = new BABYLON.Vector3(50, 5, 0);

  console.log("wall rotation", wall1.rotation, wall2.rotation);
  const wall3 = wall1.clone("wall3");
  wall3.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall3.position = new BABYLON.Vector3(0, 5, -50);

  const wall4 = wall3.clone("wall4");
  wall4.rotation.z = -Math.PI / 2;
  wall4.position = new BABYLON.Vector3(0, 5, 50);
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
