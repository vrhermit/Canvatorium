import * as BABYLON from "babylonjs";

const addLabCamera = (canvas, scene) => {
  // Add an ArcRotateCamera to the scene and attach it to the canvas
  // ArcRotateCamera is used to rotate the camera around the scene when not using WebXR
  const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 0, 0), scene);
  camera.wheelDeltaPercentage = 0.01;
  camera.upperBetaLimit = Math.PI / 1.5;
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 50;
  camera.setPosition(new BABYLON.Vector3(0, 8, -8));
  camera.setTarget(new BABYLON.Vector3(0, 1, 0));
  camera.attachControl(canvas, true);
};
export default addLabCamera;
