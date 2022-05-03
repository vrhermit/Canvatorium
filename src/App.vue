<template>
  <div class="flex-grid container-fluid">
    <aside class="sidebar">
      <router-link to="/">
        <div class="headings">
          <h2>Canvatorium</h2>
          <h3>An experimental design lab for spatial computing.</h3>
        </div>
      </router-link>
      <details open>
        <summary>Active Labs</summary>
        <SidebarNavVue :showActive="true" />
      </details>
      <details>
        <summary>All Labs</summary>
        <SidebarNavVue />
      </details>
    </aside>
    <div class="main">
      <router-view />
    </div>
  </div>
</template>

<script>
import SidebarNavVue from "./components/SidebarNav.vue";
export default {
  components: {
    SidebarNavVue,
  },
};
</script>

<style>
canvas {
  width: 100%;
  height: calc(100vh - 10rem);
  touch-action: none;
}

.flex-grid {
  display: flex;
}

.col {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  padding: 1rem;
}

.sidebar {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  padding: 0.25rem;
}

.main {
  flex: 4;
}

/* width */
::-webkit-scrollbar {
  width: 0.5rem;
}

/* Track */
::-webkit-scrollbar-track {
  background: #2a323e;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #53637b;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #53637b;
}
</style>

<style scoped>
a {
  text-decoration: none;
}
</style>