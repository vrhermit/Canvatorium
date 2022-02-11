<template>
  <div class="nav-list" v-for="item of filteredRountes" v-bind:key="item.name">
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
export default {
  props: {
    showActive: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    filteredRountes() {
      if (this.showActive) {
        return this.$router.options.routes.filter(
          (route) => route.meta?.status === "running"
        );
      } else {
        return this.$router.options.routes;
      }
    },
  },
};
</script>

<style scoped>
.nav-list {
  padding: 0.25rem;
}

.fail {
  background: #eb3b5a;
  padding: 2px 4px;
  margin-left: 6px;
  border-radius: 8px;
  color: white;
}

.nav-button {
  color: white;
  text-decoration: none;
  font-size: 0.75rem;
  padding: 0.25rem;
  display: block;
  border-bottom: 1px solid #53637b;
}
</style>>
