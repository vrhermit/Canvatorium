/*
This is a shared component used across labs.
Current features
- WebXR default experience
- Teleport system
- Console log common WebXR buttons
- Imports and uses LabConsole for debugging in VR
*/

import * as BABYLON from "babylonjs";
// import { ref, reactive, watch } from "@vue/runtime-core");
import { createLabMenu } from "../lab-shared/LabMenu";

export const createLabPlayer = async (scene, teleportMeshes) => {
  const { toggleMenu } = createLabMenu(scene);
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: teleportMeshes,
    disableTeleportation: true,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true
    }
  });

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.z = -2;
  });

  // const xrInput = xr.input;
  const swappedHandednessConfiguration = [
    {
      allowedComponentTypes: [BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE, BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE],
      forceHandedness: "right",
      axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
        console.log(xrInput);
        movementState.rotateX = Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0;
        movementState.rotateY = Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0;
      }
    },
    {
      allowedComponentTypes: [BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE, BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE],
      forceHandedness: "left",
      axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
        console.log(xrInput);
        movementState.moveX = Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0;
        movementState.moveY = Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0;
      }
    }
  ];

  function setupCameraForCollisions(camera) {
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.7, 1, 0.7);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0);
  }

  setupCameraForCollisions(xr.input.xrCamera);

  const featureManager = xr.baseExperience.featuresManager;

  const movementFeature = featureManager.enableFeature(BABYLON.WebXRFeatureName.MOVEMENT, "latest", {
    xrInput: xr.input,
    customRegistrationConfigurations: swappedHandednessConfiguration,

    // add options here
    movementOrientationFollowsViewerPose: true // default true
  });
  movementFeature.movementSpeed = 0.5;
  // movementFeature.rotationEnabled = false;
  // movementFeature.rotationSpeed = 2;

  console.log(movementFeature);

  // const featuresManager = xr.featuresManager;
  // featuresManager.enableFeature(BABYLON.WebXRFeatureName.POINTER_SELECTION, "stable", {
  //   enablePointerSelectionOnAllControllers: true
  // });

  console.log("xrdir", xr);

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Left Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Left Grip Pressed");
          }
        });
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent?.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            console.log("Left Thumbstick Pressed");
          }
        });
        // thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
        //   console.log("Left Axises: " + axes.x + " " + axes.y);
        // });

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
            toggleMenu(controller);
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
        let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        thumbstickComponent?.onButtonStateChangedObservable.add(() => {
          if (thumbstickComponent.pressed) {
            console.log("Right Thumbstick Pressed");
          }
        });
        // thumbstickComponent.onAxisValueChangedObservable.add((axes) => {
        //   console.log("Right Axises: " + axes.x + " " + axes.y);
        // });

        let aButtonComponent = motionController.getComponent(xr_ids[3]); //a-button
        aButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (aButtonComponent.pressed) {
            console.log("A Button Pressed");
          }
        });
        let bButtonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (bButtonComponent.pressed) {
            console.log("B Button Pressed");
          }
        });
      }
    });
  });

  return { xr };

  // END WebXR --------------------------------------------------
};
