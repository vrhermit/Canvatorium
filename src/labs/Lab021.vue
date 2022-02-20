<script setup>
import { labNotes } from "../composables/LabData";
labNotes.value = `
ToDoist Project Object
- Use sample data to build 3D objects that represent tasks Project from ToDoist
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

  const projects = tdprojects;
  let project;
  let startY = 2;
  for (project of projects) {
    const newProject = createProjectCard(project);
    newProject.position = new BABYLON.Vector3(0, startY, 0);
    startY -= 0.3;
  }

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
  projectSphere.scaling = new BABYLON.Vector3(1, 1, 0.5);

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

  projectCard.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
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
