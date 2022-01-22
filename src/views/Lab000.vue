<template>
  <article class="lab-wrapper">
    <canvas id="bjsCanvas" ref="bjsCanvas" />
    <h2>Lab 000 - Hello Canvatorium</h2>
    <p>Just setting up the shared lab resources. Grid, Lights, Camera, etc.</p>
  </article>
</template>

<script>
import Lab000Wrapper from "../scenes/Lab000Wrapper.js";

/*
Lab Notes:
This lab use an interface object to create a BabylonJS scene, based on the workflow that I used during 'A Vue into 3D'
*/
export default {
  name: "Lab000",

  async mounted() {
    await Lab000Wrapper.createScene(document.getElementById("bjsCanvas"));
  },
};
</script>


<style scoped>
.lab-wrapper {
  overflow-y: auto;
  height: calc(100vh - 1rem);
  margin: 0%;
  padding: 1rem;
}
</style>