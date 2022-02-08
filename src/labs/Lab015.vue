<script setup>
const labNotes = `
Resizable GUI Cards

`;

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";

// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

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

  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 1,
    width: 1.6,
    depth: 0.2,
  });
  card.position = new BABYLON.Vector3(0, 1, 0);
  card.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["dark3"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane(
    "detail-plane",
    { height: 1, width: 1.6 },
    scene
  );
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1.6 * 1024,
    1 * 1024
  );
  advancedTexture.name = "title-card-texture";
  //   advancedTexture.renderAtIdealSize = true;
  //   advancedTexture.idealWidth = 1.6 * 1024;
  //   advancedTexture.idealHeight = 1 * 1024;
  //   advancedTexture.useSmallestIdeal = true;

  var grid = new GUI.Grid();
  grid.background = "#a5b1c2";
  advancedTexture.addControl(grid);

  grid.width = "100%";
  grid.setPadding(40);

  grid.addColumnDefinition(100, true);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(100, true);
  grid.addRowDefinition(0.5);
  grid.addRowDefinition(0.5);

  var rect = new GUI.Rectangle();
  rect.background = "#8854d0";
  rect.thickness = 0;
  grid.addControl(rect, 0, 1);

  rect = new GUI.Rectangle();
  rect.background = "#3867d6";
  rect.thickness = 0;
  grid.addControl(rect, 1, 2);

  rect = new GUI.Rectangle();
  rect.background = "#0fb9b1";
  rect.thickness = 0;
  grid.addControl(rect, 1, 1);

  // Create utility layer the gizmos will be rendered on
  var utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // Create the gizmo1 to scale the card along x and y
  var gizmo1 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(1, 1, 0),
    BABYLON.Color3.FromHexString("#00b894"),
    utilLayer
  );
  gizmo1.attachedMesh = card;

  // Create the gizmo1 to scale the card along x only
  var gizmo2 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(1, 0, 0),
    BABYLON.Color3.FromHexString("#8854d0"),
    utilLayer
  );
  gizmo2.attachedMesh = card;

  var gizmo3 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(0, 1, 0),
    BABYLON.Color3.FromHexString("#3867d6"),
    utilLayer
  );
  gizmo3.snapDistance = 0.1;
  gizmo3.onSnapObservable.add((e) => {
    console.log("snap", e);
  });
  gizmo3.attachedMesh = card;

  var gizmo4 = new BABYLON.BoundingBoxGizmo(
    BABYLON.Color3.FromHexString("#0984e3"),
    utilLayer
  );
  gizmo4.setEnabledRotationAxis("");
  gizmo4.scaleBoxSize = 0.025;
  gizmo4.onScaleBoxDragEndObservable.add(() => {
    // console.log("scale", card.scaling);
    console.log("at scale", advancedTexture.getSize());
    // advancedTexture.scaleTo(
    //   Math.round(1024 * 1.6 * card.scaling.x),
    //   Math.round(1024 * 1 * card.scaling.y)
    // );
    advancedTexture.scaleTo(
      Math.round(1.6 * card.scaling.x),
      Math.round(1 * card.scaling.y)
    );
    console.log("at scale", advancedTexture.getSize());
    console.log(
      "scale to",
      Math.round(1024 * 1.6 * card.scaling.x),
      Math.round(1024 * 1 * card.scaling.y)
    );
    advancedTexture.update();
  });
  gizmo4.attachedMesh = card;

  //   setTimeout(() => advancedTexture.scaleTo(1024, 1024), 2000);
  //   setTimeout(() => advancedTexture.scaleTo(512, 1024), 3000);
  // Use the LabPlayer
  createLabPlayer(scene, [ground]);

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
