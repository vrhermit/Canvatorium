<template>
  <div v-for="item of $router.options.routes" v-bind:key="item.name">
    <router-link class="nav-button" :to="item.path">
      {{ item?.meta?.title || item?.name }}
      <span v-if="item?.meta?.subtitle">
        - {{ item?.meta?.subtitle || "" }}</span
      >
      <span v-if="item?.meta?.status === 'failed'" class="fail">X</span>
    </router-link>
  </div>
</template>

<script>
export default {};
</script>

<style>
</style>