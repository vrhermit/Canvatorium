<template>
  <article class="lab-wrapper">
    <slot name="scene">No Scene</slot>
    <h2>{{ this.$route?.meta?.title }} - {{ this.$route?.meta?.subtitle }}</h2>
    <div v-html="unmarkedLabNotes"></div>
  </article>
</template>

<script>
import { marked } from "marked";

export default {
  props: {
    labNotes: {
      type: String,
      default: "",
    },
  },
  computed: {
    unmarkedLabNotes() {
      return marked.parse(this.labNotes);
    },
  },
  mounted() {
    console.log(
      `Welcome to ${this.$route?.meta?.title} - ${this.$route?.meta?.subtitle}`
    );
    console.log(this.labNotes);
    document.getElementById("bjsCanvas").onwheel = function (event) {
      event.preventDefault();
    };

    document.getElementById("bjsCanvas").onmousewheel = function (event) {
      event.preventDefault();
    };
  },
};
</script>

<style>
.lab-wrapper {
  overflow-y: auto;
  height: calc(100vh - 1rem);
  margin: 0%;
  padding: 1rem;
}
</style>