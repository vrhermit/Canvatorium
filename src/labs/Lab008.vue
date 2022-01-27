<script setup>
const labNotes = `
Explore the new Near Menu in Babylon JS 5.0
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as GUI from "babylonjs-gui";
import { ref, reactive, onMounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

const bjsCanvas = ref(null);
let labLog = reactive([""]);

(function () {
  // Adapted from https://ourcodeworld.com/articles/read/104/how-to-override-the-console-methods-in-javascript
  // Save the original method in a private variable
  var _privateLog = console.log;
  // Redefine console.log method with a custom function
  console.log = function (message) {
    labLog.push(message.toString());
    _privateLog.apply(console, arguments);
  };
})();

let engine;
let scene;
let manager;
let anchor;

let loggerText;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lap tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // Make some boxes to test out the colors in VR
  const group = new BABYLON.Mesh("logo-group");
  group.position = new BABYLON.Vector3(-3.5, 0.5, 0);

  // Create the 3D UI manager
  anchor = new BABYLON.AbstractMesh("anchor", scene);
  manager = new GUI.GUI3DManager(scene);
  //   manager.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  //   manager.useRealisticScaling = true;

  console.log("3D GUI:", manager, anchor);

  // Let's add a slate
  var near = new GUI.NearMenu("near");
  manager.addControl(near);

  var button0 = new GUI.TouchHolographicButton("button0");
  button0.imageUrl = "./textures/IconFollowMe.png";
  button0.text = "Button 0";
  near.addButton(button0);

  var button1 = new GUI.TouchHolographicButton("button1");
  button1.imageUrl = "./textures/IconClose.png";
  button1.text = "Button 1";
  near.addButton(button1);

  var button2 = new GUI.TouchHolographicButton("button2");
  button2.imageUrl = "./textures/IconFollowMe.png";
  button2.text = "Button 2";
  near.addButton(button2);

  console.log("Near Menu:", near);
  near.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
  near.defaultBehavior.followBehavior.defaultDistance = 1;
  near.defaultBehavior.followBehavior.minimumDistance = 1;
  near.defaultBehavior.followBehavior.maximumDistance = 2;
  near.defaultBehavior.followBehavior.pitchOffset = -35;

  makeLogger();

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

  console.log("console.log('Logging in WebXR!')");
  // END WebXR --------------------------------------------------

  engine.runRenderLoop(() => {
    scene.render();
  });
};

const makeLogger = () => {
  // GUI
  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 2.1,
    width: 3.1,
    depth: 0.2,
  });
  card.position = new BABYLON.Vector3(1, 1, 0);
  card.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  card.rotation = new BABYLON.Vector3(0, Math.PI / 5, 0);
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "detail-plane",
    { height: 2, width: 3 },
    scene
  );
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    3 * 1024,
    2 * 1024
  );
  advancedTexture.name = "logger-texture";
  var sv = new GUI.ScrollViewer("logger-scroll");
  sv.thickness = 48;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.width = `${3 * 1024}px`;
  sv.height = `${2 * 1024}px`;

  advancedTexture.addControl(sv);

  var tb = new GUI.TextBlock("logger-text");
  loggerText = tb;
  tb.textWrapping = true;
  tb.width = 3;
  tb.height = 2;
  tb.paddingTop = "1%";
  tb.paddingLeft = "30px";
  tb.paddingRight = "20px";
  tb.paddingBottom = "1%";
  tb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.color = "#d3d9e1";
  tb.fontSize = "96px";

  sv.addControl(tb);
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

// Watch with a single value
watch(labLog, (newValue) => {
  const logData = [...newValue];
  loggerText.text = logData.reverse().join("\n");
});
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
