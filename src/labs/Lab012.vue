<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import "babylonjs-loaders";
import { ref, onMounted, onUnmounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Gizmos!
- Example 1 creates a gizmo for a single mesh. This option takes a bit more work but offers much more control. I also found these gizmos easier to use in VR than the ones created by GizmoManager.
- Example 2 uses GizmoManager to create a gizmo for a group of meshes.
- Spacebar or VR X button to cycle gizmos.
`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  const manager = new GUI.GUI3DManager(scene);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  console.log("Lab 012 - Gizmos!");
  const gizMode = ref(0);

  // START WebXR ------------------------------------------------------------
  // WebXRDefaultExperience

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  // Just a quick hack to add an action to the X button
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const xr_ids = motionController.getComponentIds();
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
            console.log("gizMode", gizMode.value);
          }
        });
      }
    });
  });

  // Example 1: Manual creation of a gizmos on a mesh
  const boxMat = new BABYLON.StandardMaterial("box-mat", scene);
  boxMat.diffuseColor = LabColors["purple"];
  boxMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const box = BABYLON.MeshBuilder.CreateBox("box", {
    height: 0.5,
    width: 0.5,
    depth: 0.5,
  });
  box.material = boxMat;
  box.position = new BABYLON.Vector3(-1, 1.0, 0);

  const boundingBox =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(box);

  const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  boundingBox.addBehavior(sixDofDragBehavior);

  // Create utility layer the positionGizmo will be rendered on
  const utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // Create the positionGizmo and attach to the sphere
  const positionGizmo = new BABYLON.PositionGizmo(utilLayer);
  positionGizmo.attachedMesh = box;
  positionGizmo.scaleRatio = 2;

  positionGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  positionGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  const rotationGizmo = new BABYLON.RotationGizmo(utilLayer);
  positionGizmo.scaleRatio = 2;

  rotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  rotationGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  const scaleGizmo = new BABYLON.ScaleGizmo(utilLayer);
  scaleGizmo.scaleRatio = 2;

  // Keep the scaleGizmo fixed to local rotation
  scaleGizmo.updateGizmoRotationToMatchAttachedMesh = true;
  scaleGizmo.updateGizmoPositionToMatchAttachedMesh = true;

  // Create app bar
  const appBar = new BABYLON.TransformNode("");
  appBar.scaling.scaleInPlace(0.1);
  const panel = new GUI.PlanePanel();
  panel.margin = 0;
  panel.rows = 1;
  manager.addControl(panel);
  panel.linkToTransformNode(appBar);
  const positionButton = new GUI.HolographicButton("orientation");
  panel.addControl(positionButton);
  positionButton.text = "Position";
  positionButton.onPointerClickObservable.add(() => {
    gizMode.value = 0;
  });
  const rotationButton = new GUI.HolographicButton("orientation");
  panel.addControl(rotationButton);
  rotationButton.text = "Rotation";
  rotationButton.onPointerClickObservable.add(() => {
    gizMode.value = 1;
  });
  const scaleButton = new GUI.HolographicButton("orientation");
  panel.addControl(scaleButton);
  scaleButton.text = "Scale";
  scaleButton.onPointerClickObservable.add(() => {
    gizMode.value = 2;
  });

  //attach app bar to bounding box
  const behavior = new BABYLON.AttachToBoxBehavior(appBar);
  boundingBox.addBehavior(behavior);

  // Example 2: Automatic creation of gizmos using GizmoManager on multiple meshes
  const grabMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  grabMat1.diffuseColor = LabColors["purple"];
  grabMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab1 = BABYLON.MeshBuilder.CreateBox("grab1", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  grab1.material = grabMat1;
  grab1.position = new BABYLON.Vector3(0, 1, 0);

  const grabMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  grabMat2.diffuseColor = LabColors["green"];
  grabMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab2 = BABYLON.MeshBuilder.CreateBox("grab2", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  grab2.material = grabMat2;
  //   grab1.addChild(grab2);
  grab2.position = new BABYLON.Vector3(0.5, 1, 0);

  const grabMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  grabMat3.diffuseColor = LabColors["blue"];
  grabMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab3 = BABYLON.MeshBuilder.CreateBox("grab3", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  grab3.material = grabMat3;
  //   grab2.addChild(grab3);
  grab3.position = new BABYLON.Vector3(1, 1, 0);

  const boundingBox1 =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(grab1);
  const boundingBox2 =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(grab2);
  const boundingBox3 =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(grab3);

  const gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.scaleRatio = 3;
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;
  gizmoManager.boundingBoxGizmoEnabled = false;
  gizmoManager.attachableMeshes = [boundingBox1, boundingBox2, boundingBox3];

  // END WebXR --------------------------------------------------

  document.onkeydown = (e) => {
    if (e.code == "Space") {
      if (gizMode.value === 0) {
        gizMode.value = 1;
      } else if (gizMode.value === 1) {
        gizMode.value = 2;
      } else {
        gizMode.value = 0;
      }
    }
  };

  watch(gizMode, (newVal) => {
    if (newVal === 0) {
      // Toggle gizmos for Example 1
      positionGizmo.attachedMesh = !positionGizmo.attachedMesh ? box : null;
      rotationGizmo.attachedMesh = null;
      scaleGizmo.attachedMesh = null;

      // Toggle gizmos for Example 2
      gizmoManager.positionGizmoEnabled = true;
      gizmoManager.rotationGizmoEnabled = false;
      gizmoManager.scaleGizmoEnabled = false;
    } else if (newVal === 1) {
      // Toggle gizmos for Example 1
      positionGizmo.attachedMesh = null;
      rotationGizmo.attachedMesh = !rotationGizmo.attachedMesh ? box : null;
      scaleGizmo.attachedMesh = null;

      // Toggle gizmos for Example 2
      gizmoManager.positionGizmoEnabled = false;
      gizmoManager.rotationGizmoEnabled = true;
      gizmoManager.scaleGizmoEnabled = false;
    } else if (newVal === 2) {
      // Toggle gizmos for Example 1
      positionGizmo.attachedMesh = null;
      rotationGizmo.attachedMesh = null;
      scaleGizmo.attachedMesh = !scaleGizmo.attachedMesh ? box : null;

      // Toggle gizmos for Example 2
      gizmoManager.positionGizmoEnabled = false;
      gizmoManager.rotationGizmoEnabled = false;
      gizmoManager.scaleGizmoEnabled = true;
    }
  });
  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

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
