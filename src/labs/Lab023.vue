<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
Intro to Actions
- Subject 1: (purple) - Execute code when the OnPickTrigger is fired (console logs a string)
- Subject 2: (yellow/red) Interpolate between two colors
- Subject 3: (blue) - Change the scene from dark mode and back, running multiple actions
- Subject 4: (orange/green) can intersect with the card, causing a color change
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";
import { useStorage } from "@vueuse/core";
import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

const bjsCanvas = ref(null);

let engine;
let scene;
const saveObject = {
  name: "",
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
};
let subject1data = useStorage("lab023", { ...saveObject });

console.log("subject1data", subject1data);
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
  subject1.position = new BABYLON.Vector3(
    subject1data.value.position.x,
    subject1data.value.position.y,
    subject1data.value.position.z
  );
  subject1.rotationQuaternion = new BABYLON.Quaternion(
    subject1data.value.rotation.x,
    subject1data.value.rotation.y,
    subject1data.value.rotation.z
  );
  subject1.scaling = new BABYLON.Vector3(
    subject1data.value.scale.x,
    subject1data.value.scale.y,
    subject1data.value.scale.z
  );

  const moveSubject1 = new BABYLON.SixDofDragBehavior();
  moveSubject1.rotateDraggedObject = true;
  moveSubject1.rotateAroundYOnly = true;

  moveSubject1.onDragEndObservable.add(() => {
    console.log("rotation", subject1.rotation);
    console.log("rotation", subject1.rotationQuaternion);
    console.log("scaling", subject1.scaling);

    subject1data.value.position.x = subject1.position.x;
    subject1data.value.position.y = subject1.position.y;
    subject1data.value.position.z = subject1.position.z;

    subject1data.value.rotation.x = subject1.rotationQuaternion.x;
    subject1data.value.rotation.y = subject1.rotationQuaternion.y;
    subject1data.value.rotation.z = subject1.rotationQuaternion.z;

    subject1data.value.scale.x = subject1.scaling.x;
    subject1data.value.scale.y = subject1.scaling.y;
    subject1data.value.scale.z = subject1.scaling.z;
  });
  subject1.addBehavior(moveSubject1);

  const resetMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  resetMat.diffuseColor = LabColors["red"];
  resetMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const reset = BABYLON.MeshBuilder.CreateBox("reset", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  reset.material = resetMat;
  reset.position = new BABYLON.Vector3(-1, 1, 0);

  // Subject 1 Action: ExecuteCodeAction -> OnPickTrigger
  // Run code when the trigger is activated
  reset.actionManager = new BABYLON.ActionManager(scene);
  reset.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      console.log("Resetting data for subject one");
      subject1data.value = { ...saveObject };
      subject1.position = new BABYLON.Vector3(
        subject1data.value.position.x,
        subject1data.value.position.y,
        subject1data.value.position.z
      );
      subject1.rotationQuaternion = new BABYLON.Quaternion(
        subject1data.value.rotation.x,
        subject1data.value.rotation.y,
        subject1data.value.rotation.z
      );
      subject1.scaling = new BABYLON.Vector3(
        subject1data.value.scale.x,
        subject1data.value.scale.y,
        subject1data.value.scale.z
      );
    })
  );

  //   const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  //   subjectMat2.diffuseColor = LabColors["green"];
  //   subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  //   const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
  //     height: 0.4,
  //     width: 0.4,
  //     depth: 0.4,
  //   });
  //   subject2.material = subjectMat2;
  //   subject2.position = new BABYLON.Vector3(0, 1, 0);

  //   const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  //   subjectMat3.diffuseColor = LabColors["blue"];
  //   subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  //   const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
  //     height: 0.4,
  //     width: 0.4,
  //     depth: 0.4,
  //   });
  //   subject3.material = subjectMat3;
  //   subject3.position = new BABYLON.Vector3(1, 1, 0);

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
