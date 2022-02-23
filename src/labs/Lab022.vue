<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
ToDoist Project List (2D)
The idea for this lab is to create a 2D list of all projects, then use it to populate a 3D scene with cards.
- Project List: scroll view with a dynamic grid of cards
- Project Color, Name, and Button
- The button will spawn a card in the scene for the selected project
- The 3D cards are a direct copy of Lab 021. I'll refactor this into use a reusable card object at some point.
`;

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

import tdprojects from "../data/td-projects.json";
import tdcolors from "../data/td-colors.json";
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
  window.addEventListener("resize", function () {
    engine.resize();
  });
};

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
    createProjectCard(tdprojects[projectIndex]).position = new BABYLON.Vector3(
      0,
      1,
      -0.3
    );
  });
  grid.addControl(button, projectIndex, 2);
};

// const parseProjects = (projects) => {
//   let project;
//   let startY = 2;
//   for (project of projects) {
//     const newProject = createProjectCard(project);
//     newProject.position = new BABYLON.Vector3(0, startY, 1);
//     startY -= 0.3;
//   }
// };
const createProjectCard = (project) => {
  const { id, name, color } = project;
  const cardWidth = 2;
  const cardHeight = 0.5;

  // Card
  const projectCard = new BABYLON.MeshBuilder.CreateBox(`project-card-${id}`, {
    width: cardWidth,
    height: cardHeight,
    depth: 0.1,
  });
  projectCard.position = new BABYLON.Vector3(0, 1, 0);

  const projectCardMaterial = new BABYLON.StandardMaterial(
    "projectCardMaterial",
    scene
  );
  projectCardMaterial.diffuseColor = new BABYLON.Color3.FromHexString(
    "#a5b1c2"
  );
  projectCardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectCard.material = projectCardMaterial;

  // Card Content - Color Sphere
  const projectSphere = BABYLON.MeshBuilder.CreateSphere(
    `project-sphere-${id}`,
    {
      diameter: 0.4,
    }
  );
  const projectSphereMaterial = new BABYLON.StandardMaterial(
    `project-sphere-mat-${id}`,
    scene
  );
  projectSphereMaterial.diffuseColor = new BABYLON.Color3.FromHexString(
    tdcolors[color]
  );
  projectSphereMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectSphere.material = projectSphereMaterial;
  projectSphere.parent = projectCard;
  projectSphere.position = new BABYLON.Vector3(-0.75, 0, -0.056);
  projectSphere.scaling = new BABYLON.Vector3(0.8, 0.8, 0.5);

  // Card Content - Dynamic Texture
  const plane = BABYLON.MeshBuilder.CreatePlane(
    `plane-${id}`,
    { width: cardWidth, height: cardHeight },
    scene
  );
  plane.parent = projectCard;
  plane.position = new BABYLON.Vector3(0, 0, -0.056);
  //Set width and height for dynamic texture using same multiplier
  const dtResolution = 512;
  const dtWidth = cardWidth * dtResolution;
  const dtHeight = cardHeight * dtResolution;

  //Set text

  //Create dynamic texture
  var dynamicTexture = new BABYLON.DynamicTexture(
    `project-dt-${id}`,
    { width: dtWidth, height: dtHeight },
    scene
  );

  //set font to be actually used to write text on dynamic texture
  var font = "72px Tahoma";

  //Draw text
  dynamicTexture.drawText(name, 256, null, font, "#2a323e", "#d3d9e1", true);

  //create material
  var mat = new BABYLON.StandardMaterial("mat", scene);
  mat.diffuseTexture = dynamicTexture;

  //apply material
  plane.material = mat;

  projectCard.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
  projectCard.addBehavior(new BABYLON.SixDofDragBehavior());
  return projectCard;
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
