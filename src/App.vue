<template>
  <div class="flex-grid">
    <div id="nav" class="sidebar">
      <h1>Canvatorium</h1>
      <p>An experimental design lab for spatial computing.</p>
      <router-link class="nav-button" to="/lab000"
        >Lab 000 - Hello Canvatorium</router-link
      >
      <router-link class="nav-button" to="/lab001"
        >Lab 001 - Picking Colors</router-link
      >
      <router-link class="nav-button" to="/lab002"
        >Lab 002 - watch() / watchEffect()</router-link
      >
      <router-link class="nav-button" to="/lab003"
        >Lab 003 - Default XR Experience</router-link
      >
      <router-link class="nav-button" to="/lab004"
        >Lab 004 - XR Controller Buttons</router-link
      >
      <router-link class="nav-button" to="/lab005"
        >Lab 005 - Router Nav to Lab 006
        <span class="fail">X</span></router-link
      >
      <router-link class="nav-button" to="/lab006"
        >Lab 006 - Router Nav to Lab 005
        <span class="fail">X</span></router-link
      >
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
