<script setup>
/*
Lab Notes:
Continuing from lab 2 with reactive data
- Explore the xr object with async/await
- Print a message when the visitor enters immersive mode
- Reposition the camera when the user enters immersive mode
- Add some button events to the trigger, these update the count value --/++
*/
import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, onMounted, watch } from "@vue/runtime-core";

import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

const bjsCanvas = ref(null);

const count = ref(0);
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
  console.log(ground);

  // Make some boxes to test out the colors in VR
  const group = new BABYLON.Mesh("logo-group");
  group.position = new BABYLON.Vector3(-3.5, 0.5, 0);

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
            count.value--;
          }
        });
      }
      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            count.value++;
          }
        });
      }
    });
  });

  // END WebXR --------------------------------------------------

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
  cardText.text = "{message}";
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
  text1.fontSize = 64;
  button.content = text1;

  button.onPointerUpObservable.add(() => {
    count.value--;
  });
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

// Watch with a single value
watch(count, (newValue, oldValue) => {
  const texture = scene.getTextureByName("card-texture");
  texture.getControlByName("card-text").text =
    "From " + oldValue + " to " + newValue;
});
</script>

<template>
  <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
  <p>Lab 003 - Learning more about WebXR in Babylon JS</p>
</template>
