<script setup>
const labNotes = `
Resizable GUI Cards
- Example 1: Scale the card while keeping the aspect ratio
- Example 2: Scale the card while streaching the content
- Example 3: Scale the card while streaching the content, with snapping
- Example 4: Attempt at scaling the card while maintaining the aspect ratio (failed, so far)
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
    width: 1,
    height: 1,
    depth: 0.2,
  });
  card.position = new BABYLON.Vector3(0, 1, 0);
  //   card.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["dark3"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane(
    "detail-plane",
    {
      width: 1,
      height: 1,
    },
    scene
  );
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1 * 1024,
    1 * 1024
  );
  advancedTexture.name = "title-card-texture";

  var grid = new GUI.Grid();
  //   grid.background = "#a5b1c2";
  advancedTexture.addControl(grid);

  //   grid.width = "100%";
  //   grid.setPadding(40);

  grid.addColumnDefinition(0.5, false);
  //   grid.addColumnDefinition(1);
  //   grid.addColumnDefinition(1);
  grid.addColumnDefinition(0.5, false);
  grid.addRowDefinition(0.5);
  grid.addRowDefinition(0.5);

  var rect = new GUI.Rectangle();
  rect.background = "#8854d0";
  rect.thickness = 0;
  grid.addControl(rect, 0, 0);

  rect = new GUI.Rectangle();
  rect.background = "#3867d6";
  rect.thickness = 0;
  grid.addControl(rect, 0, 1);

  rect = new GUI.Rectangle();
  rect.background = "#0fb9b1";
  rect.thickness = 0;
  grid.addControl(rect, 1, 0);

  var text1 = new GUI.TextBlock();
  text1.text =
    "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?";
  text1.color = "white";
  text1.fontSize = 36;
  text1.textWrapping = true;
  grid.addControl(text1, 1, 1);

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
    console.log("start scale", advancedTexture.getSize());

    advancedTexture.scaleTo(
      Math.round(1024 * card.scaling.x),
      Math.round(1024 * card.scaling.y)
    );
    // Mark as dirty to force redraw - may not be needed in latest version
    advancedTexture.markAsDirty();
  });
  gizmo4.attachedMesh = card;

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
