<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted, watch } from "@vue/runtime-core";
import { useRefHistory } from "@vueuse/core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Snapping and History
- Simple box with a drag widget, snapping to the grid
- Uses VueUse \`useRefHistory()\` to add Undo / Redo
- Keyboard: z = undo, x = redo
- VR Controller: a = undo, b = redo
`;
const bjsCanvas = ref(null);

// A ref to store the current box X position
const dragX = ref(0.5);
// History tracking for the box X position
const { undo, redo } = useRefHistory(dragX);

let engine;
let scene;

// Adding a small change in the main branch

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  console.log("Lab 012 - Gizmos!");

  const subjectMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat.diffuseColor = LabColors["purple"];
  subjectMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject = BABYLON.MeshBuilder.CreateBox("grab1", {
    height: 1,
    width: 1,
    depth: 1,
  });
  subject.material = subjectMat;
  subject.position = new BABYLON.Vector3(0.5, 0.5, 0.5);

  // Create utility layer the positionGizmo will be rendered on
  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // Create the positionGizmo and attach to the sphere
  var gizmo = new BABYLON.AxisDragGizmo(
    new BABYLON.Vector3(1, 0, 0),
    BABYLON.Color3.FromHexString("#8854d0"),
    utilLayer
  );
  gizmo.scaleRatio = 2;
  gizmo.updateGizmoRotationToMatchAttachedMesh = true;
  gizmo.updateGizmoPositionToMatchAttachedMesh = true;
  gizmo.attachedMesh = subject;
  gizmo.snapDistance = 1;
  // Write the x position to the dragX ref after each drag
  gizmo.onSnapObservable.add(() => {
    dragX.value = subject.position.x;
  });

  // START WebXR ------------------------------------------------------------

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  // Just a quick hack to add an action to the X button
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const xr_ids = motionController.getComponentIds();
      if (motionController.handness === "right") {
        let aButtonComponent = motionController.getComponent(xr_ids[3]); //a-button
        aButtonComponent.onButtonStateChangedObservable.add(() => {
          if (aButtonComponent.pressed) {
            console.log("A Button Pressed, undo()");
            undo();
          }
        });
        let bButtonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bButtonComponent.onButtonStateChangedObservable.add(() => {
          if (bButtonComponent.pressed) {
            console.log("B Button Pressed, redo()");
            redo();
          }
        });
      }
    });
  });

  // END WebXR --------------------------------------------------
  document.onkeydown = (e) => {
    if (e.code == "KeyZ") {
      console.log("trying to undo");
      undo();
    }
    {
      if (e.code == "KeyX") {
        redo();
      }
    }
  };

  // Watch the dragX ref and update the subject position
  watch(dragX, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      subject.position.x = newVal;
    }
  });
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
