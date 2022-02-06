<script setup>
const labNotes = `
Gizmos!
`;

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import "babylonjs-loaders";
import { ref, onMounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabConsole } from "../lab-shared/LabConsole";

import LabColors from "../lab-shared/LabColors";

const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  var manager = new GUI.GUI3DManager(scene);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  const { toggleConsole } = createLabConsole(scene);

  console.log("Lab 012 - Gizmos!");
  const gizMode = ref(0);

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  // let vrCamera;
  // Move the player when thet enter immersive mode
  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    xrCamera.position.z = -2;
  });

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-positionButton
        xButtonComponent.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
            if (gizMode.value === 0) {
              gizMode.value = 1;
            } else if (gizMode.value === 1) {
              gizMode.value = 2;
            } else {
              gizMode.value = 0;
            }
          }
        });
        const xr_ids = motionController.getComponentIds();
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-positionButton
        yButtonComponent.onButtonStateChangedObservable.add(() => {
          if (yButtonComponent.pressed) {
            toggleConsole(controller);
          }
        });
      }
    });
  });

  const boxMat = new BABYLON.StandardMaterial("box-mat", scene);
  boxMat.diffuseColor = LabColors["purple"];
  boxMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const box = BABYLON.MeshBuilder.CreateBox("box", {
    height: 0.5,
    width: 0.5,
    depth: 0.5,
  });
  box.material = boxMat;
  box.position = new BABYLON.Vector3(0, 1.2, 0);

  var boundingBox =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(box);

  var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  boundingBox.addBehavior(sixDofDragBehavior);

  // Create utility layer the positionGizmo will be rendered on
  var utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // Create the positionGizmo and attach to the sphere
  var positionGizmo = new BABYLON.PositionGizmo(utilLayer);
  positionGizmo.attachedMesh = box;
  positionGizmo.scaleRatio = 2;

  positionGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  var rotationGizmo = new BABYLON.RotationGizmo(utilLayer);
  positionGizmo.scaleRatio = 2;

  rotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  rotationGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  var scaleGizmo = new BABYLON.ScaleGizmo(utilLayer);
  scaleGizmo.scaleRatio = 2;

  // Keep the scaleGizmo fixed to local rotation
  scaleGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  scaleGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  // Create app bar
  var appBar = new BABYLON.TransformNode("");
  appBar.scaling.scaleInPlace(0.1);
  var panel = new GUI.PlanePanel();
  panel.margin = 0;
  panel.rows = 1;
  manager.addControl(panel);
  panel.linkToTransformNode(appBar);
  var positionButton = new GUI.HolographicButton("orientation");
  panel.addControl(positionButton);
  positionButton.text = "Position";
  positionButton.onPointerClickObservable.add(() => {
    gizMode.value = 0;
  });
  var rotationButton = new GUI.HolographicButton("orientation");
  panel.addControl(rotationButton);
  rotationButton.text = "Rotation";
  rotationButton.onPointerClickObservable.add(() => {
    gizMode.value = 1;
  });
  var scaleButton = new GUI.HolographicButton("orientation");
  panel.addControl(scaleButton);
  scaleButton.text = "Scale";
  scaleButton.onPointerClickObservable.add(() => {
    gizMode.value = 2;
  });

  //attach app bar to bounding box
  var behavior = new BABYLON.AttachToBoxBehavior(appBar);
  boundingBox.addBehavior(behavior);

  // END WebXR --------------------------------------------------

  document.onkeydown = () => {
    if (gizMode.value === 0) {
      gizMode.value = 1;
    } else if (gizMode.value === 1) {
      gizMode.value = 2;
    } else {
      gizMode.value = 0;
    }
  };

  watch(gizMode, (newVal) => {
    if (newVal === 0) {
      positionGizmo.attachedMesh = !positionGizmo.attachedMesh ? box : null;
      rotationGizmo.attachedMesh = null;
      scaleGizmo.attachedMesh = null;
    } else if (newVal === 1) {
      positionGizmo.attachedMesh = null;
      rotationGizmo.attachedMesh = !rotationGizmo.attachedMesh ? box : null;
      scaleGizmo.attachedMesh = null;
    } else if (newVal === 2) {
      positionGizmo.attachedMesh = null;
      rotationGizmo.attachedMesh = null;
      scaleGizmo.attachedMesh = !scaleGizmo.attachedMesh ? box : null;
    }
  });
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
