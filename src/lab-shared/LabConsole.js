/*
This tool started as a proof of concept for during Lab 007 and was refactored into this file.
Lots to do before this is a robust tool: https://github.com/vrhermit/Canvatorium/issues/10
*/

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { reactive, watch } from "@vue/runtime-core";

// Adapted from https://ourcodeworld.com/articles/read/104/how-to-override-the-console-methods-in-javascript
const overrideConsole = () => {
  // Save the original method in a private variable
  let _privateLog = console.log;
  // Redefine console.log method with a custom function
  console.log = function (message) {
    labLog.push(message.toString());
    _privateLog.apply(console, arguments);
  };
};

overrideConsole();

// The data that we will display in the VR console
let labLog = reactive([""]);

// A reference to the BJS GUI TextBlock, too lazy to query this in the graph...
let loggerText;
let scrollViewer;

const addLabConsole = (scene) => {
  // GUI
  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 2.1,
    width: 3.1,
    depth: 0.2
  });
  card.position = new BABYLON.Vector3(0, 1, 0);
  card.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  const plane = BABYLON.MeshBuilder.CreatePlane("detail-plane", { height: 2, width: 3 }, scene);
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 3 * 1024, 2 * 1024);
  advancedTexture.name = "logger-texture";
  var sv = new GUI.ScrollViewer("logger-scroll");
  scrollViewer = sv;
  sv.thickness = 48;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.width = `${3 * 1024}px`;
  sv.height = `${2 * 1024}px`;

  advancedTexture.addControl(sv);

  var tb = new GUI.TextBlock("logger-text");
  loggerText = tb;
  tb.textWrapping = true;
  tb.width = 3;
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
};

console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");
console.log("Just a test");

// Watch the labLog data and update the text in the GUI
// TODO: Refactor this to append only the new eleements to the text block
watch(labLog, (newValue) => {
  const logData = [...newValue];
  scrollViewer.verticalBar.value = 1;
  if (loggerText) {
    loggerText.text = logData.join("\n");
    loggerText.resizeToFit = true;
  }
});

export default addLabConsole;
