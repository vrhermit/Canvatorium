<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
Advanced Action Triggers
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
  subject1.position = new BABYLON.Vector3(-1, 1, 0);
  subject1.addBehavior(new BABYLON.SixDofDragBehavior());
  subject1.actionManager = new BABYLON.ActionManager(scene);

  // Example 2: OnDoublePickTrigger - failed
  // OnDoublePickTrigger is just like double clicking a mouse. Works on a computer but not on Quest
  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["red"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(0, 1, 0);
  subject2.actionManager = new BABYLON.ActionManager(scene);
  subject2.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnDoublePickTrigger,
      () => {
        console.log("Subject 2: ExecuteCodeAction -> OnDoublePickTrigger");
      }
    )
  );

  // Subject 3: OnLongPressTrigger
  // Click and hold to trigger. Works on a computer but not on Quest
  const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["blue"];
  subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject3.material = subjectMat3;
  subject3.position = new BABYLON.Vector3(1, 1, 0);
  subject3.actionManager = new BABYLON.ActionManager(scene);
  subject3.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnLongPressTrigger,
      () => {
        console.log("Subject 3: ExecuteCodeAction -> OnLongPressTrigger");
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
