import { Engine, Scene, ArcRotateCamera, HemisphericLight, Color3, Vector3, MeshBuilder, StandardMaterial } from "@babylonjs/core";

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
    scene.clearColor = new Color3(0.9, 0.9, 0.9);

    // Add a ground plane to the scene. Used for WebXR teleportation
    const ground = MeshBuilder.CreateGround("ground", { height: 50, width: 60, subdivisions: 4 }, scene);
    const groundMat = new StandardMaterial("ground-material", scene);
    groundMat.alpha = 1;
    groundMat.diffuseColor = new Color3(0.6, 0.6, 0.6);
    groundMat.specularColor = new Color3(0.2, 0.2, 0.2);
    ground.material = groundMat;

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

export default Lab000Wrapper;
