import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

import addLabCamera from "../lab-shared/LabCamera";
import addLabLights from "../lab-shared/LabLights";
import addLabRoom from "../lab-shared/LabRoom";

const Lab000Wrapper = {
  engine: null,
  scene: null,

  createScene: async (canvas) => {
    // Create and customize the scene
    const engine = new BABYLON.Engine(canvas);
    const scene = new BABYLON.Scene(engine);

    // Use the shared lab tools
    addLabCamera(canvas, scene);
    scene.getCameraByName("camera").position = new BABYLON.Vector3(0, 0.8, -4);
    addLabLights(scene);
    const ground = addLabRoom(scene);

    // Make some boxes to test out the colors in VR
    const group = new BABYLON.Mesh("logo-group");
    group.position = new BABYLON.Vector3(-3.5, 0.5, 0);

    makeCard();

    // WebXRDefaultExperience
    const xrDefault = scene.createDefaultXRExperienceAsync({
      floorMeshes: [ground]
    });
    const xrHelper = xrDefault.baseExperience;
    console.info("webxr:", xrHelper);

    engine.runRenderLoop(() => {
      scene.render();
    });
  }

  // --- Call these functions from Vue to pass in the data or setup the scene ---
};

const makeCard = () => {
  // GUI
  var plane = BABYLON.MeshBuilder.CreatePlane("plane");
  plane.position.y = 1;

  var advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
  advancedTexture.name = "card-texture";

  var cardText = new GUI.TextBlock("card-text");
  cardText.text = "Canvatorium";
  cardText.color = "white";
  cardText.fontSize = 64;

  advancedTexture.addControl(cardText);
  plane.scaling = new BABYLON.Vector3(5, 5, 5);
};

export default Lab000Wrapper;
