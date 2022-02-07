<script setup>
const labNotes = `
Grabbing objects and moving them around.
- Pointer Grabbing adapted from this [post](https://forum.babylonjs.com/t/webxr-grab-a-mesh-multiple-controller-support/14251) and this [playground](https://www.babylonjs-playground.com/#LABFNA#2)
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

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

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const ground = addLabRoom(scene);
  const { toggleConsole } = createLabConsole(scene);

  console.log("Lab 010 - Grab Lab");

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
        const xr_ids = motionController.getComponentIds();
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-button
        yButtonComponent.onButtonStateChangedObservable.add(() => {
          if (yButtonComponent.pressed) {
            toggleConsole(controller);
          }
        });
      }
    });
  });

  // TEST GRABBING
  const makeGrabbable = function (model) {
    console.log("model", model);
    Object.assign(model, {
      startInteraction(pointerInfo, controllerMesh) {
        console.log("props", this.props);
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
      },
    });
  };

  const selectedMeshes = {};
  // POINTERDOWN
  scene.onPointerObservable.add((pointerInfo) => {
    const { pickInfo } = pointerInfo;
    const { hit } = pickInfo;
    const { pickedMesh } = pickInfo;
    if (!hit) return;
    if (!pickedMesh) return;
    if (!pickedMesh.startInteraction) return;
    selectedMeshes[pointerInfo.event.pointerId] = pickedMesh;
    if (
      xr.baseExperience &&
      xr.baseExperience.state === BABYLON.WebXRState.IN_XR
    ) {
      // XR Mode
      const xrInput = xr.pointerSelection.getXRControllerByPointerId(
        pointerInfo.event.pointerId
      );
      if (!xrInput) return;
      const motionController = xrInput.motionController;
      if (!motionController) return;
      pickedMesh.startInteraction(pointerInfo, motionController.rootMesh);
    } else {
      pickedMesh.startInteraction(pointerInfo, scene.activeCamera);
    }
  }, BABYLON.PointerEventTypes.POINTERDOWN);

  // POINTERUP
  scene.onPointerObservable.add((pointerInfo) => {
    const pickedMesh = selectedMeshes[pointerInfo.event.pointerId];
    if (pickedMesh) {
      if (pickedMesh.endInteraction) {
        pickedMesh.endInteraction(pointerInfo);
      }
      delete selectedMeshes[pointerInfo.event.pointerId];
    }
  }, BABYLON.PointerEventTypes.POINTERUP);

  const grabMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  grabMat1.diffuseColor = LabColors["purple"];
  grabMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab1 = BABYLON.MeshBuilder.CreateBox("grab1", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab1.material = grabMat1;
  grab1.position = new BABYLON.Vector3(0.3, 1, 0);

  const grabMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  grabMat2.diffuseColor = LabColors["green"];
  grabMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab2 = BABYLON.MeshBuilder.CreateBox("grab2", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab2.material = grabMat2;
  grab1.addChild(grab2);
  grab2.position = new BABYLON.Vector3(0, 0.2, 0);

  const grabMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  grabMat3.diffuseColor = LabColors["blue"];
  grabMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab3 = BABYLON.MeshBuilder.CreateBox("grab3", {
    height: 0.1,
    width: 0.4,
    depth: 0.4,
  });
  grab3.material = grabMat3;
  grab2.addChild(grab3);
  grab3.position = new BABYLON.Vector3(0, 0.2, 0);

  makeGrabbable(grab1);
  makeGrabbable(grab2);
  makeGrabbable(grab3);

  const grabMat4 = new BABYLON.StandardMaterial("grab-mat4", scene);
  grabMat4.diffuseColor = LabColors["purple"];
  grabMat4.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const grab4 = BABYLON.MeshBuilder.CreateBox("grab4", {
    height: 0.5,
    width: 0.5,
    depth: 0.5,
  });
  grab4.material = grabMat4;
  grab4.position = new BABYLON.Vector3(-0.6, 1.2, 0);

  var boundingBox =
    BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(grab4);
  // boundingBox.scaleRatio = 1.5;

  // // Create bounding box positionGizmo
  // var utilLayer = new BABYLON.UtilityLayerRenderer(scene);
  // utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
  // var positionGizmo = new BABYLON.BoundingBoxGizmo(
  //   BABYLON.Color3.FromHexString("#0984e3"),
  //   utilLayer
  // );
  // positionGizmo.attachedMesh = boundingBox;
  // // positionGizmo.scaleRatio = 0.5;

  // // Create behaviors to drag and scale with pointers in VR
  var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  boundingBox.addBehavior(sixDofDragBehavior);
  var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior();
  boundingBox.addBehavior(multiPointerScaleBehavior);

  // END WebXR --------------------------------------------------

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
