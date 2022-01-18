import { Engine, Scene, ArcRotateCamera, HemisphericLight, Color3, Vector3, Mesh, MeshBuilder, StandardMaterial } from "@babylonjs/core";
import SceneColors from "../helpers/SceneColors";
const Lab000Wrapper = {
  engine: null,
  scene: null,

  createScene: async (canvas) => {
    // Create and customize the scene
    const engine = new Engine(canvas);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new Vector3(0, 0, 0), scene);
    camera.wheelDeltaPercentage = 0.01;
    camera.upperBetaLimit = Math.PI / 1.5;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 50;
    camera.setPosition(new Vector3(0, 1.5, -2));
    camera.setTarget(new Vector3(0, 2, 4));
    camera.attachControl(canvas, true);

    // Customize the scene lighting and background color
    const ambientLight1 = new HemisphericLight("light-01", new Vector3(5, 5, 5), scene);
    ambientLight1.intensity = 0.7;
    const ambientLight2 = new HemisphericLight("light-02", new Vector3(-5, 5, -5), scene);
    ambientLight2.intensity = 0.7;
    scene.clearColor = SceneColors.light4;
    // scene.clearColor = new Color3(0.9, 0.9, 0.9);

    // Add a ground plane to the scene. Used for WebXR teleportation
    const ground = MeshBuilder.CreateGround("ground", { height: 50, width: 60, subdivisions: 4 }, scene);
    const groundMat = new StandardMaterial("ground-material", scene);
    groundMat.alpha = 1;
    groundMat.diffuseColor = SceneColors.dark1;
    // groundMat.diffuseColor = new Color3(0.6, 0.6, 0.6);
    groundMat.specularColor = new Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;

    // Make some boxes to test out the colors in VR
    const group = new Mesh("logo-group");
    group.position = new Vector3(0, 1.2, 3);
    // group.rotation = new Vector3(0, 2, 0);
    group.scaling = new Vector3(0.3, 0.3, 0.3);
    makeBox("purple", group, scene).position = new Vector3(0, 0, 0);
    makeBox("blue", group, scene).position = new Vector3(0.5, 0, 0);
    makeBox("teal", group, scene).position = new Vector3(1.0, 0, 0);
    makeBox("cyan", group, scene).position = new Vector3(1.5, 0, 0);

    makeBox("green", group, scene).position = new Vector3(2.0, 0, 0);
    makeBox("yellow", group, scene).position = new Vector3(2.5, 0, 0);
    makeBox("orange", group, scene).position = new Vector3(3.0, 0, 0);
    makeBox("red", group, scene).position = new Vector3(3.5, 0, 0);

    makeBox("dark1", group, scene).position = new Vector3(0, 1, 0);
    makeBox("dark2", group, scene).position = new Vector3(0.5, 1, 0);
    makeBox("dark3", group, scene).position = new Vector3(1.0, 1, 0);
    makeBox("dark4", group, scene).position = new Vector3(1.5, 1, 0);

    makeBox("light1", group, scene).position = new Vector3(2.0, 1, 0);
    makeBox("light2", group, scene).position = new Vector3(2.5, 1, 0);
    makeBox("light3", group, scene).position = new Vector3(3.0, 1, 0);
    makeBox("light4", group, scene).position = new Vector3(3.5, 1, 0);

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
  const mat = new StandardMaterial(`${colorName}-material`, scene);
  mat.diffuseColor = SceneColors[colorName];
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  const mesh = MeshBuilder.CreateBox(`${colorName}-box`, { size: 0.5 }, scene);
  mesh.material = mat;
  mesh.parent = parent;
  return mesh;
};

export default Lab000Wrapper;
