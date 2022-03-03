<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";

// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Surface Magnetism Behavior
- The subject (purple box) can grapped and moved.
- Dropping it over the card will snap it to the card using Surface Magnetism.
- The subject will follow the pointer around the surface of the card.
- Toggle the follow behavior with the X button on the controller.
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
  card.position = new BABYLON.Vector3(0, 1.5, 0);

  const subjectMat = new BABYLON.StandardMaterial("grab-mat4", scene);
  subjectMat.diffuseColor = LabColors["purple"];
  subjectMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject = BABYLON.MeshBuilder.CreateBox("subject", {
    height: 1.2,
    width: 0.6,
    depth: 0.2,
  });
  subject.material = subjectMat;
  subject.position = new BABYLON.Vector3(-1, 1, -0.25);
  subject.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);

  var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.allowMultiPointers = true;
  subject.addBehavior(sixDofDragBehavior);

  var surfaceMagnetismBehavior = new BABYLON.SurfaceMagnetismBehavior();
  surfaceMagnetismBehavior.meshes = [card];
  subject.addBehavior(surfaceMagnetismBehavior);

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const xr_ids = motionController.getComponentIds();
      if (motionController.handness === "left") {
        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-positionButton
        xButtonComponent.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
            surfaceMagnetismBehavior.enabled =
              !surfaceMagnetismBehavior.enabled;
            console.log(
              "surfaceMagnetismBehavior",
              surfaceMagnetismBehavior.enabled
            );
          }
        });
      }
    });
  });

  document.onkeydown = (e) => {
    if (e.code == "KeyX") {
      surfaceMagnetismBehavior.enabled = !surfaceMagnetismBehavior.enabled;
      console.log("surfaceMagnetismBehavior", surfaceMagnetismBehavior.enabled);
    }
  };

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
