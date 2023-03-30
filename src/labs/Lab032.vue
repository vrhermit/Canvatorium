<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
} from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";

import {
  createGridMenuLabel,
  createGridMenuSlider,
  createGridMenuCheckbox,
} from "../lab-shared/LabMenuControls";

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

watch(actualLatheSettings, (newValue) => {
  storedLatheSettings.value = newValue;
});

let grabbersRef;
let latheMatRef;

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

  grabbersRef = grabbers;

  console.log(grabbers);

  const latheMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  latheMat.diffuseColor = LabColors["purple"];
  latheMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  latheMatRef = latheMat;
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

  createUICard();

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

const createUICard = (scene) => {
  const cardMaterial = new BABYLON.StandardMaterial(
    "menu-card-material",
    scene
  );
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const card = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1,
    height: 1,
    depth: 0.1,
  });
  card.material = cardMaterial;
  card.position = new BABYLON.Vector3(0, 1, 0);
  card.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);

  const followBehavior = new BABYLON.FollowBehavior();
  followBehavior.defaultDistance = 0.8;
  followBehavior.minimumDistance = 0.7;
  followBehavior.maximumDistance = 1.25;
  followBehavior.ignoreCameraPitchAndRoll = true;
  followBehavior.pitchOffset = -10;
  followBehavior.lerpTime = 250;
  followBehavior.attach(card);

  // UI Plane
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "menu-plane",
    {
      width: 1,
      height: 1,
    },
    scene
  );
  plane.position.z = -0.055;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1 * 1024,
    1 * 1024
  );
  advancedTexture.name = "menu-texture";

  const sv = new GUI.ScrollViewer("lab-info-scroll");
  sv.thickness = 12;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.height = `${1024}px`;
  sv.width = `${1024}px`;
  sv.barSize = 30;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(sv);

  const numberOfPointsLabel = createGridMenuLabel(
    `Number of points: ${actualLatheSettings.numberOfPoints}`
  );
  const numberOfPointsSlider = createGridMenuSlider({
    min: 0.1,
    max: 24,
    step: 1,
    value: 6,
  });
  numberOfPointsSlider.value = actualLatheSettings.numberOfPoints;
  numberOfPointsSlider.onValueChangedObservable.add(function (value) {
    actualLatheSettings.numberOfPoints = value;
    numberOfPointsLabel.text = `Number of points: ${value}`;
  });

  const tessellationLabel = createGridMenuLabel(
    `Tessellation: ${actualLatheSettings.tessellation}`
  );
  const tessellationSlider = createGridMenuSlider({
    min: 6,
    max: 46,
    step: 1,
    value: 12,
  });
  tessellationSlider.value = actualLatheSettings.tessellation;
  tessellationSlider.onValueChangedObservable.add(function (value) {
    actualLatheSettings.tessellation = value;
    tessellationLabel.text = `Tessellation: ${value}`;
  });

  const isFlatLabel = createGridMenuLabel("Is Flat Shaded?");
  const isFlatToggle = createGridMenuCheckbox();
  isFlatToggle.isChecked = actualLatheSettings.isFlat;
  isFlatToggle.onIsCheckedChangedObservable.add(function (value) {
    actualLatheSettings.isFlat = value;
  });

  const arcLabel = createGridMenuLabel(
    `Arc: ${actualLatheSettings.arc.toFixed(2)}`
  );
  const arcSlider = createGridMenuSlider({
    min: 0.1,
    max: 1,
    step: 0.1,
    value: 1,
  });
  arcSlider.value = actualLatheSettings.arc;
  arcSlider.onValueChangedObservable.add(function (value) {
    actualLatheSettings.arc = value;
    arcLabel.text = `Rotation Speed: ${value.toFixed(2)}`;
  });

  const resetButton = GUI.Button.CreateSimpleButton(
    "reset-button",
    "Reset Settings"
  );
  resetButton.width = 1;
  resetButton.height = "60px";
  resetButton.fontSize = "40px";
  resetButton.color = "white";
  resetButton.background = "#53637b";

  resetButton.onPointerUpObservable.add(function () {
    actualLatheSettings.numberOfPoints = 6;
    actualLatheSettings.tessellation = 12;
    actualLatheSettings.isFlat = true;
    actualLatheSettings.arc = 1;

    numberOfPointsSlider.value = actualLatheSettings.numberOfPoints;
    tessellationSlider.value = actualLatheSettings.tessellation;
    isFlatToggle.isChecked = actualLatheSettings.isFlat;
    arcSlider.value = actualLatheSettings.arc;
  });

  const buildButton = GUI.Button.CreateSimpleButton(
    "reset-button",
    "Build Shape"
  );
  buildButton.width = 1;
  buildButton.height = "60px";
  buildButton.fontSize = "40px";
  buildButton.color = "white";
  buildButton.background = "#53637b";

  buildButton.onPointerUpObservable.add(function () {
    buildLathe();
  });

  const grid = new GUI.Grid();
  grid.addColumnDefinition(40, true);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(40, true);

  // Layout the grid content
  // Add rows to the grid and attach controls to the rows, using the current row count.
  // This makes it easy to reorder these in code without having to reindex the grid content.
  grid.addRowDefinition(36, true); // empty row
  grid
    .addRowDefinition(72, true)
    .addControl(numberOfPointsLabel, grid.rowCount, 1)
    .addControl(numberOfPointsSlider, grid.rowCount, 2);
  grid
    .addRowDefinition(72, true)
    .addControl(tessellationLabel, grid.rowCount, 1)
    .addControl(tessellationSlider, grid.rowCount, 2);
  grid
    .addRowDefinition(72, true)
    .addControl(isFlatLabel, grid.rowCount, 1)
    .addControl(isFlatToggle, grid.rowCount, 2);
  // grid.addRowDefinition(36, true); // empty row
  grid
    .addRowDefinition(72, true)
    .addControl(arcLabel, grid.rowCount, 1)
    .addControl(arcSlider, grid.rowCount, 2);
  // grid
  //   .addRowDefinition(72, true)
  //   .addControl(rotationThresholdLabel, grid.rowCount, 1)
  //   .addControl(rotationThresholdSlider, grid.rowCount, 2);
  // grid
  //   .addRowDefinition(72, true)
  //   .addControl(rotationEnabledLabel, grid.rowCount, 1)
  //   .addControl(rotationEnabledCheckbox, grid.rowCount, 2);
  // grid.addRowDefinition(36, true); // empty row
  // grid
  //   .addRowDefinition(72, true)
  //   .addControl(movementOrientationFollowsViewerPoseLabel, grid.rowCount, 1)
  //   .addControl(movementOrientationFollowsViewerPoseCheckbox, grid.rowCount, 2);
  // grid
  //   .addRowDefinition(72, true)
  //   .addControl(gravityLabel, grid.rowCount, 1)
  //   .addControl(gravityCheckbox, grid.rowCount, 2);
  grid.addRowDefinition(36, true); // empty row
  grid.addRowDefinition(72, true).addControl(resetButton, grid.rowCount, 2);
  grid.addRowDefinition(72, true).addControl(buildButton, grid.rowCount, 2);

  sv.addControl(grid);

  return;
};

const buildLathe = () => {
  //   console.log("Subject 1: ExecuteCodeAction -> OnPickTrigger");
  //   scene.getMeshByName("lathe")?.dispose();
  let latheArray = [];
  for (let i = 0; i < grabbersRef.length; i++) {
    latheArray.push(grabbersRef[i].position);
  }

  const lathe = BABYLON.MeshBuilder.CreateLathe("lathe", {
    shape: latheArray,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    tessellation: actualLatheSettings.tessellation,
    arc: actualLatheSettings.arc,
    cap: actualLatheSettings.cap,
  });
  lathe.material = latheMatRef;
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
};

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
