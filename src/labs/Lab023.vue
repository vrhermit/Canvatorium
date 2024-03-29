<script setup>
import { labNotes } from "../composables/LabData";
import * as BABYLON from "babylonjs";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted } from "@vue/runtime-core";
import { useStorage } from "@vueuse/core";
import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import { createLabPlayer } from "../lab-shared/LabPlayer";
import LabColors from "../lab-shared/LabColors";

labNotes.value = `
Save Object Transform
- Subject 1: (purple) - Move the object around the scene
- When letting go of subject 1, save the object's transform to local storage
- Uses '/useStorage'/ from VueUse
- Click the the red cube to reset the object's transform and the local storage value
`;
const bjsCanvas = ref(null);

let engine;
let scene;

// Initial object to use with local storage
const saveObject = {
  name: "", // unused
  position: { x: 0, y: 0, z: 0 },
  rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 },
  scale: { x: 1, y: 1, z: 1 },
};
let subject1data = useStorage("lab023", { ...saveObject });
console.log("subject1data", subject1data);

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);

  // Use the shared lab tools
  addLabCamera(canvas, scene);
  addLabLights(scene);
  const ground = addLabRoom(scene);

  // Subject 1: (purple) - Move the object around the scene
  const subjectMat1 = new BABYLON.StandardMaterial("grab-mat1", scene);
  subjectMat1.diffuseColor = LabColors["purple"];
  subjectMat1.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);

  const subject1 = BABYLON.MeshBuilder.CreateBox("subject1", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  subject1.material = subjectMat1;

  // Set initial transform using local storage or default data
  subject1.position = new BABYLON.Vector3(
    subject1data.value.position.x,
    subject1data.value.position.y,
    subject1data.value.position.z
  );

  subject1.rotationQuaternion = new BABYLON.Quaternion(
    subject1data.value.rotationQuaternion.x,
    subject1data.value.rotationQuaternion.y,
    subject1data.value.rotationQuaternion.z,
    subject1data.value.rotationQuaternion.w
  );

  subject1.scaling = new BABYLON.Vector3(
    subject1data.value.scale.x,
    subject1data.value.scale.y,
    subject1data.value.scale.z
  );

  const moveSubject1 = new BABYLON.SixDofDragBehavior();
  moveSubject1.rotateWithMotionController = true;

  // On drag end, save the transform to local storage using useStorage
  moveSubject1.onDragEndObservable.add(() => {
    console.log(
      "rotationQuaternion values",
      subject1.rotationQuaternion.x,
      subject1.rotationQuaternion.y,
      subject1.rotationQuaternion.z,
      subject1.rotationQuaternion.w
    );

    subject1data.value.position.x = subject1.position.x;
    subject1data.value.position.y = subject1.position.y;
    subject1data.value.position.z = subject1.position.z;

    // Example of how to save the data as a vector 3 instead of a quaternion
    // const saveRot = subject1.rotationQuaternion.toEulerAngles();
    // console.log("rotation", saveRot.x, saveRot.y, saveRot.z);
    // subject1data.value.rotation.x = saveRot.x;
    // subject1data.value.rotation.y = saveRot.y;
    // subject1data.value.rotation.z = saveRot.z;

    // Switching to quaternion values because the SixDofDragBehavior uses them instead of Euler angles
    subject1data.value.rotationQuaternion.x = subject1.rotationQuaternion.x;
    subject1data.value.rotationQuaternion.y = subject1.rotationQuaternion.y;
    subject1data.value.rotationQuaternion.z = subject1.rotationQuaternion.z;
    subject1data.value.rotationQuaternion.w = subject1.rotationQuaternion.w;

    subject1data.value.scale.x = subject1.scaling.x;
    subject1data.value.scale.y = subject1.scaling.y;
    subject1data.value.scale.z = subject1.scaling.z;
  });
  subject1.addBehavior(moveSubject1);

  const resetMat = new BABYLON.StandardMaterial("grab-mat1", scene);
  resetMat.diffuseColor = LabColors["red"];
  resetMat.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  const reset = BABYLON.MeshBuilder.CreateBox("reset", {
    height: 0.4,
    width: 0.4,
    depth: 0.4,
  });
  reset.material = resetMat;
  reset.position = new BABYLON.Vector3(-1, 1, 0);

  // Reset the data saved in local storage and reset the object.
  // For some reason, this only works once. Then I need to refresh the page to use it again.
  reset.actionManager = new BABYLON.ActionManager(scene);
  reset.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
      console.log("Resetting data for subject one");
      subject1data.value = { ...saveObject };
      subject1.position = new BABYLON.Vector3(
        subject1data.value.position.x,
        subject1data.value.position.y,
        subject1data.value.position.z
      );
      subject1.rotationQuaternion = new BABYLON.Quaternion(
        subject1data.value.rotationQuaternion.x,
        subject1data.value.rotationQuaternion.y,
        subject1data.value.rotationQuaternion.z
      );
      subject1.scaling = new BABYLON.Vector3(
        subject1data.value.scale.x,
        subject1data.value.scale.y,
        subject1data.value.scale.z
      );
    })
  );

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
</script>

<template>
  <LabLayout :labNotes="labNotes">
    <template v-slot:scene>
      <canvas style="overflow: hidden" id="bjsCanvas" ref="bjsCanvas" />
    </template>
  </LabLayout>
</template>
