<template>
  <NavBar />
  <router-view />
</template>

<script setup>
import NavBar from "./components/NavBar.vue";
import { defineProps } from "vue";

defineProps({});
</script>

