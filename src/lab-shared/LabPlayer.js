/*
This is a shared component used across labs.
Current features
- WebXR default experience
- Teleport system
- Console log common WebXR buttons
- Imports and uses LabConsole for debugging in VR
*/

// import * as BABYLON from "babylonjs");
// import { ref, reactive, watch } from "@vue/runtime-core");
import { createLabConsole } from "../lab-shared/LabConsole";

export const createLabPlayer = async (scene, teleportMeshes) => {
  const { toggleConsole } = createLabConsole(scene);
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: teleportMeshes
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
        //   console.log("Left Axises: " + axes.x + " " + axes.y);
        // });

        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-button
        xButtonComponent.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-button
        yButtonComponent.onButtonStateChangedObservable.add(() => {
          if (yButtonComponent.pressed) {
            console.log("Y Button Pressed");
            toggleConsole(controller);
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
        //   console.log("Right Axises: " + axes.x + " " + axes.y);
        // });

        let aButtonComponent = motionController.getComponent(xr_ids[3]); //a-button
        aButtonComponent.onButtonStateChangedObservable.add(() => {
          if (aButtonComponent.pressed) {
            console.log("A Button Pressed");
          }
        });
        let bButtonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bButtonComponent.onButtonStateChangedObservable.add(() => {
          if (bButtonComponent.pressed) {
            console.log("B Button Pressed");
          }
        });
      }
    });
  });

  // END WebXR --------------------------------------------------
};
