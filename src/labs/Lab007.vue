<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import "babylonjs-loaders";
import { ref, reactive, watch, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Explore the idea of overriding console.log() so I can view the log in VR
- This is just a proof-of-concept, not a full-fledged solution
- Override console.log() and stash the message in a reactive variable
- watch the variable and display the message in VR by updating the text in a scroll view
`;
const bjsCanvas = ref(null);

let engine;
let scene;

let conLogData = reactive([]);

// A reference to the BJS GUI Scroll Viewer, too lazy to query this in the graph...
let scrollViewer;

// A reference to the BJS GUI TextBlock, too lazy to query this in the graph...
let loggerText;

// Adapted from https://ourcodeworld.com/articles/read/104/how-to-override-the-console-methods-in-javascript
const overrideConsole = () => {
  // Save the original method in a private variable
  let _privateLog = console.log;
  // Redefine console.log method with a custom function
  console.log = function (message) {
    conLogData.push(message.toString());
    _privateLog.apply(console, arguments);
  };
};
overrideConsole();

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // GUI

  const card = BABYLON.MeshBuilder.CreateBox("console-card", {
    height: 2.1,
    width: 3.1,
    depth: 0.2,
  });
  // card.position = new BABYLON.Vector3(-1, 1, 1);
  card.position = new BABYLON.Vector3(0, 1, 0);
  card.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane(
    "console-plane",
    { height: 2, width: 3 },
    scene
  );
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    3 * 1024,
    2 * 1024
  );
  advancedTexture.name = "logger-texture";

  var panel = new GUI.StackPanel();
  advancedTexture.addControl(panel);

  var sv = new GUI.ScrollViewer("logger-scroll");
  scrollViewer = sv;
  sv.thickness = 48;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.width = `${3 * 1024}px`;
  sv.height = `${2 * 1024 - 128}px`;
  sv.barSize = 60;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

  panel.addControl(sv);

  var tb = new GUI.TextBlock("logger-text");
  loggerText = tb;
  tb.textWrapping = true;

  tb.width = 1;
  tb.height = 3;
  tb.paddingTop = "1%";
  tb.paddingLeft = "30px";
  tb.paddingRight = "20px";
  tb.paddingBottom = "1%";
  tb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.color = "#d3d9e1";
  tb.fontSize = "96px";

  sv.addControl(tb);

  console.log("WebXR Console Logging in Babylon JS");
  console.log(
    "This concept was turned into a reusable tool. You can find it in `src/lab-shared/LabConsole.js`"
  );
  console.log(
    "This lab also imported the shared LabConsole. Toggle it on with the Y button"
  );

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

  // END WebXR --------------------------------------------------

  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

// Watch the labLog data and update the text in the GUI
// TODO: Refactor this to append only the new eleements to the text block
watch(conLogData, (newValue) => {
  const logData = [...newValue];
  if (scrollViewer && loggerText) {
    loggerText.text = logData.join("\n");
    loggerText.resizeToFit = true;
    scrollViewer.verticalBar.value = 1;
  }
});

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
