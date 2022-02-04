<script setup>
const labNotes = `
Explore the idea of overriding console.log() so I can view the log in VR
- This is just a proof-of-concept, not a full-fledged solution
- Override console.log() and stash the message in a reactive variable
- watch the variable and display the message in VR by updating the text in a scroll view
- Updated on 2022.01.27 - Move the Console Log features to src/lab-shared/LabConsole.js
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabConsole } from "../lab-shared/LabConsole";

const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  const { consoleIsVisible, setConsoleTransform } = createLabConsole(scene);

  consoleIsVisible.value = true;
  setConsoleTransform(
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(0, 1, -2),
    new BABYLON.Vector3(0.5, 0.5, 0.5)
  );

  console.log("WebXR Console Logging in Babylon JS");
  console.log("Press the Y button to show/hide the console");
  console.log(
    "When the console shows, it will appear in front of your left controller."
  );

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  // let vrCamera;
  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.z = -2;
  });

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        // console.log("grip", controller.grip);
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Left Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Left Grip Pressed");
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            console.log("Left Thumbstick Pressed");
          }
        });
        // thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
        //   console.log("Left Axis Values: " + axes.x + " " + axes.y);
        // });

        let abuttonComponent = motionController.getComponent(xr_ids[3]); //x-button
        abuttonComponent.onButtonStateChangedObservable.add(() => {
          if (abuttonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
        let bbuttonComponent = motionController.getComponent(xr_ids[4]); //y-button
        bbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (bbuttonComponent.pressed) {
            console.log("Y Button Pressed");
            consoleIsVisible.value = !consoleIsVisible.value;

            if (controller.grip && consoleIsVisible.value) {
              // Create an empty ray
              const tmpRay = new BABYLON.Ray(
                new BABYLON.Vector3(),
                new BABYLON.Vector3(),
                Infinity
              );

              // Update the ray to use the controller's position and forward
              controller.getWorldPointerRayToRef(tmpRay, true);

              // Calculate a position in front of the controller
              const newPosition = new BABYLON.Vector3(
                tmpRay.origin.x + tmpRay.direction.x,
                tmpRay.origin.y,
                tmpRay.origin.z + tmpRay.direction.z
              );

              // Use the current position of the controller as a vector to use with lookAt()
              const newRotation = new BABYLON.Vector3(
                tmpRay.origin.x,
                tmpRay.origin.y,
                tmpRay.origin.z
              );

              const newScale = new BABYLON.Vector3(0.5, 0.5, 0.5);
              setConsoleTransform(
                // Repacking these so I don't end up with a reference to the controller
                newPosition,
                newRotation,
                newScale
              );
            }
          }
        });
      }

      // END LEFT CONTROLLER ------------------------------------------------------------

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Right Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Right Grip Pressed");
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            console.log("Right Thumbstick Pressed");
          }
        });
        // thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
        //   console.log("Right Axis Values: " + axes.x + " " + axes.y);
        // });

        let abuttonComponent = motionController.getComponent(xr_ids[3]); //a-button
        abuttonComponent.onButtonStateChangedObservable.add(() => {
          if (abuttonComponent.pressed) {
            console.log("A Button Pressed");
          }
        });
        let bbuttonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bbuttonComponent.onButtonStateChangedObservable.add(() => {
          if (bbuttonComponent.pressed) {
            console.log("B Button Pressed");
          }
        });
      }
    });
  });

  // TEST GRABBING
  const selectedMeshes = {};
  // POINTERDOWN
  scene.onPointerObservable.add((pointerInfo) => {
    const { pickInfo } = pointerInfo;
    const { hit } = pickInfo;
    const { pickedMesh } = pickInfo;
    if (!hit) return;
    if (!pickedMesh) return;
    if (!pickedMesh.startInteraction) return;
    selectedMeshes[pointerInfo.event.pointerId] = pickedMesh;
    if (
      xr.baseExperience &&
      xr.baseExperience.state === BABYLON.WebXRState.IN_XR
    ) {
      // XR Mode
      const xrInput = xr.pointerSelection.getXRControllerByPointerId(
        pointerInfo.event.pointerId
      );
      if (!xrInput) return;
      const motionController = xrInput.motionController;
      if (!motionController) return;
      pickedMesh.startInteraction(pointerInfo, motionController.rootMesh);
    } else {
      pickedMesh.startInteraction(pointerInfo, scene.activeCamera);
    }
  }, BABYLON.PointerEventTypes.POINTERDOWN);

  // POINTERUP
  scene.onPointerObservable.add((pointerInfo) => {
    const pickedMesh = selectedMeshes[pointerInfo.event.pointerId];
    if (pickedMesh) {
      if (pickedMesh.endInteraction) {
        pickedMesh.endInteraction(pointerInfo);
      }
      delete selectedMeshes[pointerInfo.event.pointerId];
    }
  }, BABYLON.PointerEventTypes.POINTERUP);

  // END WebXR --------------------------------------------------

  engine.runRenderLoop(() => {
    scene.render();
  });
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
