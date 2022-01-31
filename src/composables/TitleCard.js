import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { ref, watch } from "@vue/runtime-core";
import LabColors from "../lab-shared/LabColors";

const createTitleCard = (scene) => {
  // The data that we will display in the VR console
  let title = ref("TITLE PLACEHOLDER");
  let subtitle = ref("SUBTITLE PLACEHOLDER");

  const card = BABYLON.MeshBuilder.CreateBox("detail-card", {
    height: 1,
    width: 1.6,
    depth: 0.2
  });
  card.position = new BABYLON.Vector3(0, 1.5, 0);
  card.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

  const cardMaterial = new BABYLON.StandardMaterial("card-material", scene);
  cardMaterial.diffuseColor = LabColors["dark3"];
  cardMaterial.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  card.material = cardMaterial;

  const plane = BABYLON.MeshBuilder.CreatePlane("detail-plane", { height: 1, width: 1.6 }, scene);
  plane.position.z = -0.11;
  plane.parent = card;

  const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1.6 * 1024, 1 * 1024);
  advancedTexture.name = "title-card-texture";

  const titleTextBlock = new GUI.TextBlock("title-text");
  titleTextBlock.text = title.value;
  titleTextBlock.textWrapping = true;
  titleTextBlock.height = 0.5;
  titleTextBlock.top = -244;
  titleTextBlock.color = "#d3d9e1";
  titleTextBlock.fontSize = "124px";
  titleTextBlock.fontStyle = "bold";
  advancedTexture.addControl(titleTextBlock);

  const subtitleTextBlock = new GUI.TextBlock("subtitle-text");
  subtitleTextBlock.text = subtitle.value;
  subtitleTextBlock.textWrapping = true;
  subtitleTextBlock.height = 0.5;
  subtitleTextBlock.color = "#d3d9e1";
  subtitleTextBlock.fontSize = "96px";
  subtitleTextBlock.fontStyle = "bold";
  advancedTexture.addControl(subtitleTextBlock);

  // Watch the title and subtitle for changes
  // and update the text in the GUI
  watch(title, (newValue) => {
    const texture = scene.getTextureByName("title-card-texture");
    texture.getControlByName("title-text").text = newValue;
  });

  watch(subtitle, (newValue) => {
    const texture = scene.getTextureByName("title-card-texture");
    texture.getControlByName("subtitle-text").text = newValue;
  });

  return { title, subtitle };
};

export default createTitleCard;
