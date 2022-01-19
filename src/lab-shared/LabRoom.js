import * as BABYLON from "babylonjs";
import * as MAT from "babylonjs-materials";
import LabColors from "./LabColors";

const addLabRoom = (scene) => {
  // Add a ground plane to the scene. Used for WebXR teleportation
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { height: 20, width: 20, subdivisions: 4 }, scene);
  // ground.position.y = 10;
  ground.sideOrientation = "DOUBLESIDE";
  const groundMaterial = new MAT.GridMaterial("groundMaterial", scene);
  groundMaterial.majorUnitFrequency = 5;
  groundMaterial.minorUnitFrequency = 0.1;
  groundMaterial.gridRatio = 1;
  groundMaterial.backFaceCulling = false;
  groundMaterial.mainColor = LabColors.light1;
  groundMaterial.lineColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  groundMaterial.opacity = 0.98;
  ground.material = groundMaterial;

  const wall1 = BABYLON.MeshBuilder.CreateGround("wall1", { height: 10, width: 20, subdivisions: 4 }, scene);
  wall1.rotation = new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 2);
  wall1.position = new BABYLON.Vector3(-10, 5, 0);
  wall1.material = groundMaterial;

  const wall2 = wall1.clone("wall2");
  wall2.rotation = new BABYLON.Vector3(Math.PI / 2, 0, Math.PI / 2);
  wall2.position = new BABYLON.Vector3(10, 5, 0);

  const wall3 = wall1.clone("wall2");
  wall3.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall3.position = new BABYLON.Vector3(0, 5, -10);

  const wall4 = wall1.clone("wall4");
  wall4.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wall4.position = new BABYLON.Vector3(0, 5, 10);

  // Return the ground to use for teleportation
  return ground;
};
export default addLabRoom;
