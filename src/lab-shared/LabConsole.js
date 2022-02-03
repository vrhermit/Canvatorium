/*
This tool started as a proof of concept for during Lab 007 and was refactored into this file.
Lots to do before this is a robust tool: https://github.com/vrhermit/Canvatorium/issues/10
*/

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, reactive, watch } from "@vue/runtime-core";

export const createLabConsole = (scene) => {
  // The data that we will display in the VR console
  let conLogData = reactive([""]);
  let consoleIsVisible = ref(false);

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

  // GUI
  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 2.1,
    width: 3.1,
    depth: 0.2
  });
  card.position = new BABYLON.Vector3(-1, 1, 1);
  card.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  // card.rotation = new BABYLON.Vector3(0, Math.PI / -5, 0);
  // card.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;

  const plane = BABYLON.MeshBuilder.CreatePlane("detail-plane", { height: 2, width: 3 }, scene);
  plane.position.z = -0.11;
  plane.parent = card;

  card.isVisible = consoleIsVisible.value;
  plane.isVisible = consoleIsVisible.value;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 3 * 1024, 2 * 1024);
  advancedTexture.name = "logger-texture";

  var panel = new GUI.StackPanel();
  advancedTexture.addControl(panel);

  var sv = new GUI.ScrollViewer("logger-scroll");
  scrollViewer = sv;
  sv.thickness = 48;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.width = `${3 * 1024}px`;
  sv.height = `${2 * 1024 - 128}px`;
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

  panel.addControl(sv);

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

  var clearButton = GUI.Button.CreateSimpleButton("clear-button", "clear");
  clearButton.width = "256px";
  clearButton.height = "128px";
  clearButton.color = "white";
  clearButton.background = "#eb3b5a";
  clearButton.fontSize = "96px";
  clearButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  clearButton.onPointerClickObservable.add(() => {
    conLogData.splice(0, conLogData.length);
    console.log("console cleared");
  });
  panel.addControl(clearButton);

  const setConsoleTransform = (position, rotateTo, scaling) => {
    card.position = position;
    card.lookAt(rotateTo, Math.PI, 0, 0);
    card.scaling = scaling;
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

  watch(consoleIsVisible, (newValue) => {
    card.isVisible = newValue;
    plane.isVisible = newValue;
  });

  return { consoleIsVisible, setConsoleTransform };
};
