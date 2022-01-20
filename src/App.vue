<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/lab000">Lab 000</router-link> |
    <router-link to="/lab001">Lab 001</router-link> |
    <router-link to="/lab002">Lab 002</router-link>
  </div>
  <router-view />
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: white;
}

#nav a.router-link-exact-active {
  color: #2d98da;
}
</style>
