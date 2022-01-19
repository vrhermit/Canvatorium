import * as BABYLON from "babylonjs";
import * as MAT from "babylonjs-materials";
import LabColors from "../lab-shared/LabColors";
import addLabCamera from "../lab-shared/LabCamera";

const Lab000Wrapper = {
  engine: null,
  scene: null,

  createScene: async (canvas) => {
    // Create and customize the scene
    const engine = new BABYLON.Engine(canvas);
    const scene = new BABYLON.Scene(engine);

    addLabCamera(canvas, scene);

    // Customize the scene lighting and background color
    const ambientLight1 = new BABYLON.HemisphericLight("light-01", new BABYLON.Vector3(5, 5, 5), scene);
    ambientLight1.intensity = 0.7;
    const ambientLight2 = new BABYLON.HemisphericLight("light-02", new BABYLON.Vector3(-5, 5, -5), scene);
    ambientLight2.intensity = 0.7;
    scene.clearColor = LabColors.dark1;
    // scene.clearColor = new Color3(0.9, 0.9, 0.9);

    // Add a ground plane to the scene. Used for WebXR teleportation
    const ground = BABYLON.MeshBuilder.CreateGround("ground", { height: 50, width: 60, subdivisions: 4 }, scene);
    const groundMaterial = new MAT.GridMaterial("groundMaterial", scene);
    groundMaterial.majorUnitFrequency = 5;
    groundMaterial.minorUnitFrequency = 0.1;
    groundMaterial.gridRatio = 1;
    groundMaterial.backFaceCulling = false;
    groundMaterial.mainColor = LabColors.light1;
    groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
    groundMaterial.opacity = 0.98;
    ground.material = groundMaterial;

    // Make some boxes to test out the colors in VR
    const group = new BABYLON.Mesh("logo-group");
    group.position = new BABYLON.Vector3(-3.5, 0.5, 3);
    // group.rotation = new Vector3(0, 2, 0);
    // group.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
    // group.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    makeBox("purple", group, scene).position = new BABYLON.Vector3(0, 0, 0);
    makeBox("blue", group, scene).position = new BABYLON.Vector3(1, 0, 0);
    makeBox("teal", group, scene).position = new BABYLON.Vector3(2, 0, 0);
    makeBox("cyan", group, scene).position = new BABYLON.Vector3(3, 0, 0);

    makeBox("green", group, scene).position = new BABYLON.Vector3(4, 0, 0);
    makeBox("yellow", group, scene).position = new BABYLON.Vector3(5, 0, 0);
    makeBox("orange", group, scene).position = new BABYLON.Vector3(6, 0, 0);
    makeBox("red", group, scene).position = new BABYLON.Vector3(7, 0, 0);

    makeBox("dark1", group, scene).position = new BABYLON.Vector3(0, 1, 0);
    makeBox("dark2", group, scene).position = new BABYLON.Vector3(1, 1, 0);
    makeBox("dark3", group, scene).position = new BABYLON.Vector3(2, 1, 0);
    makeBox("dark4", group, scene).position = new BABYLON.Vector3(3, 1, 0);

    makeBox("light1", group, scene).position = new BABYLON.Vector3(4, 1, 0);
    makeBox("light2", group, scene).position = new BABYLON.Vector3(5, 1, 0);
    makeBox("light3", group, scene).position = new BABYLON.Vector3(6, 1, 0);
    makeBox("light4", group, scene).position = new BABYLON.Vector3(7, 1, 0);

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

const makeBox = (colorName, parent, scene) => {
  // Create a colored box from using a string to get the color from the Brand object
  const mat = new BABYLON.StandardMaterial(`${colorName}-material`, scene);
  mat.diffuseColor = LabColors[colorName];
  mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  const mesh = BABYLON.MeshBuilder.CreateBox(`${colorName}-box`, { size: 1 }, scene);
  mesh.material = mat;
  mesh.parent = parent;
  return mesh;
};

export default Lab000Wrapper;
