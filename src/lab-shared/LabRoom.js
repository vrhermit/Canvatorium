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

  return ground;
};
export default addLabRoom;
