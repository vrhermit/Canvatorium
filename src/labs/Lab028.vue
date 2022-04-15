<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import * as MAT from "babylonjs-materials";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
// import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";
// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Columns

`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  //   scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  //   // scene.fogDensity = 0.01;
  //   scene.fogStart = 5.0;
  //   scene.fogEnd = 45.0;

  //   const ambientLight1 = new BABYLON.HemisphericLight(
  //     "light-01",
  //     new BABYLON.Vector3(5, 5, 5),
  //     scene
  //   );
  //   ambientLight1.intensity = 0.8;
  //   const ambientLight2 = new BABYLON.HemisphericLight(
  //     "light-02",
  //     new BABYLON.Vector3(-5, 5, -5),
  //     scene
  //   );
  //   ambientLight2.intensity = 0.8;
  //   var light = new BABYLON.DirectionalLight(
  //     "light",
  //     new BABYLON.Vector3(-1, -1, -1),
  //     scene
  //   );

  //   scene.clearColor = LabColors["light1"];

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  //   const ground = addLabRoom(scene);
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { height: 500, width: 500, subdivisions: 10 },
    scene
  );
  ground.isVisible = false;
  ground.receiveShadows = true;
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

  const railMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  railMat.diffuseColor = LabColors["dark2"];
  railMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const railText = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  railText.uScale = 10;
  railText.vScale = 5;

  railMat.diffuseTexture = railText;

  const rail = BABYLON.MeshBuilder.CreateBox(
    "rail",
    { height: 0.4, width: 95, depth: 8 },
    scene
  );
  rail.material = railMat;
  rail.position = new BABYLON.Vector3(0, 5.6, 3);

  const rail2 = BABYLON.MeshBuilder.CreateBox(
    "rail2",
    { height: 0.1, width: 95, depth: 8 },
    scene
  );
  rail2.material = railMat;
  rail2.position = new BABYLON.Vector3(0, 0, 3);

  //   var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
  //   shadowGenerator.usePoissonSampling = true;
  //   shadowGenerator.useExponentialShadowMap = true;

  const column = createColumn1();
  column.position = new BABYLON.Vector3(-45, 0, 0);
  const colum2 = createColumn1();
  colum2.position = new BABYLON.Vector3(-45, 0, 6);
  //   shadowGenerator.addShadowCaster(column);

  columnFactory(column);
  columnFactory(colum2);

  //   const numberOfColumns = 18;
  //   var x = column.position.x;
  //   var i = 0;
  //   do {
  //     i++;
  //     x += 5;
  //     console.log(x);
  //     const newCol = column.clone("column");
  //     newCol.position = new BABYLON.Vector3(
  //       x,
  //       column.position.y,
  //       column.position.z
  //     );

  //     newCol.enableEdgesRendering();
  //     // newCol.getChildMeshes()[0].enableEdgesRendering();
  //     // newCol.getChildMeshes()[1].enableEdgesRendering();
  //     // shadowGenerator.addShadowCaster(newCol);
  //   } while (i < numberOfColumns);

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
onMounted(() => {
  if (bjsCanvas.value) {
    createScene(bjsCanvas.value);
  }
});

onUnmounted(() => {
  engine.dispose();
});

const createColumn1 = () => {
  const colMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  colMat.diffuseColor = LabColors["light3"];
  colMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const colTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);
  colTex.vScale = 4;
  colTex.uScale = 4;
  colMat.diffuseTexture = colTex;

  //   const maseMat = new BABYLON.StandardMaterial("menu-card-material", scene);
  //   maseMat.diffuseColor = LabColors["light3"];
  //   maseMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  //   const baseTex = new BABYLON.Texture("../assets/stoa-noise-01.jpg", scene);

  //   maseMat.diffuseTexture = baseTex;

  //   const base = BABYLON.MeshBuilder.CreateBox("menu-card", {
  //     width: 1.04,
  //     height: 0.2,
  //     depth: 1.04,
  //   });
  //   base.material = maseMat;
  //   base.position = new BABYLON.Vector3(0, 0.1, 0);

  //   const cap = BABYLON.MeshBuilder.CreateBox("menu-card", {
  //     width: 1.04,
  //     height: 0.2,
  //     depth: 1.04,
  //   });
  //   cap.material = maseMat;
  //   cap.position = new BABYLON.Vector3(0, 5.34, 0);

  const profile = [
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.4, 5, 0),
    new BABYLON.Vector3(0.42, 5.05, 0),
    new BABYLON.Vector3(0.44, 5.1, 0),
    new BABYLON.Vector3(0.44, 5.2, 0),
    new BABYLON.Vector3(0.5, 5.3, 0),
    new BABYLON.Vector3(0.5, 5.4, 0),
    // new BABYLON.Vector3(0.44, 5.2, 0),
    new BABYLON.Vector3(0, 5.4, 0),
  ];

  const column = BABYLON.MeshBuilder.CreateLathe("stand", {
    tessellation: 18,
    shape: profile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });

  column.material = colMat;
  column.convertToFlatShadedMesh();
  //   column.enableEdgesRendering();
  //   column.edgesWidth = 0.2;
  //   column.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
  //   column.edgesShareWithInstances = true;

  //   base.material = colMat;
  //   base.enableEdgesRendering();
  //   base.edgesWidth = 0.4;
  //   base.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);

  //   cap.material = colMat;
  //   cap.enableEdgesRendering();
  //   cap.edgesWidth = 0.4;
  //   cap.edgesColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1);

  //   base.addChild(column);
  //   base.addChild(cap);

  return column;
};

const columnFactory = (column) => {
  const numberOfColumns = 18;
  var x = column.position.x;
  var i = 0;
  do {
    i++;
    x += 5;
    console.log(x);
    const newCol = column.clone("column");
    newCol.position = new BABYLON.Vector3(
      x,
      column.position.y,
      column.position.z
    );

    // newCol.enableEdgesRendering();
  } while (i < numberOfColumns);
};
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
