// import * as BABYLON from "babylonjs";
import * as GUI from "babylonjs-gui";

const createGridMenuLabel = (text) => {
  const label = new GUI.TextBlock();
  label.text = text;
  label.height = "60px";
  label.fontSize = "40px";
  label.color = "white";
  label.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  return label;
};

const createGridMenuSlider = (options) => {
  const { min, max, step, value } = options;
  const slider = new GUI.Slider();
  slider.minimum = min;
  slider.maximum = max;
  slider.step = step;
  slider.value = value;
  slider.height = "60px";
  slider.width = "100%";
  slider.color = "#8854d0";
  slider.background = "#53637b";
  slider.thumbWidth = "60px";
  slider.thumbHeight = "60px";
  slider.thumbBackground = "#8854d0";
  slider.thumbBorderColor = "#8854d0";
  slider.thumbBorderWidth = "2px";
  slider.isThumbCircle = true;
  slider.isThumbClamped = true;
  slider.isThumbClampedY = true;

  return slider;
};

const createGridMenuCheckbox = () => {
  const checkbox = new GUI.Checkbox();
  checkbox.isChecked = true;
  checkbox.height = "60px";
  // checkbox does not have a margin, so add some extra width, then use it in padding
  checkbox.width = "70px";
  checkbox.paddingLeftInPixels = "10";
  checkbox.color = "#8854d0";
  checkbox.background = "#53637b";
  checkbox.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  return checkbox;
};

export { createGridMenuLabel, createGridMenuSlider, createGridMenuCheckbox };
