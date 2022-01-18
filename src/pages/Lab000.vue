<template>
  <canvas id="bjsCanvas" ref="bjsCanvas" />
</template>

<script>
import Lab000Wrapper from "../scenes/Lab000Wrapper.js";
export default {
  name: "Lab000",


  async mounted() {
    await Lab000Wrapper.createScene(document.getElementById("bjsCanvas"));
  },
}
</script>

<style>
canvas {
  width: 100%;
  height: 100%;
  padding: auto;
}
</style>