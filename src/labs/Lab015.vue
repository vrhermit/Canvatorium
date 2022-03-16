<script setup>
import { labNotes } from "../composables/LabData";

import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import "babylonjs-loaders";
import { ref, onMounted, onUnmounted, watch } from "@vue/runtime-core";

import LabLayout from "../components/LabLayout.vue";
import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";
import LabColors from "../lab-shared/LabColors";

// Import the LabPlayer
import { createLabPlayer } from "../lab-shared/LabPlayer";

labNotes.value = `
Resizable GUI Cards
Press X key (keyboard) or the X button (controller) to cycle gizmos / examples.
- Example 1: Scale the card while keeping the aspect ratio
- Example 2: Scale the card while streching the content
- Example 3: Scale the card while streching the content, with snapping
- Example 4: Attempt at scaling the card while maintaining the aspect ratio (failed, so far)
`;
const bjsCanvas = ref(null);

let engine;
let scene;

const createScene = async (canvas) => {
  // Create and customize the scene
  engine = new BABYLON.Engine(canvas);
  scene = new BABYLON.Scene(engine);
  const gizMode = ref(0);

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
  cardMaterial.diffuseColor = LabColors["dark3"];
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
  sv.thickness = 48;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.width = "100%";
  sv.height = "100%";
  sv.barSize = 20;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

  advancedTexture.addControl(sv);

  var tb = new GUI.TextBlock("logger-text");
  tb.text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
  But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?
    `;
  tb.textWrapping = true;

  tb.width = 1;
  tb.height = 3;
  tb.paddingTop = "1%";
  tb.paddingLeft = "30px";
  tb.paddingRight = "20px";
  tb.paddingBottom = "1%";
  tb.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tb.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tb.color = "#d3d9e1";
  tb.fontSize = "36px";

  sv.addControl(tb);

  // Create utility layer the gizmos will be rendered on
  var utilLayer = new BABYLON.UtilityLayerRenderer(scene);

  // Create the gizmo1 to scale the card along x and y
  var gizmo1 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(1, 1, 0),
    BABYLON.Color3.FromHexString("#00b894"),
    utilLayer
  );
  gizmo1.attachedMesh = card;

  // Create the gizmo1 to scale the card along x only
  var gizmo2 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(1, 0, 0),
    BABYLON.Color3.FromHexString("#8854d0"),
    utilLayer
  );
  gizmo2.attachedMesh = card;

  var gizmo3 = new BABYLON.AxisScaleGizmo(
    new BABYLON.Vector3(0, 1, 0),
    BABYLON.Color3.FromHexString("#3867d6"),
    utilLayer
  );
  gizmo3.snapDistance = 0.1;
  gizmo3.onSnapObservable.add((e) => {
    console.log("snap", e);
  });
  gizmo3.attachedMesh = card;

  var gizmo4 = new BABYLON.BoundingBoxGizmo(
    BABYLON.Color3.FromHexString("#0984e3"),
    utilLayer
  );
  gizmo4.setEnabledRotationAxis("");
  gizmo4.scaleBoxSize = 0.05;
  gizmo4.onScaleBoxDragEndObservable.add(() => {
    console.log("start scale", advancedTexture.getSize());

    advancedTexture.scaleTo(
      Math.round(1024 * card.scaling.x),
      Math.round(1024 * card.scaling.y)
    );
    // Mark as dirty to force redraw - may not be needed in latest version
    advancedTexture.markAsDirty();
  });
  gizmo4.attachedMesh = card;

  gizmo1.attachedMesh = null;
  gizmo2.attachedMesh = null;
  gizmo3.attachedMesh = null;
  gizmo4.attachedMesh = null;

  // Use the LabPlayer
  const { xr } = await createLabPlayer(scene, [ground]);
  // Just a quick hack to add an action to the X button
  xr.input.onControllerAddedObservable.add((controller) => {
    controller.onMotionControllerInitObservable.add((motionController) => {
      const xr_ids = motionController.getComponentIds();
      if (motionController.handness === "left") {
        let xButtonComponent = motionController.getComponent(xr_ids[3]); //x-positionButton
        xButtonComponent.onButtonStateChangedObservable.add(() => {
          if (xButtonComponent.pressed) {
            console.log("X Button Pressed");
            if (gizMode.value === 0) {
              gizMode.value = 1;
            } else if (gizMode.value === 1) {
              gizMode.value = 2;
            } else if (gizMode.value === 2) {
              gizMode.value = 3;
            } else {
              gizMode.value = 0;
            }
            console.log("gizMode", gizMode.value);
          }
        });
      }
    });
  });

  document.onkeydown = (e) => {
    if (e.code == "KeyX") {
      if (gizMode.value === 0) {
        gizMode.value = 1;
      } else if (gizMode.value === 1) {
        gizMode.value = 2;
      } else if (gizMode.value === 2) {
        gizMode.value = 3;
      } else {
        gizMode.value = 0;
      }
    }
  };

  watch(gizMode, (newVal) => {
    if (newVal === 0) {
      // Toggle gizmos for Example 1
      gizmo1.attachedMesh = !gizmo1.attachedMesh ? card : null;
      gizmo2.attachedMesh = null;
      gizmo3.attachedMesh = null;
      gizmo4.attachedMesh = null;
    } else if (newVal === 1) {
      // Toggle gizmos for Example 1
      gizmo1.attachedMesh = null;
      gizmo2.attachedMesh = !gizmo2.attachedMesh ? card : null;
      gizmo3.attachedMesh = null;
      gizmo4.attachedMesh = null;
    } else if (newVal === 2) {
      // Toggle gizmos for Example 1
      gizmo1.attachedMesh = null;
      gizmo2.attachedMesh = null;
      gizmo3.attachedMesh = !gizmo3.attachedMesh ? card : null;
      gizmo4.attachedMesh = null;
    } else {
      // Toggle gizmos for Example 1
      gizmo1.attachedMesh = null;
      gizmo2.attachedMesh = null;
      gizmo3.attachedMesh = null;
      gizmo4.attachedMesh = !gizmo4.attachedMesh ? card : null;
    }
  });

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
