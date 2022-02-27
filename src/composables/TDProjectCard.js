import * as BABYLON from "babylonjs";
import tdcolors from "../data/td-colors.json";

export const createProjectCard = (project, scene) => {
  const { id, name, color } = project;
  const cardWidth = 2;
  const cardHeight = 0.4;

  // Card
  const projectCard = new BABYLON.MeshBuilder.CreateBox(`project-card-${id}`, {
    width: cardWidth,
    height: cardHeight,
    depth: 0.1
  });
  projectCard.position = new BABYLON.Vector3(0, 1, 0);

  const projectCardMaterial = new BABYLON.StandardMaterial("projectCardMaterial", scene);
  projectCardMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#a5b1c2");
  projectCardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectCard.material = projectCardMaterial;

  // Card Content - Color Dot
  const projectDot = BABYLON.MeshBuilder.CreateCylinder(`project-sphere-${id}`, {
    diameter: 0.25,
    height: 0.05
  });
  const projectDotMaterial = new BABYLON.StandardMaterial(`project-sphere-mat-${id}`, scene);
  projectDotMaterial.diffuseColor = new BABYLON.Color3.FromHexString(tdcolors[color]);
  projectDotMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  projectDot.material = projectDotMaterial;
  projectDot.parent = projectCard;
  projectDot.position = new BABYLON.Vector3(-0.8, 0, -0.056);
  projectDot.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);
  projectDot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

  // Card Content - Dynamic Texture
  const plane = BABYLON.MeshBuilder.CreatePlane(`plane-${id}`, { width: cardWidth, height: cardHeight }, scene);
  plane.parent = projectCard;
  plane.position = new BABYLON.Vector3(0, 0, -0.056);
  //Set width and height for dynamic texture using same multiplier
  const dtResolution = 512;
  const dtWidth = cardWidth * dtResolution;
  const dtHeight = cardHeight * dtResolution;

  //Set text

  //Create dynamic texture
  var dynamicTexture = new BABYLON.DynamicTexture(`project-dt-${id}`, { width: dtWidth, height: dtHeight }, scene);

  //set font to be actually used to write text on dynamic texture
  var font = "72px Tahoma";

  //Draw text
  dynamicTexture.drawText(name, 196, null, font, "#2a323e", "#d3d9e1", true);

  //create material
  var mat = new BABYLON.StandardMaterial("mat", scene);
  mat.diffuseTexture = dynamicTexture;

  //apply material
  plane.material = mat;

  projectCard.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);
  projectCard.addBehavior(new BABYLON.SixDofDragBehavior());
  return projectCard;
};
