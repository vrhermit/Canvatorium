import * as BABYLON from "babylonjs";
import LabColors from "./LabColors";

const addLabLights = (scene) => {
  // Customize the scene lighting and background color
  const ambientLight1 = new BABYLON.HemisphericLight("light-01", new BABYLON.Vector3(5, 5, 5), scene);
  ambientLight1.intensity = 0.8;
  const ambientLight2 = new BABYLON.HemisphericLight("light-02", new BABYLON.Vector3(-5, 5, -5), scene);
  ambientLight2.intensity = 0.8;
  scene.clearColor = LabColors.dark1;
};
export default addLabLights;
