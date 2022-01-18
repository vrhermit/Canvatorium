import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("./pages/Home.vue");
const About = () => import("./pages/About.vue");
const Lab000 = () => import("./pages/Lab000.vue");
const _404 = () => import("./pages/404.vue");

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/lab000", component: Lab000 },
  { path: "/:_(.*)*", component: _404 }
];

const router = createRouter({
  routes,
  history: createWebHistory()
});

export default router;
