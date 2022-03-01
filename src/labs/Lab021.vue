<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
ToDoist Project Object
The idea behind this lab is to create a reusable todoist project object for a project-picker scene. I could use Advanced Dynamic Texture for the GUI on these cards, but those are pretty heave objects and I can only add around 12 of them to a scene at any given time before running into performance issues.
- Use sample data to build 3D objects that represent tasks Project from ToDoist
- Create a project card with view-only UI based on Dynamic Texture instead of Advanced Dynamic Texture
- Loop over sample data and make a card for each one. Layout is static, but cards are grabbable.

Follow up:
I've tested this scene with 20-60 cards. ~40 seems to be the max I can handle without impacting performance.
`;

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";

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

  parseProjects(tdprojects);

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

const parseProjects = (projects) => {
  let project;
  let startY = 2;
  for (project of projects) {
    const newProject = createProjectCard(project);
    newProject.position = new BABYLON.Vector3(0, startY, 0);
    startY -= 0.2;
  }
};
const createProjectCard = (project) => {
  const { id, name, color } = project;
  const cardWidth = 2;
  const cardHeight = 0.4;

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

  // Card Content - Color Dot
  const projectDot = BABYLON.MeshBuilder.CreateCylinder(
    `project-sphere-${id}`,
    {
      diameter: 0.25,
      height: 0.05,
    }
  );
  const projectDotMaterial = new BABYLON.StandardMaterial(
    `project-sphere-mat-${id}`,
    scene
  );
  projectDotMaterial.diffuseColor = new BABYLON.Color3.FromHexString(
    tdcolors[color]
  );
  projectDotMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectDot.material = projectDotMaterial;
  projectDot.parent = projectCard;
  projectDot.position = new BABYLON.Vector3(-0.8, 0, -0.056);
  projectDot.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  projectDot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

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
  dynamicTexture.drawText(name, 196, null, font, "#2a323e", "#d3d9e1", true);

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
