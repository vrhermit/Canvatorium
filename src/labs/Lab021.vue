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
  console.log(ground);

  const sampleProject = {
    projectName: "Project 1",
    projectColor: "#b8256f",
  };
  createProjectCard(sampleProject);

  const sampleProject2 = {
    projectName: "Project 2",
    projectColor: "#b8256f",
  };
  createProjectCard(sampleProject2).position = new BABYLON.Vector3(0, 0.7, 0);

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
  const { projectName, projectColor } = project;
  const projectCard = new BABYLON.MeshBuilder.CreateBox("projectCard", {
    height: 0.5,
    width: 2,
    depth: 0.2,
  });
  projectCard.position = new BABYLON.Vector3(0, 1, 0);

  const projectCardMaterial = new BABYLON.StandardMaterial(
    "projectCardMaterial",
    scene
  );
  projectCardMaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
  projectCardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectCard.material = projectCardMaterial;

  const projectSphere = BABYLON.MeshBuilder.CreateSphere("projectSphere", {
    diameter: 0.4,
  });
  const projectSphereMaterial = new BABYLON.StandardMaterial(
    "projectSphereMaterial",
    scene
  );
  projectSphereMaterial.diffuseColor = new BABYLON.Color3.FromHexString(
    projectColor
  );
  projectSphereMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectSphere.material = projectSphereMaterial;
  projectSphere.parent = projectCard;
  projectSphere.position = new BABYLON.Vector3(-0.75, 0, -0.1);
  projectSphere.scaling = new BABYLON.Vector3(1, 1, 0.5);

  //Set width an height for plane
  var planeWidth = 2;
  var planeHeight = 0.5;

  //Create plane
  var plane = BABYLON.MeshBuilder.CreatePlane(
    "plane",
    { width: planeWidth, height: planeHeight },
    scene
  );
  plane.parent = projectCard;
  plane.position = new BABYLON.Vector3(0, 0, -0.11);
  //Set width and height for dynamic texture using same multiplier
  const resolution = 512;
  const DTWidth = planeWidth * resolution;
  const DTHeight = planeHeight * resolution;

  //Set text

  //Create dynamic texture
  var dynamicTexture = new BABYLON.DynamicTexture(
    "DynamicTexture",
    { width: DTWidth, height: DTHeight },
    scene
  );

  //set font to be actually used to write text on dynamic texture
  var font = "72px Tahoma";

  //Draw text
  dynamicTexture.drawText(
    projectName,
    256,
    null,
    font,
    "#000000",
    "#ffffff",
    true
  );

  //create material
  var mat = new BABYLON.StandardMaterial("mat", scene);
  mat.diffuseTexture = dynamicTexture;

  //apply material
  plane.material = mat;

  projectCard.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
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
