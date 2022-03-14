<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as MAT from "babylonjs-materials";
import "babylonjs-loaders";
import { ref, reactive, onMounted, watch } from "@vue/runtime-core";
import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Teleport Controls

`;
const bjsCanvas = ref(null);

let engine;
let scene;
let mainCamera; // a refecence to the XR camera, will be set after entering VR
let menuIsVisible = ref(true);

let movementControlManager; // a reference to the movement controls
let movementSettings = reactive({
  movementOrientationFollowsViewerPose: true,

  movementEnabled: true,
  movementSpeed: 0.5, // 1 is too fast most of the time
  movementThreshold: 0.25,

  rotationEnabled: true,
  rotationSpeed: 0.25,
  rotationThreshold: 0.25,
});

watch(movementSettings, (newValue) => {
  // console.log("watching movementSettings", newValue);
  if (movementControlManager) {
    movementControlManager.movementOrientationFollowsViewerPose =
      newValue.movementOrientationFollowsViewerPose;

    movementControlManager.movementEnabled = newValue.movementEnabled;
    movementControlManager.movementSpeed = newValue.movementSpeed;
    movementControlManager.movementThreshold = newValue.movementThreshold;

    movementControlManager.rotationEnabled = newValue.rotationEnabled;
    movementControlManager.rotationSpeed = newValue.rotationSpeed;
    movementControlManager.rotationThreshold = newValue.rotationThreshold;
  }
});

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const teleportMeshes = addLabRoomLocal(scene);
  console.log("teleportMeshes", teleportMeshes);

  const { toggleMenu } = createUICard();

  await addLabPlayerLocal(scene, toggleMenu, teleportMeshes);
  toggleMenu();

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

const createUICard = (scene) => {
  const toggleMenu = () => {
    menuIsVisible.value = !menuIsVisible.value;
  };

  const cardMaterial = new BABYLON.StandardMaterial(
    "menu-card-material",
    scene
  );
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const card = BABYLON.MeshBuilder.CreateBox("menu-card", {
    width: 1,
    height: 1,
    depth: 0.1,
  });
  card.material = cardMaterial;
  card.position = new BABYLON.Vector3(0, 1, 0);

  const followBehavior = new BABYLON.FollowBehavior();
  followBehavior.defaultDistance = 1.2;
  followBehavior.minimumDistance = 1;
  followBehavior.maximumDistance = 2;
  followBehavior.ignoreCameraPitchAndRoll = true;
  followBehavior.pitchOffset = -10;
  followBehavior.lerpTime = 250;
  followBehavior.attach(card);

  // UI Plane
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "menu-plane",
    {
      width: 1,
      height: 1,
    },
    scene
  );
  plane.position.z = -0.055;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1 * 1024,
    1 * 1024
  );
  advancedTexture.name = "menu-texture";

  const sv = new GUI.ScrollViewer("lab-info-scroll");
  sv.thickness = 12;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.height = `${1024}px`;
  sv.width = `${1024}px`;
  sv.barSize = 30;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(sv);

  const movementSpeedLabel = new GUI.TextBlock();
  movementSpeedLabel.text = "Movement Speed: 0.5";
  movementSpeedLabel.height = "60px";
  movementSpeedLabel.fontSize = "40px";
  movementSpeedLabel.color = "white";
  movementSpeedLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const movementSpeedSlider = new GUI.Slider();
  movementSpeedSlider.minimum = 0.1;
  movementSpeedSlider.maximum = 2;
  movementSpeedSlider.value = 0.5;
  movementSpeedSlider.height = "60px";
  movementSpeedSlider.width = "100%";
  movementSpeedSlider.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  movementSpeedSlider.color = "#8854d0";
  movementSpeedSlider.background = "#53637b";
  movementSpeedSlider.onValueChangedObservable.add(function (value) {
    movementSettings.movementSpeed = value;
    movementSpeedLabel.text = `Movement Speed: ${value.toFixed(2)}`;
  });

  const movementThresholdLabel = new GUI.TextBlock();
  movementThresholdLabel.text = "Axis Threshold: 0.25";
  movementThresholdLabel.height = "60px";
  movementThresholdLabel.fontSize = "40px";
  movementThresholdLabel.color = "white";
  movementThresholdLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const movementThresholdSlider = new GUI.Slider();
  movementThresholdSlider.minimum = 0;
  movementThresholdSlider.maximum = 1;
  movementThresholdSlider.value = 0.25;
  movementThresholdSlider.height = "60px";
  movementThresholdSlider.width = "100%";
  movementThresholdSlider.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  movementThresholdSlider.color = "#8854d0";
  movementThresholdSlider.background = "#53637b";
  movementThresholdSlider.onValueChangedObservable.add(function (value) {
    movementSettings.movementThreshold = value;
    movementThresholdLabel.text = `Axis Threshold: ${value.toFixed(2)}`;
  });

  const movementEnabledLabel = new GUI.TextBlock();
  movementEnabledLabel.text = "Movement Enabled";
  movementEnabledLabel.height = "60px";
  movementEnabledLabel.fontSize = "40px";
  movementEnabledLabel.color = "white";
  movementEnabledLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const movementEnabledToggle = new GUI.Checkbox();
  movementEnabledToggle.isChecked = true;
  movementEnabledToggle.height = "60px";
  movementEnabledToggle.width = "70px";
  movementEnabledToggle.color = "#8854d0";
  movementEnabledToggle.background = "#53637b";
  movementEnabledToggle.paddingLeftInPixels = "10";
  movementEnabledToggle.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  movementEnabledToggle.onIsCheckedChangedObservable.add(function (value) {
    movementSettings.movementEnabled = value;
  });

  const rotationSpeedLabel = new GUI.TextBlock();
  rotationSpeedLabel.text = "Rotation Speed: 0.25";
  rotationSpeedLabel.height = "60px";
  rotationSpeedLabel.fontSize = "40px";
  rotationSpeedLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  rotationSpeedLabel.color = "white";

  const rotationSpeedSlider = new GUI.Slider();
  rotationSpeedSlider.minimum = 0.1;
  rotationSpeedSlider.maximum = 1;
  rotationSpeedSlider.value = 0.25;
  rotationSpeedSlider.height = "60px";
  rotationSpeedSlider.width = "100%";
  rotationSpeedSlider.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  rotationSpeedSlider.color = "#8854d0";
  rotationSpeedSlider.background = "#53637b";
  rotationSpeedSlider.onValueChangedObservable.add(function (value) {
    movementSettings.rotationSpeed = value;
    rotationSpeedLabel.text = `Rotation Speed: ${value.toFixed(2)}`;
  });

  const rotationThresholdLabel = new GUI.TextBlock();
  rotationThresholdLabel.text = "Axis Threshold: 0.25";
  rotationThresholdLabel.height = "60px";
  rotationThresholdLabel.fontSize = "40px";
  rotationThresholdLabel.color = "white";
  rotationThresholdLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const rotationThresholdSlider = new GUI.Slider();
  rotationThresholdSlider.minimum = 0;
  rotationThresholdSlider.maximum = 1;
  rotationThresholdSlider.value = 0.25;
  rotationThresholdSlider.height = "60px";
  rotationThresholdSlider.width = "100%";
  rotationThresholdSlider.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  rotationThresholdSlider.color = "#8854d0";
  rotationThresholdSlider.background = "#53637b";
  rotationThresholdSlider.onValueChangedObservable.add(function (value) {
    movementSettings.rotationThreshold = value;
    rotationThresholdLabel.text = `Axis Threshold: ${value.toFixed(2)}`;
  });

  const rotationEnabledLabel = new GUI.TextBlock();
  rotationEnabledLabel.text = "Rotation Enabled";
  rotationEnabledLabel.height = "70px";
  rotationEnabledLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  rotationEnabledLabel.fontSize = "40px";
  rotationEnabledLabel.color = "white";

  const rotationEnabledCheckbox = new GUI.Checkbox();
  rotationEnabledCheckbox.isChecked = true;
  rotationEnabledCheckbox.height = "60px";
  rotationEnabledCheckbox.width = "70px";
  rotationEnabledCheckbox.color = "#8854d0";
  rotationEnabledCheckbox.background = "#53637b";
  rotationEnabledCheckbox.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  rotationEnabledCheckbox.paddingLeftInPixels = "10";
  rotationEnabledCheckbox.onIsCheckedChangedObservable.add(function (value) {
    movementSettings.rotationEnabled = value;
  });

  const movementOrientationFollowsViewerPoseLabel = new GUI.TextBlock();
  movementOrientationFollowsViewerPoseLabel.text = "Orientation Follows Pose";
  movementOrientationFollowsViewerPoseLabel.height = "70px";
  movementOrientationFollowsViewerPoseLabel.fontSize = "40px";
  movementOrientationFollowsViewerPoseLabel.color = "white";
  movementOrientationFollowsViewerPoseLabel.textHorizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const movementOrientationFollowsViewerPoseCheckbox = new GUI.Checkbox();
  movementOrientationFollowsViewerPoseCheckbox.isChecked = true;
  movementOrientationFollowsViewerPoseCheckbox.height = "60px";
  movementOrientationFollowsViewerPoseCheckbox.width = "70px";
  movementOrientationFollowsViewerPoseCheckbox.color = "#8854d0";
  movementOrientationFollowsViewerPoseCheckbox.background = "#53637b";
  movementOrientationFollowsViewerPoseCheckbox.horizontalAlignment =
    GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  movementOrientationFollowsViewerPoseCheckbox.paddingLeftInPixels = "10";
  movementOrientationFollowsViewerPoseCheckbox.onIsCheckedChangedObservable.add(
    function (value) {
      movementSettings.movementOrientationFollowsViewerPose = value;
    }
  );

  const gravityLabel = new GUI.TextBlock();
  gravityLabel.text = "Apply Gravity";
  gravityLabel.height = "60px";
  gravityLabel.fontSize = "40px";
  gravityLabel.color = "white";
  gravityLabel.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  const gravityCheckbox = new GUI.Checkbox();
  gravityCheckbox.isChecked = true;
  gravityCheckbox.height = "60px";
  gravityCheckbox.width = "70px";
  gravityCheckbox.color = "#8854d0";
  gravityCheckbox.background = "#53637b";
  gravityCheckbox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gravityCheckbox.paddingLeftInPixels = "10";
  gravityCheckbox.onIsCheckedChangedObservable.add(function (value) {
    mainCamera.applyGravity = value;
  });

  const resetButton = GUI.Button.CreateSimpleButton(
    "reset-button",
    "Reset All"
  );
  resetButton.width = 1;
  resetButton.height = "60px";
  resetButton.fontSize = "40px";
  resetButton.color = "white";
  resetButton.background = "#53637b";

  resetButton.onPointerUpObservable.add(function () {
    movementSettings.movementSpeed = 0.5;
    movementSettings.movementThreshold = 0.25;
    movementSettings.movementEnabled = true;
    movementSettings.rotationSpeed = 0.25;
    movementSettings.rotationThreshold = 0.25;
    movementSettings.rotationEnabled = true;
    movementSettings.movementOrientationFollowsViewerPose = true;

    movementSpeedSlider.value = movementSettings.movementSpeed;
    movementThresholdSlider.value = movementSettings.movementThreshold;
    movementEnabledToggle.isChecked = movementSettings.movementEnabled;
    rotationSpeedSlider.value = movementSettings.rotationSpeed;
    rotationThresholdSlider.value = movementSettings.rotationThreshold;
    movementEnabledToggle.isChecked = movementSettings.movementEnabled;
    rotationEnabledCheckbox.isChecked = movementSettings.rotationEnabled;
    movementOrientationFollowsViewerPoseCheckbox.isChecked =
      movementSettings.movementOrientationFollowsViewerPose;

    // Move the player back to the starting position
    mainCamera.position = new BABYLON.Vector3(0, 3, 0);
  });

  const grid = new GUI.Grid();
  grid.addColumnDefinition(40, true);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(0.5);
  grid.addColumnDefinition(40, true);

  grid.addRowDefinition(72, true); // empty row

  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);

  grid.addRowDefinition(72, true); // empty row

  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);

  grid.addRowDefinition(72, true); // empty row
  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);
  grid.addRowDefinition(72, true);

  sv.addControl(grid);

  // Layout the grid content
  grid.addControl(movementSpeedLabel, 1, 1);
  grid.addControl(movementSpeedSlider, 1, 2);
  grid.addControl(movementThresholdLabel, 2, 1);
  grid.addControl(movementThresholdSlider, 2, 2);
  grid.addControl(movementEnabledLabel, 3, 1);
  grid.addControl(movementEnabledToggle, 3, 2);

  grid.addControl(rotationSpeedLabel, 5, 1);
  grid.addControl(rotationSpeedSlider, 5, 2);
  grid.addControl(rotationThresholdLabel, 6, 1);
  grid.addControl(rotationThresholdSlider, 6, 2);
  grid.addControl(rotationEnabledLabel, 7, 1);
  grid.addControl(rotationEnabledCheckbox, 7, 2);

  grid.addControl(movementOrientationFollowsViewerPoseLabel, 9, 1);
  grid.addControl(movementOrientationFollowsViewerPoseCheckbox, 9, 2);

  grid.addControl(gravityLabel, 10, 1);
  grid.addControl(gravityCheckbox, 10, 2);

  grid.addControl(resetButton, 12, 2);

  watch(menuIsVisible, (newValue) => {
    card.isVisible = newValue;
    plane.isVisible = newValue;
  });

  return { toggleMenu };
};

const addLabPlayerLocal = async (scene, toggleMenu, teleportMeshes) => {
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    // floorMeshes: teleportMeshes,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true,
    },
  });

  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    mainCamera = xrCamera;
    xrCamera.position.z = -2;
  });

  const teleportRingMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  teleportRingMat.diffuseColor = LabColors["light1"];
  teleportRingMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  //   var utilLayer = new BABYLON.UtilityLayerRenderer(scene);
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(
    "cylinder",
    { height: 0.05, diameter: 1 },
    scene
  );
  cylinder.position.y = 0.25;
  const cylinderMaterial = new BABYLON.StandardMaterial("cylinder-mat", scene);
  cylinderMaterial.diffuseColor = LabColors["purple"];
  cylinderMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  cylinder.material = cylinderMaterial;
  cylinder.renderingGroupId = 1;

  const featuresManager = xr.baseExperience.featuresManager;
  const teleportation = featuresManager.enableFeature(
    BABYLON.WebXRFeatureName.TELEPORTATION,
    "stable",
    {
      xrInput: xr.input,
      floorMeshes: teleportMeshes,
      renderingGroupId: 1,
      teleportationTargetMesh: cylinder,
      defaultTargetMeshOptions: {
        teleportationFillColor: "#3e4a5d",
        teleportationBorderColor: "#8854d0",
        torusArrowMaterial: teleportRingMat,
      },
    }
  );

  teleportation.parabolicCheckRadius = 10;

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Left Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Left Grip Pressed");
          }
        });

        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-button
        xButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-button
        yButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (yButtonComponent.pressed) {
            console.log("Y Button Pressed");
            toggleMenu();
          }
        });
      }

      // END LEFT CONTROLLER ------------------------------------------------------------

      if (motionController.handness === "right") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Right Trigger Pressed");
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          if (squeezeComponent.pressed) {
            console.log("Right Grip Pressed");
          }
        });

        let aButtonComponent = motionController.getComponent(xr_ids[3]); //a-button
        aButtonComponent?.onButtonStateChangedObservable.add(() => {
          // Move the player back to the start position if the A button is pressed
          if (aButtonComponent.pressed) {
            console.log("A Button Pressed");
          }
        });
        let bButtonComponent = motionController.getComponent(xr_ids[4]); //b-button
        bButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (bButtonComponent.pressed) {
            console.log("B Button Pressed");
          }
        });
      }
    });
  });
};

const addLabRoomLocal = (scene) => {
  // Add a ground plane to the scene. Used for WebXR teleportation
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 100, width: 100, subdivisions: 4 },
    scene
  );
  // ground.position.y = 10;
  ground.sideOrientation = "DOUBLESIDE";
  const groundMaterial = new MAT.GridMaterial("ground-mat", scene);
  groundMaterial.majorUnitFrequency = 5;
  groundMaterial.minorUnitFrequency = 0.1;
  groundMaterial.gridRatio = 1;
  groundMaterial.backFaceCulling = false;
  groundMaterial.mainColor = LabColors.light1;
  groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  groundMaterial.opacity = 0.98;
  ground.material = groundMaterial;
  ground.checkCollisions = true;

  // Note: the rotation of these elements is set to put the face of the plane/ground facing the inside of the room so that collisions will work.

  const wall1 = BABYLON.MeshBuilder.CreateGround(
    "wall1",
    { height: 10, width: 100, subdivisions: 4 },
    scene
  );
  wall1.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI, Math.PI / 2);
  wall1.position = new BABYLON.Vector3(-50, 5, 0);
  wall1.material = groundMaterial;
  wall1.sideOrientation = "DOUBLESIDE";
  wall1.checkCollisions = true;

  const wall2 = wall1.clone("wall2");
  wall2.rotation.z = -Math.PI / 2;
  wall2.position = new BABYLON.Vector3(50, 5, 0);

  console.log("wall rotation", wall1.rotation, wall2.rotation);

  const wall3 = BABYLON.MeshBuilder.CreateGround(
    "wall1",
    { height: 10, width: 100, subdivisions: 4 },
    scene
  );
  wall3.material = groundMaterial;
  wall3.sideOrientation = "DOUBLESIDE";
  wall3.checkCollisions = true;
  wall3.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall3.position = new BABYLON.Vector3(0, 5, -50);

  const wall4 = wall3.clone("wall4");
  wall4.rotation.z = -Math.PI / 2;
  wall4.position = new BABYLON.Vector3(0, 5, 50);

  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["purple"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    width: 20,
    height: 0.2,
    depth: 20,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(20, 3, 10);
  subject1.checkCollisions = true;

  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["blue"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    width: 20,
    height: 0.2,
    depth: 20,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(-10, 9, 15);

  const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["green"];
  subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
    width: 20,
    height: 0.2,
    depth: 20,
  });
  subject3.material = subjectMat3;
  subject3.position = new BABYLON.Vector3(0, 6, -20);

  // return meshes for teleportation
  return [ground, subject1, subject2, subject3];
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
