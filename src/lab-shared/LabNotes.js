// import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";
import { useRoute } from "vue-router";
import { watch } from "@vue/runtime-core";
import { labNotes } from "../composables/LabData";
// import LabColors from "../lab-shared/LabColors";

const createLabNotesPanel = () => {
  // const labNotes = ref("");
  const currentRoute = useRoute();
  const title = currentRoute.meta.title;
  const subtitle = currentRoute.meta.subtitle;

  // A reference to the BJS GUI Scroll Viewer, too lazy to query this in the graph...
  let scrollViewer;

  // A reference to the BJS GUI TextBlock, too lazy to query this in the graph...
  let notesText;

  const wrapperPanel = new GUI.StackPanel();

  const sv = new GUI.ScrollViewer("lab-info-scroll");
  scrollViewer = sv;

  sv.thickness = 12;
  sv.color = "#3e4a5d";
  sv.background = "#3e4a5d";
  sv.opacity = 1;
  sv.height = `${1024 - 128}px`;
  sv.width = `${1024}px`;
  sv.barSize = 20;
  sv.barColor = "#53637b";
  sv.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

  const panel = new GUI.StackPanel();
  sv.addControl(panel);

  wrapperPanel.addControl(sv);

  const titleTextBlock = new GUI.TextBlock("title-text");
  titleTextBlock.text = title;
  titleTextBlock.textWrapping = true;
  titleTextBlock.height = "64px";
  titleTextBlock.color = "#d3d9e1";
  titleTextBlock.fontSize = "48px";
  titleTextBlock.fontStyle = "bold";
  titleTextBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  titleTextBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  titleTextBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  titleTextBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.addControl(titleTextBlock);

  const subtitleTextBlock = new GUI.TextBlock("subtitle-text");
  subtitleTextBlock.text = subtitle;
  subtitleTextBlock.textWrapping = true;
  subtitleTextBlock.height = "64px";
  subtitleTextBlock.color = "#d3d9e1";
  subtitleTextBlock.fontSize = "36px";
  subtitleTextBlock.fontStyle = "bold";
  subtitleTextBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  subtitleTextBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  subtitleTextBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  subtitleTextBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  panel.addControl(subtitleTextBlock);

  const notesTextBlock = new GUI.TextBlock("logger-text");
  notesText = notesTextBlock;

  notesTextBlock.text = labNotes.value;
  notesTextBlock.textWrapping = true;
  notesTextBlock.width = "1024px";
  notesTextBlock.height = "2048px";
  notesTextBlock.paddingTop = "1%";
  notesTextBlock.paddingLeft = "30px";
  notesTextBlock.paddingRight = "20px";
  notesTextBlock.paddingBottom = "1%";
  notesTextBlock.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  notesTextBlock.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  notesTextBlock.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  notesTextBlock.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  notesTextBlock.color = "#d3d9e1";
  notesTextBlock.fontSize = "36px";

  panel.addControl(notesTextBlock);

  watch(labNotes, (newValue) => {
    const notes = newValue;
    if (scrollViewer && notesText) {
      notesText.text = notes;
      notesText.resizeToFit = true;
      scrollViewer.verticalBar.value = 1;
    }
  });

  return wrapperPanel;
};

export default createLabNotesPanel;
