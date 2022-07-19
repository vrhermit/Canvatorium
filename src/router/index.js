import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Lab000 from "../labs/Lab000.vue";
import Lab001 from "../labs/Lab001.vue";
import Lab002 from "../labs/Lab002.vue";
import Lab003 from "../labs/Lab003.vue";
import Lab004 from "../labs/Lab004.vue";
import Lab005 from "../labs/Lab005.vue";
import Lab006 from "../labs/Lab006.vue";
import Lab007 from "../labs/Lab007.vue";
import Lab008 from "../labs/Lab008.vue";
import Lab009 from "../labs/Lab009.vue";
import Lab010 from "../labs/Lab010.vue";
import Lab011 from "../labs/Lab011.vue";
import Lab012 from "../labs/Lab012.vue";
// import Lab013 from "../labs/Lab013.vue";
import Lab014 from "../labs/Lab014.vue";
import Lab015 from "../labs/Lab015.vue";
import Lab016 from "../labs/Lab016.vue";
import Lab017 from "../labs/Lab017.vue";
import Lab018 from "../labs/Lab018.vue";
import Lab019 from "../labs/Lab019.vue";
import Lab020 from "../labs/Lab020.vue";
import Lab021 from "../labs/Lab021.vue";
import Lab022 from "../labs/Lab022.vue";
import Lab023 from "../labs/Lab023.vue";
import Lab024 from "../labs/Lab024.vue";
import Lab025 from "../labs/Lab025.vue";
import Lab026 from "../labs/Lab026.vue";
import Lab027 from "../labs/Lab027.vue";
import Lab028 from "../labs/Lab028.vue";
import Lab029 from "../labs/Lab029.vue";
import Lab030 from "../labs/Lab030.vue";
import Lab031 from "../labs/Lab031.vue";
import Lab032 from "../labs/Lab032.vue";

const routes = [
  {
    path: "/",
    name: "Overview",
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
    path: "/Lab007",
    name: "Lab007",
    component: Lab007,
    meta: {
      title: "Lab 007",
      subtitle: "Console... Log(?)",
      status: "complete"
    }
  },
  {
    path: "/Lab008",
    name: "Lab008",
    component: Lab008,
    meta: {
      title: "Lab 008",
      subtitle: "Near Menu",
      status: "complete"
    }
  },
  {
    path: "/Lab009",
    name: "Lab009",
    component: Lab009,
    meta: {
      title: "Lab 009",
      subtitle: "Title Card & Vue 3 Composables",
      status: "complete"
    }
  },
  {
    path: "/Lab010",
    name: "Lab010",
    component: Lab010,
    meta: {
      title: "Lab 010",
      subtitle: "Grab Lab",
      status: "complete"
    }
  },
  {
    path: "/Lab011",
    name: "Lab011",
    component: Lab011,
    meta: {
      title: "Lab 011",
      subtitle: "Shared Lab Player",
      status: "complete"
    }
  },
  {
    path: "/Lab012",
    name: "Lab012",
    component: Lab012,
    meta: {
      title: "Lab 012",
      subtitle: "Gizmos!",
      status: "complete"
    }
  },
  // {
  //   path: "/Lab013",
  //   name: "Lab013",
  //   component: Lab013,
  //   meta: {
  //     title: "Lab 013",
  //     subtitle: "Nothing to see here. Move along.",
  //     status: "running"
  //   }
  // },
  {
    path: "/Lab014",
    name: "Lab014",
    component: Lab014,
    meta: {
      title: "Lab 014",
      subtitle: "Follow Behaviors",
      status: "complete"
    }
  },
  {
    path: "/Lab015",
    name: "Lab015",
    component: Lab015,
    meta: {
      title: "Lab 015",
      subtitle: "Resizable GUI Cards",
      status: "complete"
    }
  },
  {
    path: "/Lab016",
    name: "Lab016",
    component: Lab016,
    meta: {
      title: "Lab 016",
      subtitle: "Snapping and History",
      status: "complete"
    }
  },
  {
    path: "/Lab017",
    name: "Lab017",
    component: Lab017,
    meta: {
      title: "Lab 017",
      subtitle: "Surface Magnetism Behavior",
      status: "complete"
    }
  },
  {
    path: "/Lab018",
    name: "Lab018",
    component: Lab018,
    meta: {
      title: "Lab 018",
      subtitle: "Intro to Actions",
      status: "complete"
    }
  },
  {
    path: "/Lab019",
    name: "Lab019",
    component: Lab019,
    meta: {
      title: "Lab 019",
      subtitle: "Action Triggers in WebXR",
      status: "complete"
    }
  },
  {
    path: "/Lab020",
    name: "Lab020",
    component: Lab020,
    meta: {
      title: "Lab 020",
      subtitle: "Working with Assets",
      status: "complete"
    }
  },
  {
    path: "/Lab021",
    name: "Lab021",
    component: Lab021,
    meta: {
      title: "Lab 021",
      subtitle: "Dynamic Texture Cards",
      status: "complete"
    }
  },
  {
    path: "/Lab022",
    name: "Lab022",
    component: Lab022,
    meta: {
      title: "Lab 022",
      subtitle: "3D Cards pop out from 2D GUI",
      status: "complete"
    }
  },
  {
    path: "/Lab023",
    name: "Lab023",
    component: Lab023,
    meta: {
      title: "Lab 023",
      subtitle: "Save Object Transform",
      status: "complete"
    }
  },
  {
    path: "/Lab024",
    name: "Lab024",
    component: Lab024,
    meta: {
      title: "Lab 024",
      subtitle: "Movement Controls",
      status: "running"
    }
  },
  {
    path: "/Lab025",
    name: "Lab025",
    component: Lab025,
    meta: {
      title: "Lab 025",
      subtitle: "Teleport Controls",
      status: "running"
    }
  },
  {
    path: "/Lab026",
    name: "Lab026",
    component: Lab026,
    meta: {
      title: "Lab 026",
      subtitle: "User Locomotion Settings",
      status: "running"
    }
  },
  {
    path: "/Lab027",
    name: "Lab027",
    component: Lab027,
    meta: {
      title: "Lab 027",
      subtitle: "Performance Testing",
      status: "running"
    }
  },
  {
    path: "/Lab028",
    name: "Lab028",
    component: Lab028,
    meta: {
      title: "Lab 028",
      subtitle: "Stoa (Geometry)",
      status: "running"
    }
  },
  {
    path: "/Lab029",
    name: "Lab029",
    component: Lab029,
    meta: {
      title: "Lab 029",
      subtitle: "Stoa (Lighting & Textures)",
      status: "running"
    }
  },
  {
    path: "/Lab030",
    name: "Lab030",
    component: Lab030,
    meta: {
      title: "Lab 030",
      subtitle: "Stoa (Water)",
      status: "failed"
    }
  },
  {
    path: "/Lab031",
    name: "Lab031",
    component: Lab031,
    meta: {
      title: "Lab 031",
      subtitle: "Playing with Images",
      status: "running"
    }
  },
  {
    path: "/Lab032",
    name: "Lab032",
    component: Lab032,
    meta: {
      title: "Lab 032",
      subtitle: "VR Lathe Array",
      status: "running"
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
