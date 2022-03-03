<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Action Triggers in WebXR
- Subject 1: Use \`ExecuteCodeAction\` to test available triggers.
  - Working Triggers: 
    - OnPickOutTrigger
    - OnPickTrigger
    - OnPickDownTrigger
    - OnPickUpTrigger
    - OnPickOutTrigger
    - OnLeftPickTrigger
    - OnPointerOverTrigger
    - OnPointerOutTrigger
    - OnIntersectionEnterTrigger
    - OnIntersectionExitTrigger
  - Non-Working Triggers:
    - OnDoublePickTrigger
    - OnRightPickTrigger
    - OnCenterPickTrigger
    - OnLongPressTrigger
`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  const cardMat = new BABYLON.StandardMaterial("card-mat", scene);
  cardMat.diffuseColor = LabColors["dark3"];
  cardMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["purple"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(0, 1, 0);
  // Subject 1 Action: ExecuteCodeAction -> OnPickTrigger
  // Run code when the trigger is activated
  subject1.actionManager = new BABYLON.ActionManager(scene);
  subject1.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      // Change this to other triggers to see different effects
      BABYLON.ActionManager.OnDoublePickTrigger,
      () => {
        console.log("Subject 1: ExecuteCodeAction -> OnDoublePickTrigger");
      }
    )
  );

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", function () {
    engine.resize();
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
