import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Lab000 from "../labs/Lab000.vue";
import Lab001 from "../labs/Lab001.vue";
import Lab002 from "../labs/Lab002.vue";
import Lab003 from "../labs/Lab003.vue";
import Lab004 from "../labs/Lab004.vue";
import Lab005 from "../labs/Lab005.vue";
import Lab006 from "../labs/Lab006.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/Lab000",
    name: "Lab000",
    component: Lab000,
    meta: {
      title: "Lab 000",
      subtitle: "Hello Canvatorium",
      status: "complete"
    }
  },
  {
    path: "/Lab001",
    name: "Lab001",
    component: Lab001,
    meta: {
      title: "Lab 001",
      subtitle: "Picking Colors",
      status: "complete"
    }
  },

  {
    path: "/Lab002",
    name: "Lab002",
    component: Lab002,
    meta: {
      title: "Lab 002",
      subtitle: "watch() / watchEffect()",
      status: "complete"
    }
  },
  {
    path: "/Lab003",
    name: "Lab003",
    component: Lab003,
    meta: {
      title: "Lab 003",
      subtitle: "Default XR Experience",
      status: "complete"
    }
  },
  {
    path: "/Lab004",
    name: "Lab004",
    component: Lab004,
    meta: {
      title: "Lab 004",
      subtitle: "XR Controller Buttons",
      status: "complete"
    }
  },
  {
    path: "/Lab005",
    name: "Lab005",
    component: Lab005,
    meta: {
      title: "Lab 005",
      subtitle: "Router Nav to Lab 006",
      status: "failed"
    }
  },
  {
    path: "/Lab006",
    name: "Lab006",
    component: Lab006,
    meta: {
      title: "Lab 006",
      subtitle: "Router Nav to Lab 005",
      status: "failed"
    }
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
  history: createWebHistory(),
  routes
});

export default router;
