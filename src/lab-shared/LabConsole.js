/*
This tool started as a proof of concept for during Lab 007 and was refactored into this file.
Lots to do before this is a robust tool: https://github.com/vrhermit/Canvatorium/issues/10
*/

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, reactive, watch } from "@vue/runtime-core";
import LabColors from "../lab-shared/LabColors";

const makeGrabbable = function (model) {
  Object.assign(model, {
    startInteraction(pointerInfo, controllerMesh) {
      this.props = this.props || {};
      if (this.props.grabbedPointerId === undefined) {
        this.props.originalParent = this.parent;
      }
      this.props.grabbedPointerId = pointerInfo.event.pointerId;
      this.setParent(controllerMesh);
    },
    endInteraction(pointerInfo) {
      if (this.props.grabbedPointerId === pointerInfo.event.pointerId) {
        this.setParent(this.props.originalParent);
        delete this.props.grabbedPointerId;
      }
    }
  });
};

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
  const grabMaterial = new BABYLON.StandardMaterial("card-material", scene);
  grabMaterial.diffuseColor = LabColors["purple"];
  grabMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 0.05,
    width: 0.4,
    depth: 0.05
  });
  grab.material = grabMaterial;
  grab.position = new BABYLON.Vector3(0, 1, 0);
  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 2.1,
    width: 3.1,
    depth: 0.2
  });
  // card.parent = grab;
  grab.addChild(card);
  // card.position = new BABYLON.Vector3(-1, 1, 1);
  card.position = new BABYLON.Vector3(0, 0.6, 0);
  card.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane("detail-plane", { height: 2, width: 3 }, scene);
  plane.position.z = -0.11;
  plane.parent = card;

  grab.isVisible = consoleIsVisible.value;
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
  sv.opacity = 1;
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

  makeGrabbable(grab);

  const setConsoleTransform = (position, rotateTo, scaling) => {
    grab.position = position;
    grab.lookAt(rotateTo, Math.PI, 0, 0);
    grab.scaling = scaling;
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
    grab.isVisible = newValue;
    card.isVisible = newValue;
    plane.isVisible = newValue;
  });

  return { consoleIsVisible, setConsoleTransform };
};
