<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as MAT from "babylonjs-materials";
import "babylonjs-loaders";
import { ref, reactive, onMounted, watch } from "@vue/runtime-core";
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

let movementControlManager; // a reference to the movement controls
let movementSettings = reactive({
  movementEnabled: true,
  movementOrientationFollowsViewerPose: true,
  movementSpeed: 1,
  movementThreshold: 0.25,
  rotationEnabled: true,
  rotationSpeed: 0.25,
  rotationThreshold: 0.25,
});

watch(movementSettings, (newValue) => {
  console.log("watching movementSettings", newValue);
  if (movementControlManager) {
    movementControlManager.movementSpeed = newValue.movementSpeed;
    // movementControlManager.movementThreshold = newValue.movementThreshold;
  }
});

let mainCamera;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  addLabRoom(scene);

  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["purple"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject1 = BABYLON.MeshBuilder.CreateSphere("subject1", {
    radius: 1,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(0, 1.5, 0);

  const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.allowMultiPointers = true;
  subject1.addBehavior(sixDofDragBehavior);

  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["blue"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    height: 8,
    width: 16,
    depth: 0.2,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(0, 4, 50);

  const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["green"];
  subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
    height: 8,
    width: 16,
    depth: 0.2,
  });
  subject3.material = subjectMat3;
  subject3.position = new BABYLON.Vector3(0, 4, -50);

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    disableTeleportation: true,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true,
    },
  });

  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    mainCamera = xrCamera;
    xrCamera.position.z = -2;
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

  movementControlManager = featureManager.enableFeature(
    BABYLON.WebXRFeatureName.MOVEMENT,
    "latest",
    {
      xrInput: xr.input,
      customRegistrationConfigurations: swappedHandednessConfiguration,

      // add options here
      movementOrientationFollowsViewerPose: true, // default true
    }
  );
  movementControlManager.movementSpeed = movementSettings.movementSpeed;
  // movementFeature.rotationEnabled = false;
  // movementFeature.rotationSpeed = 2;

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Left Trigger Pressed");
            movementControlManager.movementSpeed =
              movementSettings.movementSpeed * 2;
          } else {
            console.log("Left Trigger Released");
            movementControlManager.movementSpeed =
              movementSettings.movementSpeed;
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Left Grip Pressed");
          }
        });

        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-button
        xButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-button
        yButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (yButtonComponent.pressed) {
            console.log("Y Button Pressed");
            // toggleMenu(controller);
          }
        });
      }

      // END LEFT CONTROLLER ------------------------------------------------------------

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Right Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Right Grip Pressed");
          }
        });

        let aButtonComponent = motionController.getComponent(xr_ids[3]); //a-button
        aButtonComponent?.onButtonStateChangedObservable.add(() => {
          // Move the player back to the start position if the A button is pressed
          if (aButtonComponent.pressed) {
            console.log("A Button Pressed");
            mainCamera.position = new BABYLON.Vector3(
              0,
              mainCamera.position.y,
              -2
            );
          }
        });
        let bButtonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (bButtonComponent.pressed) {
            console.log("B Button Pressed");
            if (movementSettings.movementSpeed == 1) {
              movementSettings.movementSpeed = 0.1;
            } else {
              movementSettings.movementSpeed = 1;
            }
            console.log(
              "Subject 1: ExecuteCodeAction -> OnPickTrigger",
              movementControlManager.movementSpeed,
              movementSettings.movementSpeed
            );
          }
        });
      }
    });
  });

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
