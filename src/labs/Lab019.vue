<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
Intersection Action
- Drag the subject (purple box) over the card to change color while intersecting.
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
  addLabLights(scene);
  const ground = addLabRoom(scene);

  const cardMat = new BABYLON.StandardMaterial("card-mat", scene);
  cardMat.diffuseColor = LabColors["dark3"];
  cardMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const cardWidth = 1.5;
  const cardHeight = 1.6;
  const cardThickness = 0.1;
  const card = BABYLON.MeshBuilder.CreateBox(
    "card",
    { width: cardWidth, height: cardHeight, depth: cardThickness },
    scene
  );
  card.isPickable = false;
  card.material = cardMat;
  card.position = new BABYLON.Vector3(0, 1.5, 1);

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
  subject1.addBehavior(new BABYLON.SixDofDragBehavior());
  subject1.actionManager = new BABYLON.ActionManager(scene);

  const turnGreen = new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: {
        mesh: card,
        usePreciseIntersection: true,
      },
    },
    subjectMat1,
    "diffuseColor",
    LabColors["green"]
  );
  const turnPurple = new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: {
        mesh: card,
        usePreciseIntersection: true,
      },
    },
    subjectMat1,
    "diffuseColor",
    LabColors["purple"]
  );
  subject1.actionManager.registerAction(turnGreen);
  subject1.actionManager.registerAction(turnPurple);

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
