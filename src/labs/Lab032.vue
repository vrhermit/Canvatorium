<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, reactive, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";

import { useStorage } from "@vueuse/core";
// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
VR Lathe
- Testing an idea to see if can make a VR interface for the array of Vector3s used by the Lathe tool.

`;
const bjsCanvas = ref(null);

let engine;
let scene;

// Default settings for the lathe data
const defaultLatheSettings = {
  numberOfPoints: 12,
  tessellation: 12,
  isFlat: true,
  arc: 1,
  cap: "NO_CAP",
};

// Spread the default settings into the stored settings
// This will only be set if the local storage value is not found, else it will use the local storage value
let storedLatheSettings = useStorage("lab-lathe-settings", {
  ...defaultLatheSettings,
});

// Map the stored settings to the reactive settings object
// I could not find a way to get Watch working with useStorage
let actualLatheSettings = reactive({
  numberOfPoints: storedLatheSettings.value.numberOfPoints,
  tessellation: storedLatheSettings.value.tessellation,
  isFlat: storedLatheSettings.value.isFlat,
  arc: storedLatheSettings.value.arc,
  cap: storedLatheSettings.value.cap,
});

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -4);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  console.log(ground);

  const cardMat = new BABYLON.StandardMaterial("card-mat", scene);
  cardMat.diffuseColor = LabColors["dark3"];
  cardMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const cardWidth = 2;
  const cardHeight = 2;
  const cardThickness = 0.01;
  const card = BABYLON.MeshBuilder.CreateBox(
    "card",
    { width: cardWidth, height: cardHeight, depth: cardThickness },
    scene
  );
  card.isPickable = false;
  card.material = cardMat;
  card.position = new BABYLON.Vector3(1, 1, 0);

  const boundsWidth = 0;
  const boundsHeight = 0;
  // create plane in front of card for bounds checking
  const boundsPlane = BABYLON.MeshBuilder.CreatePlane(
    "boundsPlane",
    { width: cardWidth - boundsWidth, height: cardHeight - boundsHeight },
    scene
  );
  boundsPlane.isPickable = false;
  boundsPlane.position.x = card.position.x;
  boundsPlane.position.y = card.position.y;
  boundsPlane.position.z = -cardThickness / 2;
  boundsPlane.isVisible = false;

  const grabMat = new BABYLON.StandardMaterial("grab-mat6", scene);
  grabMat.diffuseColor = LabColors["purple"];
  grabMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  let i;
  let grabbers = [];

  for (i = 0; i < actualLatheSettings.numberOfPoints; i++) {
    var planeDragBehavior = new BABYLON.PointerDragBehavior({
      dragPlaneNormal: boundsPlane.forward,
    });
    planeDragBehavior.useObjectOrientationForDragging = true;

    planeDragBehavior.validateDrag = (targetPosition) => {
      const bounds = boundsPlane.getBoundingInfo().boundingBox;
      targetPosition.x = BABYLON.Scalar.Clamp(
        targetPosition.x,
        bounds.minimum.x + boundsPlane.position.x,
        bounds.maximum.x + boundsPlane.position.x
      );
      targetPosition.y = BABYLON.Scalar.Clamp(
        targetPosition.y,
        bounds.minimum.y + boundsPlane.position.y,
        bounds.maximum.y + boundsPlane.position.y
      );
      return true;
    };
    const grabber = BABYLON.MeshBuilder.CreateSphere("grabber", {
      diameter: 0.05,
    });
    const yoffset = i * 0.1;
    grabber.material = grabMat;
    grabber.position = new BABYLON.Vector3(0 + yoffset / 2, 2 - yoffset, 0);
    grabber.addBehavior(planeDragBehavior);
    grabbers.push(grabber);
  }

  console.log(grabbers);

  const latheMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  latheMat.diffuseColor = LabColors["purple"];
  latheMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    height: 0.2,
    width: 0.2,
    depth: 0.2,
  });
  subject1.material = cardMat;
  subject1.position = new BABYLON.Vector3(2.2, 1, 0);

  // Subject 1 Action: ExecuteCodeAction -> OnPickTrigger
  // Run code when the trigger is activated
  subject1.actionManager = new BABYLON.ActionManager(scene);
  subject1.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      //   console.log("Subject 1: ExecuteCodeAction -> OnPickTrigger");
      //   scene.getMeshByName("lathe")?.dispose();
      let latheArray = [];
      for (let i = 0; i < grabbers.length; i++) {
        latheArray.push(grabbers[i].position);
      }

      const lathe = BABYLON.MeshBuilder.CreateLathe("lathe", {
        shape: latheArray,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        tessellation: actualLatheSettings.tessellation,
        arc: actualLatheSettings.arc,
        cap: actualLatheSettings.cap,
      });
      lathe.material = latheMat;
      lathe.visibility = 0.6;
      // lathe.closed = true;
      if (actualLatheSettings.isFlat) {
        lathe.convertToFlatShadedMesh();
      }

      lathe.addBehavior(
        new BABYLON.PointerDragBehavior({
          dragPlaneNormal: lathe.upVector,
        })
      );
    })
  );

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", resizeListener);
};

const resizeListener = () => {
  if (engine) {
    engine.resize();
  }
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
  window.removeEventListener("resize", resizeListener);
});
onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
});
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
