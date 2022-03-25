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
import { useStorage } from "@vueuse/core";
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
User Locomotion Settings
- Based on the work in Labs 024 and 025
- Select the locomotion type: teleport or movement modules

`;
const bjsCanvas = ref(null);

let engine;
let scene;
// TODO: Set this with the default camera, then replace it with the VR camera. Set it back when exiting VR
let mainCamera; // a refecence to the XR camera, will be set after entering VR
let menuIsVisible = ref(true);

// Default settings for the movement controls
const defaultMovementSettings = {
  locomotionType: "teleport", // "teleport" or "movement"
  // Movement settings
  movementEnabled: true,
  movementSpeed: 0.5, // 1 is too fast most of the time
  rotationEnabled: true,
  rotationSpeed: 0.25,
  // Teleport settings
  parabolicCheckRadius: 5,
  rotationAngle: 0.25, // teleport rotation angle, not movement controls
  backwardsTeleportationDistance: 0.7,
};

// Spread the default settings into the stored settings
// This will only be set if the local storage value is not found, else it will use the local storage value
let storedMovementSettings = useStorage("lab-locomotion-config", {
  ...defaultMovementSettings,
});

// Map the stored settings to the reactive settings object
// I could not find a way to get Watch working with useStorage
let movementSettings = reactive({
  locomotionType: storedMovementSettings.value.locomotionType,
  movementEnabled: storedMovementSettings.value.movementEnabled,
  movementSpeed: storedMovementSettings.value.movementSpeed,

  rotationEnabled: storedMovementSettings.value.rotationEnabled,
  rotationSpeed: storedMovementSettings.value.rotationSpeed,

  parabolicCheckRadius: storedMovementSettings.value.parabolicCheckRadius,
  rotationAngle: storedMovementSettings.value.rotationAngle,
  backwardsTeleportationDistance:
    storedMovementSettings.value.backwardsTeleportationDistance,
});

console.log("movementSettings", movementSettings);

let mainFeatureManager; // a reference to the feature manager, will be set after entering VR
let movementControlManager; // a reference to the movement controls
let teleportControlManager; // a reference to the teleport object

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);
  addLabLights(scene);
  const teleportMeshes = addLabRoomLocal(scene);

  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["purple"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject1 = BABYLON.MeshBuilder.CreateSphere("subject1", {
    radius: 1,
  });
  subject1.material = subjectMat1;
  subject1.position = new BABYLON.Vector3(-5, 1.5, 0);

  const sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
  sixDofDragBehavior.allowMultiPointers = true;
  subject1.addBehavior(sixDofDragBehavior);

  const platform = BABYLON.MeshBuilder.CreateBox("subject1", {
    width: 20,
    height: 0.2,
    depth: 200,
  });
  platform.material = subjectMat1;
  platform.position = new BABYLON.Vector3(60, 10, 0);
  platform.checkCollisions = true;

  const { toggleMenu } = createUICard();

  const { useMovementControls, useTeleportControls } = await addLabPlayerLocal(
    scene,
    toggleMenu,
    teleportMeshes
  );

  watch(movementSettings, (newValue) => {
    // TODO: Check the locomoation type enable the corrent feature set
    if (newValue.locomotionType === "teleport") {
      useTeleportControls(mainFeatureManager);
    } else {
      useMovementControls(mainFeatureManager);
    }

    if (movementControlManager) {
      movementControlManager.movementEnabled = newValue.movementEnabled;
      movementControlManager.movementSpeed = newValue.movementSpeed;
      movementControlManager.rotationEnabled = newValue.rotationEnabled;
      movementControlManager.rotationSpeed = newValue.rotationSpeed;
    }
    if (teleportControlManager) {
      teleportControlManager.parabolicCheckRadius =
        newValue.parabolicCheckRadius;
      teleportControlManager.rotationAngle = newValue.rotationAngle;
      teleportControlManager.backwardsTeleportationDistance =
        newValue.backwardsTeleportationDistance;
    }
    storedMovementSettings.value = newValue;
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

onUnmounted(() => {
  engine.dispose();
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

  const teleportButton = GUI.Button.CreateSimpleButton(
    "teleport-button",
    "TELEPORT MODE"
  );
  teleportButton.width = 1;
  teleportButton.height = "60px";
  teleportButton.fontSize = "32px";
  teleportButton.fontStyle =
    movementSettings.locomotionType === "teleport" ? "bold" : "normal";
  teleportButton.color = "white";
  teleportButton.background =
    movementSettings.locomotionType === "teleport" ? "#8854d0" : "#53637b";
  teleportButton.onPointerUpObservable.add(function () {
    movementSettings.locomotionType = "teleport";
    teleportButton.background =
      movementSettings.locomotionType === "teleport" ? "#8854d0" : "#53637b";
    teleportButton.fontStyle =
      movementSettings.locomotionType === "teleport" ? "bold" : "normal";
    movementButton.background =
      movementSettings.locomotionType === "movement" ? "#8854d0" : "#53637b";
  });

  const movementButton = GUI.Button.CreateSimpleButton(
    "movement-button",
    "MOVEMENT MODE"
  );
  movementButton.width = 1;
  movementButton.height = "60px";
  movementButton.fontSize = "32px";
  movementButton.fontStyle =
    movementSettings.locomotionType === "movement" ? "bold" : "normal";
  movementButton.color = "white";
  movementButton.background =
    movementSettings.locomotionType === "movement" ? "#8854d0" : "#53637b";
  movementButton.onPointerUpObservable.add(function () {
    movementSettings.locomotionType = "movement";
    teleportButton.background =
      movementSettings.locomotionType === "teleport" ? "#8854d0" : "#53637b";
    teleportButton.fontStyle =
      movementSettings.locomotionType === "teleport" ? "bold" : "normal";
    movementButton.background =
      movementSettings.locomotionType === "movement" ? "#8854d0" : "#53637b";
    movementButton.fontStyle =
      movementSettings.locomotionType === "movement" ? "bold" : "normal";
  });

  const movementSettingslabel = createGridMenuLabel("MOVEMENT SETTINGS");
  movementSettingslabel.fontSize = "30px";
  movementSettingslabel.fontStyle = "bold";
  movementSettingslabel.color = "#a5b1c2";

  const movementSpeedLabel = createGridMenuLabel(
    `Movement Speed: ${movementSettings.movementSpeed.toFixed(2)}`
  );
  const movementSpeedSlider = createGridMenuSlider({
    min: 0.1,
    max: 2,
    step: 0.01,
    value: 0.5,
  });
  movementSpeedSlider.value = movementSettings.movementSpeed;
  movementSpeedSlider.onValueChangedObservable.add(function (value) {
    movementSettings.movementSpeed = value;
    movementSpeedLabel.text = `Movement Speed: ${value.toFixed(2)}`;
  });

  const movementEnabledLabel = createGridMenuLabel("Movement Enabled");
  const movementEnabledCheckbox = createGridMenuCheckbox();
  movementEnabledCheckbox.isChecked = movementSettings.movementEnabled;
  movementEnabledCheckbox.onIsCheckedChangedObservable.add(function (value) {
    movementSettings.movementEnabled = value;
  });

  const rotationSpeedLabel = createGridMenuLabel(
    `Rotation Speed: ${movementSettings.rotationSpeed.toFixed(2)}`
  );
  const rotationSpeedSlider = createGridMenuSlider({
    min: 0.1,
    max: 2,
    step: 0.01,
    value: 0.25,
  });
  rotationSpeedSlider.value = movementSettings.rotationSpeed;
  rotationSpeedSlider.onValueChangedObservable.add(function (value) {
    movementSettings.rotationSpeed = value;
    rotationSpeedLabel.text = `Rotation Speed: ${value.toFixed(2)}`;
  });

  const rotationEnabledLabel = createGridMenuLabel("Rotation Enabled");
  const rotationEnabledCheckbox = createGridMenuCheckbox();
  rotationEnabledCheckbox.isChecked = movementSettings.rotationEnabled;
  rotationEnabledCheckbox.onIsCheckedChangedObservable.add(function (value) {
    movementSettings.rotationEnabled = value;
  });

  const teleportSettingslabel = createGridMenuLabel("TELEPORT SETTINGS");
  teleportSettingslabel.fontSize = "30px";
  teleportSettingslabel.fontStyle = "bold";
  teleportSettingslabel.color = "#a5b1c2";

  const parabolicCheckRadiusLabel = createGridMenuLabel("Parabolic Radius: 5");

  const parabolicCheckRadiusSlider = createGridMenuSlider({
    min: 1,
    max: 20,
    step: 1,
    value: 5,
  });
  parabolicCheckRadiusSlider.onValueChangedObservable.add(function (value) {
    movementSettings.parabolicCheckRadius = value;
    parabolicCheckRadiusLabel.text = `Parabolic Radius: ${value}`;
  });

  const rotationAngleLabel = createGridMenuLabel("Snap Turn Angle (Pi / 8)");

  const rotationAngleSlider = createGridMenuSlider({
    min: 2,
    max: 12,
    step: 1,
    value: 8,
  });
  rotationAngleSlider.onValueChangedObservable.add(function (value) {
    movementSettings.rotationAngle = value;
    rotationAngleLabel.text = `Snap Turn Angle (Pi / ${value})`;
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
    movementSettings.backwardsTeleportationDistance = value;
    backwardsTeleportationDistanceLabel.text = `Backwards Distance: ${value}`;
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
    movementSettings.movementEnabled = true;
    movementSettings.rotationSpeed = 0.25;
    movementSettings.rotationEnabled = true;
    movementSettings.parabolicCheckRadius = 5;
    movementSettings.rotationAngle = 8;
    movementSettings.backwardsTeleportationDistance = 1;

    movementSpeedSlider.value = movementSettings.movementSpeed;
    movementEnabledCheckbox.isChecked = movementSettings.movementEnabled;
    rotationSpeedSlider.value = movementSettings.rotationSpeed;
    rotationEnabledCheckbox.isChecked = movementSettings.rotationEnabled;
    parabolicCheckRadiusSlider.value = movementSettings.parabolicCheckRadius;
    rotationAngleSlider.value = movementSettings.rotationAngle;
    backwardsTeleportationDistanceSlider.value =
      movementSettings.backwardsTeleportationDistance;

    // Move the player back to the starting position
    mainCamera.position = new BABYLON.Vector3(0, 3, 0);
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
    .addControl(teleportButton, grid.rowCount, 1)
    .addControl(movementButton, grid.rowCount, 2);
  grid.addRowDefinition(18, true); // empty row

  // Layout the Teleport Controls
  grid
    .addRowDefinition(72, true)
    .addControl(teleportSettingslabel, grid.rowCount, 1);
  grid
    .addRowDefinition(72, true)
    .addControl(parabolicCheckRadiusLabel, grid.rowCount, 1)
    .addControl(parabolicCheckRadiusSlider, grid.rowCount, 2);

  grid
    .addRowDefinition(72, true)
    .addControl(rotationAngleLabel, grid.rowCount, 1)
    .addControl(rotationAngleSlider, grid.rowCount, 2);

  grid
    .addRowDefinition(72, true)
    .addControl(backwardsTeleportationDistanceLabel, grid.rowCount, 1)
    .addControl(backwardsTeleportationDistanceSlider, grid.rowCount, 2);
  grid.addRowDefinition(18, true); // empty row

  // Layout the Movmement Controls
  grid
    .addRowDefinition(72, true)
    .addControl(movementSettingslabel, grid.rowCount, 1);
  grid
    .addRowDefinition(72, true)
    .addControl(movementSpeedLabel, grid.rowCount, 1)
    .addControl(movementSpeedSlider, grid.rowCount, 2);
  grid
    .addRowDefinition(72, true)
    .addControl(movementEnabledLabel, grid.rowCount, 1)
    .addControl(movementEnabledCheckbox, grid.rowCount, 2);
  grid
    .addRowDefinition(72, true)
    .addControl(rotationSpeedLabel, grid.rowCount, 1)
    .addControl(rotationSpeedSlider, grid.rowCount, 2);
  grid
    .addRowDefinition(72, true)
    .addControl(rotationEnabledLabel, grid.rowCount, 1)
    .addControl(rotationEnabledCheckbox, grid.rowCount, 2);
  grid.addRowDefinition(36, true); // empty row
  grid.addRowDefinition(72, true).addControl(resetButton, grid.rowCount, 2);

  sv.addControl(grid);

  watch(menuIsVisible, (newValue) => {
    card.isVisible = newValue;
    plane.isVisible = newValue;
  });

  return { toggleMenu };
};

const setupCameraForCollisions = (camera) => {
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new BABYLON.Vector3(0.7, 1, 0.7);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 0.5, 0);
};

const addLabPlayerLocal = async (scene, toggleMenu, teleportMeshes) => {
  // Create the default experience
  let xr = await scene.createDefaultXRExperienceAsync({
    disableTeleportation: true,
    pointerSelectionOptions: {
      enablePointerSelectionOnAllControllers: true,
    },
  });

  xr.baseExperience.onInitialXRPoseSetObservable.add((xrCamera) => {
    mainCamera = xrCamera;
    xrCamera.position.z = -2;
  });

  const useMovementControls = (featureManager) => {
    // Turn off the other feature
    featureManager.disableFeature(BABYLON.WebXRFeatureName.TELEPORTATION);
    // Configure and enable the movement controls
    const swappedHandednessConfiguration = [
      {
        allowedComponentTypes: [
          BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
          BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
        ],
        forceHandedness: "right",
        axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
          console.log(xrInput);
          movementState.rotateX =
            Math.abs(axes.x) > featureContext.rotationThreshold ? axes.x : 0;
          movementState.rotateY =
            Math.abs(axes.y) > featureContext.rotationThreshold ? axes.y : 0;
        },
      },
      {
        allowedComponentTypes: [
          BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE,
          BABYLON.WebXRControllerComponent.TOUCHPAD_TYPE,
        ],
        forceHandedness: "left",
        axisChangedHandler: (axes, movementState, featureContext, xrInput) => {
          console.log(xrInput);
          movementState.moveX =
            Math.abs(axes.x) > featureContext.movementThreshold ? axes.x : 0;
          movementState.moveY =
            Math.abs(axes.y) > featureContext.movementThreshold ? axes.y : 0;
        },
      },
    ];

    setupCameraForCollisions(xr.input.xrCamera);

    movementControlManager = featureManager.enableFeature(
      BABYLON.WebXRFeatureName.MOVEMENT,
      "latest",
      {
        xrInput: xr.input,
        customRegistrationConfigurations: swappedHandednessConfiguration,
        movementEnabled: movementSettings.movementEnabled,
        movementSpeed: movementSettings.movementSpeed,
        rotationEnabled: movementSettings.rotationEnabled,
        rotationSpeed: movementSettings.rotationSpeed,
      }
    );
  };

  const useTeleportControls = (featureManager) => {
    // Turn off the other feature
    featureManager.disableFeature(BABYLON.WebXRFeatureName.MOVEMENT);
    // Configure and enable the teleportation feature
    const createTeleportationSetup = () => {
      let setup = {
        xrInput: xr.input,
        floorMeshes: teleportMeshes,
      };

      return setup;
    };

    teleportControlManager = featureManager.enableFeature(
      BABYLON.WebXRFeatureName.TELEPORTATION,
      "stable",
      createTeleportationSetup({})
    );
    teleportControlManager.parabolicCheckRadius =
      movementSettings.parabolicCheckRadius;
    teleportControlManager.rotationAngle = movementSettings.rotationAngle;
    teleportControlManager.backwardsTeleportationDistance =
      movementSettings.backwardsTeleportationDistance;
  };

  mainFeatureManager = xr.baseExperience.featuresManager;
  if (movementSettings.locomotionType === "movement") {
    useMovementControls(mainFeatureManager);
  } else {
    useTeleportControls(mainFeatureManager);
  }

  //controller input
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      if (motionController.handness === "left") {
        const xr_ids = motionController.getComponentIds();
        let triggerComponent = motionController.getComponent(xr_ids[0]); //xr-standard-trigger
        triggerComponent?.onButtonStateChangedObservable.add(() => {
          if (triggerComponent.pressed) {
            console.log("Left Trigger Pressed");
            movementControlManager.movementSpeed =
              movementSettings.movementSpeed * 3;
          } else {
            console.log("Left Trigger Released");
            movementControlManager.movementSpeed =
              movementSettings.movementSpeed;
          }
        });
        let squeezeComponent = motionController.getComponent(xr_ids[1]); //xr-standard-squeeze
        squeezeComponent?.onButtonStateChangedObservable.add(() => {
          console.log("Left Grip Pressed");
        });

        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-button
        xButtonComponent?.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
          }
        });
        let yButtonComponent = motionController.getComponent(xr_ids[4]); //y-button
        yButtonComponent?.onButtonStateChangedObservable.add(() => {
          console.log("Y Button Pressed");
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
            if (movementSettings.movementSpeed == 1) {
              movementSettings.movementSpeed = 0.1;
            } else {
              movementSettings.movementSpeed = 1;
            }
            console.log(
              "Subject 1: ExecuteCodeAction -> OnPickTrigger",
              movementControlManager.movementSpeed,
              movementSettings.movementSpeed
            );
          }
        });
      }
    });
  });
  return { useMovementControls, useTeleportControls };
};

const addLabRoomLocal = (scene) => {
  // Add a ground plane to the scene. Used for WebXR teleportation
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 200, width: 100, subdivisions: 4 },
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
    { height: 10, width: 200, subdivisions: 4 },
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
  // const wall3 = wall1.clone("wall3");
  wall3.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall3.position = new BABYLON.Vector3(0, 5, -100);

  const wall4 = wall3.clone("wall4");
  wall4.rotation.z = -Math.PI / 2;
  wall4.position = new BABYLON.Vector3(0, 5, 100);

  const subjectMat2 = new BABYLON.StandardMaterial("grab-mat2", scene);
  subjectMat2.diffuseColor = LabColors["blue"];
  subjectMat2.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject2 = BABYLON.MeshBuilder.CreateBox("subject2", {
    height: 8,
    width: 16,
    depth: 0.2,
  });
  subject2.material = subjectMat2;
  subject2.position = new BABYLON.Vector3(0, 4, 100);

  const subjectMat3 = new BABYLON.StandardMaterial("grab-mat3", scene);
  subjectMat3.diffuseColor = LabColors["green"];
  subjectMat3.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const subject3 = BABYLON.MeshBuilder.CreateBox("subject3", {
    height: 8,
    width: 16,
    depth: 0.2,
  });
  subject3.material = subjectMat3;
  subject3.position = new BABYLON.Vector3(0, 4, -100);

  return [ground];
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
