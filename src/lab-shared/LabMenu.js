/*
This tool started as a proof of concept for during Lab 007 and was refactored into this file.
Lots to do before this is a robust tool: https://github.com/vrhermit/Canvatorium/issues/10
*/

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import { ref, watch } from "@vue/runtime-core";
import LabColors from "../lab-shared/LabColors";
import { createLabConsole } from "../lab-shared/LabConsole";
import createLabNotesPanel from "../lab-shared/LabNotes";

export const createLabMenu = (scene) => {
  const { toggleConsole } = createLabConsole(scene);
  console.log(toggleConsole);

  let menuIsVisible = ref(false);

  // Grab Handle
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

  const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.draggableMeshes = [grab];
  grab.addBehavior(sixDofDragBehavior);

  // Card
  const cardMaterial = new BABYLON.StandardMaterial("menu-card-material", scene);
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const card = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1,
    height: 1,
    depth: 0.1
  });
  card.material = cardMaterial;
  grab.addChild(card);
  card.position = new BABYLON.Vector3(0, 0.6, 0);

  // UI Plane
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "menu-plane",
    {
      width: 1,
      height: 1
    },
    scene
  );
  plane.position.z = -0.055;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1 * 1024, 1 * 1024);
  advancedTexture.name = "menu-texture";

  var vStack = new GUI.StackPanel();
  advancedTexture.addControl(vStack);

  var hStack = new GUI.StackPanel();
  hStack.isVertical = false;
  hStack.height = "128px";

  var buttonInfo = GUI.Button.CreateSimpleButton("buttonInfo", "Lab Info");
  buttonInfo.width = "512px";
  buttonInfo.height = "128px";
  buttonInfo.paddingBottomInPixels = "12px";
  buttonInfo.background = "#3e4a5d";
  buttonInfo.color = "white";
  buttonInfo.fontSize = "48px";
  buttonInfo.left = "-256px";
  hStack.addControl(buttonInfo);

  var buttonConsole = GUI.Button.CreateSimpleButton("buttonConsole", "Console");
  buttonConsole.width = "512px";
  buttonConsole.height = "128px";
  buttonConsole.paddingBottomInPixels = "12px";
  buttonConsole.background = "#3e4a5d";
  buttonConsole.color = "white";
  buttonConsole.fontSize = "48px";
  buttonConsole.left = "256px";
  hStack.addControl(buttonConsole);

  vStack.addControl(hStack);
  vStack.addControl(createLabNotesPanel());

  const setConsoleTransform = (position, rotateTo, scaling) => {
    grab.position = position;
    grab.lookAt(rotateTo, Math.PI, 0, 0);
    grab.scaling = scaling;
  };

  const toggleMenu = (xrController) => {
    menuIsVisible.value = !menuIsVisible.value;

    if (xrController.grip && menuIsVisible.value) {
      // Create an empty ray
      const tmpRay = new BABYLON.Ray(new BABYLON.Vector3(), new BABYLON.Vector3(), Infinity);

      // Update the ray to use the controller's position and forward
      xrController.getWorldPointerRayToRef(tmpRay, true);

      // Calculate a position in front of the controller
      const newPosition = new BABYLON.Vector3(tmpRay.origin.x + tmpRay.direction.x, tmpRay.origin.y, tmpRay.origin.z + tmpRay.direction.z);

      // Use the current position of the controller as a vector to use with lookAt()
      const newRotation = new BABYLON.Vector3(tmpRay.origin.x, tmpRay.origin.y, tmpRay.origin.z);

      const newScale = new BABYLON.Vector3(0.5, 0.5, 0.5);
      setConsoleTransform(
        // Repacking these so I don't end up with a reference to the controller
        newPosition,
        newRotation,
        newScale
      );
    }
  };

  watch(menuIsVisible, (newValue) => {
    grab.isVisible = newValue;
    card.isVisible = newValue;
    advancedTexture.isVisible = newValue;
  });

  return { toggleMenu };
};
