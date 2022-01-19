import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Lab000 from "../views/Lab000.vue";
import Lab001Color from "../views/Lab001Color.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/Lab000",
    name: "Lab000",
    component: Lab000
  },
  {
    path: "/Lab001",
    name: "Lab001",
    component: Lab001Color
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
