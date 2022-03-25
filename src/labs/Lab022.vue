<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

import tdprojects from "../data/td-projects.json";
import tdcolors from "../data/td-colors.json";
import { createProjectCard } from "../composables/TDProjectCard";

labNotes.value = `
3D Cards pop out from 2D GUI
The idea for this lab is to create a 2D list of all projects, then use it to populate a 3D scene with cards.
- Project List: scroll view with a dynamic grid of cards
- Project Color, Name, and Button
- The button will spawn a card in the scene for the selected project
- The 3D cards are a direct copy of Lab 021. I'll refactor this into use a reusable card object at some point.
`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  console.log("sample data:", tdprojects, tdcolors);
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 1, -2);

  addLabLights(scene);
  const ground = addLabRoom(scene);

  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    width: 1,
    height: 1,
    depth: 0.2,
  });
  card.position = new BABYLON.Vector3(0, 1, 0);

  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["light1"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane(
    "detail-plane",
    {
      width: 1,
      height: 1,
    },
    scene
  );
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(
    plane,
    1 * 1024,
    1 * 1024
  );
  advancedTexture.name = "title-card-texture";

  var sv = new GUI.ScrollViewer("logger-scroll");
  sv.thickness = 12;
  sv.color = "#a5b1c2";
  sv.background = "#a5b1c2";
  sv.opacity = 1;
  sv.width = "100%";
  sv.height = "100%";
  sv.barSize = 36;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

  advancedTexture.addControl(sv);

  const gridHeight = tdprojects.length * 100;
  console.log("gridHeight:", gridHeight);

  var grid = new GUI.Grid();
  grid.height = `${gridHeight}px`;
  grid.addColumnDefinition(100, true);
  grid.addColumnDefinition(724, true);
  grid.addColumnDefinition(100, true);

  for (let index in tdprojects) {
    addGridRow(grid, index);
  }

  sv.addControl(grid);

  //   createProjectCard(tdprojects[0]).position = new BABYLON.Vector3(-2, 1, 1);

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  console.log(xr);

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

const addGridRow = (grid, projectIndex) => {
  grid.addRowDefinition(100, true);

  const project = tdprojects[projectIndex];
  const colorDot = new GUI.Ellipse();
  colorDot.background = tdcolors[project.color];
  colorDot.width = "60px";
  colorDot.height = "60px";
  colorDot.thickness = 0;
  grid.addControl(colorDot, projectIndex, 0);

  const projectName = new GUI.TextBlock();
  projectName.color = "#2a323e";
  projectName.height = "100px";
  projectName.text = project.name;
  projectName.fontSize = "60px";
  projectName.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

  grid.addControl(projectName, projectIndex, 1);

  const button = new GUI.Button();
  button.background = "#2d98da";
  button.height = "60px";
  button.width = "60px";
  button.thickness = 0;
  button.onPointerClickObservable.add(() => {
    console.log("create project card for project index", projectIndex);
    createProjectCard(tdprojects[projectIndex], scene).position =
      new BABYLON.Vector3(0, 1, -0.3);
  });
  grid.addControl(button, projectIndex, 2);
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
