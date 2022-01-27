<script setup>
const labNotes = `
Explore the new Near Menu in Babylon JS 5.0
- Based on the Holohraphic Menu with limited customizations
- Using manage.controlScaling to scale the menu
- Using some properties on the follow behavior to adjust the relative position
- Bug: [Near Menu Dragging does not work in WebXR on Quest 2](https://forum.babylonjs.com/t/near-menu-dragging-does-not-work-in-oculus-quest-2/27152)
- Bug: [Scaling the controls does not update the scale of mouseover effects](https://forum.babylonjs.com/t/3d-gui-manage-control-scaling-does-not-scale-the-mouse-over-effects-on-holograph-ui/27150)
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import addLabConsole from "../lab-shared/LabConsole";

const bjsCanvas = ref(null);

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
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 2, -3);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  addLabConsole();

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);

  console.log("3D GUI:", manager, anchor);

  var near = new GUI.NearMenu("near");
  manager.addControl(near);
  manager.controlScaling = 0.25;

  var button0 = new GUI.TouchHolographicButton("button0");
  button0.text = "Button 0";
  button0.onPointerClickObservable.add(() => {
    console.log("Button 0 clicked");
  });
  near.addButton(button0);

  var button1 = new GUI.TouchHolographicButton("button1");
  button1.text = "Button 1";
  button1.onPointerClickObservable.add(() => {
    console.log("Button 1 clicked");
  });

  near.addButton(button1);

  var button2 = new GUI.TouchHolographicButton("button2");
  button2.text = "Button 2";
  button2.onPointerClickObservable.add(() => {
    console.log("Button 2 clicked");
  });
  near.addButton(button2);

  console.log("Near Menu:", near);
  near.defaultBehavior.followBehavior.defaultDistance = 1;
  near.defaultBehavior.followBehavior.minimumDistance = 1;
  near.defaultBehavior.followBehavior.maximumDistance = 2;
  near.defaultBehavior.followBehavior.pitchOffset = -35;
  console.log("Near ", near.mesh);

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.z = -2;
  });

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        // let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        // triggerComponent.onButtonStateChangedObservable.add(() => {
        //   if (triggerComponent.pressed) {
        //     console.log("Left Trigger Pressed");
        //   }
        // });
        // let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        // squeezeComponent.onButtonStateChangedObservable.add(() => {
        //   if (squeezeComponent.pressed) {
        //     console.log("Left Grip Pressed");
        //   }
        // });
        // let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        // thumbstickComponent.onButtonStateChangedObservable.add(() => {
        //   if (thumbstickComponent.pressed) {
        //     console.log("Left Thumbstick Pressed");
        //   }
        // });
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
          }
        });
      }

      // END LEFT CONTROLLER ------------------------------------------------------------

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        // let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        // triggerComponent.onButtonStateChangedObservable.add(() => {
        //   if (triggerComponent.pressed) {
        //     console.log("Right Trigger Pressed");
        //   }
        // });
        // let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        // squeezeComponent.onButtonStateChangedObservable.add(() => {
        //   if (squeezeComponent.pressed) {
        //     console.log("Right Grip Pressed");
        //   }
        // });
        // let thumbstickComponent = motionController.getComponent(xr_ids[2]); //xr-standard-thumbstick
        // thumbstickComponent.onButtonStateChangedObservable.add(() => {
        //   if (thumbstickComponent.pressed) {
        //     console.log("Right Thumbstick Pressed");
        //   }
        // });
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
