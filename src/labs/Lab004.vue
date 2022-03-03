<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ref, onMounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

labNotes.value = `
Continuing from lab 3 with controller input and buttons
- Explore the xr object with async/await
- Print a message when the visitor enters immersive mode
- Reposition the camera when the user enters immersive mode
- Added controller button logging to a message value. Adapted from this playground: https://playground.babylonjs.com/#28EKWI#37
- Tested with Oculus Quest 2 Controllers
`;
const bjsCanvas = ref(null);

const count = ref(0);
const message = ref("message value");
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
  console.log(ground);

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);

  makeAddButton();
  makeSubButton();
  makeCard();

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  // Perform actions when entering immersiveXR mode
  xr.baseExperience.sessionManager.onXRSessionInit.add((session) => {
    console.log("XR Session Init", session);
    const texture = scene.getTextureByName("card-texture");
    texture.getControlByName("card-text").text = "Welcome to Lab 003";
  });

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    console.log("XR Camera", xrCamera);
    xrCamera.position.z = -2;
  });

  // Playing with control input
  console.log("input", xr.input);

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            message.value = "Left Trigger Pressed";
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            message.value = "Left Grip Pressed";
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            message.value = "Left Thumbstick Pressed";
          }
        });
        thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
          message.value = "Left Axises: " + axes.x + " " + axes.y;
          console.log("axes", axes);
        });

        let abuttonComponent = motionController.getComponent(xr_ids[3]); //x-button
        abuttonComponent.onButtonStateChangedObservable.add(() => {
          if (abuttonComponent.pressed) {
            message.value = "X Button Pressed";
          }
        });
        let bbuttonComponent = motionController.getComponent(xr_ids[4]); //y-button
        bbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (bbuttonComponent.pressed) {
            message.value = "Y Button Pressed";
          }
        });
      }

      // END LEFT CONTROLLER ------------------------------------------------------------

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            message.value = "Right Trigger Pressed";
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            message.value = "Right Grip Pressed";
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            message.value = "Right Thumbstick Pressed";
          }
        });
        thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
          message.value = "Right Axises: " + axes.x + " " + axes.y;
          console.log("axes", axes);
        });

        let abuttonComponent = motionController.getComponent(xr_ids[3]); //a-button
        abuttonComponent.onButtonStateChangedObservable.add(() => {
          if (abuttonComponent.pressed) {
            message.value = "A Button Pressed";
          }
        });
        let bbuttonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (bbuttonComponent.pressed) {
            message.value = "B Button Pressed";
          }
        });
      }
    });
  });
  // END WebXR --------------------------------------------------

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
  cardText.text = message.value;
  cardText.color = "white";
  cardText.fontSize = 64;

  advancedTexture.addControl(cardText);
  plane.scaling = new BABYLON.Vector3(5, 5, 5);
};

const makeAddButton = () => {
  // Let's add a button
  var button = new GUI.Button3D("button-add");
  manager.addControl(button);
  button.linkToTransformNode(anchor);
  button.position = new BABYLON.Vector3(0.3, 1, 0);
  button.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  var text1 = new GUI.TextBlock();
  text1.text = "count++";
  text1.color = "white";
  text1.fontSize = 64;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    count.value++;
    message.value = "count: " + count.value;
  });
};

const makeSubButton = () => {
  // Let's add a button
  var button = new GUI.Button3D("button-sub");
  manager.addControl(button);
  button.linkToTransformNode(anchor);
  button.position = new BABYLON.Vector3(-0.3, 1, 0);
  button.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

  var text1 = new GUI.TextBlock();
  text1.text = "count--";
  text1.color = "white";
  text1.fontSize = 48;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    count.value--;
    message.value = "count: " + count.value;
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

// Watch with a single value
watch(message, (newValue, oldValue) => {
  console.log(oldValue, newValue);
  const texture = scene.getTextureByName("card-texture");
  texture.getControlByName("card-text").text = newValue;
});
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
