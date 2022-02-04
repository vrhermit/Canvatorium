<script setup>
const labNotes = `
Grabbing objects and moveing them around.
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabConsole } from "../lab-shared/LabConsole";

import LabColors from "../lab-shared/LabColors";

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

  consoleIsVisible.value = false;
  setConsoleTransform(
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(0, 1, -2),
    new BABYLON.Vector3(0.5, 0.5, 0.5)
  );

  console.log("Lab 010 - Grab Lab");

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
  const makeGrabbable = function (model) {
    console.log("model", model);
    Object.assign(model, {
      startInteraction(pointerInfo, controllerMesh) {
        console.log("props", this.props);
        this.props = this.props || {};
        if (this.props.grabbedPointerId === undefined) {
          this.props.originalParent = this.parent;
        }
        this.props.grabbedPointerId = pointerInfo.event.pointerId;
        this.setParent(controllerMesh);
      },
      endInteraction(pointerInfo) {
        if (this.props.grabbedPointerId === pointerInfo.event.pointerId) {
          this.setParent(this.props.originalParent);
          delete this.props.grabbedPointerId;
        }
      },
    });
  };

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

  const grabMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  grabMat1.diffuseColor = LabColors["purple"];
  grabMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab1 = BABYLON.MeshBuilder.CreateBox("grab1", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab1.material = grabMat1;
  grab1.position = new BABYLON.Vector3(0, 1, 0);

  const grabMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  grabMat2.diffuseColor = LabColors["green"];
  grabMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab2 = BABYLON.MeshBuilder.CreateBox("grab2", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab2.material = grabMat2;
  grab1.addChild(grab2);
  grab2.position = new BABYLON.Vector3(0, 0.2, 0);

  const grabMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  grabMat3.diffuseColor = LabColors["blue"];
  grabMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab3 = BABYLON.MeshBuilder.CreateBox("grab3", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab3.material = grabMat3;
  grab2.addChild(grab3);
  grab3.position = new BABYLON.Vector3(0, 0.2, 0);

  makeGrabbable(grab1);
  makeGrabbable(grab2);
  makeGrabbable(grab3);

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
