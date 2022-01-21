<template>
  <div class="flex-grid">
    <div id="nav" class="sidebar">
      <router-link class="nav-button" to="/"><h1>Canvatorium</h1></router-link>

      <router-link class="nav-button" to="/lab000"
        >Lab 000 - Hello Canvatorium</router-link
      >
      <router-link class="nav-button" to="/lab001"
        >Lab 001 - Picking Colors</router-link
      >
      <router-link class="nav-button" to="/lab002"
        >Lab 002 - watch() / watchEffect()</router-link
      >
      <router-link class="nav-button" to="/lab003">Lab 003 - WebXR</router-link>
    </div>
    <div class="main">
      <router-view />
    </div>
  </div>
</template>

<style>
body,
html {
  overflow: hidden;
  background: black;
}
canvas {
  width: 100%;
  height: calc(100vh - 10rem);
  padding: auto;
}

.nav-button {
  color: white;
  text-decoration: none;
  padding: 1rem;
  display: block;
  border-bottom: 1px solid white;
}

.flex-grid {
  display: flex;
  /* margin: auto -1rem 1rem; */
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

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
}

#nav {
  padding: 0px;
}

#nav a {
  font-weight: bold;
  color: white;
}

#nav a.router-link-exact-active {
  color: #2d98da;
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
