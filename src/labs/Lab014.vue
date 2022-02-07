<script setup>
const labNotes = `
Follow Behaviors

`;

import * as BABYLON from "babylonjs";

import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
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
  console.log("Lab 012 - Gizmos!");

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  // Just a quick hack to add an action to the X button
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const xr_ids = motionController.getComponentIds();
      if (motionController.handness === "left") {
        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-positionButton
        xButtonComponent.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
      }
    });
  });

  // Example 1: Manual creation of a gizmos on a mesh
  const boxMat = new BABYLON.StandardMaterial("subject-mat", scene);
  boxMat.diffuseColor = LabColors["purple"];
  boxMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject = BABYLON.MeshBuilder.CreateSphere("subject", {
    diameter: 0.25,
  });
  subject.material = boxMat;
  subject.position = new BABYLON.Vector3(0, 1.0, 0);

  var followBehavior = new BABYLON.FollowBehavior();
  followBehavior.defaultDistance = 1;
  followBehavior.minimumDistance = 1;
  followBehavior.maximumDistance = 2;
  followBehavior.ignoreAngleClamp = true;
  followBehavior.lerpTime = 1000;
  followBehavior.attach(subject);

  // // Create behaviors to drag and scale with pointers in VR
  var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.allowMultiPointers = true;
  subject.addBehavior(sixDofDragBehavior);

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
