/*
This is a shared component used across labs.
Current features
- WebXR default experience
- Teleport system
- Console log common WebXR buttons
- Imports and uses LabConsole for debugging in VR
*/

// import * as BABYLON from "babylonjs";
// import { ref, reactive, watch } from "@vue/runtime-core");
import * as BABYLON from "babylonjs";
import { createLabMenu } from "../lab-shared/LabMenu";
import { reactive } from "@vue/runtime-core";
import { useStorage } from "@vueuse/core";
import LabColors from "../lab-shared/LabColors";

export const createLabPlayer = async (scene, teleportMeshes) => {
  // Default settings for the movement controls
  const defaultMovementSettings = {
    locomotionType: "teleport", // "teleport" or "movement"
    // Movement settings
    movementEnabled: true,
    movementSpeed: 0.5, // 1 is too fast most of the time
    rotationEnabled: true,
    rotationSpeed: 0.25,
    // Teleport settings
    parabolicCheckRadius: 5,
    rotationAngle: 0.25, // teleport rotation angle, not movement controls
    backwardsTeleportationDistance: 0.7
  };

  // Spread the default settings into the stored settings
  // This will only be set if the local storage value is not found, else it will use the local storage value
  let storedMovementSettings = useStorage("lab-locomotion-config", {
    ...defaultMovementSettings
  });

  // Map the stored settings to the reactive settings object
  // I could not find a way to get Watch working with useStorage
  // I don't actually need this to be reactive, but I'm keeping it for now to match the usage on Lab 026
  let movementSettings = reactive({
    locomotionType: storedMovementSettings.value.locomotionType,
    movementEnabled: storedMovementSettings.value.movementEnabled,
    movementSpeed: storedMovementSettings.value.movementSpeed,

    rotationEnabled: storedMovementSettings.value.rotationEnabled,
    rotationSpeed: storedMovementSettings.value.rotationSpeed,

    parabolicCheckRadius: storedMovementSettings.value.parabolicCheckRadius,
    rotationAngle: storedMovementSettings.value.rotationAngle,
    backwardsTeleportationDistance: storedMovementSettings.value.backwardsTeleportationDistance
  });

  // console.log("storedMovementSettings", storedMovementSettings);
  const { toggleMenu } = createLabMenu(scene);
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: teleportMeshes,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true
    }
  });

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.z = -2;
  });

  const setupCameraForCollisions = (camera) => {
    camera.checkCollisions = true;
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(0.7, 1, 0.7);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0);
  };

  const useMovementControls = (featureManager) => {
    // Turn off the other feature
    featureManager.disableFeature(BABYLON.WebXRFeatureName.TELEPORTATION);
    // Configure and enable the movement controls
    const swappedHandednessConfiguration = [
      {
        allowedComponentTypes: [BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE, BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE],
        forceHandedness: "right",
        axisChangedHandler: (axes, movementState, featureContext) => {
          // console.log(xrInput);
          movementState.rotateX = Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0;
          movementState.rotateY = Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0;
        }
      },
      {
        allowedComponentTypes: [BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE, BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE],
        forceHandedness: "left",
        axisChangedHandler: (axes, movementState, featureContext) => {
          // console.log(xrInput);
          movementState.moveX = Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0;
          movementState.moveY = Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0;
        }
      }
    ];

    setupCameraForCollisions(xr.input.xrCamera);

    featureManager.enableFeature(BABYLON.WebXRFeatureName.MOVEMENT, "latest", {
      xrInput: xr.input,
      customRegistrationConfigurations: swappedHandednessConfiguration,
      movementEnabled: movementSettings.movementEnabled,
      movementSpeed: movementSettings.movementSpeed,
      rotationEnabled: movementSettings.rotationEnabled,
      rotationSpeed: movementSettings.rotationSpeed
    });
  };

  const useTeleportControls = (featureManager) => {
    // Turn off the other feature
    featureManager.disableFeature(BABYLON.WebXRFeatureName.MOVEMENT);
    // Configure and enable the teleportation feature
    const createTeleportationSetup = () => {
      const teleportRingMat = new BABYLON.StandardMaterial("grab-mat1", scene);
      teleportRingMat.diffuseColor = LabColors["light1"];
      teleportRingMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

      let setup = {
        xrInput: xr.input,
        floorMeshes: teleportMeshes
      };

      setup["defaultTargetMeshOptions"] = {
        teleportationFillColor: "#3e4a5d",
        teleportationBorderColor: "#8854d0",
        torusArrowMaterial: teleportRingMat
      };

      setup["renderingGroupId"] = 1;

      return setup;
    };

    const teleportControlManager = featureManager.enableFeature(BABYLON.WebXRFeatureName.TELEPORTATION, "stable", createTeleportationSetup({}));
    teleportControlManager.parabolicCheckRadius = movementSettings.parabolicCheckRadius;
    teleportControlManager.rotationAngle = movementSettings.rotationAngle;
    teleportControlManager.backwardsTeleportationDistance = movementSettings.backwardsTeleportationDistance;
    teleportControlManager.rotationEnabled = false; // rotation while teleport is disabled
  };

  const featureManager = xr.baseExperience.featuresManager;
  if (movementSettings.locomotionType === "movement") {
    useMovementControls(featureManager);
  } else {
    useTeleportControls(featureManager);
  }

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
          // if (thumbstickComponent.pressed) {
          //   console.log("Left Thumbstick Pressed");
          // }
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
          // if (thumbstickComponent.pressed) {
          //   console.log("Right Thumbstick Pressed");
          // }
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
