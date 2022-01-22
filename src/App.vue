<template>
  <div class="flex-grid">
    <div id="nav" class="sidebar">
      <h1>Canvatorium</h1>
      <p>An experimental design lab for spatial computing.</p>

      <SidebarNavVue />
    </div>
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
body,
html {
  overflow: hidden;
  background: #0b0d10;
}
canvas {
  width: 100%;
  height: calc(100vh - 10rem);
  padding: auto;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
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
}

.main {
  flex: 4;
  padding: 1rem;
}

.fail {
  background: #eb3b5a;
  padding: 2px 4px;
  margin-left: 6px;
  border-radius: 8px;
  color: white;
}

#nav {
  padding: 0px;
}

#nav a {
  color: #d3d9e1;
}

#nav a.router-link-exact-active {
  color: #2d98da;
}

.nav-button {
  color: white;
  text-decoration: none;
  padding: 1rem;
  display: block;
  border-bottom: 1px solid #b4becc;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
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
