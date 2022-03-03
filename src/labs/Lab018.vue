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
Intro to Actions
- Subject 1: (purple) - Execute code when the OnPickTrigger is fired (console logs a string)
- Subject 2: (yellow/red) Interpolate between two colors
- Subject 3: (blue) - Change the scene from dark mode and back, running multiple actions
- Subject 4: (orange/green) can intersect with the card, causing a color change
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

  // Subject 1 Action: ExecuteCodeAction -> OnPickTrigger
  // Run code when the trigger is activated
  subject1.actionManager = new BABYLON.ActionManager(scene);
  subject1.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      console.log("Subject 1: ExecuteCodeAction -> OnPickTrigger");
    })
  );

  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["yellow"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(0, 1, 0);

  // Subject 2 Action: InterpolateValueAction -> OnPickTrigger
  // Change a value over time when the trigger is activated
  subject2.actionManager = new BABYLON.ActionManager(scene);
  subject2.actionManager
    .registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        subjectMat2,
        "diffuseColor",
        LabColors["red"],
        1000
      )
    )
    .then(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        subjectMat2,
        "diffuseColor",
        LabColors["yellow"],
        1000
      )
    );

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

  // Subject 3 Action: InterpolateValueAction -> OnPickTrigger
  // Change the scene from dark mode to light mode when the trigger is activated
  // There is probably a better way to run multiple actions at once, but this works for now
  subject3.actionManager = new BABYLON.ActionManager(scene);
  subject3.actionManager
    .registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene,
        "clearColor",
        LabColors["light1"],
        1000
      )
    )
    .then(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene,
        "clearColor",
        LabColors["dark1"],
        1000
      )
    );

  subject3.actionManager
    .registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene.getMaterialByName("ground-mat"),
        "mainColor",
        LabColors["dark4"],
        1000
      )
    )
    .then(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene.getMaterialByName("ground-mat"),
        "mainColor",
        LabColors["light1"],
        1000
      )
    );

  subject3.actionManager
    .registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene.getMaterialByName("ground-mat"),
        "lineColor",
        LabColors["dark4"],
        1000
      )
    )
    .then(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        scene.getMaterialByName("ground-mat"),
        "lineColor",
        new BABYLON.Color3(1, 1, 1),
        1000
      )
    );

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
  card.position = new BABYLON.Vector3(2, 1.5, 1);

  // Subject 4: SetValueAction -> On Intersection Enter/Exit Triggers
  // Subject 4 (orange/green) can intersect with the card, causing a color change
  const subjectMat4 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat4.diffuseColor = LabColors["orange"];
  subjectMat4.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject4 = BABYLON.MeshBuilder.CreateBox("subject4", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject4.material = subjectMat4;
  subject4.position = new BABYLON.Vector3(2, 1, 0);
  subject4.addBehavior(new BABYLON.SixDofDragBehavior());
  subject4.actionManager = new BABYLON.ActionManager(scene);

  const turnGreen = new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
      parameter: {
        mesh: card,
        usePreciseIntersection: true,
      },
    },
    subjectMat4,
    "diffuseColor",
    LabColors["green"]
  );
  const turnOrange = new BABYLON.SetValueAction(
    {
      trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
      parameter: {
        mesh: card,
        usePreciseIntersection: true,
      },
    },
    subjectMat4,
    "diffuseColor",
    LabColors["orange"]
  );
  subject4.actionManager.registerAction(turnGreen);
  subject4.actionManager.registerAction(turnOrange);

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
