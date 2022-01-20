<template>
  <canvas id="bjsCanvas" ref="bjsCanvas" />
  <p>
    Lab 000 - Just setting up the shared lab resources. Grid, Lights, Camera,
    etc.
  </p>
</template>

<script>
import Lab000Wrapper from "../scenes/Lab000Wrapper.js";
export default {
  name: "Lab000",

  async mounted() {
    await Lab000Wrapper.createScene(document.getElementById("bjsCanvas"));
  },
};
</script>
