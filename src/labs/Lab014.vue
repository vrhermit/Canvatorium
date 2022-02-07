<script setup>
const labNotes = `
Follow Behaviors
- Purple sphere can place itself anywhere in my view
- Green sphere is constrained to a fixed pitch of -35 degrees

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
  await createLabPlayer(scene, [ground]);

  console.log("Example 1: Free to follow");
  const subjectMat = new BABYLON.StandardMaterial("subject-mat", scene);
  subjectMat.diffuseColor = LabColors["purple"];
  subjectMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject = BABYLON.MeshBuilder.CreateSphere("subject", {
    diameter: 0.25,
  });
  subject.material = subjectMat;
  subject.position = new BABYLON.Vector3(0, 1.0, 0);

  var followBehavior = new BABYLON.FollowBehavior();
  followBehavior.defaultDistance = 1.5;
  followBehavior.minimumDistance = 1.2;
  followBehavior.maximumDistance = 2.4;
  followBehavior.lerpTime = 1000;
  followBehavior.attach(subject);

  // // Create behaviors to drag and scale with pointers in VR
  var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.allowMultiPointers = true;
  subject.addBehavior(sixDofDragBehavior);

  console.log("Example 2: Constrained to the bottom of the scene.");
  const subjectMat2 = new BABYLON.StandardMaterial("subject-mat2", scene);
  subjectMat2.diffuseColor = LabColors["green"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject2 = BABYLON.MeshBuilder.CreateSphere("subject2", {
    diameter: 0.25,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(0, 1.0, 0);

  var followBehavior2 = new BABYLON.FollowBehavior();
  followBehavior2.defaultDistance = 1.2;
  followBehavior2.minimumDistance = 1;
  followBehavior2.maximumDistance = 2;
  followBehavior2.ignoreCameraPitchAndRoll = true;
  followBehavior2.pitchOffset = -35;
  followBehavior2.lerpTime = 1000;
  followBehavior2.attach(subject2);

  // // Create behaviors to drag and scale with pointers in VR
  var sixDofDragBehavior2 = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior2.allowMultiPointers = true;
  subject2.addBehavior(sixDofDragBehavior2);

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
