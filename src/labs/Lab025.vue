<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import * as MAT from "babylonjs-materials";
import "babylonjs-loaders";
import {
  ref,
  reactive,
  onMounted,
  onUnmounted,
  watch,
} from "@vue/runtime-core";
import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import LabColors from "../lab-shared/LabColors";

import {
  createGridMenuLabel,
  createGridMenuSlider,
  createGridMenuCheckbox,
} from "../lab-shared/LabMenuControls";

labNotes.value = `
Teleport Controls

`;
const bjsCanvas = ref(null);

let engine;
let scene;
let mainCamera; // a refecence to the XR camera, will be set after entering VR
let menuIsVisible = ref(true);

let featuresManager;
let teleportControlManager; // a reference to the teleport object
let teleportSettings = reactive({
  parabolicRayEnabled: true,
  parabolicCheckRadius: 5,

  rotationEnabled: true,
  rotationAngle: 0.25,

  backwardsMovementEnabled: true,
  backwardsTeleportationDistance: 0.7,
});

let teleportSetupData = reactive({
  useMainComponent: false,
  useRenderingGroupId: false,
  useCustomMesh: false,
});

watch(teleportSettings, (newValue) => {
  // console.log("watching teleportSettings", newValue);
  if (teleportControlManager) {
    teleportControlManager.parabolicRayEnabled = newValue.parabolicRayEnabled;
    teleportControlManager.parabolicCheckRadius = newValue.parabolicCheckRadius;

    teleportControlManager.rotationEnabled = newValue.rotationEnabled;
    teleportControlManager.rotationAngle = newValue.rotationAngle;

    teleportControlManager.backwardsMovementEnabled =
      newValue.backwardsMovementEnabled;
    teleportControlManager.backwardsTeleportationDistance =
      newValue.backwardsTeleportationDistance;
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

  const { toggleMenu } = createUICard();

  const { createTeleportationSetup } = await addLabPlayerLocal(
    scene,
    toggleMenu,
    teleportMeshes
  );
  // toggleMenu();
  watch(teleportSetupData, (newValue) => {
    console.log("watching teleportSetupData", newValue);
    if (featuresManager) {
      const teleportation = featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.TELEPORTATION,
        "stable",
        createTeleportationSetup({
          useMainComponent: newValue.useMainComponent,
          useRenderingGroupId: newValue.useRenderingGroupId,
          useCustomMesh: newValue.useCustomMesh,
        })
      );

      teleportControlManager = teleportation;
      teleportControlManager.parabolicRayEnabled =
        teleportSettings.parabolicRayEnabled;
      teleportControlManager.parabolicCheckRadius =
        teleportSettings.parabolicCheckRadius;

      teleportControlManager.rotationEnabled = teleportSettings.rotationEnabled;
      teleportControlManager.rotationAngle = teleportSettings.rotationAngle;

      teleportControlManager.backwardsMovementEnabled =
        teleportSettings.backwardsMovementEnabled;
      teleportControlManager.backwardsTeleportationDistance =
        teleportSettings.backwardsTeleportationDistance;
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", resizeListener);
};

const resizeListener = () => {
  if (engine) {
    engine.resize();
  }
};

onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
  window.removeEventListener("resize", resizeListener);
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
    height: 1.35,
    depth: 0.1,
  });
  card.material = cardMaterial;
  card.position = new BABYLON.Vector3(0, 1, 0);
  card.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);

  const followBehavior = new BABYLON.FollowBehavior();
  followBehavior.defaultDistance = 0.8;
  followBehavior.minimumDistance = 0.7;
  followBehavior.maximumDistance = 1.25;
  followBehavior.ignoreCameraPitchAndRoll = true;
  followBehavior.pitchOffset = -10;
  followBehavior.lerpTime = 250;
  followBehavior.attach(card);

  // UI Plane
  const plane = BABYLON.MeshBuilder.CreatePlane(
    "menu-plane",
    {
      width: 1,
      height: 1.35,
    },
    scene
  );
  plane.position.z = -0.055;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1 * 1024,
    1.35 * 1024
  );
  advancedTexture.name = "menu-texture";

  const sv = new GUI.ScrollViewer("lab-info-scroll");
  sv.thickness = 12;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.height = `${2048}px`;
  sv.width = `${1024}px`;
  sv.barSize = 30;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(sv);

  const stackPanel = new GUI.StackPanel("lab-info-stack");
  stackPanel.width = "100%";
  stackPanel.height = "100%";
  stackPanel.isVertical = true;

  const createSection1 = () => {
    const heading = new GUI.TextBlock("lab-info-heading-1");
    heading.text =
      "Section 1: These options can be modified in real time on an instance of BABYLON.WebXRFeatureName.TELEPORTATION";
    heading.height = "90px";
    heading.color = "#b4becc";
    heading.textWrapping = GUI.TextWrapping.WordWrap;
    heading.fontSize = 30;
    heading.fontStyle = "italic";
    heading.paddingLeft = "40px";
    heading.paddingRight = "40px";
    heading.paddingTop = "20px";
    heading.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    heading.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    const parabolicCheckRadiusLabel = createGridMenuLabel(
      "Parabolic Radius: 5"
    );

    const parabolicCheckRadiusSlider = createGridMenuSlider({
      min: 1,
      max: 20,
      step: 1,
      value: 5,
    });
    parabolicCheckRadiusSlider.onValueChangedObservable.add(function (value) {
      teleportSettings.parabolicCheckRadius = value;
      parabolicCheckRadiusLabel.text = `Parabolic Radius: ${value}`;
    });

    const parabolicRayEnabledLabel = createGridMenuLabel("Parabolic Enabled");
    const parabolicRayEnabledCheckbox = createGridMenuCheckbox();
    parabolicRayEnabledCheckbox.onIsCheckedChangedObservable.add(function (
      value
    ) {
      teleportSettings.parabolicRayEnabled = value;
    });

    const rotationAngleLabel = createGridMenuLabel("Snap Turn Angle (Pi / 8)");

    const rotationAngleSlider = createGridMenuSlider({
      min: 2,
      max: 12,
      step: 1,
      value: 8,
    });
    rotationAngleSlider.onValueChangedObservable.add(function (value) {
      teleportSettings.rotationAngle = value;
      rotationAngleLabel.text = `Snap Turn Angle (Pi / ${value})`;
    });

    // Important: This setting only effects the rotation feature on an active teleport target. The user can move their thumbstick to rotate round the target before completing the teleportation.
    const rotationEnabledLabel = createGridMenuLabel("Rotate During Teleport");
    const rotationEnabledCheckbox = createGridMenuCheckbox();
    rotationEnabledCheckbox.onIsCheckedChangedObservable.add(function (value) {
      teleportSettings.rotationEnabled = value;
    });

    const backwardsMovementEnabledLabel =
      createGridMenuLabel("Backwards Movement");
    const backwardsMovementEnabledCheckbox = createGridMenuCheckbox();
    backwardsMovementEnabledCheckbox.onIsCheckedChangedObservable.add(function (
      value
    ) {
      teleportSettings.backwardsMovementEnabled = value;
    });

    const backwardsTeleportationDistanceLabel = createGridMenuLabel(
      "Backwards Distance: 1.0"
    );

    const backwardsTeleportationDistanceSlider = createGridMenuSlider({
      min: 0,
      max: 10,
      step: 0.1,
      value: 1,
    });
    backwardsTeleportationDistanceSlider.onValueChangedObservable.add(function (
      value
    ) {
      teleportSettings.backwardsTeleportationDistance = value;
      backwardsTeleportationDistanceLabel.text = `Backwards Distance: ${value}`;
    });

    const resetButton = GUI.Button.CreateSimpleButton(
      "reset-button",
      "Reset Section 1"
    );
    resetButton.width = "100%";
    resetButton.height = "60px";
    resetButton.fontSize = "32px";
    resetButton.color = "white";
    resetButton.background = "#53637b";
    resetButton.paddingRight = "40px";
    resetButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

    resetButton.onPointerUpObservable.add(function () {
      teleportSettings.parabolicCheckRadius = 5;
      teleportSettings.parabolicRayEnabled = true;
      teleportSettings.rotationAngle = 8;
      teleportSettings.rotationEnabled = true;
      teleportSettings.backwardsMovementEnabled = true;
      teleportSettings.backwardsTeleportationDistance = 1;

      parabolicCheckRadiusSlider.value = teleportSettings.parabolicCheckRadius;
      parabolicRayEnabledCheckbox.isChecked =
        teleportSettings.parabolicRayEnabled;
      rotationAngleSlider.value = teleportSettings.rotationAngle;
      rotationEnabledCheckbox.isChecked = teleportSettings.rotationEnabled;
      backwardsMovementEnabledCheckbox.isChecked =
        teleportSettings.backwardsMovementEnabled;
      backwardsTeleportationDistanceSlider.value =
        teleportSettings.backwardsTeleportationDistance;

      // Move the player back to the starting position
      mainCamera.position = new BABYLON.Vector3(0, 1.7, 0);
    });

    const grid = new GUI.Grid();
    grid.addColumnDefinition(40, true);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(40, true);

    // Layout the grid content
    // Add rows to the grid and attach controls to the rows, using the current row count.
    // This makes it easy to reorder these in code without having to reindex the grid content.
    grid.addRowDefinition(36, true); // empty row
    grid
      .addRowDefinition(72, true)
      .addControl(rotationEnabledLabel, grid.rowCount, 1)
      .addControl(rotationEnabledCheckbox, grid.rowCount, 2);
    grid.addRowDefinition(36, true); // empty row
    grid
      .addRowDefinition(72, true)
      .addControl(parabolicCheckRadiusLabel, grid.rowCount, 1)
      .addControl(parabolicCheckRadiusSlider, grid.rowCount, 2);
    grid
      .addRowDefinition(72, true)
      .addControl(parabolicRayEnabledLabel, grid.rowCount, 1)
      .addControl(parabolicRayEnabledCheckbox, grid.rowCount, 2);
    grid.addRowDefinition(36, true); // empty row
    grid
      .addRowDefinition(72, true)
      .addControl(rotationAngleLabel, grid.rowCount, 1)
      .addControl(rotationAngleSlider, grid.rowCount, 2);
    grid.addRowDefinition(36, true); // empty row
    grid
      .addRowDefinition(72, true)
      .addControl(backwardsTeleportationDistanceLabel, grid.rowCount, 1)
      .addControl(backwardsTeleportationDistanceSlider, grid.rowCount, 2);
    grid
      .addRowDefinition(72, true)
      .addControl(backwardsMovementEnabledLabel, grid.rowCount, 1)
      .addControl(backwardsMovementEnabledCheckbox, grid.rowCount, 2);
    grid.addRowDefinition(36, true); // empty row
    grid.addRowDefinition(72, true).addControl(resetButton, grid.rowCount, 2);
    grid.height = "730px";

    return { heading, grid };
  };

  const createSection2 = () => {
    const heading = new GUI.TextBlock("lab-info-heading-2");
    heading.text =
      "These options are only available in the constructor. Reenable the teleportation feature to see them applied. This will replace the existing teleport feature with a new one.";
    heading.height = "120px";
    heading.color = "#b4becc";
    heading.textWrapping = GUI.TextWrapping.WordWrap;
    heading.fontSize = 30;
    heading.fontStyle = "italic";
    heading.paddingLeft = "40px";
    heading.paddingRight = "40px";
    // heading.paddingTop = "20px";
    heading.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    heading.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    const useMainComponentLabel = createGridMenuLabel(
      "Trigger / Timer Teleport"
    );
    const useMainComponentCheckbox = createGridMenuCheckbox();
    useMainComponentCheckbox.isChecked = false;
    useMainComponentCheckbox.onIsCheckedChangedObservable.add(function (value) {
      teleportSetupData.useMainComponent = value;
    });

    const useCustomMeshLabel = createGridMenuLabel("Use Custom Mesh");
    const useCustomMeshCheckbox = createGridMenuCheckbox();
    useCustomMeshCheckbox.isChecked = false;
    useCustomMeshCheckbox.onIsCheckedChangedObservable.add(function (value) {
      teleportSetupData.useCustomMesh = value;
    });

    const useRenderingGroupIdLabel = createGridMenuLabel(
      "Use Rendering Group Id"
    );
    const useRenderingGroupIdCheckbox = createGridMenuCheckbox();
    useRenderingGroupIdCheckbox.isChecked = false;
    useRenderingGroupIdCheckbox.onIsCheckedChangedObservable.add(function (
      value
    ) {
      teleportSetupData.useRenderingGroupId = value;
    });

    const resetButton = GUI.Button.CreateSimpleButton(
      "reset-button",
      "Reset Section 2"
    );
    resetButton.width = "100%";
    resetButton.height = "60px";
    resetButton.fontSize = "32px";
    resetButton.color = "white";
    resetButton.background = "#53637b";
    resetButton.paddingRight = "40px";
    resetButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;

    resetButton.onPointerUpObservable.add(function () {
      teleportSetupData.useMainComponent = false;
      teleportSetupData.useCustomMesh = false;
      teleportSetupData.useRenderingGroupId = false;

      useMainComponentCheckbox.isChecked = teleportSetupData.useMainComponent;
      useCustomMeshCheckbox.isChecked = teleportSetupData.useCustomMesh;
      useRenderingGroupIdCheckbox.isChecked =
        teleportSetupData.useRenderingGroupId;
    });

    const grid = new GUI.Grid();
    grid.addColumnDefinition(40, true);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(40, true);

    // Layout the grid content
    // Add rows to the grid and attach controls to the rows, using the current row count.
    // This makes it easy to reorder these in code without having to reindex the grid content.
    grid.addRowDefinition(36, true); // empty row
    grid
      .addRowDefinition(72, true)
      .addControl(useRenderingGroupIdLabel, grid.rowCount, 1)
      .addControl(useRenderingGroupIdCheckbox, grid.rowCount, 2);
    grid
      .addRowDefinition(72, true)
      .addControl(useCustomMeshLabel, grid.rowCount, 1)
      .addControl(useCustomMeshCheckbox, grid.rowCount, 2);
    grid
      .addRowDefinition(72, true)
      .addControl(useMainComponentLabel, grid.rowCount, 1)
      .addControl(useMainComponentCheckbox, grid.rowCount, 2);

    grid.addRowDefinition(36, true); // empty row
    grid.addRowDefinition(72, true).addControl(resetButton, grid.rowCount, 2);

    grid.height = "400px";

    return { heading, grid };
  };

  const { heading: heading1, grid: grid1 } = createSection1();
  const { heading: heading2, grid: grid2 } = createSection2();

  stackPanel.addControl(heading1);
  stackPanel.addControl(grid1);
  stackPanel.addControl(heading2);
  stackPanel.addControl(grid2);

  sv.addControl(stackPanel);

  watch(menuIsVisible, (newValue) => {
    card.isVisible = newValue;
    plane.isVisible = newValue;
  });

  return { toggleMenu };
};

const addLabPlayerLocal = async (scene, toggleMenu, teleportMeshes) => {
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: teleportMeshes,
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

  featuresManager = xr.baseExperience.featuresManager;

  const createTeleportationSetup = (options) => {
    const cylinder = BABYLON.MeshBuilder.CreateCylinder(
      "cylinder",
      { height: 0.05, diameter: 1 },
      scene
    );
    cylinder.position.y = 0.25;
    const cylinderMaterial = new BABYLON.StandardMaterial(
      "cylinder-mat",
      scene
    );
    cylinderMaterial.diffuseColor = LabColors["purple"];
    cylinderMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    cylinder.material = cylinderMaterial;
    cylinder.isVisible = false;
    const { useMainComponent, useRenderingGroupId, useCustomMesh } = options;
    let setup = {
      xrInput: xr.input,
      floorMeshes: teleportMeshes,
    };
    if (useCustomMesh) {
      cylinder.isVisible = true;
      setup["teleportationTargetMesh"] = cylinder;
    } else {
      cylinder.isVisible = false;
      setup["defaultTargetMeshOptions"] = {
        teleportationFillColor: "#3e4a5d",
        teleportationBorderColor: "#8854d0",
        torusArrowMaterial: teleportRingMat,
      };
    }
    if (useRenderingGroupId) {
      cylinder.renderingGroupId = 1;
      setup["renderingGroupId"] = 1;
    } else {
      cylinder.renderingGroupId = 0;
    }
    if (useMainComponent) {
      setup["useMainComponentOnly"] = true;
      // setup["timeToTeleport"] = 1.5;
    }
    return setup;
  };
  const teleportation = featuresManager.enableFeature(
    BABYLON.WebXRFeatureName.TELEPORTATION,
    "stable",
    createTeleportationSetup({
      useMainComponent: false,
      useRenderingGroupId: false,
      useCustomMesh: false,
    })
  );

  teleportControlManager = teleportation;

  // teleportation.backwardsMovementEnabled = false;
  // teleportation.backwardsTeleportationDistance = 2;

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

  return { createTeleportationSetup };
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
